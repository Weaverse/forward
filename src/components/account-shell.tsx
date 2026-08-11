import Link from "next/link";
import type { ReactNode } from "react";

import { CUSTOMER_ACCOUNT_LOGOUT_PATH } from "@/lib/account/customer-account";
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
  /** Right-hand column of the page hero. */
  lede?: string;
  heroAside?: ReactNode;
  /** Renders the sign-out control only for a real, usable session. */
  signedIn?: boolean;
  children: ReactNode;
}

/**
 * Canonical account frame. Source `app.js:316` and `app.js:320`: the dark
 * `.page-hero`, the 190px mono `.account-nav` rail, and the content column.
 *
 * Sign-out is a same-origin POST form, never a link: the pinned logout handler
 * requires POST plus an Origin/Referer match against the configured origin.
 */
export function AccountShell({
  activePath,
  eyebrow = "Field account",
  title,
  lede,
  heroAside,
  signedIn = false,
  children,
}: AccountShellProps) {
  return (
    <>
      <header className="page-hero">
        <div className="page-hero-inner">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="h1">{title}</h1>
          </div>
          {heroAside ?? <p className="lede">{lede}</p>}
        </div>
      </header>
      <div className="shell account-layout">
        <nav className="account-nav" aria-label="Account navigation">
          {ACCOUNT_NAV.map((item) => {
            const selected = item.href === activePath;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={cn(selected && "active")}
              >
                {item.label}
              </Link>
            );
          })}
          {signedIn ? (
            <form method="post" action={CUSTOMER_ACCOUNT_LOGOUT_PATH}>
              <button type="submit" className="text-link">
                Sign out
              </button>
            </form>
          ) : null}
        </nav>
        <section>{children}</section>
      </div>
    </>
  );
}
