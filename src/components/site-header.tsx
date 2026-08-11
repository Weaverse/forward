import { Suspense } from "react";

import { FieldIndexHeader } from "@/components/field-index-header";
import { QueryPreservingFieldIndexHeader } from "@/components/query-preserving-field-index-header";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { storefront } from "@/lib/storefront/data-source";

/**
 * Canonical Field Index header. Navigation remains behind the normalized
 * storefront boundary; the full server-rendered header is also the query
 * reader's Suspense fallback so static pages never bail out to client rendering.
 */
export async function SiteHeader() {
  const [navigation, themeContent] = await Promise.all([
    storefront.getNavigation(),
    storefront.getThemeContent(),
  ]);

  const accountEnabled = getCustomerAccountRuntime() !== null;
  const utility = accountEnabled
    ? navigation.utility
    : navigation.utility.filter((item) => item.href !== "/account");

  return (
    <Suspense
      fallback={
        <FieldIndexHeader
          announcement={themeContent.announcement}
          primary={navigation.primary}
          utility={utility}
        />
      }
    >
      <QueryPreservingFieldIndexHeader
        announcement={themeContent.announcement}
        primary={navigation.primary}
        utility={utility}
      />
    </Suspense>
  );
}
