import Link from "next/link";
import type { ReactNode } from "react";

import { CUSTOMER_ACCOUNT_LOGOUT_PATH } from "@/lib/account/customer-account";
import { cn } from "@/lib/cn";
import { eyebrow as eyebrowClass, textLink } from "@/lib/presentation/variants";

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
 * Accepted account frame: the dark page hero, 190px mono navigation rail, and
 * content column.
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
      <header className="flex min-h-107.5 items-end bg-ink px-page-gutter pt-17.5 pb-18.75 text-text-inverse sm:min-h-130 sm:pt-25 md:min-h-140">
        <div className="mx-auto grid w-full grid-cols-1 items-end gap-7 md:grid-cols-page-header md:gap-12.5">
          <div>
            <p className={eyebrowClass({ tone: "signal" })}>{eyebrow}</p>
            <h1 className="m-0 max-w-feature text-balance font-heading text-index-display-mobile leading-display font-medium tracking-heading sm:text-display">
              {title}
            </h1>
          </div>
          {heroAside ?? (
            <p className="m-0 max-w-full justify-self-start text-lede leading-lede text-text-dark-lede md:max-w-lede md:justify-self-end">
              {lede}
            </p>
          )}
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-page grid-cols-1 gap-[clamp(42px,8vw,120px)] px-page-gutter pt-17.5 pb-30 md:grid-cols-media-row">
        <nav
          className="flex self-start overflow-x-auto border-border-subtle border-t font-body md:block md:overflow-x-visible"
          aria-label="Account navigation"
        >
          {ACCOUNT_NAV.map((item) => {
            const selected = item.href === activePath;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "flex min-h-12.5 min-w-30 items-center border-border-subtle border-b pr-5 text-micro font-bold uppercase md:min-w-auto md:pr-0",
                  selected && "text-signal-strong",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {signedIn ? (
            <form method="post" action={CUSTOMER_ACCOUNT_LOGOUT_PATH}>
              <button type="submit" className={textLink()}>
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
