"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface EditorialOverlayHeroProps extends WeaverseElementProps {
  children?: ReactNode;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
}

/** Full-bleed hero: copy sits over a darkened cover image. */
function EditorialOverlayHero({
  children,
  image,
  ...rest
}: EditorialOverlayHeroProps) {
  /* A merchant can clear the image in Studio; the copy still stands alone. */
  const resolved = weaverseImage(image);
  return (
    <section
      {...elementAttributes(rest)}
      className="relative mx-2.5 mt-2.5 min-h-0 overflow-hidden text-text-inverse after:absolute after:inset-0 after:bg-field-testing-overlay after:content-[''] md:mx-7 md:mt-5.5 md:min-h-[90svh]"
    >
      {resolved === null ? null : (
        <Image
          className="absolute inset-0 h-full object-cover"
          src={resolved.src}
          alt={resolved.alt}
          width={resolved.width}
          height={resolved.height}
          sizes="100vw"
          priority
        />
      )}
      <div className="relative z-1 max-w-205 px-page-gutter py-16.25 md:p-[clamp(70px,9vw,150px)]">
        {children}
      </div>
    </section>
  );
}

export default EditorialOverlayHero;

export { schema } from "./schema";
