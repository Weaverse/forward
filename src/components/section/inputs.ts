/**
 * The settings every section shares.
 *
 * A section schema spreads these rather than restating them, so "content
 * width", "vertical padding", and the background controls mean the same thing
 * everywhere and a merchant learns them once. Exported as plain data so a
 * schema module stays importable outside Next.
 */

import type { InspectorGroup } from "@weaverse/schema";

type SectionInputs = InspectorGroup["inputs"];

/** Layout: how wide the section runs and how much air it gets. */
export const layoutInputs: SectionInputs = [
  {
    type: "select",
    name: "width",
    label: "Content width",
    configs: {
      options: [
        { value: "full", label: "Full page" },
        { value: "stretch", label: "Stretch" },
        { value: "fixed", label: "Fixed" },
      ],
    },
  },
  {
    type: "range",
    name: "gap",
    label: "Items spacing",
    configs: { min: 0, max: 60, step: 4, unit: "px" },
  },
  {
    type: "select",
    name: "verticalPadding",
    label: "Vertical padding",
    configs: {
      options: [
        { value: "none", label: "None" },
        { value: "compact", label: "Compact" },
        { value: "default", label: "Default" },
      ],
    },
  },
];

/** Background: a flat colour, optionally behind an image. */
export const backgroundInputs: SectionInputs = [
  {
    type: "select",
    name: "backgroundFor",
    label: "Background for",
    configs: {
      options: [
        { value: "section", label: "Full section" },
        { value: "content", label: "Content only" },
      ],
    },
  },
  { type: "color", name: "backgroundColor", label: "Background colour" },
  { type: "image", name: "backgroundImage", label: "Background image" },
  {
    type: "select",
    name: "backgroundFit",
    label: "Image fit",
    configs: {
      options: [
        { value: "cover", label: "Cover" },
        { value: "contain", label: "Contain" },
      ],
    },
  },
];

/**
 * Overlay: only meaningful over a background image, which is why it is a
 * separate group a section can leave out.
 */
export const overlayInputs: SectionInputs = [
  { type: "switch", name: "enableOverlay", label: "Enable overlay" },
  { type: "color", name: "overlayColor", label: "Overlay colour" },
  {
    type: "range",
    name: "overlayOpacity",
    label: "Overlay opacity",
    configs: { min: 0, max: 100, step: 5, unit: "%" },
  },
];

/** The three groups a section normally declares before its own content. */
export const sectionSettings: InspectorGroup[] = [
  { group: "Layout", inputs: layoutInputs },
  { group: "Background", inputs: backgroundInputs },
  { group: "Overlay", inputs: overlayInputs },
];
