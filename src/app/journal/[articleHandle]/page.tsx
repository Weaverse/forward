import type { Metadata } from "next";

import { SurfaceShell } from "@/components/surface-shell";
import { formatHandle } from "@/lib/shell-fixtures";

interface ArticlePageProps {
  params: Promise<{ articleHandle: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { articleHandle } = await params;
  return { title: `${formatHandle(articleHandle)} · Journal` };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleHandle } = await params;
  return (
    <SurfaceShell
      eyebrow="Journal entry"
      title={formatHandle(articleHandle)}
      description="Article body, byline, imagery, and publish date arrive with live editorial data."
      dataDependency={`This surface will resolve the “${articleHandle}” article from the Shopify Blog API.`}
    >
      <div className="max-w-2xl space-y-4 border border-mist bg-parchment px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
          Article body placeholder
        </p>
        <p className="text-sm leading-relaxed text-slate">
          The full article layout — typography scale, pull quotes, inline
          imagery, and related reading — lands with the editorial slice.
        </p>
      </div>
    </SurfaceShell>
  );
}
