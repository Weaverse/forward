import { Suspense } from "react";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { storefront } from "@/lib/storefront/data-source";
import { readThemeSettings } from "@/lib/weaverse/server";
import { FieldIndexHeader } from "./field-index-header";
import { ACCOUNT_LINK } from "./header-navigation";
import { QueryPreservingFieldIndexHeader } from "./query-preserving-field-index-header";

/**
 * Canonical Field Index header. Navigation remains behind the normalized
 * storefront boundary; the full server-rendered header is also the query
 * reader's Suspense fallback so static pages never bail out to client rendering.
 */
export async function SiteHeader() {
  const [navigation, settings, collections] = await Promise.all([
    storefront.getNavigation(),
    readThemeSettings(),
    storefront.listCollections(),
  ]);

  const utility = getCustomerAccountRuntime() === null ? [] : [ACCOUNT_LINK];
  const announcement = settings.announcement ?? "";

  return (
    <Suspense
      fallback={
        <FieldIndexHeader
          announcement={announcement}
          collections={collections}
          primary={navigation.primary}
          utility={utility}
        />
      }
    >
      <QueryPreservingFieldIndexHeader
        announcement={announcement}
        collections={collections}
        primary={navigation.primary}
        utility={utility}
      />
    </Suspense>
  );
}
