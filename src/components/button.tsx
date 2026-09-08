import { createSchema } from "@weaverse/schema";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { cta } from "@/lib/presentation/variants";

type ButtonIntent = "primary" | "signal" | "light" | "outline";

export interface ButtonProps {
  label: string;
  href: string;
  intent?: ButtonIntent;
  className?: string;
}

/**
 * Shared call-to-action element.
 *
 * Always a link, never a `<button>`: every authored CTA in this theme
 * navigates, and rendering a navigation control as a button would lose
 * middle-click, open-in-new-tab, and the href in the status bar. Anything that
 * performs an action rather than navigating belongs to the theme-owned
 * commerce surfaces, not to Studio.
 */
function Button({ className, href, intent = "primary", label }: ButtonProps) {
  return (
    <Link className={cn(cta({ intent }), className)} href={href}>
      {label}
    </Link>
  );
}

export default Button;

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
