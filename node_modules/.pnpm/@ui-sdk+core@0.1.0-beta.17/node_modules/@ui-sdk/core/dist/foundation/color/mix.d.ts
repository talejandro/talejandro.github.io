import { type Color, type ColorSpace } from "./convert.js";
/**
 * Which way a mix goes around the hue wheel, as in CSS `color-mix()`:
 * `"shorter"`, `"longer"`, `"increasing"` or `"decreasing"`.
 * @experimental
 */
type ColorHueInterpolation = "shorter" | "longer" | "increasing" | "decreasing";
/**
 * Options for `mixColor`.
 * @experimental
 */
type ColorMixOptions = {
    /**
     * The space the colors mix in, which the result is in too.
     * @defaultValue "oklab"
     */
    space?: ColorSpace;
    /**
     * Which way the hue goes, in a space with one.
     * @defaultValue "shorter"
     */
    hue?: ColorHueInterpolation;
};
/**
 * Mixes two colors like CSS `color-mix()`: `amount` of the second, from 0 to
 * 1, in Oklab by default. Channels mix premultiplied by alpha, and a channel
 * missing from one color takes the other's.
 * @experimental
 */
declare function mixColor(first: Color, second: Color, amount?: number, options?: ColorMixOptions): Color;
export { mixColor, type ColorHueInterpolation, type ColorMixOptions };
