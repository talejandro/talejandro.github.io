import type { Color } from "./convert.js";
/**
 * Reads a CSS color: hex, a named color, `transparent`, or `rgb()`, `hsl()`,
 * `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()` and `color()` in the
 * `srgb`, `srgb-linear`, `display-p3` and `xyz` spaces. The color keeps the
 * space it was written in. Returns null for anything else.
 * @experimental
 */
declare function parseColor(text: string): Color | null;
export { parseColor };
