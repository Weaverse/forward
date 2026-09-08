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

export interface WeaversePageProps {
  data: WeaverseNextLoaderData;
  projectId: string;
}

export function WeaversePage({ data, projectId }: WeaversePageProps) {
  const client = createWeaverseNextClient({
    components: WEAVERSE_COMPONENTS,
    projectId,
  });

  return (
    <WeaverseNextProvider client={client}>
      <WeaverseNextRenderer data={data} />
    </WeaverseNextProvider>
  );
}
