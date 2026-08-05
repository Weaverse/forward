/**
 * Decode route-like values for display while keeping the helper total for
 * direct callers and future data paths. Next may reject a malformed request
 * target before it reaches an App Router page; this helper covers values that
 * do reach application code.
 */
export function safeDecodeRouteSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Turns a URL segment into readable display text for shell pages. */
export function formatRouteSegment(segment: string): string {
  const words = safeDecodeRouteSegment(segment)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length > 0 ? words.join(" ") : segment;
}