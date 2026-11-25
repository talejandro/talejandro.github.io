import { type NumberFormat } from "../../foundation/number/format.js";
type Range = readonly [number, number];
type Span = {
    start: number;
    duration: number;
    children?: readonly Span[];
};
/**
 * One tick of the axis: its time, the text it shows, and where it sits on the
 * axis, from 0 to 100.
 * @experimental
 */
type WaterfallTickData = {
    /** The moment it marks, in milliseconds. */
    time: number;
    /** The time as the waterfall's `format` and locale show it. */
    label: string;
    /** Where it sits between the range's start and end, from 0 to 100. Also `--waterfall-tick`. */
    position: number;
};
declare function spanRange(items: readonly Span[]): [number, number];
declare function percentAt(time: number, [start, end]: Range): number;
declare function spanPlacement(span: Span, range: Range): {
    start: number;
    size: number;
};
declare function tickTimes([start, end]: Range, max: number): number[];
declare function formatTime(time: number, locale: string, format?: NumberFormat, scale?: number, step?: number): string;
declare function waterfallTicks(range: Range, max: number, locale: string, format?: NumberFormat): WaterfallTickData[];
export { formatTime, percentAt, spanPlacement, spanRange, tickTimes, type WaterfallTickData, waterfallTicks, };
