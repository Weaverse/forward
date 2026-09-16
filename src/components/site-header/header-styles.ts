/** Class contracts the header shell shares across its panels and controls. */

/** The row highlight the Field Index shares between its two nav layers. */
export const INDEX_ROW_TRANSITION =
  "[transition:background-color_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),padding-inline_220ms_var(--ease-standard)]";

/*
 * While the header floats over a dark hero it carries `data-transparent`, and
 * its controls invert: a light-surface hover would read as a hole in the hero.
 * The dividers go with it, fading back in only once the bar takes its surface
 * back, so only border-color transitions — hover stays as immediate as before.
 */
export const PRIMARY_NAV_ITEM_CLASS =
  "group inline-flex min-w-25.5 items-center justify-center gap-2.5 border-0 border-s border-border-subtle px-3.5 font-body text-caption font-ui-strong tracking-link uppercase transition-[border-color] duration-(--duration-fast) ease-standard hover:bg-ink hover:text-text-inverse aria-[current=page]:bg-ink aria-[current=page]:text-text-inverse last:border-e motion-reduce:transition-none xl:min-w-30.5 xl:px-5 group-data-[transparent=true]/header:border-transparent group-data-[transparent=true]/header:hover:bg-text-inverse group-data-[transparent=true]/header:hover:text-ink group-data-[transparent=true]/header:aria-[current=page]:bg-text-inverse group-data-[transparent=true]/header:aria-[current=page]:text-ink";

/*
 * The `01`/`02` index numerals beside each nav label. Over the hero they swap
 * to the dark-surface muted tone: the light-surface one lands near 3:1 on ink.
 */
export const NAV_ITEM_INDEX_CLASS =
  "text-ui text-text-muted not-italic group-hover:text-text-dark-muted group-aria-[current=page]:text-text-dark-muted group-data-[transparent=true]/header:text-text-dark-muted group-data-[transparent=true]/header:group-hover:text-text-muted group-data-[transparent=true]/header:group-aria-[current=page]:text-text-muted";

/*
 * The disclosure caret on the panel triggers. Forward publishes two signal
 * tones — `signal-strong` for light surfaces, `signal` for dark — so the caret
 * follows whichever surface the item is wearing right now, in either bar state.
 */
export const NAV_ITEM_CARET_CLASS =
  "inline-flex min-w-2.5 items-center text-label text-signal-strong group-hover:text-signal group-aria-[current=page]:text-signal group-data-[transparent=true]/header:text-signal group-data-[transparent=true]/header:group-hover:text-signal-strong group-data-[transparent=true]/header:group-aria-[current=page]:text-signal-strong";

export const HEADER_CONTROL_CLASS =
  "min-h-touch min-w-touch items-center justify-center gap-2 bg-transparent font-body text-caption font-ui tracking-link uppercase hover:bg-surface-subtle group-data-[transparent=true]/header:hover:bg-white/15";
