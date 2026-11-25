/**
 * How positions map to values: evenly (`"linear"`), by ratio (`"log"`, for
 * volume, frequency or zoom, with a positive `min`), or through your own `to`
 * and `from`, which map values into an even space and back.
 * @experimental
 */
type NumberScale = "linear" | "log" | {
    to: (value: number) => number;
    from: (position: number) => number;
};
/**
 * Where a value sits between `min` and `max`, from 0 to 1, along a scale: how
 * far to fill a progress bar or place a slider's thumb. Values outside the
 * bounds sit at an end.
 * @experimental
 */
declare function fractionOf(value: number, range: {
    min: number;
    max: number;
}, scale?: NumberScale): number;
/**
 * The value at a fraction from 0 to 1 between `min` and `max`, along a scale,
 * like where a press on a track lands. Unsnapped; `scrubTo` puts it on the grid.
 * @experimental
 */
declare function valueAt(fraction: number, range: {
    min: number;
    max: number;
}, scale?: NumberScale): number;
export { fractionOf, type NumberScale, valueAt };
