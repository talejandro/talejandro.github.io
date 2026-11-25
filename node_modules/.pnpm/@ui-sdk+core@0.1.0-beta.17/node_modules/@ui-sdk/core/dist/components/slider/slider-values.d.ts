import { type StepRange } from "../../foundation/number/steps.js";
type SliderRange = StepRange & {
    minStepsBetweenThumbs: number;
    largeStep: number;
};
declare function thumbBounds(values: readonly number[], index: number, range: SliderRange): {
    lower: number;
    upper: number;
};
/** Where a thumb may go between the values of the thumbs before and after it, if any. */
declare function boundsBetween(before: number | undefined, after: number | undefined, range: SliderRange): {
    lower: number;
    upper: number;
};
declare function moveThumb(values: readonly number[], index: number, target: number, range: SliderRange): readonly number[];
declare function normalizeValues(values: readonly number[], range: StepRange): number[];
/** What a key does to a thumb's value, or null for keys a slider ignores. Home and End go to the thumb's own bounds. */
declare function keyTarget(key: string, { shiftKey, rtl, orientation, }: {
    shiftKey?: boolean | undefined;
    rtl?: boolean | undefined;
    orientation?: "horizontal" | "vertical" | undefined;
} | undefined, value: number, bounds: {
    lower: number;
    upper: number;
}, range: SliderRange): number | null;
/**
 * The thumb a press moves. The nearest one, and among thumbs stacked on one
 * value, the one on the side the press is on: below them the lowest, above
 * them the highest. Pressed right on the stack, the first move decides, so
 * the index is null and the stack comes back.
 */
declare function thumbForPress(values: readonly number[], pressed: number): {
    index: number;
    stack: number[];
} | {
    index: null;
    stack: number[];
};
declare function stackAt(values: readonly number[], index: number): number[];
declare function thumbForDirection(stack: readonly number[], direction: number): number;
/** Where a value sits between the bounds, from 0 to 100, for positioning. */
declare function percentOf(value: number, range: StepRange): number;
/**
 * Where a point falls along a box, from 0 at its start to 1 at its end: left
 * to right, right to left, or bottom to top.
 */
declare function fractionAlong(point: {
    x: number;
    y: number;
}, box: {
    left: number;
    top: number;
    width: number;
    height: number;
}, { rtl, vertical }?: {
    rtl?: boolean | undefined;
    vertical?: boolean | undefined;
}): number;
/** The value at a fraction of the track, unsnapped, so presses pick thumbs by distance. */
declare function valueAt(fraction: number, range: StepRange): number;
export { boundsBetween, fractionAlong, keyTarget, moveThumb, normalizeValues, percentOf, type SliderRange, stackAt, thumbBounds, thumbForDirection, thumbForPress, valueAt, };
