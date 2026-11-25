/**
 * A calendar date as an ISO 8601 string, `YYYY-MM-DD`, like `"2026-10-16"`. What `<input type="date">` submits.
 * @stable
 */
type ISODate = string;
/**
 * A calendar date's fields: a year from 1 to 9999, a month from 1 to 12 and a day from 1.
 * @stable
 */
type DateParts = {
    year: number;
    month: number;
    day: number;
};
/**
 * Whether a value is a real ISO date, like `"2026-10-16"`. `"2026-02-30"` isn't.
 * @stable
 */
declare function isISODate(value: unknown): value is ISODate;
/**
 * The year, month and day of an ISO date, or undefined when it isn't a real date.
 * @stable
 */
declare function dateParts(date: ISODate | null | undefined): {
    year: number;
    month: number;
    day: number;
} | undefined;
/**
 * The ISO date of a year, a month from 1 to 12 and a day, or undefined when there's no such date.
 * @stable
 */
declare function isoDate(year: number, month: number, day: number): string | undefined;
/**
 * The ISO date of an ISO string, a `Date` (its local year, month and day, as
 * the user saw them) or anything with `year`, `month` and `day`, like a
 * `Temporal.PlainDate`. Undefined for anything else.
 * @stable
 */
declare function toISODate(value: ISODate | Date | DateParts | null | undefined): string | undefined;
/**
 * The number of days in a month, from 1 to 12, of a year. 0 for a month that doesn't exist.
 * @stable
 */
declare function daysInMonth(year: number, month: number): number;
/**
 * The date `days` days later, or earlier when negative, kept between years 1 and 9999.
 * @stable
 */
declare function addDays(date: ISODate, days: number): string;
/**
 * The date `months` months later, or earlier, keeping the day where it can: January 31 plus a month is the last day of February.
 * @stable
 */
declare function addMonths(date: ISODate, months: number): string;
/**
 * The date `years` years later, or earlier: February 29 becomes February 28 in a common year.
 * @stable
 */
declare function addYears(date: ISODate, years: number): string;
/**
 * Days from `from` to `to`: positive when `to` is later.
 * @stable
 */
declare function daysBetween(from: ISODate, to: ISODate): number;
/**
 * The day of the week, 0 for Sunday to 6 for Saturday, as `Date#getDay` counts.
 * @stable
 */
declare function weekday(date: ISODate): number;
/**
 * The first day of the week `date` is in, for weeks starting on `weekStartsOn` (0 for Sunday).
 * @stable
 */
declare function startOfWeek(date: ISODate, weekStartsOn?: number): string;
/**
 * The last day of the week `date` is in, for weeks starting on `weekStartsOn` (0 for Sunday).
 * @stable
 */
declare function endOfWeek(date: ISODate, weekStartsOn?: number): string;
/**
 * The first day of the month `date` is in.
 * @stable
 */
declare function startOfMonth(date: ISODate): string;
/**
 * The last day of the month `date` is in.
 * @stable
 */
declare function endOfMonth(date: ISODate): string;
/**
 * Whether two dates are in the same month of the same year.
 * @stable
 */
declare function isSameMonth(a: ISODate, b: ISODate): boolean;
/**
 * `date`, moved onto `min` or `max` when it's outside them. Either bound may be missing.
 * @stable
 */
declare function clampDate(date: ISODate, min?: ISODate | null, max?: ISODate | null): string;
/**
 * The weeks a month shows in a calendar, each seven ISO dates starting on
 * `weekStartsOn` (0 for Sunday). Days of the months around it fill the first
 * and last weeks. With `fixedWeeks`, the default, there are always six, so a
 * calendar keeps its height from month to month.
 * @stable
 */
declare function monthGrid(month: ISODate, options?: {
    weekStartsOn?: number;
    fixedWeeks?: boolean;
}): string[][];
export { addDays, addMonths, addYears, clampDate, dateParts, type DateParts, daysBetween, daysInMonth, endOfMonth, endOfWeek, isISODate, isoDate, type ISODate, isSameMonth, monthGrid, startOfMonth, startOfWeek, toISODate, weekday, };
