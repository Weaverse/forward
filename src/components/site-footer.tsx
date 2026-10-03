import { Icon } from "@/components/icon";
import { Link } from "@/components/link";
import { PaymentMarks } from "@/components/payment-marks";
import { Wordmark } from "@/components/wordmark";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { cn } from "@/lib/cn";
import type { LocaleId } from "@/lib/i18n/locales";
import type { TranslationKey } from "@/lib/i18n/static-content";
import { T } from "@/lib/i18n/t";
import { getTranslator } from "@/lib/i18n/translator";
import { THEME_CUSTOM_PAGE_LINKS } from "@/lib/routes/route-contract";
import { getStorefront } from "@/lib/storefront/data-source";
import { VERIFIED_SOCIAL_LINKS } from "@/lib/storefront/integrations";

/** The theme's own field-guide pages, labelled per market. */
const FIELD_GUIDE_LABELS: Record<
  (typeof THEME_CUSTOM_PAGE_LINKS)[number]["href"],
  TranslationKey
> = {
  "/about": "footer.fieldGuidePages.about",
  "/materials": "footer.fieldGuidePages.materials",
  "/field-testing": "footer.fieldGuidePages.fieldTesting",
};

const FOOTER_COLUMN_CLASS =
  "[&>a]:flex [&>a]:min-h-9 [&>a]:items-center [&>a]:text-caption [&>a:hover]:text-signal [&>h2]:mt-0 [&>h2]:mb-3.75 [&>h2]:font-body [&>h2]:text-field-meta [&>h2]:text-text-dark-muted [&>h2]:tracking-field-meta [&>h2]:uppercase";

/**
 * Shopify owns the menu columns; theme-owned custom pages get their own
 * heading so they are discoverable without being mistaken for `/pages/*`.
 *
 * Integrations render only when verified. Unverified social accounts, payment
 * marks, and the (currently unconfigured) newsletter provider render nothing
 * at all rather than a decorative claim the shopper cannot check.
 */
export async function SiteFooter({ locale }: { locale: LocaleId }) {
  const [navigation, t] = await Promise.all([
    getStorefront(locale).getNavigation(),
    getTranslator(locale),
  ]);
  const tagline = t("footer.tagline");

  const accountEnabled = getCustomerAccountRuntime() !== null;
  const footerColumns = accountEnabled
    ? navigation.footerColumns
    : navigation.footerColumns.map((column) => ({
        ...column,
        links: column.links.filter((link) => link.href !== "/account"),
      }));

  return (
    <footer
      className="relative bg-ink px-page-gutter pt-25 pb-6 text-text-inverse"
      data-shell-background
    >
      <div
        className="mx-auto grid w-full max-w-page grid-cols-1 gap-12.5 sm:grid-cols-2 md:grid-cols-[1.2fr_repeat(2,minmax(0,1fr))] lg:grid-cols-[1.5fr_repeat(4,0.45fr)]"
        data-footer-grid
      >
        <div className="col-auto sm:col-span-full md:col-auto">
          <Wordmark variant="footer" />
          {/* Checked on the server so an empty tagline renders no paragraph;
           * `<T>` still carries Studio's live edits once it renders. */}
          {tagline === "" ? null : (
            <p className="mt-7.5 mb-prose-paragraph max-w-95 text-text-dark-muted">
              <T k="footer.tagline" />
            </p>
          )}
        </div>
        {footerColumns.map((column) => (
          <nav
            key={column.heading}
            className={FOOTER_COLUMN_CLASS}
            aria-label={t("footer.columnLinks", { heading: column.heading })}
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
          aria-label={t("footer.fieldGuideLinks")}
        >
          <h2>
            <T k="footer.fieldGuide" />
          </h2>
          {THEME_CUSTOM_PAGE_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <T k={FIELD_GUIDE_LABELS[link.href]} />
            </Link>
          ))}
        </nav>
      </div>
      {VERIFIED_SOCIAL_LINKS.length > 0 ? (
        <div className="mx-auto mt-11 flex w-full max-w-page flex-col items-start justify-between gap-6 border-white/20 border-t pt-5.5 sm:flex-row sm:items-center">
          <h2 className="m-0 text-ui font-ui text-text-dark-muted tracking-field-meta uppercase">
            <T k="footer.social" />
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
          "mx-auto flex w-full max-w-page flex-col items-start justify-between gap-2 border-white/20 border-t pt-5 pb-9.5 font-body text-field-meta text-text-dark-muted tracking-label uppercase sm:flex-row sm:items-stretch sm:gap-0 sm:pb-0",
          VERIFIED_SOCIAL_LINKS.length > 0 ? "mt-6" : "mt-15",
        )}
      >
        <span>
          <T k="footer.fieldOffice" />
        </span>
        <PaymentMarks label={t("footer.paymentMethods")} />
      </div>
    </footer>
  );
}
