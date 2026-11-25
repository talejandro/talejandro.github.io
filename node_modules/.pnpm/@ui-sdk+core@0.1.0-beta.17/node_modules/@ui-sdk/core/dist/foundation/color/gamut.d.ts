import { type Color } from "./convert.js";
/**
 * A range of colors a screen can show: `"srgb"`, which every screen shows, or
 * `"p3"`, the wider range of most phones and laptops.
 * @experimental
 */
type ColorGamut = "srgb" | "p3";
/**
 * Whether a screen with this gamut can show the color.
 * @experimental
 */
declare function isInGamut(color: Color, gamut?: ColorGamut): boolean;
/**
 * The closest color the gamut holds, in the color's own space. It keeps the
 * lightness and hue and lowers the chroma in OKLCH until the color fits, the
 * way CSS Color 4 maps colors (binary search with local MINDE).
 * @experimental
 */
declare function toGamut(color: Color, gamut?: ColorGamut): Color;
export { isInGamut, toGamut, type ColorGamut };
