import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mp--media",
  title: "Product media",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Gallery",
      inputs: [
        {
          type: "select",
          name: "layout",
          label: "Layout",
          defaultValue: "editorial",
          configs: {
            options: [
              { value: "editorial", label: "Editorial (lead + pair)" },
              { value: "grid", label: "Two-column grid" },
              { value: "stack", label: "Single column" },
            ],
          },
        },
      ],
    },
    {
      group: "Zoom",
      inputs: [
        {
          type: "switch",
          name: "enableZoom",
          label: "Enable zoom",
          defaultValue: true,
          helpText: "Opens a full-screen gallery when an image is clicked.",
        },
        {
          type: "switch",
          name: "showZoomHint",
          label: "Show zoom hint",
          defaultValue: true,
          condition: (data: { enableZoom?: boolean }) =>
            data.enableZoom !== false,
        },
        {
          type: "text",
          name: "zoomHintText",
          label: "Zoom hint text",
          defaultValue: "Zoom +",
          condition: (data: { enableZoom?: boolean; showZoomHint?: boolean }) =>
            data.enableZoom !== false && data.showZoomHint !== false,
        },
      ],
    },
  ],
  presets: {},
});
