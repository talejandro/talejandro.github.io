import { type ISODate } from "./plain-date.js";
/**
 * A cached `Intl.DateTimeFormat` for calendar dates in a locale: UTC, and in a calendar whose months match the Gregorian ones.
 * @stable
 */
declare function dateFormatter(locale?: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat;
/**
 * An ISO date as people read it in a locale, like "October 16, 2026" or
 * "16.10.2026". `options` are `Intl.DateTimeFormat`'s; the default is the
 * locale's long date, the label a calendar's day cells use.
 * @stable
 */
declare function formatDate(date: ISODate, locale?: string, options?: Intl.DateTimeFormatOptions): string;
/**
 * A range of ISO dates as people read it in a locale, like "Oct 16 – 20, 2026".
 * @stable
 */
declare function formatDateRange(start: ISODate, end: ISODate, locale?: string, options?: Intl.DateTimeFormatOptions): string;
/**
 * The parts `Intl` formats an ISO date into, for building a label of your own.
 * @stable
 */
declare function formatDateToParts(date: ISODate, locale?: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[];
/**
 * The twelve month names in a locale, January first, in the form that stands
 * alone, as in a month select or a heading: "январь" rather than the "января"
 * of "16 января".
 * @stable
 */
declare function monthNames(locale?: string, width?: "long" | "short" | "narrow"): string[];
/**
 * The seven weekday names in a locale, starting on `weekStartsOn` (0 for Sunday).
 * @stable
 */
declare function weekdayNames(locale?: string, width?: "long" | "short" | "narrow", weekStartsOn?: number): string[];
/**
 * Today's ISO date in a time zone, like `"America/New_York"`, or in the
 * runtime's own. A server and a browser in different zones can disagree, so
 * render today only on the client, or pass the same zone to both.
 * @stable
 */
declare function todayDate(timeZone?: string): string;
export { dateFormatter, formatDate, formatDateRange, formatDateToParts, monthNames, todayDate, weekdayNames, };
