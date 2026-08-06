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
  /** Right-hand column of the page hero. */
  lede?: string;
  heroAside?: ReactNode;
  children: ReactNode;
}

/**
 * Canonical account frame. Source `app.js:316` and `app.js:320`: the dark
 * `.page-hero`, the 190px mono `.account-nav` rail, and the content column.
 *
 * The canonical prototype fakes a signed-in customer; Forward keeps its honest
 * static notice because customer accounts are not connected.
 */
export function AccountShell({
  activePath,
  eyebrow = "Field account",
  title,
  lede,
  heroAside,
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
          <Link href="/account/login">Sign in</Link>
        </nav>
        <section>
          <p className="demo-note">
            Prototype account · customer accounts are not connected and every
            record below is local demo data.
          </p>
          {children}
        </section>
      </div>
    </>
  );
}
