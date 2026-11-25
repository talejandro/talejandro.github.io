import { type Color, type ColorSpace } from "./convert.js";
/**
 * What `formatColor` writes: `"hex"`, or a space in its CSS syntax. `"srgb"`
 * writes `rgb()`, and the spaces without a function of their own write `color()`.
 * @experimental
 */
type ColorFormat = Exclude<ColorSpace, "hsv"> | "hex";
/**
 * Options for `formatColor`.
 * @experimental
 */
type ColorFormatOptions = {
    /**
     * Significant digits per channel, counted against the channel's range: 5
     * writes `rgb(212.41 0 52.94)` and `oklch(0.6276 0.2577 29.23)`.
     * @defaultValue 5
     */
    precision?: number;
};
/**
 * Writes a color as CSS: in `format`, or in its own space by default (HSV
 * writes `hsl()`). `hex`, `rgb()`, `hsl()` and `hwb()` hold only sRGB colors,
 * so a wider color is clipped to fit: map it with `toGamut` first to keep its
 * lightness and hue. A missing channel writes `none`.
 * @experimental
 */
declare function formatColor(color: Color, format?: ColorFormat, options?: ColorFormatOptions): string;
export { formatColor, type ColorFormat, type ColorFormatOptions };
