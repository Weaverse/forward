/**
 * Builder schemas for the composable sections.
 *
 * Schemas live here rather than inside `src/sections/` for two reasons: the
 * section files stay pure presentation per `AGENTS.md`, and schema code stays
 * out of the route bundles that import those sections. Only the registry in
 * `./components.ts` reads this module.
 *
 * Every input below corresponds to a prop the shipped section already takes,
 * and every `defaultValue` is the value that section renders today. Nothing is
 * invented: a setting that has no prop would be a setting the component cannot
 * honor.
 *
 * Data-shaped props — `Product`, `Collection`, `JournalArticle` — are not
 * settings. They arrive from the storefront data source through the route, and
 * a merchant selects *which* resource by handle. Those selector inputs are
 * named `<prop>Handle` so the mapping stays obvious.
 */

import { createSchema } from "@weaverse/schema";

/* Shared input fragments. Repeating these by hand is how a registry drifts. */

const EYEBROW_INPUT = {
  type: "text",
  name: "eyebrowLabel",
  label: "Eyebrow",
} as const;

const HEADING_INPUT = {
  type: "text",
  name: "heading",
  label: "Heading",
} as const;

const BODY_INPUT = {
  type: "textarea",
  name: "body",
  label: "Body",
} as const;

const IMAGE_INPUT = {
  type: "image",
  name: "image",
  label: "Image",
} as const;

function group<const T>(inputs: readonly T[], label = "Content") {
  return [{ group: label, inputs: [...inputs] }];
}

/* ------------------------------------------------------------------ INDEX */

export const homeHeroSchema = createSchema({
  type: "home-hero",
  title: "Home hero",
  settings: group([
    { ...EYEBROW_INPUT, defaultValue: "Forward / Field equipment 2026" },
    {
      ...HEADING_INPUT,
      defaultValue: "Equipment for weather that changes the plan.",
    },
    {
      type: "textarea",
      name: "lede",
      label: "Lede",
      defaultValue:
        "Layerable apparel, precise footwear, and low-profile carry systems made to move together.",
    },
    { type: "text", name: "primaryCtaLabel", label: "Primary CTA label" },
    { type: "text", name: "primaryCtaHref", label: "Primary CTA link" },
    { type: "text", name: "secondaryCtaLabel", label: "Secondary CTA label" },
    { type: "text", name: "secondaryCtaHref", label: "Secondary CTA link" },
    IMAGE_INPUT,
    {
      type: "text",
      name: "featuredProductHandle",
      label: "Featured product handle",
    },
  ]),
});

export const featuredProductsSchema = createSchema({
  type: "featured-products",
  title: "Featured products",
  settings: group([
    { ...EYEBROW_INPUT, defaultValue: "New field rotation" },
    HEADING_INPUT,
    BODY_INPUT,
    { type: "text", name: "linkLabel", label: "Link label" },
    { type: "text", name: "linkHref", label: "Link target" },
    {
      type: "textarea",
      name: "productHandles",
      label: "Product handles, one per line",
    },
  ]),
});

export const collectionIndexSchema = createSchema({
  type: "collection-index",
  title: "Collection index",
  settings: group([
    { ...EYEBROW_INPUT, defaultValue: "Shop by system" },
    HEADING_INPUT,
    {
      type: "textarea",
      name: "collectionHandles",
      label: "Collection handles, one per line",
    },
  ]),
});

export const productSpotlightSchema = createSchema({
  type: "product-spotlight",
  title: "Product spotlight",
  settings: group([
    { type: "text", name: "eyebrowPrefix", label: "Eyebrow prefix" },
    { type: "text", name: "ctaLabel", label: "CTA label" },
    {
      type: "range",
      name: "specCount",
      label: "Spec rows shown",
      defaultValue: 3,
    },
    { type: "text", name: "productHandle", label: "Product handle" },
    IMAGE_INPUT,
  ]),
});

export const materialStandardSchema = createSchema({
  type: "material-standard",
  title: "Material standard",
  settings: group([
    { ...EYEBROW_INPUT, defaultValue: "Material standard" },
    HEADING_INPUT,
    BODY_INPUT,
    { type: "text", name: "primaryCtaLabel", label: "Primary CTA label" },
    { type: "text", name: "primaryCtaHref", label: "Primary CTA link" },
    { type: "text", name: "secondaryCtaLabel", label: "Secondary CTA label" },
    { type: "text", name: "secondaryCtaHref", label: "Secondary CTA link" },
    IMAGE_INPUT,
  ]),
});

