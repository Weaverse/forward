import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { storefront } from "@/lib/storefront/data-source";

/**
 * Canonical footer. Source `app.js:162–176`: stacked wordmark, intro, three
 * navigation columns, and the bottom rail. Columns come from the normalized
 * navigation model.
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
      </div>
      <div className="footer-bottom">
        <span>{themeContent.footerStatus}</span>
        <span>FORWARD · Field office 54.4609° N / 3.0886° W</span>
      </div>
    </footer>
  );
}
