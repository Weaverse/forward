"use client";

import {
  PredictiveSearchProvider,
  usePredictiveSearch,
  usePredictiveSearchActions,
} from "@shopify/hydrogen/react";
import Image from "next/image";
import { type KeyboardEvent, useId, useState } from "react";

import { Link } from "@/components/link";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizePath } from "@/lib/i18n/locales";
import type { TranslationKey } from "@/lib/i18n/static-content";
import { useT } from "@/lib/i18n/t";
import { formatMoney } from "@/lib/storefront/format";
import {
  PREDICTIVE_SEARCH_PATH,
  type PredictiveSearchKind,
  type PredictiveSearchOption,
  predictiveSearchGroups,
} from "@/lib/storefront/predictive-search";

const GROUP_HEADINGS: Record<PredictiveSearchKind, TranslationKey> = {
  query: "search.groupQuery",
  product: "search.groupProduct",
  collection: "search.groupCollection",
  page: "search.groupPage",
  article: "search.groupArticle",
};

const OPTION_CLASS =
  "flex min-h-touch items-center gap-3.5 px-4 py-2 font-body text-copy text-ink transition-colors duration-fast ease-standard hover:bg-surface-subtle aria-selected:bg-signal motion-reduce:transition-none";

interface PredictiveSearchFormProps {
  /** The submitted query, to start the field with. */
  defaultQuery: string;
}

/**
 * The search page's GET form, with results as the shopper types: an ARIA
 * combobox over Hydrogen's predictive search handler, in the page's market.
 * Hydrogen's store debounces the term and aborts a stale request. Without
 * JavaScript, or on Enter with no option active, the form submits to
 * `/search` as before.
 */
export function PredictiveSearchForm({
  defaultQuery,
}: PredictiveSearchFormProps) {
  const locale = useLocale();
  return (
    <PredictiveSearchProvider
      predictiveSearchEndpoint={localizePath(PREDICTIVE_SEARCH_PATH, locale)}
      debounceInMs={200}
    >
      <SearchCombobox defaultQuery={defaultQuery} />
    </PredictiveSearchProvider>
  );
}

