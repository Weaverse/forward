import { Icon } from "@/components/icon";
import {
  ACTIVE_STOREFRONT_COUNTRY,
  AVAILABLE_STOREFRONT_COUNTRIES,
  countryControlLabel,
} from "@/lib/storefront/localization";

/**
 * Topbar market indicator. Forward publishes exactly one market today, so the
 * control states that market truthfully instead of pretending to offer a
 * choice. When `AVAILABLE_STOREFRONT_COUNTRIES` grows, this becomes the seam
 * for a real selector.
 */
export function CountryControl() {
  return (
    <span className="inline-flex items-center gap-1.5 font-body text-[11px] font-ui tracking-[0.08em] uppercase">
      <Icon name="globe-hemisphere-west" size={14} />
      {countryControlLabel(ACTIVE_STOREFRONT_COUNTRY)}
      <span className="sr-only">
        {AVAILABLE_STOREFRONT_COUNTRIES.length === 1
          ? ". Forward currently ships to this market only."
          : ". Current shipping market and currency."}
      </span>
    </span>
  );
}
