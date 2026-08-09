/**
 * Static policy fixture records. Only the data source may import this file.
 * `shipping-policy` is the approved route-smoke policy handle.
 */

import type { Policy } from "../types";

const POLICY_FIXTURE_COPY = [
  {
    handle: "shipping-policy",
    title: "Shipping Policy",
    updatedAt: "2026-07-01",
    summary:
      "Where we ship, how long it takes, and what it costs. The short version: carbon-neutral carriers, honest timelines, free over $150.",
    sections: [
      {
        heading: "Destinations and timelines",
        paragraphs: [
          "We ship to the United States, Canada, the United Kingdom, the European Union, and Norway. Domestic orders leave the warehouse within two business days and typically arrive in three to five. International orders allow seven to ten business days plus any customs handling.",
          "During launch periods dispatch can stretch by a day or two; the order status page always shows the current honest estimate.",
        ],
      },
      {
        heading: "Costs",
        paragraphs: [
          "Standard shipping is free on orders over $150. Below that, domestic standard is a flat $8 and international is calculated at checkout by destination. Expedited options appear at checkout where the destination supports them.",
        ],
      },
      {
        heading: "Duties and taxes",
        paragraphs: [
          "Orders to the UK, EU, and Norway ship delivered-duty-paid: the price at checkout is the final price. Canadian orders may collect duties at the door depending on carrier and province.",
        ],
      },
      {
        heading: "Carriers and packaging",
        paragraphs: [
          "We use carbon-neutral carrier programs on every lane and ship in paper-based packaging with no plastic fill. Boxes are sized to the order, which is why a pair of laces does not arrive in a shoe box.",
        ],
      },
    ],
  },
  {
    handle: "refund-policy",
    title: "Return Policy",
    updatedAt: "2026-07-01",
    summary:
      "Sixty days, worn or not. If it did not work for you, send it back and we will make it right.",
    sections: [
      {
        heading: "The window",
        paragraphs: [
          "You have sixty days from delivery to return or exchange anything, in any condition short of destroyed. Gear is meant to be tested outside; a muddy sole does not void a return.",
        ],
      },
      {
        heading: "How returns work",
        paragraphs: [
          "Start a return from your account or the contact address below. We issue a prepaid label for domestic returns; international returns are shipped at cost. Refunds land on the original payment method within five business days of the item reaching the warehouse.",
          "Returned items that cannot be resold are cleaned, repaired, and moved to the seconds program rather than discarded.",
        ],
      },
      {
        heading: "Warranty",
        paragraphs: [
          "Defects in materials or workmanship are covered for the life of the product, which is a repairs conversation rather than a returns one — see the Repairs page. Wear and tear is what the repairs program is for; misadventure is what it is best at.",
        ],
      },
    ],
  },
  {
    handle: "privacy-policy",
    title: "Privacy Policy",
    updatedAt: "2026-06-12",
    summary:
      "We collect what an order needs and nothing more. No ad-tech resale, no dark patterns, no surprises.",
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "Placing an order requires a name, shipping address, email, and payment handled by our payment processor — card numbers never touch our servers. Creating an account additionally stores your order history and saved addresses.",
        ],
      },
      {
        heading: "What we do with it",
        paragraphs: [
          "Fulfil orders, answer support requests, and — only if you opt in — send the occasional journal dispatch. We do not sell or rent personal data, and we do not enrich it with third-party profiles.",
        ],
      },
      {
        heading: "Your controls",
        paragraphs: [
          "You can export or delete your account data at any time from account settings or by writing to the address below. Deletion removes everything except records we are legally required to keep for tax purposes.",
        ],
      },
    ],
  },
  {
    handle: "terms-of-service",
    title: "Terms of Service",
    updatedAt: "2026-06-12",
    summary:
      "The legal frame for using this store, written to be read: fair use, honest pricing, and the rules both sides agree to.",
    sections: [
      {
        heading: "The agreement",
        paragraphs: [
          "Using this store means agreeing to these terms. They exist to keep the relationship predictable: we describe products accurately, charge what we display, and deliver what you order; you use the site lawfully and provide accurate information at checkout.",
        ],
      },
      {
        heading: "Pricing and availability",
        paragraphs: [
          "Prices are in US dollars unless stated otherwise and can change without notice, though never for an order already placed. If a listing error prices a product absurdly, we may cancel the order and refund in full rather than honor the mistake.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "Gear reduces risk; it does not remove it. Forward is not liable for injuries arising from the activities our products are designed for. Use judgment, check conditions, and tell someone where you are going.",
        ],
      },
    ],
  },
] as const;

export const POLICY_FIXTURES: readonly Policy[] = POLICY_FIXTURE_COPY.map(
  (policy) => ({
    ...policy,
    sections: policy.sections.map((section) => ({
      ...section,
      paragraphs: section.paragraphs.map((text) => [{ text }]),
    })),
  }),
);
