import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/account-shell";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate, formatMoney } from "@/lib/storefront/format";

export const metadata: Metadata = {
  title: "Order history · Account",
  description: "Forward prototype order history.",
};

/**
 * Order history — the canonical `.order-table` from `accountPage()` (source
 * `app.js:316`) on its own route, including the 560px stacked-row treatment.
 */
export default async function OrdersPage() {
  const orders = await storefront.listDemoOrders();

  return (
    <AccountShell
      activePath="/account/orders"
      eyebrow="Field account / Order history"
      title="Every order on record."
      lede="The full demo order log, newest first. Each entry deep-links back to the exact colorway it shipped in."
    >
      <div className="account-header">
        <p className="eyebrow">Complete log</p>
        <h2 className="h2">Orders</h2>
      </div>
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
          {[...orders].reverse().map((order) => (
            <tr key={order.id}>
              <td data-label="Order">
                <strong>
                  <Link href={`/account/orders/${order.id}`}>
                    {order.number}
                  </Link>
                </strong>
              </td>
              <td data-label="Date">{formatDate(order.placedAt)}</td>
              <td data-label="Status">
                <span className="order-status">{order.statusDetail}</span>
              </td>
              <td data-label="Total">{formatMoney(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AccountShell>
  );
}
