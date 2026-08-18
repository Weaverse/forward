import Link from "next/link";

import { Icon } from "@/components/icon";
import { Wordmark } from "@/components/wordmark";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { THEME_CUSTOM_PAGE_LINKS } from "@/lib/routes/route-contract";
import { storefront } from "@/lib/storefront/data-source";
import {
  SOCIAL_SECTION_HEADING,
  VERIFIED_CHECKOUT_PAYMENT_MARKS,
  VERIFIED_SOCIAL_LINKS,
} from "@/lib/storefront/integrations";

/**
 * Canonical footer. Source `app.js:162–176`: stacked wordmark, intro,
 * navigation columns, and the bottom rail. Shopify owns the menu columns; the
 * theme-owned custom pages get their own heading so they are discoverable
 * without being mistaken for `/pages/*`.
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
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand-wrap">
          <Wordmark variant="footer" />
          <p className="footer-intro">{themeContent.footerTagline}</p>
        </div>
        {footerColumns.map((column) => (
          <nav
            key={column.heading}
            className="footer-col"
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
        <nav className="footer-col" aria-label="Forward field guide links">
          <h2>Field guide</h2>
          {THEME_CUSTOM_PAGE_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {VERIFIED_SOCIAL_LINKS.length > 0 ? (
        <div className="footer-social">
          <h2>{SOCIAL_SECTION_HEADING}</h2>
          <ul>
            {VERIFIED_SOCIAL_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} rel="noopener noreferrer external">
                  <Icon name={link.icon} size={20} title={link.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="footer-bottom">
        {themeContent.footerStatus.length > 0 ? (
          <span>{themeContent.footerStatus}</span>
        ) : null}
        <span>FORWARD · Field office 54.4609° N / 3.0886° W</span>
        {VERIFIED_CHECKOUT_PAYMENT_MARKS.length > 0 ? (
          <span className="footer-payments">
            {VERIFIED_CHECKOUT_PAYMENT_MARKS.join(" · ")}
          </span>
        ) : null}
      </div>
    </footer>
  );
}
