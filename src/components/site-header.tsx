import Link from "next/link";

import { CartCount } from "@/components/cart-count";
import { Wordmark } from "@/components/wordmark";
import { storefront } from "@/lib/storefront/data-source";

export async function SiteHeader() {
  const [navigation, themeContent] = await Promise.all([
    storefront.getNavigation(),
    storefront.getThemeContent(),
  ]);

  return (
    <header className="border-b border-mist bg-bone">
      <p className="field-label border-b border-pine-deep/60 bg-pine-deep px-5 py-2 text-center text-moss-light sm:px-8">
        {themeContent.announcement}
      </p>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
        <Wordmark />
        {/* Static links only — the nav stays fully usable without JavaScript. */}
        <nav
          aria-label="Primary"
          className="order-last w-full sm:order-none sm:w-auto"
        >
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {navigation.primary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="field-label inline-flex min-h-11 items-center text-slate transition-colors hover:text-pine"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Utility" className="ml-auto">
          <ul className="flex items-center gap-x-5">
            {navigation.utility.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="field-label inline-flex min-h-11 items-center text-slate transition-colors hover:text-pine"
                >
                  {item.label}
                  {item.href === "/cart" ? <CartCount /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
