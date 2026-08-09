/**
 * Synthetic Storefront API content responses for Shopify content-adapter tests.
 *
 * These are live-shaped, hand-authored payloads for approved Forward handles.
 * They contain no real shop data, credentials, or captured response bodies.
 */

const PAGE_HANDLES = [
  "about-forward",
  "field-repair",
  "shipping-returns",
  "contact",
] as const;

const ARTICLE_HANDLES = [
  "layering-for-moving-weather",
  "packing-thirty-liters-for-a-long-day",
  "reading-the-trail-underfoot",
] as const;

const POLICY_HANDLES = [
  "privacy-policy",
  "refund-policy",
  "shipping-policy",
  "terms-of-service",
] as const;

function page(
  handle: (typeof PAGE_HANDLES)[number],
  title: string,
  bodySummary: string,
  body: string,
) {
  return { handle, title, bodySummary, body };
}

function article(
  handle: (typeof ARTICLE_HANDLES)[number],
  title: string,
  excerpt: string,
  publishedAt: string,
  contentHtml: string,
) {
  return { handle, title, excerpt, publishedAt, contentHtml };
}

function policy(
  handle: (typeof POLICY_HANDLES)[number],
  title: string,
  body: string,
) {
  return { handle, title, body };
}

export interface ContentResponse {
  data: {
    // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
    aboutForward: any;
    // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
    fieldRepair: any;
    // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
    shippingReturns: any;
    // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
    contact: any;
    blog: {
      handle: string;
      articles: {
        pageInfo: { hasNextPage: boolean };
        // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
        nodes: any[];
      };
    } | null;
    shop: {
      privacyPolicy: unknown;
      refundPolicy: unknown;
      shippingPolicy: unknown;
      termsOfService: unknown;
    };
  };
}

/** Fresh, mutable, approved live-shaped content response. */
export function contentResponse(): ContentResponse {
  const aboutForward = page(
    "about-forward",
    "About Forward",
    "Forward makes a short list of gear for moving through weather, not around it.",
    "<p>Forward makes a short list of gear for moving through weather, not around it.</p><p>We revise the products we already make before adding new ones.</p>",
  );
  const fieldRepair = page(
    "field-repair",
    "Field Repair",
    "Small damage should not end a trip or a product’s useful life.",
    "<p>Small damage should not end a trip or a product’s useful life.</p><p>Clean and dry the affected area, then use a compatible repair patch.</p>",
  );
  const shippingReturns = page(
    "shipping-returns",
    "Shipping & Returns",
    "Orders are prepared within two business days. Delivery estimates appear at checkout.",
    "<p>Orders are prepared within two business days. Delivery estimates appear at checkout.</p><p>Contact support before returning worn equipment.</p>",
  );
  const contact = page(
    "contact",
    "Contact",
    "Questions about fit, repairs, or an order can be sent to Forward support.",
    "<p>Questions about fit, repairs, or an order can be sent to Forward support.</p>",
  );
  return {
    data: {
      aboutForward,
      fieldRepair,
      shippingReturns,
      contact,
      blog: {
        handle: "field-notes",
        articles: {
          pageInfo: { hasNextPage: false },
          nodes: [
            article(
              "layering-for-moving-weather",
              "Layering for Moving Weather",
              "How to layer for long climbs, fast descents, and uncertain forecasts.",
              "2026-07-24",
              "<p>Weather changes quickly when the route climbs above the trees.</p><p>Begin the climb slightly cool so the first hour does not soak your midlayer.</p>",
            ),
            article(
              "packing-thirty-liters-for-a-long-day",
              "Packing Thirty Liters for a Long Day",
              "The honest pack list for a full mountain day.",
              "2026-06-10",
              "<p>Thirty liters gives enough margin for weather, food, and the unexpected.</p><p>Count the layers, water, shelter margin, and repair kit first.</p>",
            ),
            article(
              "reading-the-trail-underfoot",
              "Reading the Trail Underfoot",
              "Foot placement, pace, and terrain cues for moving efficiently.",
              "2026-05-08",
              "<p>Terrain speaks early if you look down often enough.</p><p>Small shifts in texture usually tell you more than the color of the trail.</p>",
            ),
          ],
        },
      },
      shop: {
        privacyPolicy: policy(
          "privacy-policy",
          "Privacy Policy",
          [
            "<h2>What we collect</h2>",
            "<p>Placing an order requires a name, shipping address, and email.</p>",
            "<h2>Your controls</h2>",
            '<p>For account or privacy requests, visit <a href="/pages/contact">Contact</a>.</p>',
          ].join(""),
        ),
        refundPolicy: policy(
          "refund-policy",
          "Refund Policy",
          [
            "<h2>The window</h2>",
            "<p>You have sixty days from delivery to request a return or exchange.</p>",
          ].join(""),
        ),
        shippingPolicy: policy(
          "shipping-policy",
          "Shipping Policy",
          [
            "<h2>Destinations and timelines</h2>",
            "<p>Domestic orders usually arrive in three to five business days.</p>",
          ].join(""),
        ),
        termsOfService: policy(
          "terms-of-service",
          "Terms of Service",
          [
            "<h2>The agreement</h2>",
            "<p>Using this store means agreeing to these terms.</p>",
          ].join(""),
        ),
      },
    },
  };
}

export function contentResponseWith(
  mutate: (response: ContentResponse) => void,
): ContentResponse {
  const response = contentResponse();
  mutate(response);
  return response;
}

export function contentResponseWithLiquidPrivacy(): ContentResponse {
  return contentResponseWith((response) => {
    response.data.shop.privacyPolicy = policy(
      "privacy-policy",
      "Privacy Policy",
      "<p>{{ shop.name }}</p>",
    );
  });
}

export function contentResponseWithScript(): ContentResponse {
  return contentResponseWith((response) => {
    if (response.data.blog !== null) {
      response.data.blog.articles.nodes.splice(0, 1, {
        ...response.data.blog.articles.nodes[0],
        contentHtml:
          "<p>Safe start.</p><script>alert('nope')</script><p>Unsafe end.</p>",
      });
    }
  });
}

export function contentResponseWithEventHandler(): ContentResponse {
  return contentResponseWith((response) => {
    response.data.aboutForward = {
      ...response.data.aboutForward,
      body: '<p onclick="alert(1)">Unsafe paragraph.</p>',
    };
  });
}

export function contentResponseWithUnapprovedAttribute(): ContentResponse {
  return contentResponseWith((response) => {
    response.data.aboutForward = {
      ...response.data.aboutForward,
      body: '<p class="marketing-copy">Styled paragraph.</p>',
    };
  });
}
