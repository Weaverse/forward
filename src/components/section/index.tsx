"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "@/sections/weaverse-element";

/**
 * Two recipes, not one with two call sites: cva fills in `defaultVariants` for
 * every variant a call omits, so a single recipe would put the width classes
 * on the outer element as well and drop the gutter.
 */
const outerVariants = cva("relative", {
  variants: {
    width: { full: "", stretch: "", fixed: "" },
  },
  defaultVariants: { width: "fixed" },
});

/**
 * The measure itself stays with the gutter, the way `SHELL_SECTION_CLASS`
 * composed it, so converting a section does not move its content edge.
 */
const innerVariants = cva("relative", {
  variants: {
    width: {
      full: "w-full",
      stretch: "w-full px-page-gutter",
      fixed: "mx-auto w-full max-w-page px-page-gutter",
    },
    verticalPadding: {
      none: "",
      compact: "py-section-block-compact",
      default: "py-section-block",
    },
  },
  defaultVariants: {
    width: "fixed",
    verticalPadding: "default",
  },
});

export interface SectionProps
  extends VariantProps<typeof innerVariants>,
    WeaverseElementProps {
  as?: ElementType;
  /** Space between direct children, in px. */
  gap?: number;
  backgroundFor?: "section" | "content";
  backgroundColor?: string;
  /** A Builder image value, a StorefrontImage, or nothing. */
  backgroundImage?: StorefrontImage | unknown;
  backgroundFit?: "cover" | "contain";
  enableOverlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  containerClassName?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
}

/**
 * The shell every composed section renders inside.
 *
 * Width, padding, background, and overlay are the settings almost every
 * section wants, so they are declared once here and spread into a schema from
 * `./inputs`. Sections that hardcoded `SHELL_SECTION_CLASS` got the same
 * measure with none of it editable; going through this component is what lets
 * a merchant change the page measure globally and override it per section.
 */
export function Section({
  as: Component = "section",
  backgroundColor,
  backgroundFit = "cover",
  backgroundFor = "section",
  backgroundImage,
  children,
  className,
  containerClassName,
  enableOverlay,
  gap,
  overlayColor = "#000000",
  overlayOpacity = 50,
  verticalPadding,
  width,
  ...rest
}: SectionProps) {
  const image = weaverseImage(backgroundImage);
  const onContent = backgroundFor === "content";
  const dressing = (
    <>
      {image === null ? null : (
        <Image
          alt={image.alt}
          className={cn(
            "absolute inset-0 h-full w-full",
            backgroundFit === "contain" ? "object-contain" : "object-cover",
          )}
          height={image.height}
          sizes="100vw"
          src={image.src}
          width={image.width}
        />
      )}
      {enableOverlay === true && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity / 100,
          }}
        />
      )}
    </>
  );

  return (
    <Component
      {...elementAttributes(rest)}
      className={cn(outerVariants({ width }), className)}
      style={onContent ? undefined : { backgroundColor }}
    >
      {onContent ? null : dressing}
      <div
        className={cn(
          innerVariants({ verticalPadding, width }),
          containerClassName,
        )}
        style={{
          ...(onContent ? { backgroundColor } : undefined),
          ...(gap === undefined ? undefined : { gap: `${gap}px` }),
          ...(gap === undefined
            ? undefined
            : { display: "flex", flexDirection: "column" }),
        }}
      >
        {onContent ? dressing : null}
        {children}
      </div>
    </Component>
  );
}
