"use client";

import { useT } from "@/lib/i18n/t";
import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";

/** Error state with the accepted geometry, reset behavior, and semantics. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  return (
    <div className={emptyState({ size: "page" })}>
      <div className="max-w-state" role="alert">
        <p className={eyebrow()}>{t("errors.eyebrow")}</p>
        <h1 className={sectionHeading()}>{t("errors.heading")}</h1>
        <p className="max-w-lede text-lede leading-lede text-text-muted">
          {t("errors.body")}
        </p>
        {error.digest ? (
          <p className="font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase">
            {t("errors.reference", { digest: error.digest })}
          </p>
        ) : null}
        <button className={cta()} type="button" onClick={reset}>
          {t("errors.retry")}
        </button>
      </div>
    </div>
  );
}
