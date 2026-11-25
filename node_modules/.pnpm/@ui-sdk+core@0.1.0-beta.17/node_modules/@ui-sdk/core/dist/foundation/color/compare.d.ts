import { type Color } from "./convert.js";
/**
 * How different two colors look, as ΔEOK: the distance between them in
 * Oklab. About 0.02 is the smallest difference most people notice. Alpha
 * doesn't count.
 * @experimental
 */
declare function colorDistance(first: Color, second: Color): number;
/**
 * The WCAG 2 contrast ratio between two colors, from 1 to 21, whichever is
 * lighter. Text needs 4.5 against its background, or 3 when it's large.
 * Alpha doesn't count, so blend a translucent color over its background first.
 * @experimental
 */
declare function contrastRatio(first: Color, second: Color): number;
export { colorDistance, contrastRatio };
