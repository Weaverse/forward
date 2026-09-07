import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import {
  hasRefreshMarker,
  readAccountOrder,
  readAccountSession,
} from "@/lib/account/account-view";
import { cn } from "@/lib/cn";
import { eyebrow, textLink } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";

/**
 * An order is an authenticated per-customer resource: never prerendered, never
 * cached, and never enumerated into build-time route parameters.
 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Order · Account",
  description: "Your Forward order.",
  robots: { index: false, follow: false },
};

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CART_LINE_CLASS =
  "grid grid-cols-line-item gap-6 border-border-subtle border-b py-5.5 max-sm:grid-cols-line-item-compact max-sm:gap-3.5";
const ACCOUNT_BLOCK_CLASS = "min-h-70 border border-ink bg-transparent p-7";
const SUMMARY_ROW_CLASS =
  "flex justify-between gap-5 border-border-subtle border-b py-2.5";

/**
 * Order detail. A malformed order number, an order belonging to another
 * customer, and an order the API declines all resolve to the same generic 404.
 */
export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const [{ orderId }, search] = await Promise.all([params, searchParams]);
  const path = `/account/orders/${orderId}`;
  const session = await readAccountSession({
    path,
    refreshed: hasRefreshMarker(search),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        activePath="/account/orders"
        eyebrow="Field account / Order"
        title="Order"
      >
        <AccountAccessPanel path={path} session={session} />
      </AccountShell>
    );
  }

  const order = await readAccountOrder(session, orderId);
  if (order === null) {
    notFound();
  }

  return (
    <AccountShell
      activePath="/account/orders"
      eyebrow="Field account / Order"
      title={order.name}
      signedIn
      heroAside={
        <div>
          <span className="font-bold text-signal-strong">{order.status}</span>
          <p className="m-0 max-w-lede justify-self-end text-lede leading-lede text-text-dark-lede max-md:max-w-full max-md:justify-self-start">
            Placed {formatDate(order.processedAt.slice(0, 10))}
          </p>
        </div>
      }
    >
      <Link className={textLink()} href="/account/orders">
        Back to orders
      </Link>

      <div className="border-border-subtle border-t py-section-block-compact">
        {order.lines.map((line) => (
          <article key={line.id} className={CART_LINE_CLASS}>
            <div>
              <h2 className="m-0 mb-1 text-balance font-heading text-heading-3-fixed font-medium">
                {line.title}
              </h2>
              <p className="text-text-muted">
                {line.variantTitle === null ? "" : `${line.variantTitle} · `}
                Qty {line.quantity}
              </p>
            </div>
            <div className="font-bold whitespace-nowrap max-sm:col-start-2">
              {line.total}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12.5 grid grid-cols-2 gap-3 py-section-block-compact max-sm:grid-cols-1">
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>Delivery address</p>
          {order.shippingAddress === null ? (
            <p className="text-text-muted">
              No delivery address on this order.
            </p>
          ) : (
            <address>
              {order.shippingAddress.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
          )}
        </article>
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className={eyebrow()}>Order total</p>
          {order.subtotal === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>Subtotal</span>
              <span>{order.subtotal}</span>
            </div>
          )}
          {order.shipping === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>Delivery</span>
              <span>{order.shipping}</span>
            </div>
          )}
          {order.tax === null ? null : (
            <div className={SUMMARY_ROW_CLASS}>
              <span>Tax</span>
              <span>{order.tax}</span>
            </div>
          )}
          <div
            className={cn(
              SUMMARY_ROW_CLASS,
              "py-5 font-heading text-heading-4",
            )}
          >
            <span>Total</span>
            <strong>{order.total}</strong>
          </div>
        </article>
      </div>
    </AccountShell>
  );
}
