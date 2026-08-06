import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { storefront } from "@/lib/storefront/data-source";

export async function SiteFooter() {
  const [navigation, themeContent] = await Promise.all([
    storefront.getNavigation(),
    storefront.getThemeContent(),
  ]);

  return (
    <footer data-surface="dark" className="bg-carbon-deep text-cream">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-20 lg:py-28">
        <div className="flex flex-col justify-between gap-12">
          <Wordmark size="stacked" />
          <div>
            <p className="max-w-sm text-sm leading-relaxed text-cream/70">
              {themeContent.footerTagline}
            </p>
            <p className="field-label mt-7 text-acid">
              Field office · 54.4609° N, 3.0886° W
            </p>
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-3 lg:gap-12 lg:pl-10 lg:pt-4">
          {navigation.footerColumns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="field-label text-cream/50">{column.heading}</h2>
              <ul className="mt-5 space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-sm text-cream/85 transition-colors hover:text-acid"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="field-label mx-auto flex max-w-7xl flex-wrap items-baseline justify-between gap-x-8 gap-y-3 px-5 py-7 text-cream/50 sm:px-8">
          <p className="max-w-3xl normal-case tracking-normal">
            © 2026 Forward. {themeContent.demoNotice}
          </p>
          <p>Forward · Advanced field system</p>
        </div>
      </div>
    </footer>
  );
}
