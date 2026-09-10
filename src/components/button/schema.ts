import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "button",
  title: "Button",
  settings: [
    {
      group: "Button",
      inputs: [
        { type: "text", name: "label", label: "Label" },
        { type: "url", name: "href", label: "Link" },
        {
          type: "select",
          name: "intent",
          label: "Style",
          defaultValue: "signal",
          configs: {
            options: [
              { value: "signal", label: "Yellow" },
              { value: "link", label: "Text link" },
            ],
          },
        },
        {
          type: "select",
          name: "tone",
          label: "Reads against",
          defaultValue: "dark",
          helpText:
            "Pick the one that contrasts with this section's background: a dark shadow on a light background, a light one on a dark background.",
          configs: {
            options: [
              { value: "dark", label: "Light background" },
              { value: "light", label: "Dark background" },
            ],
          },
        },
        {
          type: "switch",
          name: "showBorder",
          label: "Underline",
          defaultValue: true,
          helpText: "Text link only.",
        },
      ],
    },
  ],
  presets: {
    label: "Shop the catalog",
    href: "/shop",
    intent: "signal",
  },
});
