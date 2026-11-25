/**
 * A place the sheet can rest, measured from the edge it comes from. A number
 * up to 1 is a fraction of the screen along the sheet's axis, and a larger one
 * is pixels. `"…px"`, `"…rem"` and `"…%"` (of the screen) work too.
 * `"content"` is the sheet's own size. None can be larger than the sheet.
 * @stable
 */
type SnapPoint = number | `${number}px` | `${number}rem` | `${number}%` | "content";
/** A snap point resolved to an extent. Points within 1px of each other share one entry. */
type ResolvedSnapPoint = {
    /** The id the machine and attributes use: the snap point as a string. */
    id: string;
    /** The snap point as written, which callbacks report. */
    value: SnapPoint;
    /** px from the attached edge. */
    extent: number;
    /** Every snap point merged into this one, as ids. */
    ids: string[];
};
/**
 * Resolves snap points to ascending extents. `container` is the space along
 * the axis (the screen, less the keyboard) and `content` is the sheet's own
 * size, which caps every point. Points within 1px of each other merge, and
 * the one written later names the entry, so `"content"` equal to `1` on a
 * short screen doesn't leave a dead snap point.
 */
declare function resolveSnapPoints(points: readonly SnapPoint[], context: {
    container: number;
    content: number;
    rootFontSize: number;
}): {
    /** The id the machine and attributes use: the snap point as a string. */
    id: string;
    /** The snap point as written, which callbacks report. */
    value: SnapPoint;
    /** px from the attached edge. */
    extent: number;
    /** Every snap point merged into this one, as ids. */
    ids: string[];
}[];
/** The index of the resolved entry a snap point merged into, or -1. */
declare function findSnapIndex(resolved: readonly ResolvedSnapPoint[], point: SnapPoint | string | null | undefined): number;
/** Whether `point` is at or below `limit`, like a sheet resting where the page stays usable. */
declare function isAtOrBelow(resolved: readonly ResolvedSnapPoint[], point: SnapPoint | string | null | undefined, limit: SnapPoint | string | null | undefined): boolean;
export { findSnapIndex, isAtOrBelow, type ResolvedSnapPoint, resolveSnapPoints, type SnapPoint, };
