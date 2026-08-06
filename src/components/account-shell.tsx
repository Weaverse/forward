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
  /** Mono report line above the title, e.g. "Field account / Order". */
  eyebrow?: string;
  title: string;
  lede: string;
  children: ReactNode;
}

/**
 * Shared frame for the prototype account area: carbon masthead, mono nav
 * rail, and an honest notice that customer accounts are not live and all
 * data is local demo fixtures.
 */
export function AccountShell({
  activePath,
  eyebrow = "Field account",
  title,
  lede,
  children,
}: AccountShellProps) {
  return (
    <div>
      <section
        data-surface="dark"
        className="border-b border-carbon bg-carbon text-cream"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end">
          <div>
            <p className="field-label text-acid">{eyebrow}</p>
            <h1 className="display-huge mt-4">{title}</h1>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-cream/75">
            {lede}
          </p>
        </div>
        <div className="border-t border-cream/15">
          <p className="field-label mx-auto max-w-7xl px-5 py-3 normal-case tracking-normal text-cream/60 sm:px-8">
            Prototype account · not signed in to anything — customer accounts
            are not connected and everything below is local demo data.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <nav aria-label="Account" className="lg:col-span-3">
            <p className="field-label text-slate">Rowan Hale · demo member</p>
            <ul className="mt-4">
              {ACCOUNT_NAV.map((item) => {
                const selected = item.href === activePath;
                return (
                  <li key={item.href} className="border-t border-hairline">
                    <Link
                      href={item.href}
                      aria-current={selected ? "page" : undefined}
                      className={cn(
                        "field-label flex min-h-11 items-center gap-3 transition-colors",
                        selected
                          ? "text-carbon"
                          : "text-slate hover:text-carbon",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-2 rounded-full border border-carbon/40",
                          selected && "border-carbon bg-acid",
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="border-y border-hairline">
                <Link
                  href="/account/login"
                  className="field-label flex min-h-11 items-center gap-3 text-slate transition-colors hover:text-carbon"
                >
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full border border-carbon/40"
                  />
                  Sign in (demo)
                </Link>
              </li>
            </ul>
          </nav>
          <div className="lg:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
