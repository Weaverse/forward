/**
 * Storefront API -> normalized `Product` mapping.
 *
 * Every field is re-validated at runtime. The adapter has no fixture fallback,
 * so an unexpected shape must fail loudly here rather than degrade into
 * plausible-looking output.
 *
 * Ownership split:
 * - Shopify owns identity, copy, price, options, media, and the five `forward`
 *   metafields;
 * - `catalog-presentation.ts` owns plate, category, activities, subtitle,
 *   repair copy, related-handle order, colorway IDs, and swatch colors.
 */

import {
  CANONICAL_PRODUCT_HANDLES,
  type CatalogPresentationProfile,
  getCatalogPresentationProfile,
} from "../catalog-presentation";
import { isShopifyProductImageUrl } from "../image-source";
import type {
  ColorwayImages,
  Money,
  Product,
  ProductColorway,
  ProductOption,
  ProductVariant,
  SpecRow,
  StorefrontImage,
} from "../types";
import type { CatalogQueryResult } from "./client";
import { ShopifyCatalogError } from "./errors";
import { CATALOG_OWNERSHIP_TAG } from "./queries";

/** Shopify option that becomes colorways instead of a normalized option. */
const COLOR_OPTION_NAME = "Color";

/** The normalized model is USD-only. */
const REQUIRED_CURRENCY_CODE = "USD";

/**
 * Colorway media roles, in the exact order the metafield lists media IDs.
 * `product.media.nodes` order is never treated as role or colorway order.
 */
const COLORWAY_MEDIA_ROLES = [
  "primary",
  "alternate",
  "detail",
  "context",
] as const;

const MEDIA_IDS_PER_COLORWAY = COLORWAY_MEDIA_ROLES.length;

/** Required Storefront metafield types for the five `forward` metafields. */
const METAFIELD_TYPES = {
  highlights: "list.single_line_text_field",
  materials: "multi_line_text_field",
  fieldSpecs: "json",
  care: "rich_text_field",
  colorwayMediaMap: "json",
} as const;

/** Trailing unit tokens rendered as a suffix in humanized spec labels. */
const SPEC_UNIT_LABELS: Readonly<Record<string, string>> = {
  mm: "mm",
  cm: "cm",
  m: "m",
  g: "g",
  kg: "kg",
  liters: "L",
  litres: "L",
  l: "L",
};

function fail(message: string): never {
  throw new ShopifyCatalogError(message);
}

function asRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${context} is not an object.`);
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown, context: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    fail(`${context} is not an array.`);
  }
  return value;
}

function asText(value: unknown, context: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${context} is missing or empty.`);
  }
  return value;
}

function asPositiveInteger(value: unknown, context: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    fail(`${context} is not a positive integer.`);
  }
  return value;
}

function parseJsonValue(raw: string, context: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return fail(`${context} is not valid JSON.`);
  }
}

/** Reads a metafield node, enforcing presence and the exact Storefront type. */
function readMetafieldValue(
  node: unknown,
  expectedType: string,
  context: string,
): string {
  if (node === null || node === undefined) {
    fail(`${context} is missing.`);
  }
  const record = asRecord(node, context);
  if (record.type !== expectedType) {
    fail(`${context} must be a "${expectedType}" metafield.`);
  }
  return asText(record.value, `${context} value`);
}

/* -------------------------------------------------------------------------- */
/* Money                                                                      */
/* -------------------------------------------------------------------------- */

function mapMoney(value: unknown, context: string): Money {
  const record = asRecord(value, context);
  if (record.currencyCode !== REQUIRED_CURRENCY_CODE) {
    fail(`${context} must be ${REQUIRED_CURRENCY_CODE}.`);
  }
  const raw = record.amount;
  if (typeof raw !== "string" && typeof raw !== "number") {
    fail(`${context} amount is missing.`);
  }
  if (typeof raw === "string" && raw.trim().length === 0) {
    fail(`${context} amount is empty.`);
  }
  const amount = typeof raw === "number" ? raw : Number(raw.trim());
  if (!Number.isFinite(amount) || amount < 0) {
    fail(`${context} amount is not a finite non-negative number.`);
  }
  return { amount, currencyCode: REQUIRED_CURRENCY_CODE };
}

