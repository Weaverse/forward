"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { cta, textLink } from "@/lib/presentation/variants";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

type ButtonIntent = "primary" | "signal" | "light" | "outline";

export interface ButtonProps extends WeaverseElementProps {
  label: string;
  href: string;
  intent?: "link" | ButtonIntent;
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
  intent = "primary",
  label,
  ...rest
}: ButtonProps) {
  /* `link` is the underlined arrow link the sections already use for a
   * secondary destination. It lives here rather than as a fifth element so a
   * merchant can switch a call to action between weights without swapping the
   * item out and losing its settings. */
  return (
    <Link
      {...elementAttributes(rest)}
      className={cn(
        intent === "link" ? textLink() : cta({ intent }),
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