function SearchCombobox({ defaultQuery }: PredictiveSearchFormProps) {
  const t = useT();
  const locale = useLocale();
  const { search } = usePredictiveSearchActions();
  const { status, result } = usePredictiveSearch();
  const [value, setValue] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState({ key: "", index: -1 });
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const term = value.trim();
  const expanded = open && term !== "";
  /* Hydrogen keeps the previous result while a search loads and after one
   * fails, so only a result for the current term is shown. */
  const fresh = status !== "error" && result.term === term;
  const groups = fresh ? predictiveSearchGroups(result.items) : [];
  const total = fresh ? result.total : 0;
  const viewAll: PredictiveSearchOption = {
    kind: "query",
    title: t("search.viewAll", { query: term }),
    href: `/search?${new URLSearchParams({ q: term })}`,
    image: null,
    price: null,
  };
  const options = [...groups.flatMap((group) => group.options), viewAll];
  /* The active option belongs to one list: when results arrive or change,
   * nothing is active, so Enter never opens an option the shopper didn't
   * pick and `aria-activedescendant` never points at a missing id. */
  const optionsKey = options.map((option) => option.href).join("\n");
  const active = selection.key === optionsKey ? selection.index : -1;

  function setActive(index: number) {
    setSelection({ key: optionsKey, index });
  }

  const statusText =
    status === "loading"
      ? t("search.suggestionsLoading")
      : status === "error"
        ? t("search.suggestionsUnavailable")
        : status === "success" && fresh && total === 0
          ? t("search.suggestionsEmpty", { query: term })
          : null;

  function move(next: number) {
    setOpen(true);
    setActive(next);
    document
      .getElementById(optionId(next))
      ?.scrollIntoView({ block: "nearest" });
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    /* Arrow keys and Enter belong to the IME while it composes (Safari
     * reports composition only through keyCode 229). */
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === "ArrowDown" && term !== "") {
      event.preventDefault();
      move(expanded ? (active + 1) % options.length : 0);
    } else if (event.key === "ArrowUp" && expanded) {
      event.preventDefault();
      move(active <= 0 ? options.length - 1 : active - 1);
    } else if (event.key === "Enter" && expanded && active >= 0) {
      event.preventDefault();
      document.getElementById(optionId(active))?.click();
    } else if (event.key === "Escape" && expanded) {
      event.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  }

  function renderOption(option: PredictiveSearchOption, optionIndex: number) {
    return (
      <Link
        key={optionId(optionIndex)}
        id={optionId(optionIndex)}
        role="option"
        aria-selected={optionIndex === active}
        tabIndex={-1}
        className={OPTION_CLASS}
        href={option.href}
        /* Results change on every keystroke; prefetching each would cost a
         * request per result. */
        prefetch={false}
        onClick={() => setOpen(false)}
        onMouseMove={() => setActive(optionIndex)}
      >
        {option.kind === "product" ||
        option.kind === "collection" ||
        option.kind === "article" ? (
          <span className="block aspect-4/5 w-10 flex-none overflow-hidden bg-media-card">
            {option.image !== null ? (
              <Image
                className="size-full object-cover"
                src={option.image}
                alt=""
                width={80}
                height={100}
                sizes="40px"
              />
            ) : null}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{option.title}</span>
        {option.price !== null ? (
          <span className="flex-none whitespace-nowrap text-label">
            {formatMoney(option.price, locale)}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <form
      role="search"
      className="relative mt-17.5 mb-15 grid grid-cols-1 border-ink border-b-3 sm:grid-cols-lead-trailing"
      method="get"
      action={localizePath("/search", locale)}
    >
      <label className="sr-only" htmlFor={inputId}>
        {t("search.inputLabel")}
      </label>
      <input
        id={inputId}
        name="q"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-activedescendant={
          expanded && active >= 0 ? optionId(active) : undefined
        }
        autoComplete="off"
        className="h-16 min-w-0 border-0 bg-transparent font-heading text-search-display focus:outline-0 sm:h-27.5"
        value={value}
        placeholder={t("search.placeholder")}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          setActive(-1);
          setOpen(true);
          search(event.currentTarget.value);
        }}
        onFocus={() => {
          setOpen(true);
          if (status === "idle" && term !== "") search(term);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <button
        className="min-h-12 min-w-25 justify-self-start bg-transparent font-body text-caption font-extrabold tracking-label uppercase sm:min-h-auto sm:justify-self-auto"
        type="submit"
      >
        {t("search.submit")}
      </button>
      <p className="sr-only" role="status">
        {expanded
          ? (statusText ?? t("search.suggestionsCount", { count: total }))
          : ""}
      </p>
      {expanded ? (
        <div
          className="absolute inset-x-0 top-full z-20 mt-0.75 max-h-[min(70vh,560px)] overflow-y-auto border border-ink bg-canvas shadow-panel"
          /* Keeps focus in the field, so a click lands on the option. */
          onMouseDown={(event) => event.preventDefault()}
        >
          {statusText !== null ? (
            <p className="m-0 px-4 pt-3.5 font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase">
              {statusText}
            </p>
          ) : null}
          <div
            id={listboxId}
            role="listbox"
            aria-label={t("search.suggestions")}
            className="py-2"
          >
            {groups.map((group) => (
              <div
                key={group.kind}
                role="group"
                aria-labelledby={`${baseId}-${group.kind}`}
                className="pb-2"
              >
                <div
                  id={`${baseId}-${group.kind}`}
                  role="presentation"
                  className="px-4 pt-2 pb-1 font-field-meta text-ui font-medium text-text-muted tracking-field-meta uppercase"
                >
                  {t(GROUP_HEADINGS[group.kind])}
                </div>
                {group.options.map((option) =>
                  renderOption(option, options.indexOf(option)),
                )}
              </div>
            ))}
            <div
              role="presentation"
              className="border-border-subtle border-t pt-2"
            >
              {renderOption(viewAll, options.length - 1)}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
