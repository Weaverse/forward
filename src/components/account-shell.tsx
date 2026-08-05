import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const ACCOUNT_NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
] as const;

interface AccountShellProps {
  /** Current canonical path, used to mark the active nav item. */
  activePath: string;
  title: string;
  lede: string;
  children: ReactNode;
}

/**
 * Shared frame for the prototype account area. Every surface states plainly
 * that customer accounts are not live and all data is local demo fixtures.
 */
export function AccountShell({
  activePath,
  title,
  lede,
  children,
}: AccountShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
      <p className="field-label border-l-2 border-clay bg-parchment px-4 py-3 text-slate">
        Prototype account · not signed in to anything — customer accounts are
        not connected and everything below is local demo data.
      </p>
      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <nav aria-label="Account" className="lg:col-span-3">
          <p className="field-label text-slate">Rowan Hale · demo member</p>
          <ul className="mt-3 space-y-1 border-l border-mist">
            {ACCOUNT_NAV.map((item) => {
              const selected = item.href === activePath;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "field-label -ml-px flex min-h-11 items-center border-l-2 px-4 transition-colors",
                      selected
                        ? "border-clay text-ink"
                        : "border-transparent text-slate hover:text-pine",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/account/login"
                className="field-label -ml-px flex min-h-11 items-center border-l-2 border-transparent px-4 text-slate transition-colors hover:text-pine"
              >
                Sign in (demo)
              </Link>
            </li>
          </ul>
        </nav>
        <div className="lg:col-span-9">
          <header>
            <h1 className="font-display text-4xl text-pine">{title}</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate">
              {lede}
            </p>
          </header>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
