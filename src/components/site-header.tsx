import Link from "next/link";

import { Wordmark } from "@/components/wordmark";

const PRIMARY_NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
  { href: "/search", label: "Search" },
] as const;

const UTILITY_NAV = [
  { href: "/account", label: "Account" },
  { href: "/cart", label: "Cart" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-mist bg-bone">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
        <Wordmark />
        {/* Static links only — the nav stays fully usable without JavaScript. */}
        <nav
          aria-label="Primary"
          className="order-last w-full sm:order-none sm:w-auto"
        >
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium uppercase tracking-[0.12em] text-slate transition-colors hover:text-pine"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Utility" className="ml-auto">
          <ul className="flex items-center gap-x-5">
            {UTILITY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm font-medium uppercase tracking-[0.12em] text-slate transition-colors hover:text-pine"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
