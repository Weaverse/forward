/**
 * Parsers for list-shaped section settings.
 *
 * Builder stores these as a textarea, one entry per line, because they are
 * short editorial lists rather than Shopify resources. The section owns the
 * parsing so the stored value stays something a merchant can read and edit as
 * plain text.
 *
 * Every parser drops blank lines and trims, so a trailing newline or a stray
 * indent never renders as an empty row.
 */

/** Splits a textarea value into non-empty trimmed lines. */
export function parseLines(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Splits each line on `|` into a fixed number of trimmed cells.
 *
 * Lines with too few cells are dropped rather than padded with empty strings:
 * a half-written row is a mistake to make visible in Studio, not something to
 * render as a gap.
 */
export function parseRows(value: unknown, cells: number): string[][] {
  return parseLines(value)
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter(
      (row) => row.length >= cells && row.every((cell) => cell.length > 0),
    )
    .map((row) => row.slice(0, cells));
}
