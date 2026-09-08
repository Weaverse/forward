import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";

interface CustomPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<SearchParams>;
}

/**
 * Every Weaverse `CUSTOM` page, served by one route.
 *
 * Merchants create custom pages at paths this repository cannot know ahead of
 * time, so there is no route file per page. The route deliberately does not
 * live at the app root: a dynamic root catch-all matches every unclaimed URL,
 * which would turn unknown product, collection, article, page, and policy
 * handles from real 404s into soft ones. `proxy.ts` rewrites the paths Weaverse
 * actually publishes to this internal prefix instead, so every other URL keeps
 * Next's ordinary routing and its ordinary 404.
 */
export default async function WeaverseCustomPage(props: CustomPageProps) {
  const { slug } = await props.params;
  const pathname = `/${slug.join("/")}`;

  const page = await loadWeaversePage({
    pathname,
    searchParams: await props.searchParams,
    type: "CUSTOM",
  });
  const projectId = weaverseProjectId();

  if (page === null || projectId === null) {
    /* The proxy only rewrites paths Weaverse listed, so reaching here means
     * the page was unpublished between the cached listing and this request. */
    notFound();
  }

  return <WeaversePage data={page} projectId={projectId} />;
}

export async function generateMetadata(
  props: CustomPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await loadWeaversePage({
    pathname: `/${slug.join("/")}`,
    searchParams: await props.searchParams,
    type: "CUSTOM",
  });

  const seo = page?.page?.seo as
    | { title?: string; description?: string }
    | undefined;
  return {
    ...(seo?.title === undefined ? {} : { title: seo.title }),
    ...(seo?.description === undefined ? {} : { description: seo.description }),
  };
}
