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
        handle: "forward-main-menu",
        items: [
          {
            id: "gid://shopify/MenuItem/shop",
            title: "Shop",
            url: `${SHOP_ORIGIN}/collections/forward`,
            items: [
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
            items: [],
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
                { handle: "ridge-30-field-pack" },
                { handle: "talus-trail-shoe" },
              ],
            },
          },
          {
            handle: "outerwear",
            title: "Outerwear",
            description: "Weather protection for exposed ground.",
            products: {
              pageInfo: { hasNextPage: false },
              nodes: [{ handle: "weatherline-shell" }],
            },
          },
          {
            handle: "packs",
            title: "Packs",
            description: "Carry systems for long field days.",
            products: {
              pageInfo: { hasNextPage: false },
              nodes: [{ handle: "ridge-30-field-pack" }],
            },
          },
          {
            handle: "footwear",
            title: "Footwear",
            description: "Trail footwear for changing terrain.",
            products: {
              pageInfo: { hasNextPage: false },
              nodes: [{ handle: "talus-trail-shoe" }],
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
