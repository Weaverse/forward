import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/account-shell";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate, formatMoney } from "@/lib/storefront/format";

export const metadata: Metadata = {
  title: "Account",
  description: "Forward prototype account overview.",
};

/**
 * Account overview — port of the canonical `accountPage()` (source
 * `app.js:316`): account header, `.order-table` history, and the bordered
 * `.account-grid` blocks. Records come from the normalized demo account data.
 */
export default async function AccountPage() {
  const [orders, addresses] = await Promise.all([
    storefront.listDemoOrders(),
    storefront.listDemoAddresses(),
  ]);
  const recentOrders = [...orders].reverse();
  const defaultAddress = addresses.find((entry) => entry.isDefault);

  return (
    <AccountShell
      activePath="/account"
      title="The state of your kit."
      lede="Recent orders, where they ship, and the standing repairs offer — in one quiet place."
    >
      <div className="account-header">
        <p className="eyebrow">Order history</p>
        <h2 className="h2">Recent orders</h2>
      </div>
      {recentOrders.length > 0 ? (
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
            {recentOrders.map((order) => (
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
      ) : (
        <p className="muted">No orders on record yet.</p>
      )}

      <div className="account-grid">
        <article className="account-block">
          <p className="eyebrow">Repair desk</p>
          <h3>Keep good gear moving.</h3>
          <p className="muted">
            Anything bought from Forward can come back for repair — defects
            free, everything else at an honest quoted cost.
          </p>
          <Link className="button" href="/pages/repairs">
            The repairs programme
          </Link>
        </article>
        <article className="account-block">
          <p className="eyebrow">Default trailhead</p>
          {defaultAddress !== undefined ? (
            <>
              <h3>{defaultAddress.name}</h3>
              <p>
                {defaultAddress.lines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <Link className="button" href="/account/addresses">
                Manage addresses
              </Link>
            </>
          ) : (
            <p className="muted">No addresses saved.</p>
          )}
        </article>
      </div>
    </AccountShell>
  );
}
