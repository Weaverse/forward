/** Class contracts the header shell shares across its panels and controls. */

/** The row highlight the Field Index shares between its two nav layers. */
export const INDEX_ROW_TRANSITION =
  "[transition:background-color_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),padding-inline_220ms_var(--ease-standard)]";

export const PRIMARY_NAV_ITEM_CLASS =
  "group inline-flex min-w-25.5 items-center justify-center gap-2.5 border-0 border-s border-border-subtle px-3.5 font-body text-caption font-ui-strong tracking-link uppercase hover:bg-ink hover:text-text-inverse aria-[current=page]:bg-ink aria-[current=page]:text-text-inverse last:border-e xl:min-w-30.5 xl:px-5";

export const HEADER_CONTROL_CLASS =
  "min-h-touch min-w-touch items-center justify-center gap-2 bg-transparent font-body text-caption font-ui tracking-link uppercase hover:bg-surface-subtle";
