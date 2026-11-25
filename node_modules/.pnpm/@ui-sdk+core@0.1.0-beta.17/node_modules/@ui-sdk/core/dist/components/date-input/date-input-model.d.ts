/**
 * What a segment holds. A `"literal"` is the text between segments, like a slash.
 * @stable
 */
type DateInputSegmentType = "year" | "month" | "day" | "hour" | "minute" | "second" | "dayPeriod" | "literal";
/**
 * The smallest unit an input shows. `"day"` shows a date alone, and a time unit adds the time down to it.
 * @stable
 */
type DateInputGranularity = "day" | "hour" | "minute" | "second";
/**
 * A 12 or 24 hour clock.
 * @stable
 */
type HourCycle = 12 | 24;
/**
 * One segment, as the root's state lists them in the order the locale shows them.
 * @stable
 */
type DateInputSegmentData = {
    /** Tells segments apart: the type, or `"literal-<n>"` for the text between them. */
    key: string;
    type: DateInputSegmentType;
    /** What it shows: the number, padded, or AM and PM in the locale. Empty while it holds nothing. */
    text: string;
    /** The number it holds, or `null` while empty. AM is 0 and PM is 1. */
    value: number | null;
    /** The smallest number it takes. */
    min: number;
    /** The largest number it takes, like the days in the month. */
    max: number;
    /** Whether it holds nothing yet. */
    empty: boolean;
    /** Whether it's a segment you type in, rather than the text between segments. */
    editable: boolean;
    /** Its name in the locale, like "month", which names it to assistive technology. */
    label: string;
};
type EditableType = Exclude<DateInputSegmentType, "literal">;
type Kind = "date" | "time";
type Fields = Record<EditableType, number | null>;
type LayoutItem = {
    type: DateInputSegmentType;
    text: string;
};
type Buffer = {
    type: EditableType;
    text: string;
} | null;
type Format = {
    kind: Kind;
    granularity: DateInputGranularity;
    hourCycle: HourCycle;
    locale: string;
};
declare const emptyFields: () => Fields;
declare function typesOf({ kind, granularity, hourCycle }: Omit<Format, "locale">): EditableType[];
declare function hourCycleOf(locale: string): HourCycle;
declare function layoutOf(format: Format): LayoutItem[];
declare function dayPeriodsOf(locale: string): [string, string];
declare function boundsOf(type: EditableType, fields: Fields, hourCycle: HourCycle): [number, number];
declare function clampDay(fields: Fields): Fields;
/**
 * The segments an input shows for its fields, in the locale's order. What's
 * being typed shows as typed, unpadded, until the segment is done.
 */
declare function segmentsOf(format: Format, fields: Fields, buffer: Buffer): ({
    key: string;
    type: "literal";
    text: string;
    value: null;
    min: number;
    max: number;
    empty: boolean;
    editable: boolean;
    label: string;
} | {
    key: "month" | "year" | "day" | "dayPeriod" | "hour" | "minute" | "second";
    type: "month" | "year" | "day" | "dayPeriod" | "hour" | "minute" | "second";
    text: string;
    value: number | null;
    min: number;
    max: number;
    empty: boolean;
    editable: boolean;
    label: string;
})[];
/**
 * A digit typed into a segment. It adds to what's being typed while the
 * number still fits, else starts over, and the segment is done once no other
 * digit could follow, like "4" for a month or "12" for an hour.
 */
declare function typeDigit(fields: Fields, buffer: Buffer, type: EditableType, digit: string, hourCycle: HourCycle): {
    fields: Fields;
    buffer: {
        type: EditableType;
        text: string;
    } | null;
    done: boolean;
};
/**
 * A letter typed into AM/PM: the period whose name starts with it, in the
 * locale or in English.
 */
declare function typePeriod(fields: Fields, letter: string, locale: string): {
    dayPeriod: number;
    month: number | null;
    year: number | null;
    day: number | null;
    hour: number | null;
    minute: number | null;
    second: number | null;
} | undefined;
/**
 * Steps a segment by `delta`, wrapping at its ends without touching the
 * others: a minute past 59 is 0, and the hour stays. An empty segment starts
 * at `start`.
 */
declare function stepField(fields: Fields, type: EditableType, delta: number, hourCycle: HourCycle, start: number): Fields;
/** Sets a segment to its smallest or largest number. */
declare function stepToEnd(fields: Fields, type: EditableType, end: "min" | "max", hourCycle: HourCycle): Fields;
/** The step Page Up and Page Down take in a segment. */
declare const pageStepOf: (type: EditableType) => number;
/** The value the fields make, or `null` while any segment shown is empty. */
declare function valueOf(fields: Fields, format: Omit<Format, "locale">): string | null;
/** The fields an ISO value fills, for the segments an input shows. */
declare function fieldsOf(value: string | null, format: Omit<Format, "locale">): Fields;
/**
 * A value in the input's own shape: a date and a time cut to its smallest
 * unit, or `null` when it isn't one it can show.
 */
declare function normalizeValue(value: unknown, format: Omit<Format, "locale">): string | null;
/**
 * How a value compares with a bound: -1 before it, 1 after it, 0 on it. A
 * bound with a date alone compares dates, so `max: "2026-12-31"` takes any
 * time that day.
 */
declare function compareTo(value: string, bound: string): 0 | 1 | -1;
/** The date part of a value, for matching unavailable dates. */
declare const dateOf: (value: string) => string | undefined;
export { boundsOf, clampDay, compareTo, dateOf, type DateInputGranularity, type DateInputSegmentData, type DateInputSegmentType, dayPeriodsOf, type EditableType, emptyFields, type Fields, fieldsOf, type Format, hourCycleOf, type HourCycle, type Kind, layoutOf, normalizeValue, pageStepOf, segmentsOf, stepField, stepToEnd, typeDigit, typePeriod, typesOf, valueOf, };
