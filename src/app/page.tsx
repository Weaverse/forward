import { notFound } from "next/navigation";

import { WeaversePage } from "@/lib/weaverse/page";
import {
  loadWeaversePage,
  type SearchParams,
  weaverseProjectId,
} from "@/lib/weaverse/server";

interface HomePageProps {
  searchParams: Promise<SearchParams>;
}

export const revalidate = 3600;

/**
 * Home.
 *
 * Composed entirely from the project's `INDEX` template. Every section takes
 * its own data through its loader, so the route loads nothing itself.
 */
export default async function HomePage(props: HomePageProps) {
  const [page, projectId] = await Promise.all([
    loadWeaversePage({
      pathname: "/",
      searchParams: await props.searchParams,
      type: "INDEX",
    }),
    Promise.resolve(weaverseProjectId()),
  ]);

  if (page === null || projectId === null) {
    notFound();
  }

  return (
    <div className="bg-text-inverse">
      <WeaversePage data={page} projectId={projectId} />
    </div>
  );
}
