"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

import { useLocale } from "@/lib/i18n/locale-context";
import { type LocaleId, localizePath } from "@/lib/i18n/locales";

/**
 * The theme's only internal link: `next/link` with the current locale's prefix.
 *
 * Hrefs everywhere else stay locale-free — menus, content links and routes all
 * name `/shop`, and this puts `/de-de/shop` on the page. The default locale,
 * external URLs and non-path hrefs pass through unchanged.
 */
export function Link({
  href,
  locale: target,
  ...props
}: Omit<ComponentProps<typeof NextLink>, "locale"> & {
  /** Link into another market instead of the current one. */
  locale?: LocaleId;
}) {
  const current = useLocale();
  const locale = target ?? current;
  return (
    <NextLink
      {...props}
      href={typeof href === "string" ? localizePath(href, locale) : href}
    />
  );
}
