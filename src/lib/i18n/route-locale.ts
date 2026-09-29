import "server-only";

import { notFound } from "next/navigation";

import { type LocaleId, parseLocale } from "./locales";

/** The route's locale segment; an unknown one is a 404, never a guess. */
export async function routeLocale(
  params: Promise<{ locale: string }>,
): Promise<LocaleId> {
  const locale = parseLocale((await params).locale);
  if (locale === null) {
    notFound();
  }
  return locale;
}
