"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { cta } from "@/lib/presentation/variants";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

type ButtonIntent = "primary" | "signal" | "light" | "outline";

export interface ButtonProps extends WeaverseElementProps {
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
function Button({
  className,
  href,
  intent = "primary",
  label,
  ...rest
}: ButtonProps) {
  return (
    <Link
      {...elementAttributes(rest)}
      className={cn(cta({ intent }), className)}
      href={href}
    >
      {label}
    </Link>
  );
}

export default Button;

export { schema } from "./schema";
