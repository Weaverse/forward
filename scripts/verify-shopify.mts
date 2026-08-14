/**
 * Opt-in live read-only Shopify verification (`bun run verify:shopify`).
 *
 * Requires the existing Shopify environment. It performs no mutation and no
 * Admin API call: two `shop { name }` reads prove credential validity for the
 * public and private clients, then the real catalog/navigation adapter is
 * exercised end to end through the normalized contract.
 *
 * Output discipline — this script prints only:
 * counts, menu labels, product/collection handles, option and colorway names,
 * currency codes, media/metafield shape, and PASS/FAIL.
 *
 * It never prints tokens, environment values, request URLs, signed CDN
 * parameters, response headers, raw response bodies, or prices.
 */

import process from "node:process";

import {
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";

import { createStorefrontDataSource } from "../src/lib/storefront/data-source.ts";
import {
  CANONICAL_PRODUCT_HANDLES,
  getCatalogPresentationProfile,
} from "../src/lib/storefront/catalog-presentation.ts";
import { isShopifyProductImageUrl } from "../src/lib/storefront/image-source.ts";
import {
  CONTENT_ARTICLE_HANDLES,
  CONTENT_PAGE_HANDLES,
  CONTENT_POLICY_HANDLES,
} from "../src/lib/storefront/shopify/content-query.ts";
import { readShopifyCatalogConfig } from "../src/lib/storefront/shopify/env.ts";
import { safeErrorLabel } from "../src/lib/storefront/shopify/errors.ts";
import { SHOP_IDENTITY_QUERY } from "../src/lib/storefront/shopify/queries.ts";

const REQUIRED_ENV_KEYS = [
  "PUBLIC_STORE_DOMAIN",
  "PUBLIC_STOREFRONT_API_TOKEN",
  "PRIVATE_STOREFRONT_API_TOKEN",
] as const;

const CANONICAL_COLLECTION_HANDLES = [
  "forward",
  "outerwear",
  "packs",
  "footwear",
] as const;
const CANONICAL_VARIANT_COUNT = 78;

const CANONICAL_SHOP_LINKS = [
  "/shop/outerwear",
  "/shop/packs",
  "/shop/footwear",
] as const;

const CANONICAL_ABOUT_LINKS = [
  "/pages/materials-and-care",
  "/pages/fit-and-sizing",
  "/pages/field-testing",
  "/pages/field-repair",
  "/pages/shipping-returns",
  "/pages/contact",
] as const;

const CANONICAL_FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop/outerwear", label: "Outerwear" },
      { href: "/shop/packs", label: "Packs" },
      { href: "/shop/footwear", label: "Footwear" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/pages/about-forward", label: "About Forward" },
      { href: "/pages/field-repair", label: "Field Repair" },
      { href: "/pages/shipping-returns", label: "Shipping & Returns" },
      { href: "/pages/contact", label: "Contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/account", label: "Account" },
      { href: "/policies/shipping-policy", label: "Shipping" },
      { href: "/policies/refund-policy", label: "Returns" },
      { href: "/policies/privacy-policy", label: "Privacy" },
      { href: "/policies/terms-of-service", label: "Terms" },
    ],
  },
] as const;

const MEDIA_ROLES = ["primary", "alternate", "detail", "context"] as const;

const failures: string[] = [];

function check(label: string, ok: boolean, detail = ""): void {
  const suffix = detail.length > 0 ? ` — ${detail}` : "";
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${suffix}`);
  if (!ok) {
    failures.push(label);
  }
}

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required environment key: ${key}`);
  }
  return value.trim();
}

const missing = REQUIRED_ENV_KEYS.filter((key) => {
  const value = process.env[key];
  return typeof value !== "string" || value.trim().length === 0;
});
if (missing.length > 0) {
  console.error(
    `verify:shopify: missing required environment ${
      missing.length === 1 ? "key" : "keys"
    }: ${missing.join(", ")}`,
  );
  process.exit(1);
}

function requestContext() {
  return createShopifyRequestContext({
    request: { headers: new Headers() },
    i18n: { country: "US", language: "EN" },
  });
}

interface ShopIdentityResult {
  data?: unknown;
  errors?: unknown;
}

function readShopName(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const shop = (data as { shop?: unknown }).shop;
  if (typeof shop !== "object" || shop === null) {
    return null;
  }
  const name = (shop as { name?: unknown }).name;
  return typeof name === "string" && name.length > 0 ? name : null;
}

async function probeShopIdentity(
  label: string,
  run: () => Promise<ShopIdentityResult>,
): Promise<void> {
  try {
    const { data, errors } = await run();
    const name = readShopName(data);
    const ok = (!Array.isArray(errors) || errors.length === 0) && name !== null;
    check(label, ok, ok ? `shop identity resolved (${name})` : "no shop name");
  } catch (error) {
    check(label, false, safeErrorLabel(error));
  }
}

console.log("Forward — live read-only Shopify storefront verification\n");

const storeDomain = requiredEnv("PUBLIC_STORE_DOMAIN");

