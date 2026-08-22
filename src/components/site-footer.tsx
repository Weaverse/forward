import Link from "next/link";

import { Icon } from "@/components/icon";
import { Wordmark } from "@/components/wordmark";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { cn } from "@/lib/cn";
import { THEME_CUSTOM_PAGE_LINKS } from "@/lib/routes/route-contract";
import { storefront } from "@/lib/storefront/data-source";
import {
  SOCIAL_SECTION_HEADING,
  VERIFIED_CHECKOUT_PAYMENT_MARKS,
  VERIFIED_SOCIAL_LINKS,
} from "@/lib/storefront/integrations";

const FOOTER_COLUMN_CLASS =
  "[&>a]:flex [&>a]:min-h-9 [&>a]:items-center [&>a]:text-[12px] [&>a:hover]:text-signal [&>h2]:mt-0 [&>h2]:mb-[15px] [&>h2]:font-body [&>h2]:text-[10px] [&>h2]:text-text-dark-muted [&>h2]:tracking-field-meta [&>h2]:uppercase";

/**
 * Shopify owns the menu columns; theme-owned custom pages get their own
 * heading so they are discoverable without being mistaken for `/pages/*`.
 *
 * Integrations render only when verified. Unverified social accounts, payment
 * marks, and the (currently unconfigured) newsletter provider render nothing
 * at all rather than a decorative claim the shopper cannot check.
 */
export async function SiteFooter() {
  const [navigation, themeContent] = await Promise.all([
    storefront.getNavigation(),
    storefront.getThemeContent(),
  ]);

  const accountEnabled = getCustomerAccountRuntime() !== null;
  const footerColumns = accountEnabled
    ? navigation.footerColumns
    : navigation.footerColumns.map((column) => ({
        ...column,
        links: column.links.filter((link) => link.href !== "/account"),
      }));

  return (
    <footer
      className="relative bg-ink px-page-gutter pt-[100px] pb-6 text-text-inverse"
      data-shell-background
    >
      <div
        className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-[1.5fr_repeat(4,0.45fr)] gap-[50px] max-lg:grid-cols-[1.2fr_repeat(2,minmax(0,1fr))] max-md:grid-cols-2 max-sm:grid-cols-1"
        data-footer-grid
      >
        <div className="max-md:col-span-full max-sm:col-auto">
          <Wordmark variant="footer" />
          <p className="mt-[30px] mb-[1em] max-w-[380px] text-text-dark-muted">
            {themeContent.footerTagline}
          </p>
        </div>
        {footerColumns.map((column) => (
          <nav
            key={column.heading}
            className={FOOTER_COLUMN_CLASS}
            aria-label={`${column.heading} links`}
          >
            <h2>{column.heading}</h2>
            {column.links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
        <nav
          className={FOOTER_COLUMN_CLASS}
          aria-label="Forward field guide links"
        >
          <h2>Field guide</h2>
          {THEME_CUSTOM_PAGE_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {VERIFIED_SOCIAL_LINKS.length > 0 ? (
        <div className="mx-auto mt-11 flex w-[min(100%,var(--container-page))] items-center justify-between gap-6 border-white/20 border-t pt-[22px] max-sm:flex-col max-sm:items-start">
          <h2 className="m-0 text-[11px] font-ui text-text-dark-muted tracking-field-meta uppercase">
            {SOCIAL_SECTION_HEADING}
          </h2>
          <ul className="m-0 flex list-none gap-2.5 p-0">
            {VERIFIED_SOCIAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  className="inline-grid size-touch place-items-center border border-white/30 text-text-inverse [transition:border-color_var(--duration-fast)_var(--ease-standard),background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard)] hover:border-signal hover:bg-signal hover:text-ink focus-visible:outline-signal"
                  href={link.href}
                  rel="noopener noreferrer external"
                >
                  <Icon name={link.icon} size={20} title={link.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div
        className={cn(
          "mx-auto flex w-[min(100%,var(--container-page))] justify-between border-white/20 border-t pt-5 font-body text-[10px] text-text-dark-muted tracking-[0.1em] uppercase max-sm:flex-col max-sm:items-start max-sm:gap-2 max-sm:pb-[38px]",
          VERIFIED_SOCIAL_LINKS.length > 0 ? "mt-6" : "mt-[60px]",
        )}
      >
        {themeContent.footerStatus.length > 0 ? (
          <span>{themeContent.footerStatus}</span>
        ) : null}
        <span>FORWARD · Field office 54.4609° N / 3.0886° W</span>
        {VERIFIED_CHECKOUT_PAYMENT_MARKS.length > 0 ? (
          <span>{VERIFIED_CHECKOUT_PAYMENT_MARKS.join(" · ")}</span>
        ) : null}
      </div>
    </footer>
  );
}
