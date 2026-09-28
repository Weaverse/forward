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
import { isShopifyProductImageUrl } from "../src/lib/storefront/image-source.ts";
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
  "/shop/forward",
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
      { href: "/shop/forward", label: "All products" },
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

/** The Forward demo store's published content; the theme reads any store's. */
const CANONICAL_PAGE_HANDLES = [
  "about-forward",
  "field-repair",
  "shipping-returns",
  "contact",
  "materials-and-care",
  "fit-and-sizing",
  "field-testing",
] as const;

const CANONICAL_ARTICLE_HANDLES = [
  "layering-for-moving-weather",
  "packing-thirty-liters-for-a-long-day",
  "reading-the-trail-underfoot",
  "how-we-test-a-shell-before-calling-it-weatherproof",
  "a-two-day-kit-built-around-nine-kilograms",
  "repair-notes-what-five-years-of-use-should-look-like",
] as const;

const CANONICAL_POLICY_HANDLES = [
  "privacy-policy",
  "refund-policy",
  "shipping-policy",
  "terms-of-service",
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
  const config = readShopifyCatalogConfig(process.env);
  if (config === null) {
    throw new Error("Shopify catalog mode is not configured.");
  }
  const storefront = createStorefrontDataSource(process.env, {
    useNextCache: false,
  });
  const navigation = await storefront.getNavigation();
  const shop = navigation.primary.find((item) => item.href === "/shop/forward");
  const about = navigation.primary.find(
    (item) => item.href === "/pages/about-forward",
  );
  check(
    "live main-menu has the canonical two-level tree",
    navigation.primary.map((item) => item.href).join(",") ===
      "/shop/forward,/journal,/pages/about-forward,/search" &&
      shop?.children?.map((item) => item.href).join(",") ===
        CANONICAL_SHOP_LINKS.join(",") &&
      about?.children?.map((item) => item.href).join(",") ===
        CANONICAL_ABOUT_LINKS.join(","),
    `${shop?.children?.length ?? 0} Shop children, ${about?.children?.length ?? 0} About children`,
  );
  check(
    "live footer has the canonical three-column tree",
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
    `${navigation.footerColumns.length} live Footer columns`,
  );

  const products = await storefront.listProducts();

  check(
    "adapter returns a non-empty catalog with unique handles",
    products.length > 0 &&
      new Set(products.map((product) => product.handle)).size ===
        products.length,
    products.map((product) => product.handle).join(", "),
  );

  for (const product of products) {
    check(
      `${product.handle} money`,
      product.price.currencyCode === "USD" &&
        Number.isFinite(product.price.amount) &&
        product.price.amount > 0,
      "USD minimum variant price present",
    );

    check(
      `${product.handle} presentation from the store`,
      product.category.length > 0 && product.activities.length > 0,
      `type "${product.category}", ${product.activities.length} tags`,
    );

    /* Every published Color value must resolve to exactly one colorway, and
     * every variant must point at one of them. */
    const colorwayIds = new Set(product.colorways.map((entry) => entry.id));
    check(
      `${product.handle} colorways`,
      colorwayIds.size === product.colorways.length &&
        product.variants.every((variant) =>
          colorwayIds.has(variant.colorwayId),
        ),
      product.colorways.map((entry) => entry.name).join(", "),
    );

    const optionValueCount = product.options.reduce(
      (total, option) => total * option.values.length,
      1,
    );
    check(
      `${product.handle} variant matrix`,
      product.variants.length === product.colorways.length * optionValueCount,
      product.options.length === 0
        ? "no non-Color options"
        : product.options
            .map((option) => `${option.name} x${option.values.length}`)
            .join(", "),
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
  const publishedHandles = new Set(
    collections.map((collection) => collection.handle),
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
      (await storefront.getCollectionProducts("__forward-missing__")) === null,
    "no invented catalog records",
  );

  check(
    "every canonical collection is published",
    CANONICAL_COLLECTION_HANDLES.every((handle) =>
      publishedHandles.has(handle),
    ),
    collections.map((collection) => collection.handle).join(", "),
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

  const pageHandles = new Set(pages.map((page) => page.handle));
  const articleHandles = new Set(articles.map((article) => article.handle));
  check(
    "every canonical page is published",
    CANONICAL_PAGE_HANDLES.every((handle) => pageHandles.has(handle)),
    pages.map((page) => `${page.handle}:${page.title}`).join(", "),
  );
  check(
    "every canonical article is published",
    CANONICAL_ARTICLE_HANDLES.every((handle) => articleHandles.has(handle)),
    articles.map((article) => `${article.handle}:${article.title}`).join(", "),
  );
  check(
    "live content titles are non-empty",
    [...pages, ...articles].every((entry) => entry.title.trim().length > 0),
    `${pages.length} pages, ${articles.length} articles`,
  );

  const policies = await storefront.listPolicies();
  check(
    "every canonical policy is published",
    CANONICAL_POLICY_HANDLES.every((handle) =>
      policies.some((policy) => policy.handle === handle),
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
