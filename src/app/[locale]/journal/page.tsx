import type { Metadata } from "next";
import { routeLocale } from "@/lib/i18n/route-locale";
import { getTranslator, translatedMetadata } from "@/lib/i18n/translator";
import { getStorefront } from "@/lib/storefront/data-source";
import { IndexHeader } from "@/sections/index-header";
import { JournalGrid } from "@/sections/journal-grid";
import { JournalLead } from "@/sections/journal-lead";

interface JournalPageProps {
  params: Promise<{ locale: string }>;
}

export function generateMetadata({
  params,
}: Pick<JournalPageProps, "params">): Promise<Metadata> {
  return translatedMetadata(params, {
    title: "meta.journalTitle",
    description: "meta.journalDescription",
    path: "/journal",
  });
}

export default async function JournalPage(props: JournalPageProps) {
  const locale = await routeLocale(props.params);
  const [articles, t] = await Promise.all([
    getStorefront(locale).listArticles(),
    getTranslator(locale),
  ]);
  const [lead, ...rest] = articles;

  return (
    <>
      <IndexHeader
        eyebrowLabel={t("journal.eyebrow")}
        heading={t("journal.heading")}
        lede={t("journal.lede")}
      />

      {lead !== undefined ? (
        <JournalLead
          linkLabel={t("journal.leadLink")}
          locale={locale}
          article={lead}
        />
      ) : null}

      <JournalGrid
        eyebrowLabel={t("journal.gridEyebrow")}
        heading={t("journal.gridHeading")}
        linkLabel={t("journal.gridLink")}
        articles={rest}
      />
    </>
  );
}
