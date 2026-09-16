"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface EditorialHeroProps extends WeaverseElementProps {
  children?: ReactNode;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
  /** Which column the image occupies on desktop. Defaults to `right`. */
  imageSide?: "left" | "right";
}

/**
 * Split editorial hero: copy in one column, full-bleed image in the other.
 * Used by the About and Materials custom pages.
 */
function EditorialHero({
  children,
  image,
  imageSide = "right",
  ...rest
}: EditorialHeroProps) {
  const imageFirst = imageSide === "left";
  /* A merchant can clear the image in Studio, so absent is an ordinary state.
   * The copy column still carries the page; a missing image drops to one
   * column rather than taking the route down. */
  const resolved = weaverseImage(image);
  return (
    <section
      {...elementAttributes(rest)}
      className="mx-2.5 mt-2.5 grid min-h-0 grid-cols-1 bg-ink text-text-inverse md:mx-7 md:mt-5.5 md:min-h-page-min md:grid-cols-split-90"
    >
      <div
        className={cn(
          "flex flex-col justify-center px-page-gutter py-13.75 md:p-panel-wide",
          imageFirst && "order-1 md:order-2",
        )}
      >
        {children}
      </div>
      {resolved === null ? null : (
        <Image
          className={cn(
            "h-home-media-mobile object-cover saturate-72 md:h-full",
            imageFirst && "order-2 md:order-1",
          )}
          src={resolved.src}
          alt={resolved.alt}
          width={resolved.width}
          height={resolved.height}
          sizes="(min-width: 820px) 55vw, 100vw"
          priority
        />
      )}
    </section>
  );
}

export default EditorialHero;

export { schema } from "./schema";
