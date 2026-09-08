"use client";

/**
 * The client boundary that renders a composed Weaverse page.
 *
 * A route loads its page payload on the server, then hands it to this
 * component. Everything below here runs in the browser because
 * `WeaverseNextRenderer` holds React context and subscribes to a store, which
 * a Server Component cannot do.
 *
 * Keeping the boundary in one file means exactly one place ships the section
 * registry to the browser, so it stays obvious what the composition costs.
 */

import type { WeaverseNextLoaderData } from "@weaverse/next";
import {
  createWeaverseNextClient,
  WeaverseNextProvider,
  WeaverseNextRenderer,
} from "@weaverse/next";

import { WEAVERSE_COMPONENTS } from "./components";
import { clientRequestContext } from "./request-context";

export interface WeaversePageProps {
  data: WeaverseNextLoaderData;
  /** Fallback when the payload carries no project metadata. */
  projectId: string;
}

export function WeaversePage({ data, projectId }: WeaversePageProps) {
  /* Prefer the id the payload was actually loaded with: Studio targets that
   * project, and a mismatch between it and the environment would point the
   * bridge at the wrong one. */
  const resolvedProjectId =
    (data.configs?.projectId as string | undefined) ??
    (data.project?.id as string | undefined) ??
    projectId;
  /* Studio attaches to the route identity carried in the payload; without it
   * the bridge has no page to outline and no item to revalidate. */
  const client = createWeaverseNextClient({
    components: WEAVERSE_COMPONENTS,
    projectId: resolvedProjectId,
    requestContext: clientRequestContext(data),
  });

  return (
    <WeaverseNextProvider client={client}>
      <WeaverseNextRenderer data={data} />
    </WeaverseNextProvider>
  );
}