/* -------------------------------------------------------------------------- */
/* Options and colorways                                                      */
/* -------------------------------------------------------------------------- */

interface MappedOptions {
  /** Exact Shopify `Color` labels in Shopify order. */
  colorLabels: readonly string[];
  /** Every non-Color option, in Shopify order. */
  options: readonly ProductOption[];
}

function mapOptions(value: unknown, handle: string): MappedOptions {
  const nodes = asArray(value, `${handle} options`);
  if (nodes.length === 0) {
    fail(`${handle} has no product options.`);
  }

  let colorLabels: readonly string[] | undefined;
  const options: ProductOption[] = [];

  for (const [index, node] of nodes.entries()) {
    const context = `${handle} option ${index}`;
    const record = asRecord(node, context);
    const name = asText(record.name, `${context} name`);
    const values = asArray(record.optionValues, `${context} optionValues`).map(
      (entry, valueIndex) =>
        asText(
          asRecord(entry, `${context} value ${valueIndex}`).name,
          `${context} value ${valueIndex} name`,
        ),
    );
    if (values.length === 0) {
      fail(`${context} has no values.`);
    }
    if (new Set(values).size !== values.length) {
      fail(`${context} has duplicate values.`);
    }

    if (name === COLOR_OPTION_NAME) {
      if (colorLabels !== undefined) {
        fail(`${handle} has more than one ${COLOR_OPTION_NAME} option.`);
      }
      colorLabels = values;
      continue;
    }
    options.push({ name, values });
  }

  if (colorLabels === undefined) {
    fail(`${handle} has no ${COLOR_OPTION_NAME} option.`);
  }
  return { colorLabels, options };
}

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

function mapMediaImages(
  value: unknown,
  handle: string,
): ReadonlyMap<string, StorefrontImage> {
  const connection = asRecord(value, `${handle} media`);
  const pageInfo = asRecord(connection.pageInfo, `${handle} media pageInfo`);
  if (pageInfo.hasNextPage === true) {
    fail(`${handle} has more media than the configured bound allows.`);
  }

  const nodes = asArray(connection.nodes, `${handle} media nodes`);
  const images = new Map<string, StorefrontImage>();

  for (const [index, node] of nodes.entries()) {
    const context = `${handle} media node ${index}`;
    const record = asRecord(node, context);
    if (record.__typename !== "MediaImage") {
      // Non-image media is allowed to exist; it simply cannot back a role.
      continue;
    }
    const id = asText(record.id, `${context} id`);
    if (images.has(id)) {
      fail(`${handle} returned duplicate media id ${id}.`);
    }
    const image = asRecord(record.image, `${context} image`);
    const src = asText(image.url, `${context} image url`);
    if (!isShopifyProductImageUrl(src)) {
      fail(`${context} image url is not an owned Shopify CDN media URL.`);
    }
    const width = asPositiveInteger(image.width, `${context} image width`);
    const height = asPositiveInteger(image.height, `${context} image height`);
    const alt =
      typeof image.altText === "string" && image.altText.trim().length > 0
        ? image.altText
        : record.alt;
    if (typeof alt !== "string" || alt.trim().length === 0) {
      fail(`${context} has no meaningful alt text.`);
    }
    images.set(id, { src, alt, width, height });
  }

  return images;
}

function parseColorwayMediaMap(
  raw: string,
  handle: string,
): ReadonlyMap<string, readonly string[]> {
  const context = `${handle} forward.colorway_media_map`;
  const parsed = asRecord(parseJsonValue(raw, context), context);
  const entries = new Map<string, readonly string[]>();

  for (const [label, value] of Object.entries(parsed)) {
    const ids = asArray(value, `${context} entry "${label}"`).map(
      (entry, index) =>
        asText(entry, `${context} entry "${label}" id ${index}`),
    );
    if (ids.length !== MEDIA_IDS_PER_COLORWAY) {
      fail(
        `${context} entry "${label}" must list exactly ${MEDIA_IDS_PER_COLORWAY} media ids.`,
      );
    }
    entries.set(label, ids);
  }

  if (entries.size === 0) {
    fail(`${context} is empty.`);
  }
  return entries;
}

