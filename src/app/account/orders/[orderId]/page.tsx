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
          <span className="order-status">{order.status}</span>
          <p className="lede">
            Placed {formatDate(order.processedAt.slice(0, 10))}
          </p>
        </div>
      }
    >
      <Link className="text-link" href="/account/orders">
        Back to orders
      </Link>

      <div className="cart-list section-tight">
        {order.lines.map((line) => (
          <article key={line.id} className="cart-line">
            <div>
              <h2>{line.title}</h2>
              <p className="muted">
                {line.variantTitle === null ? "" : `${line.variantTitle} · `}
                Qty {line.quantity}
              </p>
            </div>
            <div className="line-price">{line.total}</div>
          </article>
        ))}
      </div>

      <div className="account-grid section-tight">
        <article className="account-block">
          <p className="eyebrow">Delivery address</p>
          {order.shippingAddress === null ? (
            <p className="muted">No delivery address on this order.</p>
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
        <article className="account-block">
          <p className="eyebrow">Order total</p>
          {order.subtotal === null ? null : (
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{order.subtotal}</span>
            </div>
          )}
          {order.shipping === null ? null : (
            <div className="summary-row">
              <span>Delivery</span>
              <span>{order.shipping}</span>
            </div>
          )}
          {order.tax === null ? null : (
            <div className="summary-row">
              <span>Tax</span>
              <span>{order.tax}</span>
            </div>
          )}
          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>{order.total}</strong>
          </div>
        </article>
      </div>
    </AccountShell>
  );
}
