/**
 * How `createAutoScroll` scrolls.
 * @experimental
 */
type AutoScrollOptions = {
    /** How far in from an edge scrolling starts, in pixels. @defaultValue 48 */
    edge?: number;
    /** The fastest it scrolls, in pixels per frame, with the pointer at the edge. @defaultValue 18 */
    speed?: number;
    /** Runs after each frame that scrolled, so a drag can find its target again under a pointer that didn't move. */
    onScroll?: () => void;
    /** The element being dragged, which sits under the pointer, so the scrollers under it are found instead of its own. */
    ignore?: () => Element | null | undefined;
};
/**
 * Scrolls the scrollers under a dragging pointer when it nears their edges,
 * the innermost first, then the window. Call `update` from every pointer move
 * and `stop` when the drag ends:
 *
 * ```ts
 * const scroll = createAutoScroll({ onScroll: () => findDropTarget(lastX, lastY) })
 * // onMove: scroll.update(x, y)
 * // onEnd: scroll.stop()
 * ```
 * @experimental
 */
declare function createAutoScroll(options?: AutoScrollOptions): {
    /** The pointer moved to `x`, `y` in viewport pixels. Starts scrolling if it's near an edge. */
    update(x: number, y: number): void;
    /** Stops scrolling, like when the drag ends. */
    stop(): void;
};
export { type AutoScrollOptions, createAutoScroll };
