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
          defaultValue: "primary",
          configs: {
            options: [
              { value: "primary", label: "Primary" },
              { value: "signal", label: "Signal" },
              { value: "light", label: "Light" },
              { value: "outline", label: "Outline" },
            ],
          },
        },
      ],
    },
  ],
});
