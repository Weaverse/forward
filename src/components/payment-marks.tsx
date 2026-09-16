import type { SVGProps } from "react";
import {
  AmericanExpressFlatIcon,
  DiscoverFlatIcon,
  JCBFlatIcon,
  MastercardFlatIcon,
  PayPalFlatIcon,
  VisaFlatIcon,
} from "react-svg-credit-card-payment-icons";

import {
  CHECKOUT_PAYMENT_MARKS,
  type PaymentMarkId,
} from "@/lib/storefront/integrations";

/** Every mark is normalized to a 780×500 card, so one size fits the row. */
const MARK_HEIGHT = 22;
const MARK_WIDTH = 34;

const MARK_ICONS = {
  "american-express": AmericanExpressFlatIcon,
  discover: DiscoverFlatIcon,
  jcb: JCBFlatIcon,
  mastercard: MastercardFlatIcon,
  paypal: PayPalFlatIcon,
  visa: VisaFlatIcon,
} as const satisfies Record<
  PaymentMarkId,
  (props: SVGProps<SVGSVGElement>) => React.JSX.Element
>;

/**
 * Footer payment row.
 *
 * The marks come from `CHECKOUT_PAYMENT_MARKS`, which serves verified methods
 * once the Store reports any and labelled previews until then. An empty list
 * renders nothing rather than an empty rail.
 */
export function PaymentMarks() {
  if (CHECKOUT_PAYMENT_MARKS.length === 0) {
    return null;
  }

  return (
    <ul
      className="m-0 flex list-none items-center gap-1.5 p-0"
      aria-label="Accepted payment methods"
    >
      {CHECKOUT_PAYMENT_MARKS.map(({ id, label }) => {
        const Mark = MARK_ICONS[id];
        return (
          <li key={id} className="flex">
            <Mark
              role="img"
              aria-label={label}
              width={MARK_WIDTH}
              height={MARK_HEIGHT}
              className="rounded-xs"
            />
          </li>
        );
      })}
    </ul>
  );
}
