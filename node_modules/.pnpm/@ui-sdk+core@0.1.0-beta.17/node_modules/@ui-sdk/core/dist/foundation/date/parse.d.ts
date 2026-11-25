import { type ISODate } from "./plain-date.js";
/**
 * A date field's part, in the order a locale writes it.
 * @stable
 */
type DateField = "year" | "month" | "day";
/**
 * How a locale writes a date in numbers, from `datePattern`.
 * @stable
 */
type DatePattern = {
    /** The fields in the locale's order, like `["month", "day", "year"]` in American English. */
    fields: DateField[];
    /** What goes between the fields, like `"/"` or `"."`. */
    separator: string;
    /** A placeholder for an empty field, like `"MM/DD/YYYY"`, `"TT.MM.JJJJ"` in German or `"ДД.ММ.ГГГГ"` in Russian. */
    placeholder: string;
    /** December 31 of this year in the locale's numeric form, like `"12/31/2026"`, for a hint that shows the order. */
    example: string;
};
/**
 * How a locale writes a date in numbers: its field order, separator, a placeholder and an example.
 * @stable
 */
declare function datePattern(locale?: string): DatePattern;
/**
 * The ISO date in text someone typed, or undefined when it isn't a real date.
 * It reads the locale's order with any separator ("16.10.2026", "16/10/26",
 * "16 10 2026"), digits alone ("16102026"), month names ("16 Oct 2026",
 * "October 16"), the locale's own digits, and ISO dates. A missing year is
 * `referenceDate`'s, today's by default. Years read in the locale's calendar,
 * like Buddhist years in Thai. A two-digit year lands in the hundred years that
 * end 20 years after the reference year: "26" is 2026 and "70" is 1970 in 2026.
 * @stable
 */
declare function parseDate(text: string, locale?: string, options?: {
    referenceDate?: ISODate;
}): string | undefined;
export { type DateField, datePattern, type DatePattern, parseDate };
