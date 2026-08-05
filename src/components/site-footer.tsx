import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { storefront } from "@/lib/storefront/data-source";

export async function SiteFooter() {
  const [navigation, themeContent] = await Promise.all([
    storefront.getNavigation(),
    storefront.getThemeContent(),
  ]);

  return (
    <footer className="border-t border-mist bg-pine-deep text-bone">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-8">
        <div className="space-y-4">
          <Wordmark size="footer" />
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            {themeContent.footerTagline}
          </p>
          <p className="field-label text-moss-light/70">
            Field office · 54.4609° N, 3.0886° W
          </p>
        </div>
        {navigation.footerColumns.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h2 className="field-label text-moss-light">{column.heading}</h2>
            <ul className="mt-4 space-y-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-9 items-center text-sm text-bone/85 transition-colors hover:text-bone"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-bone/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs leading-relaxed text-mist sm:px-8">
          © 2026 Forward. {themeContent.demoNotice}
        </p>
      </div>
    </footer>
  );
}
