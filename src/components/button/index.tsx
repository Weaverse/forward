"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { cta, textLink } from "@/lib/presentation/variants";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

export interface ButtonProps extends WeaverseElementProps {
  label: string;
  href: string;
  /** The solid yellow call to action, or the minimal arrow control. */
  intent?: "signal" | "link";
  /**
   * The colour that has to read against the surface behind the button: the
   * shadow on `signal`, the text and rule on `link`. A merchant picks it
   * because only they know what the section's background became.
   */
  tone?: "dark" | "light";
  /** `link` only. The underline is the part most often unwanted. */
  showBorder?: boolean;
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
function Button({
  className,
  href,
  intent = "signal",
  label,
  showBorder = true,
  tone = "dark",
  ...rest
}: ButtonProps) {
  return (
    <Link
      {...elementAttributes(rest)}
      className={cn(
        intent === "link" ? textLink({ showBorder, tone }) : cta({ tone }),
        className,
      )}
      href={href}
    >
      {label}
    </Link>
  );
}

export default Button;

export { schema } from "./schema";
