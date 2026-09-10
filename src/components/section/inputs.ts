/**
 * The settings sections and shared elements reuse.
 *
 * A section schema spreads these rather than restating them, so "content
 * width" and "vertical padding" mean the same thing everywhere and a merchant
 * learns them once. Exported as plain data so a schema module stays importable
 * outside Next.
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

/**
 * Space above and below a shared element.
 *
 * One choice per edge, no breakpoint pickers: each step is a clamp that already
 * scales with the viewport. Left unset, the element keeps whatever rhythm its
 * own recipe carries.
 */
const BLOCK_SPACING_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

export const blockSpacingInputs: SectionInputs = [
  {
    type: "select",
    name: "marginTop",
    label: "Space above",
    configs: { options: BLOCK_SPACING_OPTIONS },
  },
  {
    type: "select",
    name: "marginBottom",
    label: "Space below",
    configs: { options: BLOCK_SPACING_OPTIONS },
  },
];
