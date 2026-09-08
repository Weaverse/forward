import type {
  WeaverseNextLoaderData,
  WeaverseNextRequestContext,
} from "@weaverse/next";

interface SerializedRequestInfo {
  handle?: string;
  i18n?: WeaverseNextRequestContext["i18n"];
  pageType?: WeaverseNextRequestContext["pageType"];
  pathname?: string;
  search?: string;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

/**
 * Rebuilds the request context on the client from the server payload.
 *
 * The Studio bridge needs to know which route it is looking at — pathname,
 * page type, handle, and the design/preview flags — to draw the outline and
 * to revalidate the right item after an edit. That identity is established on
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
    isDesignMode: asBoolean(configs.isDesignMode),
    isPreviewMode: asBoolean(configs.isPreviewMode),
    isRevisionPreview: asBoolean(configs.isRevisionPreview),
    pageType: requestInfo?.pageType,
    pathname: requestInfo?.pathname ?? "/",
    searchParams: new URLSearchParams(requestInfo?.search ?? ""),
    sectionType: asString(configs.sectionType),
  };
}
