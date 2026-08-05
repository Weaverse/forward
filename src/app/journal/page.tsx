import type { Metadata } from "next";
import Link from "next/link";

import { SurfaceShell } from "@/components/surface-shell";
import { SHELL_ARTICLE } from "@/lib/shell-fixtures";

export const metadata: Metadata = {
  title: "Journal",
  description: "Field notes, trip reports, and gear thinking from Forward.",
};

export default function JournalPage() {
  return (
    <SurfaceShell
      eyebrow="Journal"
      title="Field notes"
      description="Trip reports, gear thinking, and slow observations from time outside."
      dataDependency="This surface will list articles from the Shopify Blog API. The entry below is a neutral route-smoke fixture, not published editorial content."
    >
      <Link
        href={`/journal/${SHELL_ARTICLE.handle}`}
        className="group block max-w-2xl border border-mist bg-parchment px-6 py-8 transition-colors hover:border-pine"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
          Latest entry
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-pine group-hover:text-clay">
          {SHELL_ARTICLE.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          {SHELL_ARTICLE.excerpt}
        </p>
      </Link>
    </SurfaceShell>
  );
}
