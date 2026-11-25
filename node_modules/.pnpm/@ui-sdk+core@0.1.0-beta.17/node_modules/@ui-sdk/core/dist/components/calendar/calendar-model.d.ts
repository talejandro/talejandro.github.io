import { type ISODate } from "../../foundation/date/plain-date.js";
/**
 * A month as `YYYY-MM`, like `"2026-10"`, which is what `<input type="month">` submits.
 * @stable
 */
type ISOMonth = string;
/**
 * How many dates a calendar selects: one, any number, or a range from a start to an end.
 * @stable
 */
type CalendarMode = "single" | "multiple" | "range";
/**
 * A calendar's value for each mode: an ISO date, a sorted list of them, or a `[start, end]` range. `null` when nothing is selected.
 * @stable
 */
type CalendarValue<Mode extends CalendarMode = CalendarMode> = Mode extends "multiple" ? ISODate[] : Mode extends "range" ? [ISODate, ISODate] | null : ISODate | null;
/**
 * Dates a calendar shouldn't let anyone pick, as data or a function: an ISO
 * date, `{ from, to }` for the dates between two, inclusive, `{ weekday: [0, 6] }`
 * for weekends (0 is Sunday), `{ before: date }`, `{ after: date }`, a
 * function, or a list of any of these. Data can be generated and sent over the
 * wire; a function can't.
 * @stable
 */
type DateMatcher = ISODate | {
    from: ISODate;
    to: ISODate;
} | {
    weekday: readonly number[];
} | {
    before: ISODate;
} | {
    after: ISODate;
} | ((date: ISODate) => boolean);
/**
 * One or more `DateMatcher`s.
 * @stable
 */
type DateMatchers = DateMatcher | readonly DateMatcher[];
/** Whether `date` is one of the dates `matchers` name. */
declare function matchesDate(date: ISODate, matchers: DateMatchers | null | undefined): boolean;
/** The month a date is in. */
declare const monthOf: (date: ISODate) => string;
/** The month `months` months after `month`, or before when negative. */
declare const addMonthsTo: (month: ISOMonth, months: number) => string;
/** Whether a value is a month, like `"2026-10"`. */
declare const isISOMonth: (value: unknown) => value is ISOMonth;
/** The dates a value selects, sorted. A range gives its two ends. */
declare function selectedDates(value: unknown): string[];
/** A value read for a mode, so a controlled value of the wrong shape can't break the calendar. */
declare function normalizeValue(mode: CalendarMode, value: unknown): string | string[] | null;
/** The rules a range must follow, from the calendar's options. */
type RangeRules = {
    minDays?: number;
    maxDays?: number;
    /** Whether a range may hold unavailable dates. */
    allowUnavailable: boolean;
    isUnavailable: (date: ISODate) => boolean;
};
/** Whether `start` to `end` is a range the rules allow. Lengths count both ends: a day to itself is 1. */
declare function isAllowedRange(start: ISODate, end: ISODate, rules: RangeRules): boolean;
/** The range from `anchor` to `date`, whichever comes first, or null when the rules don't allow it. */
declare function rangeTo(anchor: ISODate, date: ISODate, rules: RangeRules): [string, string] | null;
/**
 * What a press on `date` does to a range: with no start yet, it starts one.
 * With a start, any date ends it, the earlier of the two starting it, if the
 * rules allow; one they don't allow keeps the start.
 */
declare function pressRange(anchor: ISODate | null, date: ISODate, rules: RangeRules): {
    anchor: string;
    value: undefined;
} | {
    anchor: null;
    value: [string, string];
};
/** A key's move, kept within `min` and `max`. Undefined when the key isn't the grid's. */
declare function moveDate(event: {
    key: string;
    shiftKey?: boolean;
}, from: ISODate, options: {
    rtl: boolean;
    weekStartsOn: number;
    min?: ISODate | null;
    max?: ISODate | null;
}): string | undefined;
/**
 * The first visible month that shows `date`, given the months shown now:
 * unchanged when it's already in view, else moved by whole pages when
 * `pageBy` is `"page"`, or just far enough when it's `"month"`.
 */
declare function monthToShow(date: ISODate, first: ISOMonth, count: number, pageBy: "month" | "page"): string;
/** A cell of a month grid: its date, and whether it belongs to the months around the grid's. */
type CalendarCell = {
    /** The cell's ISO date. */
    date: ISODate;
    /** Whether the date is in the month before or after the grid's. */
    outside: boolean;
    /**
     * Whether the cell shows nothing: a date outside the grid's month when
     * outside days are hidden, or one another visible month already shows.
     */
    hidden: boolean;
};
/**
 * The weeks of one visible month. Days of the months around it show only at
 * the outer edges of the visible months, since a date appears once on screen:
 * the first month's leading days and the last month's trailing ones.
 */
declare function gridWeeks(month: ISOMonth, options: {
    weekStartsOn: number;
    fixedWeeks: boolean;
    showOutsideDays: boolean;
    first: boolean;
    last: boolean;
}): {
    date: string;
    outside: boolean;
    hidden: boolean;
}[][];
/** The first and last dates a calendar shows. */
declare function visibleRange(first: ISOMonth, count: number): {
    start: string;
    end: string;
};
export { addMonthsTo, type CalendarCell, type CalendarMode, type CalendarValue, type DateMatcher, type DateMatchers, gridWeeks, isAllowedRange, isISOMonth, type ISOMonth, matchesDate, monthOf, monthToShow, moveDate, normalizeValue, pressRange, rangeTo, type RangeRules, selectedDates, visibleRange, };