function buildColorwayImages(
  ids: readonly string[],
  images: ReadonlyMap<string, StorefrontImage>,
  usedIds: Set<string>,
  context: string,
): ColorwayImages {
  const resolved: Partial<
    Record<(typeof COLORWAY_MEDIA_ROLES)[number], StorefrontImage>
  > = {};

  for (const [index, role] of COLORWAY_MEDIA_ROLES.entries()) {
    const id = ids[index];
    if (id === undefined) {
      fail(`${context} is missing the ${role} media id.`);
    }
    if (usedIds.has(id)) {
      fail(`${context} reuses media id ${id}.`);
    }
    const image = images.get(id);
    if (image === undefined) {
      fail(`${context} references unknown or non-image media id ${id}.`);
    }
    usedIds.add(id);
    resolved[role] = image;
  }

  const { primary, alternate, detail, context: contextImage } = resolved;
  if (
    primary === undefined ||
    alternate === undefined ||
    detail === undefined ||
    contextImage === undefined
  ) {
    fail(`${context} did not resolve all four media roles.`);
  }
  return { primary, alternate, detail, context: contextImage };
}

function mapColorways(
  colorLabels: readonly string[],
  mediaMap: ReadonlyMap<string, readonly string[]>,
  images: ReadonlyMap<string, StorefrontImage>,
  profile: CatalogPresentationProfile,
): readonly ProductColorway[] {
  const handle = profile.handle;
  const extraLabels = [...mediaMap.keys()].filter(
    (label) => !colorLabels.includes(label),
  );
  if (extraLabels.length > 0) {
    fail(
      `${handle} forward.colorway_media_map has entries for unknown ${COLOR_OPTION_NAME} values.`,
    );
  }

  const usedIds = new Set<string>();
  const seenIds = new Set<string>();
  const colorways: ProductColorway[] = [];

  for (const label of colorLabels) {
    /* Own-key lookup only: a live Color label such as "constructor" must not
       resolve through the prototype chain. */
    const presentation = Object.hasOwn(profile.colorways, label)
      ? profile.colorways[label]
      : undefined;
    if (presentation === undefined) {
      fail(
        `${handle} ${COLOR_OPTION_NAME} value "${label}" has no approved colorway mapping.`,
      );
    }
    if (seenIds.has(presentation.id)) {
      fail(`${handle} maps more than one colorway to id ${presentation.id}.`);
    }
    seenIds.add(presentation.id);

    const ids = mediaMap.get(label);
    if (ids === undefined) {
      fail(
        `${handle} forward.colorway_media_map has no entry for ${COLOR_OPTION_NAME} value "${label}".`,
      );
    }
    colorways.push({
      id: presentation.id,
      name: label,
      swatchColor: presentation.swatchColor,
      images: buildColorwayImages(
        ids,
        images,
        usedIds,
        `${handle} colorway "${label}"`,
      ),
    });
  }

  if (usedIds.size !== images.size) {
    fail(`${handle} has unreferenced MediaImage nodes.`);
  }

  return colorways;
}

/* -------------------------------------------------------------------------- */
/* Editorial metafields                                                       */
/* -------------------------------------------------------------------------- */

