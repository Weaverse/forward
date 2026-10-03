import { Suspense } from "react";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import type { LocaleId } from "@/lib/i18n/locales";
import { getStorefront } from "@/lib/storefront/data-source";
import { FieldIndexHeader } from "./field-index-header";
import { ACCOUNT_LINK } from "./header-navigation";
import { QueryPreservingFieldIndexHeader } from "./query-preserving-field-index-header";

/**
 * Canonical Field Index header. Navigation remains behind the normalized
 * storefront boundary; the full server-rendered header is also the query
 * reader's Suspense fallback so static pages never bail out to client rendering.
 */
export async function SiteHeader({ locale }: { locale: LocaleId }) {
  const [navigation, collections] = await Promise.all([
    getStorefront(locale).getNavigation(),
    getStorefront(locale).listCollections(),
  ]);

  const utility = getCustomerAccountRuntime() === null ? [] : [ACCOUNT_LINK];

  return (
    <Suspense
      fallback={
        <FieldIndexHeader
          collections={collections}
          primary={navigation.primary}
          utility={utility}
        />
      }
    >
      <QueryPreservingFieldIndexHeader
        collections={collections}
        primary={navigation.primary}
        utility={utility}
      />
    </Suspense>
  );
}
