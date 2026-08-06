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
      eyebrow="Field account / Addresses"
      title="Where the gear ships."
      lede="Editing is part of the live customer-account slice; these records are fixed demo data."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {addresses.map((address) => (
          <section
            key={address.id}
            className="border border-carbon/30 px-6 py-6"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="field-label text-pine">{address.label}</h2>
              {address.isDefault ? (
                <p className="field-label bg-acid px-2 py-1 text-carbon">
                  Default
                </p>
              ) : null}
            </div>
            <address className="mt-3 not-italic">
              <p className="font-display text-2xl text-carbon">
                {address.name}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                {address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </address>
          </section>
        ))}
      </div>
      <p className="field-label mt-8 max-w-2xl normal-case tracking-normal text-slate">
        Adding or editing addresses requires live customer accounts, which are
        intentionally not connected in this demo.
      </p>
    </AccountShell>
  );
}
