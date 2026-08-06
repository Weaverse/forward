import Link from "next/link";

import { CartCount } from "@/components/cart-count";
import { HeaderNav } from "@/components/header-nav";
import { MobileMenu } from "@/components/mobile-menu";
import { Wordmark } from "@/components/wordmark";
import { storefront } from "@/lib/storefront/data-source";

/**
 * Canonical shell chrome. Source `app.js:141–160`: announcement strip, the
 * 84px segmented header, the utility cluster, and the fixed coordinate spine.
 *
 * Two intentional normalized adaptations: the canonical cart button opens a
 * prototype drawer, while Forward's cart is a real route; and Search is a
 * primary navigation destination in Forward's navigation model rather than a
 * separate header link.
 */
export async function SiteHeader() {
  const [navigation, themeContent] = await Promise.all([
    storefront.getNavigation(),
    storefront.getThemeContent(),
  ]);
  const utilityLinks = navigation.utility.filter(
    (item) => item.href !== "/cart",
  );

  return (
    <>
      <div className="announcement">
        <span>Forward field report / 01</span>
        <span>{themeContent.announcement}</span>
        <span>54.4609° N / 3.0886° W</span>
      </div>
      <header className="site-header">
        <Wordmark />
        <HeaderNav items={navigation.primary} />
        <div className="header-actions">
          {utilityLinks.map((item) => (
            <Link
              key={item.href}
              className="header-link account-hide"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link className="icon-button cart-button" href="/cart">
            <span className="cart-label">Cart</span>
            <CartCount />
          </Link>
          <MobileMenu
            primary={navigation.primary}
            utility={navigation.utility}
          />
        </div>
      </header>
      <aside className="coordinate-spine" aria-hidden="true">
        <span>N 54° 27′</span>
        <b>FORWARD</b>
        <span>W 3° 05′</span>
      </aside>
    </>
  );
}
