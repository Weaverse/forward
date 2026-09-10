/**
 * The props the Weaverse runtime attaches to every rendered item.
 *
 * Studio identifies an item by the `data-wv-*` attributes the runtime passes
 * as props. A component that does not spread them onto its root element
 * renders correctly and is still invisible to Studio: no outline entry, no
 * click target, nothing to select or reorder. The page looks composed and
 * cannot be edited.
 *
 * So every registered component takes `WeaverseElementProps` and spreads the
 * rest onto its outermost DOM node. `tests/dom/composed-sections.test.tsx`
 * asserts that, because the failure is silent in the storefront and only shows
 * up inside Studio.
 */
export interface WeaverseElementProps {
  "data-wv-id"?: string;
  "data-wv-type"?: string;
  id?: string;
  className?: string;
  /** Anything else the runtime chooses to pass through. */
  [key: string]: unknown;
}

/**
 * Narrows the runtime rest props to what is safe to spread onto a DOM element.
 *
 * The runtime's prop bag also carries authored settings, which are not DOM
 * attributes; passing those to React logs unknown-prop warnings. Only the
 * identity attributes, `id`, and any `aria-*` a component passes through are
 * forwarded — an ARIA attribute is never an authored setting, and dropping one
 * silently removes the accessible name a section was labelled by.
 */
export function elementAttributes(
  props: WeaverseElementProps,
): Record<string, string> {
  const attributes: Record<string, string> = {};
  const forwarded = Object.keys(props).filter(
    (key) =>
      key === "data-wv-id" ||
      key === "data-wv-type" ||
      key === "id" ||
      key.startsWith("aria-"),
  );
  for (const key of forwarded) {
    const value = props[key];
    if (typeof value === "string" && value.length > 0) {
      attributes[key] = value;
    }
  }
  /* Applied after the loop on purpose: the runtime keeps `id` for the item's
   * own identity, so an authored anchor travels under its own name and has to
   * win when both are present. A section labelled by its heading needs that
   * heading to carry the stable id, and the heading is a child now. */
  if (typeof props.elementId === "string" && props.elementId.length > 0) {
    attributes.id = props.elementId;
  }
  return attributes;
}
