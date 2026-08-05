import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { SMOKE_FIXTURES } from "@/lib/routes/route-contract";

interface FooterColumn {
  heading: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: `/shop/${SMOKE_FIXTURES.collectionHandle}`, label: "Field gear" },
      { href: "/search", label: "Search" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/journal", label: "Journal" },
      { href: `/pages/${SMOKE_FIXTURES.pageHandle}`, label: "About Forward" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/account", label: "Account" },
      { href: `/policies/${SMOKE_FIXTURES.policyHandle}`, label: "Shipping policy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-mist bg-pine-deep text-bone">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-8">
        <div className="space-y-4">
          <Wordmark size="footer" />
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            Gear for moving through weather, not around it. Built as a fresh
            Next.js storefront theme for Shopify, powered by Weaverse.
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-moss-light">
              {column.heading}
            </h2>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/85 transition-colors hover:text-bone"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-bone/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-mist sm:px-8">
          © 2026 Forward. Foundation slice — live commerce data, checkout, and
          customer accounts arrive in later slices.
        </p>
      </div>
    </footer>
  );
}