const publicClient = createStorefrontClient({
  type: "public",
  requestContext: requestContext(),
  config: {
    storeDomain,
    publicStorefrontToken: requiredEnv("PUBLIC_STOREFRONT_API_TOKEN"),
  },
});

const privateClient = createStorefrontClient({
  type: "private_no_buyer_context",
  requestContext: requestContext(),
  config: {
    storeDomain,
    privateStorefrontToken: requiredEnv("PRIVATE_STOREFRONT_API_TOKEN"),
  },
});

await probeShopIdentity("public client credential validity", () =>
  publicClient.graphql(SHOP_IDENTITY_QUERY),
);

await probeShopIdentity(
  "private_no_buyer_context client credential validity",
  () => privateClient.graphql(SHOP_IDENTITY_QUERY),
);

try {
  // This CLI runs outside the Next runtime. Exercise the exact Hydrogen
  // transport/mapping seam while leaving the production default Data Cache on.
  let collectionFallbackUsed = false;
  let footerFallbackUsed = false;
  let navigationFallbackUsed = false;
  const config = readShopifyCatalogConfig(process.env);
  if (config === null) {
    throw new Error("Shopify catalog mode is not configured.");
  }
  const storefront = createStorefrontDataSource(process.env, {
    useNextCache: false,
    onCollectionFallback: () => {
      collectionFallbackUsed = true;
    },
    onFooterFallback: () => {
      footerFallbackUsed = true;
    },
    onNavigationFallback: () => {
      navigationFallbackUsed = true;
    },
  });
  const navigation = await storefront.getNavigation();
  const shop = navigation.primary.find((item) => item.href === "/shop");
  const about = navigation.primary.find(
    (item) => item.href === "/pages/about-forward",
  );
  check(
    `live ${config.mainMenuHandle} has the canonical two-level tree`,
    !navigationFallbackUsed &&
      navigation.primary.map((item) => item.href).join(",") ===
        "/shop,/journal,/pages/about-forward,/search" &&
      shop?.children?.map((item) => item.href).join(",") ===
        CANONICAL_SHOP_LINKS.join(",") &&
      about?.children?.map((item) => item.href).join(",") ===
        CANONICAL_ABOUT_LINKS.join(","),
    navigationFallbackUsed
      ? "static safeguard active"
      : `${shop?.children?.length ?? 0} Shop children, ${about?.children?.length ?? 0} About children`,
  );
  check(
    "live footer has the canonical three-column tree",
    !footerFallbackUsed &&
      navigation.footerColumns.length === CANONICAL_FOOTER_COLUMNS.length &&
      navigation.footerColumns.every(
        (column, columnIndex) =>
          column.heading === CANONICAL_FOOTER_COLUMNS[columnIndex]?.heading &&
          column.links.length ===
            CANONICAL_FOOTER_COLUMNS[columnIndex]?.links.length &&
          column.links.every(
            (link, linkIndex) =>
              link.href ===
                CANONICAL_FOOTER_COLUMNS[columnIndex]?.links[linkIndex]?.href &&
              link.label ===
                CANONICAL_FOOTER_COLUMNS[columnIndex]?.links[linkIndex]?.label,
          ),
      ),
    footerFallbackUsed
      ? "static safeguard active"
      : `${navigation.footerColumns.length} live Footer columns`,
  );

  const products = await storefront.listProducts();

  check(
    "adapter returns the canonical catalog in order",
    products.length === CANONICAL_PRODUCT_HANDLES.length &&
      products.every(
        (product, index) => product.handle === CANONICAL_PRODUCT_HANDLES[index],
      ),
    products.map((product) => product.handle).join(", "),
  );

  for (const product of products) {
    const profile = getCatalogPresentationProfile(product.handle);
    const expectedOptionValues = profile?.optionValues;
    const optionsMatch =
      expectedOptionValues === undefined
        ? product.options.length === 0
        : product.options.length === 1 &&
          product.options[0]?.name === "Size" &&
          JSON.stringify(product.options[0].values) ===
            JSON.stringify(expectedOptionValues);
    const optionSelections =
      expectedOptionValues === undefined
        ? [[]]
        : expectedOptionValues.map((value) => [{ name: "Size", value }]);
    const expectedVariants =
      profile === null
        ? []
        : Object.values(profile.colorways).flatMap((colorway) =>
            optionSelections.map((selectedOptions) => ({
              colorwayId: colorway.id,
              selectedOptions,
            })),
          );
    const variantsMatchOrder =
      product.variants.length === expectedVariants.length &&
      product.variants.every((variant, index) => {
        const expected = expectedVariants[index];
        return (
          expected !== undefined &&
          variant.colorwayId === expected.colorwayId &&
          JSON.stringify(variant.selectedOptions) ===
            JSON.stringify(expected.selectedOptions)
        );
      });
    check(
      `${product.handle} money`,
      product.price.currencyCode === "USD" &&
        Number.isFinite(product.price.amount) &&
        product.price.amount > 0,
      "USD minimum variant price present",
    );

    check(
      `${product.handle} options`,
      profile !== null && optionsMatch,
      product.options.length === 0
        ? "no non-Color options"
        : product.options
            .map((option) => `${option.name} x${option.values.length}`)
            .join(", "),
    );
    check(
      `${product.handle} variant order`,
      profile !== null && variantsMatchOrder,
      `${product.variants.length} canonical combinations in order`,
    );

    const colorwayIds = product.colorways.map((colorway) => colorway.id);
    check(
      `${product.handle} colorways`,
      new Set(colorwayIds).size === colorwayIds.length &&
        colorwayIds.length > 0,
      colorwayIds.join(", "),
    );

    const mediaOk = product.colorways.every((colorway) =>
      MEDIA_ROLES.every((role) => {
        const image = colorway.images[role];
        return (
          isShopifyProductImageUrl(image.src) &&
          Number.isInteger(image.width) &&
          image.width > 0 &&
          Number.isInteger(image.height) &&
          image.height > 0 &&
          image.alt.trim().length > 0
        );
      }),
    );
    check(
      `${product.handle} media`,
      mediaOk,
      `${product.colorways.length} colorways x ${MEDIA_ROLES.length} owned CDN roles`,
    );

    check(
      `${product.handle} metafield-derived fields`,
      product.specs.length > 0 &&
        product.care.length > 0 &&
        product.detailParagraphs.length > 0,
      `${product.specs.length} spec rows, ${product.care.length} care lines, ${product.detailParagraphs.length} detail paragraphs`,
    );
  }

  const variantCount = products.reduce(
    (total, product) => total + product.variants.length,
    0,
  );
  check(
    "canonical variant matrix",
    variantCount === CANONICAL_VARIANT_COUNT,
    `${variantCount} exact merchandise identities`,
  );

  const collections = await storefront.listCollections();
  const canonicalCollectionsInOrder =
    collections.length === CANONICAL_COLLECTION_HANDLES.length &&
    collections.every(
      (collection, index) =>
        collection.handle === CANONICAL_COLLECTION_HANDLES[index],
    );

  for (const handle of CANONICAL_COLLECTION_HANDLES) {
    const collectionProducts = await storefront.getCollectionProducts(handle);
    check(
      `collection ${handle} resolves through the live catalog`,
      collectionProducts !== null && collectionProducts.length > 0,
      `${collectionProducts?.length ?? 0} products`,
    );
  }

  check(
    "unknown handles resolve to null",
    (await storefront.getProduct("__forward-missing__")) === null &&
      (await storefront.getCollectionProducts("frontpage")) === null,
    "no invented catalog records",
  );

  check(
    "canonical collection reads stayed live and in contract order",
    !collectionFallbackUsed && canonicalCollectionsInOrder,
    collectionFallbackUsed
      ? "static safeguard active"
      : collections.map((collection) => collection.handle).join(", "),
  );

  const emptySearch = await storefront.searchProducts("   ");
  const trailSearch = await storefront.searchProducts("trail");
  check(
    "normalized search semantics",
    emptySearch.length === 0 && trailSearch.length > 0,
    `"trail" -> ${trailSearch.map((product) => product.handle).join(", ")}`,
  );

  const pages = await storefront.listPages();
  const articles = await storefront.listArticles();

  check(
    "approved live page handles",
    pages.length === CONTENT_PAGE_HANDLES.length &&
      pages.every((page, index) => page.handle === CONTENT_PAGE_HANDLES[index]),
    pages.map((page) => `${page.handle}:${page.title}`).join(", "),
  );
  check(
    "approved live article handles",
    articles.length === CONTENT_ARTICLE_HANDLES.length &&
      articles.every(
        (article, index) => article.handle === CONTENT_ARTICLE_HANDLES[index],
      ),
    articles.map((article) => `${article.handle}:${article.title}`).join(", "),
  );
  check(
    "live content titles are non-empty",
    [...pages, ...articles].every((entry) => entry.title.trim().length > 0),
    `${pages.length} pages, ${articles.length} articles`,
  );

  const policies = await storefront.listPolicies();
  check(
    "approved live policy handles",
    policies.length === CONTENT_POLICY_HANDLES.length &&
      policies.every(
        (policy, index) => policy.handle === CONTENT_POLICY_HANDLES[index],
      ),
    policies.map((policy) => `${policy.handle}:${policy.title}`).join(", "),
  );
  check(
    "policy titles are non-empty",
    policies.every((policy) => policy.title.trim().length > 0),
    `${policies.length} policies`,
  );
  const privacy = policies.find((policy) => policy.handle === "privacy-policy");
  const privacyLinks =
    privacy?.sections
      .flatMap((section) => section.paragraphs)
      .flat()
      .filter((run) => run.href !== undefined) ?? [];
  check(
    "rendered privacy policy is normalized with link semantics",
    privacy !== undefined &&
      privacy.sections.length > 0 &&
      privacyLinks.length > 0,
    `${privacy?.sections.length ?? 0} sections, ${privacyLinks.length} links`,
  );
} catch (error) {
  check("live storefront adapter", false, safeErrorLabel(error));
}

console.log("");
if (failures.length > 0) {
  console.error(`FAIL — ${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("PASS — live read-only storefront verification succeeded.");
