"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface MaterialStandardProps extends WeaverseElementProps {
  children?: ReactNode;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
}

/** Dark editorial band pairing the material story with a wide image. */
function MaterialStandard({ children, image, ...rest }: MaterialStandardProps) {
  const resolvedImage = weaverseImage(image);
  return (
    <section
      {...elementAttributes(rest)}
      className="grid grid-cols-split-85 bg-ink text-text-inverse max-md:grid-cols-1"
    >
      <div className="flex flex-col justify-center p-[clamp(48px,7vw,110px)]">
        {children}
      </div>
      {resolvedImage === null ? null : (
        <Image
          className="h-175 object-cover saturate-70 max-md:h-[58svh]"
          src={resolvedImage.src}
          alt={resolvedImage.alt}
          width={resolvedImage.width}
          height={resolvedImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
        />
      )}
    </section>
  );
}

export default MaterialStandard;

export { schema } from "./schema";
