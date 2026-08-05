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
      title="Orders"
      lede="Every order on the demo record, newest first."
    >
      <ul className="divide-y divide-mist border-y border-mist">
        {[...orders].reverse().map((order) => (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="group grid gap-2 py-5 sm:grid-cols-12 sm:items-center"
            >
              <span className="font-display text-xl text-pine group-hover:text-clay sm:col-span-3">
                {order.number}
              </span>
              <span className="field-label text-slate sm:col-span-3">
                {formatDate(order.placedAt)}
              </span>
              <span className="field-label text-moss sm:col-span-4">
                {order.statusDetail}
              </span>
              <span className="field-label text-ink sm:col-span-2 sm:text-right">
                {formatMoney(order.total)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AccountShell>
  );
}
