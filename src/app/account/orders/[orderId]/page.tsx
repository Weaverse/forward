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

const TEXT_LINK_CLASS =
  "inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]";
const CART_LINE_CLASS =
  "grid grid-cols-[190px_1fr_auto] gap-6 border-border-subtle border-b py-[22px] max-sm:grid-cols-[92px_1fr] max-sm:gap-3.5";
const ACCOUNT_BLOCK_CLASS =
  "min-h-[280px] border border-ink bg-transparent p-7";
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
          <p className="m-0 max-w-[670px] justify-self-end text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-[#b5b8ae] max-md:max-w-full max-md:justify-self-start">
            Placed {formatDate(order.processedAt.slice(0, 10))}
          </p>
        </div>
      }
    >
      <Link className={TEXT_LINK_CLASS} href="/account/orders">
        Back to orders
      </Link>

      <div className="border-border-subtle border-t py-[clamp(42px,6vw,84px)]">
        {order.lines.map((line) => (
          <article key={line.id} className={CART_LINE_CLASS}>
            <div>
              <h2 className="m-0 mb-1 text-balance font-heading text-[31px] font-medium">
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

      <div className="mt-[50px] grid grid-cols-2 gap-3 py-[clamp(42px,6vw,84px)] max-sm:grid-cols-1">
        <article className={ACCOUNT_BLOCK_CLASS}>
          <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
            Delivery address
          </p>
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
          <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
            Order total
          </p>
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
          <div className={`${SUMMARY_ROW_CLASS} py-5 font-heading text-[27px]`}>
            <span>Total</span>
            <strong>{order.total}</strong>
          </div>
        </article>
      </div>
    </AccountShell>
  );
}
