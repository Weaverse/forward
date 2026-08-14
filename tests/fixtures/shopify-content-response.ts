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
  "materials-and-care",
  "fit-and-sizing",
  "field-testing",
] as const;

const ARTICLE_HANDLES = [
  "layering-for-moving-weather",
  "packing-thirty-liters-for-a-long-day",
  "reading-the-trail-underfoot",
  "how-we-test-a-shell-before-calling-it-weatherproof",
  "a-two-day-kit-built-around-nine-kilograms",
  "repair-notes-what-five-years-of-use-should-look-like",
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
    // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
    materialsAndCare: any;
    // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
    fitAndSizing: any;
    // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
    fieldTesting: any;
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
  const materialsAndCare = page(
    "materials-and-care",
    "Materials & Care",
    "What our fabrics are made of, and what keeps them working.",
    [
      "<p>What our fabrics are made of, and what keeps them working.</p>",
      "<h2>Face fabrics and membranes</h2>",
      "<p>Shell fabrics are woven from recycled nylon and bonded to a breathable waterproof membrane.</p>",
      "<h2>Washing and reproofing</h2>",
      "<p>Wash technical fabrics with a dedicated cleaner and restore the finish with low heat.</p>",
    ].join(""),
  );
  const fitAndSizing = page(
    "fit-and-sizing",
    "Fit & Sizing",
    "How Forward layers are cut, and how to choose between two sizes.",
    [
      "<p>How Forward layers are cut, and how to choose between two sizes.</p>",
      "<h2>Apparel fit</h2>",
      "<p>Shells are cut to clear a midlayer; fleece and insulation are cut trimmer for movement.</p>",
      "<h2>Footwear sizing</h2>",
      '<p>Footwear runs true to US sizing. Ask <a href="/pages/contact">Contact</a> before ordering two sizes.</p>',
    ].join(""),
  );
  const fieldTesting = page(
    "field-testing",
    "Field Testing",
    "How a product earns its place in a short catalog.",
    [
      "<p>How a product earns its place in a short catalog.</p>",
      "<h2>What we test</h2>",
      "<p>Every product is tested wet, loaded, and cold before it is offered for sale.</p>",
      "<h2>What ends a test</h2>",
      "<p>A failure that cannot be repaired in the field ends the test and sends the pattern back.</p>",
    ].join(""),
  );
  return {
    data: {
      aboutForward,
      fieldRepair,
      shippingReturns,
      contact,
      materialsAndCare,
      fitAndSizing,
      fieldTesting,
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
            article(
              "how-we-test-a-shell-before-calling-it-weatherproof",
              "How We Test a Shell Before Calling It Weatherproof",
              "Hose tests, hill days, and the point where a seam decides everything.",
              "2026-04-22",
              "<p>A shell is not weatherproof because a lab number says so.</p><p>We wear the same pattern through wet hill days until a seam or a cuff tells us the truth.</p>",
            ),
            article(
              "a-two-day-kit-built-around-nine-kilograms",
              "A Two-Day Kit Built Around Nine Kilograms",
              "The overnight list that fits a thirty-liter pack without leaving margin behind.",
              "2026-03-19",
              "<p>Nine kilograms is the weight where an overnight still moves like a day.</p><p>Everything on the list earns its place twice: once on the back, once in use.</p>",
            ),
            article(
              "repair-notes-what-five-years-of-use-should-look-like",
              "Repair Notes: What Five Years of Use Should Look Like",
              "Wear patterns, honest failures, and the repairs that keep gear in service.",
              "2026-02-11",
              "<p>Five years of honest use leaves marks worth reading.</p><p>Most of what comes through the workshop is wear, not failure, and wear is repairable.</p>",
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
