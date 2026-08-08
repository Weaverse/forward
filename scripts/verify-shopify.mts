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
import { CANONICAL_PRODUCT_HANDLES } from "../src/lib/storefront/catalog-presentation.ts";
import { isShopifyProductImageUrl } from "../src/lib/storefront/image-source.ts";
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

const CANONICAL_SHOP_LINKS = [
  "/shop/outerwear",
  "/shop/packs",
  "/shop/footwear",
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
  let navigationFallbackUsed = false;
  const storefront = createStorefrontDataSource(process.env, {
    useNextCache: false,
    onCollectionFallback: () => {
      collectionFallbackUsed = true;
    },
    onNavigationFallback: () => {
      navigationFallbackUsed = true;
    },
  });
  const navigation = await storefront.getNavigation();
  const shop = navigation.primary.find((item) => item.href === "/shop");
  check(
    "live forward-main-menu has the canonical two-level tree",
    !navigationFallbackUsed &&
      navigation.primary.map((item) => item.href).join(",") ===
        "/shop,/journal,/pages/about-forward,/search" &&
      shop?.children?.map((item) => item.href).join(",") ===
        CANONICAL_SHOP_LINKS.join(","),
    navigationFallbackUsed
      ? "static safeguard active"
      : `${shop?.children?.length ?? 0} live Shop children`,
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
    check(
      `${product.handle} money`,
      product.price.currencyCode === "USD" &&
        Number.isFinite(product.price.amount) &&
        product.price.amount > 0,
      "USD minimum variant price present",
    );

    check(
      `${product.handle} options`,
      product.options.every((option) => option.name !== "Color"),
      product.options.length === 0
        ? "no non-Color options"
        : product.options
            .map((option) => `${option.name} x${option.values.length}`)
            .join(", "),
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
} catch (error) {
  check("live storefront adapter", false, safeErrorLabel(error));
}

console.log("");
if (failures.length > 0) {
  console.error(`FAIL — ${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("PASS — live read-only storefront verification succeeded.");
