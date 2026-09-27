import type { WeaverseNextLoaderData } from "@weaverse/next";

/**
 * Whether a Weaverse payload carries content worth rendering.
 *
 * The Builder answers a request for an uncomposed route in more than one way:
 * a fallback placeholder, the project's shared default template, or a page a
 * merchant emptied. All three arrive as a real payload with a real page id, so
 * matching on the id is unreliable — that is exactly how an earlier check
 * passed a default template through and rendered a blank page.
 *
 * What they have in common is structural: the root item exists, and nothing
 * hangs under it. So judge the content, not the metadata.
 *
 * Kept free of `server-only` and of `next/headers` so it stays directly
 * testable; `server.ts` owns the parts that touch the request.
 */
export function hasAuthoredSections(
  page: WeaverseNextLoaderData | null | undefined,
): boolean {
  const items = page?.page?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.some((item) => {
    const children = (item as { children?: unknown }).children;
    return Array.isArray(children) && children.length > 0;
  });
}
