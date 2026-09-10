/**
 * The settings every section shares.
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
