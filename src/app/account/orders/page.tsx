import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/account-shell";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate, formatMoney } from "@/lib/storefront/format";

export const metadata: Metadata = {
  title: "Order history · Account",
  description: "Forward prototype order history.",
};

export default async function OrdersPage() {
  const orders = await storefront.listDemoOrders();

  return (
    <AccountShell
      activePath="/account/orders"
      eyebrow="Field account / Order history"
      title="Every order on record."
      lede="The full demo order log, newest first. Each entry deep-links back to the exact colorway it shipped in."
    >
      <div className="field-label hidden border-b border-carbon pb-2 text-slate sm:grid sm:grid-cols-12 sm:gap-4">
        <span className="sm:col-span-3">Order</span>
        <span className="sm:col-span-3">Date</span>
        <span className="sm:col-span-4">Status</span>
        <span className="sm:col-span-2 sm:text-right">Total</span>
      </div>
      <ul className="divide-y divide-hairline border-b border-hairline">
        {[...orders].reverse().map((order) => (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="group grid gap-1 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-4"
            >
              <span className="font-display text-xl text-carbon group-hover:text-pine sm:col-span-3">
                {order.number}
              </span>
              <span className="text-sm text-slate sm:col-span-3">
                {formatDate(order.placedAt)}
              </span>
              <span className="field-label text-pine sm:col-span-4">
                {order.statusDetail}
              </span>
              <span className="text-sm text-carbon sm:col-span-2 sm:text-right">
                {formatMoney(order.total)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AccountShell>
  );
}
