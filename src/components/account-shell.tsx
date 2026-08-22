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
      <header className="flex min-h-[560px] items-end bg-ink px-page-gutter pt-[100px] pb-[75px] text-text-inverse max-md:min-h-[520px] max-sm:min-h-[430px] max-sm:pt-[70px]">
        <div className="mx-auto grid w-full grid-cols-[1.35fr_0.65fr] items-end gap-[50px] max-md:grid-cols-[minmax(0,1fr)] max-md:gap-7">
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal tracking-field-meta uppercase">
              {eyebrow}
            </p>
            <h1 className="m-0 max-w-[1050px] text-balance font-heading text-display leading-[0.94] font-medium tracking-heading max-sm:text-[clamp(53px,17vw,80px)]">
              {title}
            </h1>
          </div>
          {heroAside ?? (
            <p className="m-0 max-w-[670px] justify-self-end text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-[#b5b8ae] max-md:max-w-full max-md:justify-self-start">
              {lede}
            </p>
          )}
        </div>
      </header>
      <div className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-[190px_1fr] gap-[clamp(42px,8vw,120px)] px-page-gutter pt-[70px] pb-[120px] max-md:grid-cols-1">
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
                  "flex min-h-[50px] items-center border-border-subtle border-b text-[9px] font-bold uppercase max-md:min-w-[120px] max-md:pr-5",
                  selected && "text-signal-strong",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {signedIn ? (
            <form method="post" action={CUSTOMER_ACCOUNT_LOGOUT_PATH}>
              <button
                type="submit"
                className="inline-flex min-h-touch items-center gap-[14px] border-ink border-b bg-transparent font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]"
              >
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
