import Link from "next/link";

import { CartCount } from "@/components/cart-count";
import { HeaderNav } from "@/components/header-nav";
import { MobileMenu } from "@/components/mobile-menu";
import { Wordmark } from "@/components/wordmark";
import { storefront } from "@/lib/storefront/data-source";

export async function SiteHeader() {
  const [navigation, themeContent] = await Promise.all([
    storefront.getNavigation(),
    storefront.getThemeContent(),
  ]);

  return (
    <header className="border-b border-carbon bg-cream">
      {/* Acid report strip */}
      <div className="field-label flex items-center justify-between gap-4 bg-acid px-5 py-2 text-carbon sm:px-8">
        <span className="hidden sm:inline">Forward field report / 01</span>
        <span className="mx-auto sm:mx-0">{themeContent.announcement}</span>
        <span className="hidden sm:inline">54.4609° N / 3.0886° W</span>
      </div>
      {/* Segmented technical header */}
      <div className="flex items-stretch justify-between gap-4 px-5 sm:px-8">
        <div className="flex flex-col justify-center py-3">
          <Wordmark />
          <p className="field-label mt-1 text-slate/80">Outdoor / 01</p>
        </div>
        <HeaderNav items={navigation.primary} />
        <div className="flex items-center gap-1">
          <nav aria-label="Utility" className="hidden lg:block">
            <ul className="flex items-center">
              {navigation.utility.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="field-label inline-flex min-h-11 items-center gap-1.5 px-3 text-carbon transition-colors hover:text-slate"
                  >
                    {item.label}
                    {item.href === "/cart" ? <CartCount /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* Cart stays one tap away on mobile alongside the menu trigger. */}
          <Link
            href="/cart"
            className="field-label inline-flex min-h-11 items-center gap-1.5 px-3 text-carbon lg:hidden"
          >
            <span className="sr-only">Cart</span>
            <CartCount />
          </Link>
          <MobileMenu
            primary={navigation.primary}
            utility={navigation.utility}
          />
        </div>
      </div>
    </header>
  );
}
