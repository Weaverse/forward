import type { Metadata } from "next";

import { AccountShell } from "@/components/account-shell";
import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "Addresses · Account",
  description: "Forward prototype saved addresses.",
};

/**
 * Addresses — the canonical `.account-grid` / `.account-block` grammar from
 * `accountPage()` (source `app.js:316`), filled with normalized demo
 * addresses. Editing belongs to the live customer-account slice.
 */
export default async function AddressesPage() {
  const addresses = await storefront.listDemoAddresses();

  return (
    <AccountShell
      activePath="/account/addresses"
      eyebrow="Field account / Addresses"
      title="Where the gear ships."
      lede="Editing is part of the live customer-account slice; these records are fixed demo data."
    >
      <div className="account-header">
        <p className="eyebrow">Saved trailheads</p>
        <h2 className="h2">Addresses</h2>
      </div>
      <div className="account-grid">
        {addresses.map((address) => (
          <article key={address.id} className="account-block">
            <p className="eyebrow">
              {address.label}
              {address.isDefault ? " / Default" : ""}
            </p>
            <h3>{address.name}</h3>
            <address>
              {address.lines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </address>
          </article>
        ))}
      </div>
    </AccountShell>
  );
}
