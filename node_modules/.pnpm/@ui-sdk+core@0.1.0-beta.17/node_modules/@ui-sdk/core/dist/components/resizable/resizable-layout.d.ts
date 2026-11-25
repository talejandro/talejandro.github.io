/**
 * A panel size: a percentage of the group as a number, like `30`, or a string
 * with a unit: `"30%"`, `"240px"` or `"16rem"`. Pixel sizes follow the group's
 * size as it changes.
 * @stable
 */
type ResizableSize = number | `${number}%` | `${number}px` | `${number}rem`;
/** What a panel allows, in percentages of the space panels share. */
type PanelConstraints = {
    min: number;
    max: number;
    collapsible: boolean;
    collapsed: number;
    initial: number | undefined;
};
/** The size props a panel passes, as written. */
type PanelSizes = {
    defaultSize?: ResizableSize;
    minSize?: ResizableSize;
    maxSize?: ResizableSize;
    collapsible?: boolean;
    collapsedSize?: ResizableSize;
};
declare const sameSize: (a: number, b: number) => boolean;
declare function sameLayout(a: readonly number[], b: readonly number[]): boolean;
declare const isAbsolute: (size: ResizableSize | undefined) => boolean;
/**
 * A size in percent of `space`, the pixels panels share. Pixel and rem sizes
 * can't be resolved before the group is measured, so they're undefined then.
 */
declare function toPercent(size: ResizableSize | undefined, space: number, remSize?: number): number | undefined;
/** A size as CSS, for the server's first paint: percentages unless it says otherwise. */
declare const toCSS: (size: ResizableSize) => string;
declare function constraintsOf(sizes: PanelSizes, space: number, remSize?: number): {
    min: number;
    max: number;
    collapsible: boolean;
    collapsed: number;
    initial: number | undefined;
};
declare const isCollapsed: (panel: PanelConstraints, size: number) => boolean;
/**
 * The size a panel takes when asked for `target`, coming from `current`.
 * Between collapsed and the minimum it snaps to one or the other: an open
 * panel collapses once the target falls below `threshold` of that span, and a
 * collapsed one opens once the target passes the same share from the other
 * end. Pointers use half the span. Keys use all of it, so one step past the
 * minimum collapses, and one step out of collapsed opens.
 */
declare function settle(panel: PanelConstraints, target: number, current: number, threshold?: number): number;
/**
 * The layout after moving handle `handle`, which sits between panels
 * `handle` and `handle + 1`, by `delta` percent. Positive moves it toward the
 * end. The panel on the side it moves away from grows; the other side shrinks
 * from the handle outward, so a panel at its minimum passes the rest on to the
 * next one, up to a handle `locked` marks, which keeps the panels past it as
 * they are. Returns the same array when nothing can move.
 */
declare function resizeAt(layout: readonly number[], panels: readonly PanelConstraints[], handle: number, delta: number, threshold?: number, locked?: readonly boolean[]): readonly number[];
/** How far a handle moves for Home: its panel down to its smallest, which may be collapsed. */
declare const homeDelta: (layout: readonly number[], panels: readonly PanelConstraints[], handle: number) => number;
/** How far a handle moves for End: its panel up to its largest. */
declare const endDelta: (layout: readonly number[], panels: readonly PanelConstraints[], handle: number) => number;
/** The range a handle's panel can take from here, for `aria-valuemin` and `aria-valuemax`. */
declare function handleBounds(layout: readonly number[], panels: readonly PanelConstraints[], handle: number, locked?: readonly boolean[]): {
    min: number;
    max: number;
};
/**
 * `handleBounds` for every handle, in one pass when no panel can collapse and
 * each is within its bounds. Then a handle's panel shrinks to its minimum or
 * to what the next panel can take, and grows to its maximum or to what the
 * panels after it can give, up to a locked handle.
 */
declare function allHandleBounds(layout: readonly number[], panels: readonly PanelConstraints[], locked?: readonly boolean[]): {
    min: number;
    max: number;
}[];
/**
 * A layout every panel allows that adds up to 100: scaled to 100 when it
 * doesn't, each size settled into its panel's bounds, and what that leaves
 * over or short shared out in order. Collapsed panels stay collapsed.
 */
declare function fitLayout(layout: readonly number[], panels: readonly PanelConstraints[]): number[];
/** Where panels start: their `defaultSize`, and what's left shared by the panels without one. */
declare function initialLayout(panels: readonly PanelConstraints[]): number[];
/**
 * The layout after panels came or went: panels that stay keep their sizes
 * relative to each other, new panels start at their `defaultSize` or an even
 * share, and the result fits.
 */
declare function carryLayout(previous: {
    ids: readonly string[];
    layout: readonly number[];
}, ids: readonly string[], panels: readonly PanelConstraints[]): number[];
/**
 * The layout with one panel at `target`, through the handle after it, or the
 * one before it when that gets closer, like for the last panel.
 */
declare function resizePanel(layout: readonly number[], panels: readonly PanelConstraints[], index: number, target: number, threshold?: number, locked?: readonly boolean[]): readonly number[];
/**
 * Which panel Enter and a double-click on a handle collapse or expand: the
 * panel before it, as the APG's primary pane, or the one after when only that
 * one is collapsible.
 */
declare function toggleTarget(panels: readonly PanelConstraints[], handle: number): number | null;
/**
 * Where a handle's arrow keys move it, in percent: one step, or the large
 * step with Shift, along the group's axis. In right-to-left layouts the start
 * of a horizontal group is on the right, so the arrows swap.
 */
declare function keyDelta(key: string, { vertical, rtl, step, largeStep, shiftKey, }: {
    vertical: boolean;
    rtl: boolean;
    step: number;
    largeStep: number;
    shiftKey: boolean;
}): number | null;
export { allHandleBounds, carryLayout, constraintsOf, endDelta, fitLayout, handleBounds, homeDelta, initialLayout, isAbsolute, isCollapsed, keyDelta, type PanelConstraints, type PanelSizes, type ResizableSize, resizeAt, resizePanel, sameLayout, sameSize, settle, toCSS, toggleTarget, toPercent, };