function splitParagraphs(text: string): readonly string[] {
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const DESCRIPTION_HTML_ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

/**
 * Shopify's plain `description` concatenates adjacent HTML paragraphs without
 * whitespace. Convert `descriptionHtml` to text ourselves so `</p><p>` remains
 * a paragraph boundary, while never rendering or returning untrusted markup.
 */
function descriptionHtmlParagraphs(html: string): readonly string[] {
  const withoutExecutableBlocks = html.replace(
    /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,
    " ",
  );
  const textWithBoundaries = withoutExecutableBlocks
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|div|li|blockquote|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(
      /&(#(?:x[0-9a-f]+|\d+)|amp|apos|gt|lt|nbsp|quot);/gi,
      (match, entity: string) => {
        if (entity.startsWith("#")) {
          const hexadecimal = entity[1]?.toLowerCase() === "x";
          const digits = entity.slice(hexadecimal ? 2 : 1);
          const codePoint = Number.parseInt(digits, hexadecimal ? 16 : 10);
          if (
            Number.isSafeInteger(codePoint) &&
            codePoint > 0 &&
            codePoint <= 0x10ffff
          ) {
            return String.fromCodePoint(codePoint);
          }
          return match;
        }
        return DESCRIPTION_HTML_ENTITIES[entity.toLowerCase()] ?? match;
      },
    );
  return splitParagraphs(textWithBoundaries).map((paragraph) =>
    paragraph.replace(/\s+/g, " ").trim(),
  );
}

/** Validates `forward.highlights` even though no approved surface renders it. */
function validateHighlights(raw: string, handle: string): readonly string[] {
  const context = `${handle} forward.highlights`;
  const parsed = asArray(parseJsonValue(raw, context), context);
  if (parsed.length === 0) {
    fail(`${context} is empty.`);
  }
  return parsed.map((entry, index) =>
    asText(entry, `${context} item ${index}`),
  );
}

function humanizeSpecKey(key: string): string {
  const words = key
    .split(/[_\s]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
  if (words.length === 0) {
    return key;
  }
  const lastWord = words[words.length - 1]?.toLowerCase();
  /* Own-key lookup only, so a spec key ending in e.g. "constructor" cannot
     resolve a prototype member as a unit label. */
  const unit =
    lastWord !== undefined && Object.hasOwn(SPEC_UNIT_LABELS, lastWord)
      ? SPEC_UNIT_LABELS[lastWord]
      : undefined;
  const labelWords = unit === undefined ? words : words.slice(0, -1);
  if (labelWords.length === 0) {
    return key;
  }
  const sentence = labelWords.join(" ").toLowerCase();
  const label = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return unit === undefined ? label : `${label} (${unit})`;
}

function specScalarToText(value: unknown, context: string): string {
  if (typeof value === "string") {
    return asText(value, context);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      fail(`${context} is not a finite number.`);
    }
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return fail(`${context} is not a supported field-spec value.`);
}

function mapFieldSpecs(raw: string, handle: string): readonly SpecRow[] {
  const context = `${handle} forward.field_specs`;
  const parsed = asRecord(parseJsonValue(raw, context), context);
  const rows: SpecRow[] = [];

  for (const [key, value] of Object.entries(parsed)) {
    const rowContext = `${context} "${key}"`;
    const text = Array.isArray(value)
      ? value
          .map((entry, index) =>
            specScalarToText(entry, `${rowContext} item ${index}`),
          )
          .join(", ")
      : specScalarToText(value, rowContext);
    if (text.trim().length === 0) {
      fail(`${rowContext} is empty.`);
    }
    rows.push({ label: humanizeSpecKey(key), value: text });
  }

  if (rows.length === 0) {
    fail(`${context} has no rows.`);
  }
  return rows;
}

const RICH_TEXT_BLOCK_TYPES = new Set(["paragraph", "heading", "list"]);
const RICH_TEXT_INLINE_TYPES = new Set(["text", "link", "list-item"]);

function richTextToPlainText(node: unknown, context: string): string {
  const record = asRecord(node, context);
  const type = asText(record.type, `${context} type`);

  if (type === "text") {
    const value = record.value;
    if (typeof value !== "string") {
      fail(`${context} text node has no value.`);
    }
    return value;
  }

  if (
    !RICH_TEXT_BLOCK_TYPES.has(type) &&
    !RICH_TEXT_INLINE_TYPES.has(type) &&
    type !== "root"
  ) {
    fail(`${context} has unsupported rich-text node type "${type}".`);
  }

  const children = asArray(record.children, `${context} children`);
  const separator = type === "list" ? "\n" : "";
  return children
    .map((child, index) =>
      richTextToPlainText(child, `${context} child ${index}`),
    )
    .join(separator);
}

function mapCare(raw: string, handle: string): readonly string[] {
  const context = `${handle} forward.care`;
  const root = asRecord(parseJsonValue(raw, context), context);
  if (root.type !== "root") {
    fail(`${context} is not a rich-text root node.`);
  }
  const blocks = asArray(root.children, `${context} children`);
  const lines = blocks
    .flatMap((block, index) =>
      splitParagraphs(
        richTextToPlainText(block, `${context} block ${index}`).trim(),
      ),
    )
    .filter((line) => line.length > 0);
  if (lines.length === 0) {
    fail(`${context} has no readable text.`);
  }
  return lines;
}

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

interface MappedVariants {
  price: Money;
  variants: readonly ProductVariant[];
}

function mapVariants(
  value: unknown,
  handle: string,
  colorLabels: readonly string[],
  options: readonly ProductOption[],
  profile: CatalogPresentationProfile,
): MappedVariants {
  const connection = asRecord(value, `${handle} variants`);
  const pageInfo = asRecord(connection.pageInfo, `${handle} variants pageInfo`);
  if (pageInfo.hasNextPage === true) {
    fail(`${handle} has more variants than the configured bound allows.`);
  }

  const nodes = asArray(connection.nodes, `${handle} variant nodes`);
  if (nodes.length === 0) {
    fail(`${handle} has no variants.`);
  }

  const expectedOptionNames = [
    COLOR_OPTION_NAME,
    ...options.map(({ name }) => name),
  ];
  const merchandiseIds = new Set<string>();
  const selections = new Set<string>();
  const variants: ProductVariant[] = [];
  let minimum: Money | undefined;

  for (const [index, node] of nodes.entries()) {
    const context = `${handle} variant ${index}`;
    const record = asRecord(node, context);
    const id = asText(record.id, `${context} id`);
    if (!id.startsWith("gid://shopify/ProductVariant/")) {
      fail(`${context} id is not a Shopify ProductVariant GID.`);
    }
    if (merchandiseIds.has(id)) {
      fail(`${handle} has a duplicate merchandise id.`);
    }
    merchandiseIds.add(id);

    if (typeof record.availableForSale !== "boolean") {
      fail(`${context} availability is missing.`);
    }

    const selectedOptionRecords = asArray(
      record.selectedOptions,
      `${context} selectedOptions`,
    ).map((entry, optionIndex) => {
      const option = asRecord(
        entry,
        `${context} selectedOption ${optionIndex}`,
      );
      return {
        name: asText(
          option.name,
          `${context} selectedOption ${optionIndex} name`,
        ),
        value: asText(
          option.value,
          `${context} selectedOption ${optionIndex} value`,
        ),
      };
    });

    if (
      selectedOptionRecords.length !== expectedOptionNames.length ||
      selectedOptionRecords.some(
        (option, optionIndex) =>
          option.name !== expectedOptionNames[optionIndex],
      )
    ) {
      fail(
        `${context} selectedOptions do not match Shopify product option order.`,
      );
    }

    const color = selectedOptionRecords[0];
    if (
      color?.name !== COLOR_OPTION_NAME ||
      !colorLabels.includes(color.value)
    ) {
      fail(`${context} references an unknown ${COLOR_OPTION_NAME} value.`);
    }
    const presentationColorway = profile.colorways[color.value];
    if (presentationColorway === undefined) {
      fail(`${context} has no approved colorway mapping.`);
    }

    const selectedOptions = selectedOptionRecords.slice(1);
    for (const [optionIndex, selected] of selectedOptions.entries()) {
      const option = options[optionIndex];
      if (option === undefined || !option.values.includes(selected.value)) {
        fail(`${context} references an unknown ${selected.name} value.`);
      }
    }

    const selectionKey = [
      presentationColorway.id,
      ...selectedOptions.map(({ name, value }) => `${name}:${value}`),
    ].join("\u001f");
    if (selections.has(selectionKey)) {
      fail(`${handle} has duplicate variant option selections.`);
    }
    selections.add(selectionKey);

    const price = mapMoney(record.price, `${context} price`);
    if (minimum === undefined || price.amount < minimum.amount) {
      minimum = price;
    }
    variants.push({
      id,
      colorwayId: presentationColorway.id,
      selectedOptions,
      price,
      availableForSale: record.availableForSale,
    });
  }

  if (minimum === undefined) {
    fail(`${handle} has no usable variant price.`);
  }
  for (const colorway of Object.values(profile.colorways)) {
    if (!variants.some((variant) => variant.colorwayId === colorway.id)) {
      fail(`${handle} has no approved colorway mapping for ${colorway.id}.`);
    }
  }

  return { price: minimum, variants };
}

/* -------------------------------------------------------------------------- */
/* Product                                                                    */
/* -------------------------------------------------------------------------- */

function mapProduct(node: unknown, index: number): Product {
  const record = asRecord(node, `catalog product ${index}`);
  const handle = asText(record.handle, `catalog product ${index} handle`);

  const profile = getCatalogPresentationProfile(handle);
  if (profile === null) {
    fail(
      `Catalog product "${handle}" is not an approved Forward product in this slice.`,
    );
  }

  const tags = asArray(record.tags, `${handle} tags`).map((tag, tagIndex) =>
    asText(tag, `${handle} tag ${tagIndex}`),
  );
  if (!tags.includes(CATALOG_OWNERSHIP_TAG)) {
    fail(`${handle} is missing the "${CATALOG_OWNERSHIP_TAG}" ownership tag.`);
  }

  asText(record.id, `${handle} id`);
  asText(record.productType, `${handle} productType`);
  const title = asText(record.title, `${handle} title`);
  // Validate both Storefront fields. `descriptionHtml` preserves paragraph
  // boundaries that Shopify removes from the plain `description` string.
  asText(record.description, `${handle} description`);
  const descriptionParagraphs = descriptionHtmlParagraphs(
    asText(record.descriptionHtml, `${handle} descriptionHtml`),
  );
  if (descriptionParagraphs.length === 0) {
    fail(`${handle} description has no readable text.`);
  }

  const { colorLabels, options } = mapOptions(record.options, handle);
  const { price, variants } = mapVariants(
    record.variants,
    handle,
    colorLabels,
    options,
    profile,
  );

  const images = mapMediaImages(record.media, handle);
  const mediaMap = parseColorwayMediaMap(
    readMetafieldValue(
      record.colorwayMediaMap,
      METAFIELD_TYPES.colorwayMediaMap,
      `${handle} forward.colorway_media_map`,
    ),
    handle,
  );
  const colorways = mapColorways(colorLabels, mediaMap, images, profile);

  validateHighlights(
    readMetafieldValue(
      record.highlights,
      METAFIELD_TYPES.highlights,
      `${handle} forward.highlights`,
    ),
    handle,
  );
  const materialParagraphs = splitParagraphs(
    readMetafieldValue(
      record.materials,
      METAFIELD_TYPES.materials,
      `${handle} forward.materials`,
    ),
  );
  if (materialParagraphs.length === 0) {
    fail(`${handle} forward.materials has no readable text.`);
  }
  const specs = mapFieldSpecs(
    readMetafieldValue(
      record.fieldSpecs,
      METAFIELD_TYPES.fieldSpecs,
      `${handle} forward.field_specs`,
    ),
    handle,
  );
  const care = mapCare(
    readMetafieldValue(
      record.care,
      METAFIELD_TYPES.care,
      `${handle} forward.care`,
    ),
    handle,
  );

  return {
    handle,
    title,
    subtitle: profile.subtitle,
    category: profile.category,
    activities: profile.activities,
    price,
    description: descriptionParagraphs.join(" "),
    detailParagraphs: [...descriptionParagraphs, ...materialParagraphs],
    specs,
    care,
    repair: profile.repair,
    colorways,
    options,
    variants,
    relatedHandles: profile.relatedHandles,
  };
}

/**
 * Validates a catalog GraphQL result and returns normalized products in the
 * canonical presentation order.
 *
 * Returned GraphQL `errors`, truncated pages, unknown products, and missing
 * canonical products are all hard failures — never a partial catalog.
 */
export function mapCatalogResult(
  result: CatalogQueryResult,
): readonly Product[] {
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    fail(
      `Storefront API returned ${result.errors.length} GraphQL error(s) for the catalog query.`,
    );
  }

  const data = asRecord(result.data, "catalog response data");
  const products = asRecord(data.products, "catalog products connection");
  const pageInfo = asRecord(products.pageInfo, "catalog products pageInfo");
  if (pageInfo.hasNextPage === true) {
    fail("The catalog has more products than the configured bound allows.");
  }

  const nodes = asArray(products.nodes, "catalog product nodes");
  const mapped = new Map<string, Product>();
  for (const [index, node] of nodes.entries()) {
    const product = mapProduct(node, index);
    if (mapped.has(product.handle)) {
      fail(`The catalog returned duplicate product handle ${product.handle}.`);
    }
    mapped.set(product.handle, product);
  }

  return CANONICAL_PRODUCT_HANDLES.map((handle) => {
    const product = mapped.get(handle);
    if (product === undefined) {
      fail(`The live catalog is missing the approved product "${handle}".`);
    }
    return product;
  });
}
