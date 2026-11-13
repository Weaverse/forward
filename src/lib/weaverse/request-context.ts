import type {
  WeaverseNextLoaderData,
  WeaverseNextRequestContext,
} from "@weaverse/hydrogen/next";

interface SerializedRequestInfo {
  handle?: string;
  i18n?: WeaverseNextRequestContext["i18n"];
  pageType?: WeaverseNextRequestContext["pageType"];
  pathname?: string;
  search?: string;
}

/**
 * Rebuilds the request context on the client from the server payload.
 *
 * The Studio bridge needs to know which route it is looking at — pathname,
 * page type and handle — to draw the outline and to revalidate the right item
 * after an edit. The design/preview flags and `sectionType` are not copied:
 * the SDK runtime reads them from `configs` itself. That identity is established on
 * the server and travels in `configs.requestInfo`; without restoring it the
 * client client has no route identity and Studio has nothing to attach to.
 *
 * Kept free of `"use client"` so it stays a plain, testable function.
 */
export function clientRequestContext(
  data: WeaverseNextLoaderData,
): WeaverseNextRequestContext {
  const configs = data.configs ?? {};
  const requestInfo = configs.requestInfo as SerializedRequestInfo | undefined;

  return {
    handle: requestInfo?.handle,
    i18n: requestInfo?.i18n,
    pageType: requestInfo?.pageType,
    pathname: requestInfo?.pathname ?? "/",
    searchParams: new URLSearchParams(requestInfo?.search ?? ""),
  };
}
