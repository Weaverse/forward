import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/account-shell";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate, formatMoney } from "@/lib/storefront/format";

export const metadata: Metadata = {
  title: "Account",
  description: "Forward prototype account overview.",
};

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
      <section aria-labelledby="recent-orders-heading">
        <p className="field-label text-clay">Order history</p>
        <h2
          id="recent-orders-heading"
          className="display-large mt-3 text-carbon"
        >
          Recent orders
        </h2>
        {recentOrders.length > 0 ? (
          <div className="mt-6">
            <div className="field-label hidden border-b border-carbon pb-2 text-slate sm:grid sm:grid-cols-12 sm:gap-4">
              <span className="sm:col-span-3">Order</span>
              <span className="sm:col-span-3">Date</span>
              <span className="sm:col-span-4">Status</span>
              <span className="sm:col-span-2 sm:text-right">Total</span>
            </div>
            <ul className="divide-y divide-hairline border-b border-hairline">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="group grid gap-1 py-4 sm:grid-cols-12 sm:items-baseline sm:gap-4"
                  >
                    <span className="field-label text-carbon group-hover:text-pine sm:col-span-3">
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
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate">No orders on record yet.</p>
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="border border-carbon/30 px-6 py-6">
          <h2 className="field-label text-pine">Repair desk</h2>
          <p className="mt-3 font-display text-2xl text-carbon">
            Keep good gear moving.
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate">
            Anything you have bought from Forward can come back for repair —
            defects free, everything else at an honest quoted cost. Start with
            the program page and have your order number nearby.
          </p>
          <Link
            href="/pages/repairs"
            className="field-label mt-5 inline-flex min-h-11 items-center border border-carbon px-5 text-carbon transition-colors hover:bg-carbon hover:text-cream"
          >
            The repairs program
          </Link>
        </section>

        <section className="border border-carbon/30 px-6 py-6">
          <h2 className="field-label text-pine">Default trailhead</h2>
          {defaultAddress !== undefined ? (
            <>
              <p className="mt-3 font-display text-2xl text-carbon">
                {defaultAddress.name}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                {defaultAddress.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <Link
                href="/account/addresses"
                className="field-label mt-5 inline-flex min-h-11 items-center border border-carbon px-5 text-carbon transition-colors hover:bg-carbon hover:text-cream"
              >
                Manage addresses
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate">No addresses saved.</p>
          )}
        </section>
      </div>
    </AccountShell>
  );
}
