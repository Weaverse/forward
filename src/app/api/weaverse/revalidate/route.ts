import type { WeaverseNextRequestContext } from "@weaverse/next";
import { createWeaverseNextRevalidateHandler } from "@weaverse/next/server";

import { revalidateServerClient } from "@/lib/weaverse/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Per-item Studio revalidation.
 *
 * When a merchant edits a section, Studio posts here to re-run that one
 * component's server loader with the unsaved draft settings and get fresh
 * `loaderData` back. Without this route an edit that changes a resource
 * selection shows stale data until a full reload, because the loader only ever
 * runs during a page load.
 *
 * The handler reconstructs and validates a same-origin request context from
 * the body, so the loader re-runs with the live page's route identity rather
 * than this endpoint's own path.
 */
export const { POST } = createWeaverseNextRevalidateHandler({
  getClient: async (
    _request: Request,
    requestContext?: WeaverseNextRequestContext,
  ) => {
    const client = await revalidateServerClient(requestContext);
    if (client === null) {
      throw new Error("Weaverse is not configured for this deployment.");
    }
    return client;
  },
});
