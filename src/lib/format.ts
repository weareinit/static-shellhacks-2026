export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {},
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch (_err) {
    return "";
  }
}

// Single source of truth for the placeholder shown wherever a value is
// missing. Kept as a constant so every data display uses the same glyph.
export const EMPTY_PLACEHOLDER = "—";

// A value is "empty" when there is nothing meaningful to show. 0 and false
// are real values and intentionally not treated as empty.
export function isEmptyValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (typeof value === "number" && Number.isNaN(value))
  );
}

// Normalize a value for display, substituting the shared placeholder for
// empty/null values. Use this (or <CellValue>) instead of ad-hoc
// `value || "-"` fallbacks.
export function displayValue(
  value: unknown,
  placeholder: string = EMPTY_PLACEHOLDER,
): unknown {
  return isEmptyValue(value) ? placeholder : value;
}