export const kitCalloutSchema = createSchema({
  type: "kit-callout",
  title: "Kit callout",
  settings: group([
    { ...EYEBROW_INPUT, defaultValue: "One-day kit" },
    { ...HEADING_INPUT, defaultValue: "Carry the day, not the doubt." },
    { type: "text", name: "linkLabel", label: "Link label" },
    { type: "text", name: "productHandle", label: "Primary product handle" },
    {
      type: "textarea",
      name: "tileProductHandles",
      label: "Tile product handles, one per line",
    },
  ]),
});

export const repairAndJournalSchema = createSchema({
  type: "repair-and-journal",
  title: "Repair and journal",
  settings: group([
    { type: "text", name: "repairEyebrowLabel", label: "Repair eyebrow" },
    { type: "text", name: "repairHeading", label: "Repair heading" },
    { type: "textarea", name: "repairBody", label: "Repair body" },
    { type: "text", name: "repairLinkLabel", label: "Repair link label" },
    { type: "text", name: "repairLinkHref", label: "Repair link target" },
    { type: "text", name: "journalEyebrowLabel", label: "Journal eyebrow" },
    { type: "text", name: "journalLinkLabel", label: "Journal link label" },
    {
      type: "text",
      name: "articleHandle",
      label: "Article handle, blank for the latest",
    },
  ]),
});

/* ------------------------------------------------------------------- PAGE */

export const editorialHeroSchema = createSchema({
  type: "editorial-hero",
  title: "Editorial hero",
  settings: group([
    EYEBROW_INPUT,
    HEADING_INPUT,
    { type: "textarea", name: "lede", label: "Lede" },
    IMAGE_INPUT,
    {
      type: "select",
      name: "imageSide",
      label: "Image side",
      defaultValue: "right",
    },
  ]),
});

export const editorialOverlayHeroSchema = createSchema({
  type: "editorial-overlay-hero",
  title: "Editorial overlay hero",
  settings: group([
    EYEBROW_INPUT,
    HEADING_INPUT,
    { type: "textarea", name: "lede", label: "Lede" },
    IMAGE_INPUT,
  ]),
});

export const editorialCalloutSchema = createSchema({
  type: "editorial-callout",
  title: "Editorial callout",
  settings: group([
    EYEBROW_INPUT,
    HEADING_INPUT,
    BODY_INPUT,
    { type: "text", name: "ctaLabel", label: "CTA label" },
    { type: "text", name: "ctaHref", label: "CTA link" },
  ]),
});

export const standardStatementSchema = createSchema({
  type: "standard-statement",
  title: "Standard statement",
  settings: group([
    EYEBROW_INPUT,
    { type: "textarea", name: "statement", label: "Statement" },
    { type: "textarea", name: "columns", label: "Columns, one per line" },
  ]),
});

export const statBandSchema = createSchema({
  type: "stat-band",
  title: "Stat band",
  settings: group([
    {
      type: "textarea",
      name: "stats",
      label: "Stats, one `value | label` pair per line",
    },
  ]),
});

export const productStripSchema = createSchema({
  type: "product-strip",
  title: "Product strip",
  settings: group([
    EYEBROW_INPUT,
    HEADING_INPUT,
    { type: "text", name: "linkLabel", label: "Link label" },
    { type: "text", name: "linkHref", label: "Link target" },
    {
      type: "textarea",
      name: "productHandles",
      label: "Product handles, one per line",
    },
  ]),
});

export const principleGridSchema = createSchema({
  type: "principle-grid",
  title: "Principle grid",
  settings: group([
    {
      type: "textarea",
      name: "principles",
      label: "Principles, one `number | title | copy` row per line",
    },
  ]),
});

export const productTilesSchema = createSchema({
  type: "product-tiles",
  title: "Product tiles",
  settings: group([
    {
      type: "textarea",
      name: "tileProductHandles",
      label: "Product handles, one per line",
    },
  ]),
});

export const numberedSequenceSchema = createSchema({
  type: "numbered-sequence",
  title: "Numbered sequence",
  settings: group([
    EYEBROW_INPUT,
    HEADING_INPUT,
    {
      type: "textarea",
      name: "steps",
      label: "Steps, one `number | title | copy` row per line",
    },
  ]),
});

export const productCaseStudySchema = createSchema({
  type: "product-case-study",
  title: "Product case study",
  settings: group([
    EYEBROW_INPUT,
    { type: "text", name: "ctaLabel", label: "CTA label" },
    { type: "text", name: "productHandle", label: "Product handle" },
    IMAGE_INPUT,
  ]),
});
