import type { Metadata } from "next";
import Link from "next/link";

import { SurfaceShell } from "@/components/surface-shell";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Forward account.",
};

const ACCOUNT_LINKS = [
  { href: "/account/orders", label: "Order history" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/login", label: "Sign in" },
] as const;

export default function AccountPage() {
  return (
    <SurfaceShell
      eyebrow="Account"
      title="Your account"
      description="Profile, orders, and addresses live here once Customer Account authentication is connected."
      dataDependency="This surface will read the signed-in customer from the Shopify Customer Account API. No authentication exists in the foundation slice, so it renders a signed-out shell."
    >
      <ul className="grid max-w-2xl gap-4 sm:grid-cols-3">
        {ACCOUNT_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block border border-mist bg-parchment px-5 py-6 text-sm font-semibold uppercase tracking-[0.08em] text-pine transition-colors hover:border-pine hover:text-clay"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </SurfaceShell>
  );
}
