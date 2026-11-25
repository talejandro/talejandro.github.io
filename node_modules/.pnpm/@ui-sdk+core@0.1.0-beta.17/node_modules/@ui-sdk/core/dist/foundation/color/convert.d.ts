/**
 * A color space a `Color` can hold its channels in. The names are CSS's:
 * `color(display-p3 …)`, `oklch(…)` and so on, plus `"hsv"`, which CSS has no
 * syntax for but pickers draw their square in.
 * @experimental
 */
type ColorSpace = "srgb" | "srgb-linear" | "display-p3" | "hsl" | "hsv" | "hwb" | "lab" | "lch" | "oklab" | "oklch" | "xyz-d65" | "xyz-d50";
/**
 * A color as plain data: its space, three channels and an alpha from 0 to 1.
 * Channels use CSS's ranges: 0 to 1 for `srgb`, `display-p3` and Oklab's
 * lightness, 0 to 100 for percentages, degrees for hues. A `null` channel is
 * missing, CSS's `none`, like the hue of a grey.
 * @experimental
 */
type Color = {
    /** The space the channels are in. */
    space: ColorSpace;
    /** The three channels, in the order CSS writes them. */
    coords: [number | null, number | null, number | null];
    /** How opaque the color is, from 0 to 1. */
    alpha: number;
};
/**
 * The same color in another space. A missing channel counts as 0, and a hue
 * that doesn't show, like a grey's, comes back missing.
 * @experimental
 */
declare function convertColor(color: Color, space: ColorSpace): Color;
export { convertColor, type Color, type ColorSpace };
