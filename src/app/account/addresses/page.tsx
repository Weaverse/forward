import type { Metadata } from "next";

import { AccountShell } from "@/components/account-shell";
import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Addresses · Account",
  description: "Forward prototype saved addresses.",
};

export default async function AddressesPage() {
  const addresses = await storefront.listDemoAddresses();

  return (
    <AccountShell
      activePath="/account/addresses"
      title="Addresses"
      lede="Where the gear ships. Editing is part of the live customer-account slice; these records are fixed demo data."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {addresses.map((address) => (
          <section
            key={address.id}
            className="border border-mist bg-parchment px-5 py-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl text-pine">
                {address.label}
              </h2>
              {address.isDefault ? (
                <p className="field-label border border-moss px-2 py-1 text-moss">
                  Default
                </p>
              ) : null}
            </div>
            <address className="mt-3 text-sm not-italic leading-relaxed text-slate">
              {address.name}
              <br />
              {address.lines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
          </section>
        ))}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-slate">
        Adding or editing addresses requires live customer accounts, which are
        intentionally not connected in this demo.
      </p>
    </AccountShell>
  );
}
