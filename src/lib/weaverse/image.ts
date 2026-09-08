import type { StorefrontImage } from "@/lib/storefront/types";

/**
 * Normalizes an image coming from a Builder image input.
 *
 * Builder stores `{ url, altText, width, height }`; the theme renders
 * `StorefrontImage` (`{ src, alt, width, height }`). Without this the shapes
 * look compatible and are not: reading `.src` off a Builder image yields
 * `undefined`, which `next/image` throws on.
 *
 * Returns `null` for anything unusable — an unset input, a cleared one, or a
 * value with no URL — so a section can decide to render without the image
 * instead of crashing. A merchant can clear any field in Studio, so "absent"
 * is an ordinary state, not an error.
 */
export function weaverseImage(value: unknown): StorefrontImage | null {
  if (value === null || typeof value !== "object") {
    return null;
  }

  const image = value as Record<string, unknown>;

  /* Already a StorefrontImage: the route supplied it on the static path. */
  if (typeof image.src === "string" && image.src.length > 0) {
    return {
      src: image.src,
      alt: typeof image.alt === "string" ? image.alt : "",
      width: typeof image.width === "number" ? image.width : 0,
      height: typeof image.height === "number" ? image.height : 0,
    };
  }

  if (typeof image.url !== "string" || image.url.length === 0) {
    return null;
  }

  /* `next/image` needs real intrinsic dimensions; Builder may omit them. */
  const width = typeof image.width === "number" ? image.width : 0;
  const height = typeof image.height === "number" ? image.height : 0;
  if (width <= 0 || height <= 0) {
    return null;
  }

  return {
    src: image.url,
    alt: typeof image.altText === "string" ? image.altText : "",
    width,
    height,
  };
}
