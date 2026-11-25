/**
 * Keeps a value between `min` and `max`.
 * @experimental
 */
declare function clamp(value: number, min: number, max: number): number;
/**
 * How many decimals a number has, counting exponents like 1e-7.
 * @experimental
 */
declare function decimalsOf(value: number): number;
/**
 * Rounds to a number of decimals, which also drops floating point noise like 0.1 + 0.2.
 * @experimental
 */
declare function roundTo(value: number, decimals: number): number;
/**
 * The bounds and step every numeric control shares. The step grid starts at
 * `min` when it's finite, and at 0 otherwise.
 * @experimental
 */
type StepRange = {
    min: number;
    max: number;
    step: number;
};
/**
 * The highest value on the step grid, which is `max` only when the grid lands
 * on it, like 9 for `{ min: 1, max: 10, step: 2 }`.
 * @experimental
 */
declare function maxOnGrid(range: StepRange): number;
declare function onGrid(value: number, range: StepRange, round?: (steps: number) => number): number;
declare function snapToStep(value: number, range: StepRange): number;
/**
 * The value `steps` steps away on the grid, within the bounds; negative steps
 * go down. A value off the grid moves to the grid first, so 1.5 steps up to 2,
 * like `stepUp()`.
 * @experimental
 */
declare function stepValue(value: number, steps: number, range: StepRange): number;
/**
 * Wraps a value into the loop from `min` up to `max`, like an angle into 0 to
 * 360 or an index around a carousel: `wrap(370, 0, 360)` is 10.
 * @experimental
 */
declare function wrap(value: number, min: number, max: number): number;
/**
 * What a key or a gesture asks of a number: steps in a direction, by the step,
 * the large step or the small one, or a bound. `stepFromKey` reads one from a key.
 * @experimental
 */
type NumberMove = {
    direction: 1 | -1;
    size: "step" | "large" | "small";
} | {
    bound: "min" | "max";
};
/**
 * Values a scrub lands on when it comes close, like a timeline's chapters or keyframes.
 * @experimental
 */
type NumberSnap = {
    /** The values to land on. */
    points: readonly number[];
    /** How close a value comes before it lands on a point, in the range's units. */
    threshold: number;
};
/**
 * A step range with the larger and smaller steps a move can ask for, and the points it snaps to.
 * @experimental
 */
type NumberRange = StepRange & {
    /** What Shift and Page Up and Down move by. @defaultValue ten steps */
    largeStep?: number;
    /** What Alt moves by, on a grid of its own. @defaultValue the step */
    smallStep?: number;
    /** Points `scrubTo` and `stepBy` land on when they come close. */
    snap?: NumberSnap;
};
declare function stepOnGrid(value: number, move: {
    direction: 1 | -1;
    size: "step" | "large" | "small";
}, range: NumberRange): number;
/**
 * The value a move lands on: a step on the grid, a large step snapped back to
 * it, a small step on its own grid, or a bound, where `max` is the highest
 * value on the grid. With `range.snap`, a step stops at the first point it
 * reaches ahead, and leaves the point it's on freely; `{ snap: false }` steps past them.
 * @experimental
 */
declare function stepBy(value: number, move: NumberMove, range: NumberRange, { snap }?: {
    snap?: boolean | undefined;
}): number;
/**
 * Where a scrub is: its `value`, and the snap `point` it's pulled to, or
 * undefined when it's on its own, so a release can commit `point ?? value`.
 * @experimental
 */
type NumberScrub = {
    value: number;
    point: number | undefined;
};
/**
 * Where a value lands in a range: on the nearest of `range.snap`'s points
 * within its threshold, or else on the step grid within the bounds.
 * `{ snap: false }` ignores the points, like for typed numbers or while Cmd is
 * held, and keeps the grid; a range with a step of 0 keeps values exactly.
 *
 * With `ease`, a value near a point moves toward it instead of jumping there:
 * not at all at the threshold, faster as it closes in, and onto the point at
 * the end. `true` pulls in proportion to closeness, from 0 at the threshold to
 * 1 on the point; pass a curve over closeness to change it.
 * @experimental
 */
declare function scrubTo(value: number, range: NumberRange, { snap, ease, }?: {
    snap?: boolean;
    ease?: boolean | ((closeness: number) => number);
}): {
    value: number;
    point: undefined;
} | {
    value: number;
    point: number;
};
export { clamp, decimalsOf, maxOnGrid, type NumberMove, type NumberRange, type NumberScrub, type NumberSnap, onGrid, roundTo, scrubTo, snapToStep, type StepRange, stepBy, stepOnGrid, stepValue, wrap, };
