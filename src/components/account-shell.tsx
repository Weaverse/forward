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
      <header className="flex min-h-140 items-end bg-ink px-page-gutter pt-25 pb-18.75 text-text-inverse max-md:min-h-130 max-sm:min-h-107.5 max-sm:pt-17.5">
        <div className="mx-auto grid w-full grid-cols-page-header items-end gap-12.5 max-md:grid-cols-1 max-md:gap-7">
          <div>
            <p className={eyebrowClass({ tone: "signal" })}>{eyebrow}</p>
            <h1 className="m-0 max-w-feature text-balance font-heading text-display leading-display font-medium tracking-heading max-sm:text-index-display-mobile">
              {title}
            </h1>
          </div>
          {heroAside ?? (
            <p className="m-0 max-w-lede justify-self-end text-lede leading-lede text-text-dark-lede max-md:max-w-full max-md:justify-self-start">
              {lede}
            </p>
          )}
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-page grid-cols-media-row gap-[clamp(42px,8vw,120px)] px-page-gutter pt-17.5 pb-30 max-md:grid-cols-1">
        <nav
          className="self-start border-border-subtle border-t font-body max-md:flex max-md:overflow-x-auto"
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
                  "flex min-h-12.5 items-center border-border-subtle border-b text-micro font-bold uppercase max-md:min-w-30 max-md:pr-5",
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
