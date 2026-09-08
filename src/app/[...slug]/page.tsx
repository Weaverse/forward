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
 * time, so there is no route file per page.
 *
 * Sitting at the app root, this also catches what other routes decline: a
 * dynamic route with `dynamicParams = false` does not match an unknown handle,
 * and routing then falls through to here. `notFound()` answers both cases with
 * a real 404 — which only holds while no `loading.tsx` wraps the route in a
 * Suspense boundary, because a streamed shell commits the response to 200
 * before the check runs.
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
