export interface ShopifyMenuItemFixture {
  id: string;
  title: string;
  url: string;
  items: ShopifyMenuItemFixture[];
}

export interface ShopifyCollectionFixture {
  handle: string;
  title: string;
  description: string;
  products: {
    pageInfo: { hasNextPage: boolean };
    nodes: Array<{ handle: string }>;
  };
}

export interface NavigationResponse {
  data: {
    menu: {
      handle: string;
      items: ShopifyMenuItemFixture[];
    } | null;
    footerMenu: {
      handle: string;
      items: ShopifyMenuItemFixture[];
    } | null;
    collections: {
      pageInfo: { hasNextPage: boolean };
      nodes: ShopifyCollectionFixture[];
    };
  };
}

const SHOP_ORIGIN = "https://forward-test-shop.myshopify.com";

export function navigationResponse(): NavigationResponse {
  return {
    data: {
      menu: {
        handle: "main-menu",
        items: [
          {
            id: "gid://shopify/MenuItem/shop",
            title: "Shop",
            url: `${SHOP_ORIGIN}/collections/forward`,
            items: [
              {
                id: "gid://shopify/MenuItem/shop-all",
                title: "Shop all",
                url: `${SHOP_ORIGIN}/collections/forward`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/outerwear",
                title: "Outerwear",
                url: `${SHOP_ORIGIN}/collections/outerwear`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/packs",
                title: "Packs",
                url: `${SHOP_ORIGIN}/collections/packs`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/footwear",
                title: "Footwear",
                url: `${SHOP_ORIGIN}/collections/footwear`,
                items: [],
              },
            ],
          },
          {
            id: "gid://shopify/MenuItem/field-notes",
            title: "Field Notes",
            url: `${SHOP_ORIGIN}/blogs/field-notes`,
            items: [],
          },
          {
            id: "gid://shopify/MenuItem/about",
            title: "About",
            url: `${SHOP_ORIGIN}/pages/about-forward`,
            items: [
              {
                id: "gid://shopify/MenuItem/materials-and-care",
                title: "Materials & Care",
                url: `${SHOP_ORIGIN}/pages/materials-and-care`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/fit-and-sizing",
                title: "Fit & Sizing",
                url: `${SHOP_ORIGIN}/pages/fit-and-sizing`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/field-testing",
                title: "Field Testing",
                url: `${SHOP_ORIGIN}/pages/field-testing`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/main-field-repair",
                title: "Field Repair",
                url: `${SHOP_ORIGIN}/pages/field-repair`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/main-shipping-returns",
                title: "Shipping & Returns",
                url: `${SHOP_ORIGIN}/pages/shipping-returns`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/main-contact",
                title: "Contact",
                url: `${SHOP_ORIGIN}/pages/contact`,
                items: [],
              },
            ],
          },
        ],
      },
      footerMenu: {
        handle: "footer",
        items: [
          {
            id: "gid://shopify/MenuItem/footer-shop",
            title: "Shop",
            url: `${SHOP_ORIGIN}/collections/forward`,
            items: [
              {
                id: "gid://shopify/MenuItem/footer-all-products",
                title: "All products",
                url: `${SHOP_ORIGIN}/collections/forward`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/footer-outerwear",
                title: "Outerwear",
                url: `${SHOP_ORIGIN}/collections/outerwear`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/footer-packs",
                title: "Packs",
                url: `${SHOP_ORIGIN}/collections/packs`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/footer-footwear",
                title: "Footwear",
                url: `${SHOP_ORIGIN}/collections/footwear`,
                items: [],
              },
            ],
          },
          {
            id: "gid://shopify/MenuItem/footer-company",
            title: "Company",
            url: `${SHOP_ORIGIN}/pages/about-forward`,
            items: [
              {
                id: "gid://shopify/MenuItem/about-forward",
                title: "About Forward",
                url: `${SHOP_ORIGIN}/pages/about-forward`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/field-repair",
                title: "Field Repair",
                url: `${SHOP_ORIGIN}/pages/field-repair`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/shipping-returns",
                title: "Shipping & Returns",
                url: `${SHOP_ORIGIN}/pages/shipping-returns`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/contact",
                title: "Contact",
                url: `${SHOP_ORIGIN}/pages/contact`,
                items: [],
              },
            ],
          },
          {
            id: "gid://shopify/MenuItem/footer-support",
            title: "Support",
            url: `${SHOP_ORIGIN}/account`,
            items: [
              {
                id: "gid://shopify/MenuItem/account",
                title: "Account",
                url: `${SHOP_ORIGIN}/account`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/shipping-policy",
                title: "Shipping",
                url: `${SHOP_ORIGIN}/policies/shipping-policy`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/refund-policy",
                title: "Returns",
                url: `${SHOP_ORIGIN}/policies/refund-policy`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/privacy-policy",
                title: "Privacy",
                url: `${SHOP_ORIGIN}/policies/privacy-policy`,
                items: [],
              },
              {
                id: "gid://shopify/MenuItem/terms-of-service",
                title: "Terms",
                url: `${SHOP_ORIGIN}/policies/terms-of-service`,
                items: [],
              },
            ],
          },
        ],
      },
      collections: {
        pageInfo: { hasNextPage: false },
        nodes: [
          {
            handle: "forward",
            title: "Forward",
            description: "The complete Forward catalog.",
            products: {
              pageInfo: { hasNextPage: false },
              nodes: [
                { handle: "weatherline-shell" },
                { handle: "traverse-grid-fleece" },
                { handle: "drift-insulated-vest" },
                { handle: "ridge-30-field-pack" },
                { handle: "approach-18-day-pack" },
                { handle: "waypoint-sling-6" },
                { handle: "talus-trail-shoe" },
                { handle: "scree-approach-shoe" },
                { handle: "camp-recovery-clog" },
              ],
            },
          },
          {
            handle: "outerwear",
            title: "Outerwear",
            description: "Weather protection for exposed ground.",
            products: {
              pageInfo: { hasNextPage: false },
              nodes: [
                { handle: "weatherline-shell" },
                { handle: "traverse-grid-fleece" },
                { handle: "drift-insulated-vest" },
              ],
            },
          },
          {
            handle: "packs",
            title: "Packs",
            description: "Carry systems for long field days.",
            products: {
              pageInfo: { hasNextPage: false },
              nodes: [
                { handle: "ridge-30-field-pack" },
                { handle: "approach-18-day-pack" },
                { handle: "waypoint-sling-6" },
              ],
            },
          },
          {
            handle: "footwear",
            title: "Footwear",
            description: "Trail footwear for changing terrain.",
            products: {
              pageInfo: { hasNextPage: false },
              nodes: [
                { handle: "talus-trail-shoe" },
                { handle: "scree-approach-shoe" },
                { handle: "camp-recovery-clog" },
              ],
            },
          },
        ],
      },
    },
  };
}

export function navigationResponseWith(
  mutate: (response: NavigationResponse) => void,
): NavigationResponse {
  const response = structuredClone(navigationResponse());
  mutate(response);
  return response;
}
