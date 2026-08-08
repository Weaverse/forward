import { FieldIndexHeader } from "@/components/field-index-header";
import { storefront } from "@/lib/storefront/data-source";

/**
 * Canonical static Field Index header. Navigation remains behind the normalized
 * storefront boundary while Shopify menu wiring is intentionally deferred.
 */
export async function SiteHeader() {
  const [navigation, themeContent] = await Promise.all([
    storefront.getNavigation(),
    storefront.getThemeContent(),
  ]);

  return (
    <FieldIndexHeader
      announcement={themeContent.announcement}
      primary={navigation.primary}
      utility={navigation.utility}
    />
  );
}
