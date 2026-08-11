import type { Metadata } from "next";
import Link from "next/link";

import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import {
  hasRefreshMarker,
  readAccountProfile,
  readAccountSession,
} from "@/lib/account/account-view";
import { ACCOUNT_ORDER_LIMIT } from "@/lib/account/queries";
import { formatDate } from "@/lib/storefront/format";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Order history · Account",
  description: "Your Forward order history.",
  robots: { index: false, follow: false },
};

const ORDERS_PATH = "/account/orders";

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Order history — the canonical `.order-table` on its own route. */
export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const session = await readAccountSession({
    path: ORDERS_PATH,
    refreshed: hasRefreshMarker(params),
  });

  if (session.status !== "authenticated") {
    return (
      <AccountShell
        activePath={ORDERS_PATH}
        eyebrow="Field account / Order history"
        title="Your recent field orders."
      >
        <AccountAccessPanel path={ORDERS_PATH} session={session} />
      </AccountShell>
    );
  }

  const profile = await readAccountProfile(session, ACCOUNT_ORDER_LIMIT);

  return (
    <AccountShell
      activePath={ORDERS_PATH}
      eyebrow="Field account / Order history"
      title="Your recent field orders."
      lede={`Your ${ACCOUNT_ORDER_LIMIT} most recent orders, newest first.`}
      signedIn
    >
      <div className="account-header">
        <p className="eyebrow">Recent log</p>
        <h2 className="h2">Orders</h2>
      </div>
      {profile.orders.length > 0 ? (
        <table className="order-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {profile.orders.map((order) => (
              <tr key={order.number}>
                <td data-label="Order">
                  <strong>
                    <Link href={order.href}>{order.name}</Link>
                  </strong>
                </td>
                <td data-label="Date">
                  {formatDate(order.processedAt.slice(0, 10))}
                </td>
                <td data-label="Status">
                  <span className="order-status">{order.status}</span>
                </td>
                <td data-label="Total">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">No orders on record yet.</p>
      )}
    </AccountShell>
  );
}
