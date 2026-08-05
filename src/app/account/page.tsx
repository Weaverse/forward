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
  const latestOrder = orders[orders.length - 1];
  const defaultAddress = addresses.find((entry) => entry.isDefault);

  return (
    <AccountShell
      activePath="/account"
      title="Overview"
      lede="The state of your kit: recent orders, where they ship, and the standing repairs offer."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="border border-mist bg-parchment px-5 py-5">
          <h2 className="field-label text-slate">Latest order</h2>
          {latestOrder !== undefined ? (
            <>
              <p className="mt-3 font-display text-2xl text-pine">
                {latestOrder.number}
              </p>
              <p className="mt-1 text-sm text-slate">
                {formatDate(latestOrder.placedAt)} ·{" "}
                {formatMoney(latestOrder.total)}
              </p>
              <p className="field-label mt-2 text-moss">
                {latestOrder.statusDetail}
              </p>
              <Link
                href={`/account/orders/${latestOrder.id}`}
                className="field-label mt-4 inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
              >
                Order detail →
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate">No orders on record yet.</p>
          )}
        </section>

        <section className="border border-mist bg-parchment px-5 py-5">
          <h2 className="field-label text-slate">Default address</h2>
          {defaultAddress !== undefined ? (
            <>
              <p className="mt-3 font-display text-2xl text-pine">
                {defaultAddress.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                {defaultAddress.name}
                <br />
                {defaultAddress.lines.join(", ")}
              </p>
              <Link
                href="/account/addresses"
                className="field-label mt-4 inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
              >
                Manage addresses →
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate">No addresses saved.</p>
          )}
        </section>

        <section className="border border-mist bg-parchment px-5 py-5 sm:col-span-2">
          <h2 className="field-label text-slate">Repairs, standing offer</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate">
            Anything you have bought from Forward can come back for repair —
            defects free, everything else at an honest quoted cost. Start with
            the program page and have your order number nearby.
          </p>
          <Link
            href="/pages/repairs"
            className="field-label mt-4 inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
          >
            The repairs program →
          </Link>
        </section>
      </div>
    </AccountShell>
  );
}
