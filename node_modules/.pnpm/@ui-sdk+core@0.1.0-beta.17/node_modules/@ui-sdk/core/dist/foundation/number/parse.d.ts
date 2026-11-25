/**
 * Reads a number typed in a locale's format: its digits, group and decimal
 * separators, minus signs, and currency, percent and unit text. Percent
 * formats divide by 100. Returns null for text that isn't a number.
 * @experimental
 */
declare function parseNumber(text: string, locale?: string, format?: Intl.NumberFormatOptions): number | null;
/**
 * Whether text could still become a number as someone types it, like "-",
 * "1." or "$1,2". Without `allowNegative`, a minus sign isn't accepted.
 * @experimental
 */
declare function isPartialNumber(text: string, locale?: string, format?: Intl.NumberFormatOptions, { allowNegative }?: {
    allowNegative?: boolean | undefined;
}): boolean;
/** The numbers in a `"start/end"` string, or null when any part isn't one. */
declare function parseRange(value: string): number[] | null;
export { isPartialNumber, parseNumber, parseRange };
