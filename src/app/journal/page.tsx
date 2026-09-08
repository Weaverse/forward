import type { Metadata } from "next";

import { storefront } from "@/lib/storefront/data-source";
import { IndexHeader } from "@/sections/index-header";
import { JournalGrid } from "@/sections/journal-grid";
import { JournalLead } from "@/sections/journal-lead";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Field notes from the Forward journal: trips, gear arguments, and weather worth going out in.",
};

export default async function JournalPage() {
  const articles = await storefront.listArticles();
  const [lead, ...rest] = articles;

  return (
    <>
      <IndexHeader
        eyebrowLabel="The field journal"
        heading="Notes from farther out."
        lede="Routes, useful skills, working knowledge, and the weather worth going out in."
      />

      {lead !== undefined ? (
        <JournalLead linkLabel="Read field note" article={lead} />
      ) : null}

      <JournalGrid
        eyebrowLabel="Latest dispatches"
        heading="Read, learn, head out."
        linkLabel="Read story"
        articles={rest}
      />
    </>
  );
}
