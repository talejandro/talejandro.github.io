/**
 * Where the pointer is, and how far it moved since the last report. The same object every report, so read it, don't keep it.
 * @stable
 */
type PointerSample = {
    x: number;
    y: number;
    movementX: number;
    movementY: number;
    locked: boolean;
    event: PointerEvent;
};
/**
 * What `bindDrag` reports, and when.
 * @stable
 */
type BindDragOptions = {
    /** At most once per frame, with the latest position and the movement since the last call. */
    onMove: (sample: PointerSample) => void;
    /**
     * The pointer lifted, or the browser took it over, like for a scroll. A move
     * still pending runs first, so the last position is never lost.
     */
    onEnd: (event: PointerEvent, canceled: boolean) => void;
    /**
     * How far, in CSS pixels, the pointer moves along either axis before moves
     * are reported, so a press that barely moves stays a click. Defaults to 0.
     */
    threshold?: number;
    /**
     * Runs once, on the first move past `threshold`, before its `onMove`.
     * Return `false` to stop following the pointer, like when a drag can't start.
     */
    onStart?: (event: PointerEvent) => boolean | void;
    /**
     * Locks the pointer once it has moved past `dragThreshold`, so it can travel
     * without limit, like a scrub, while a plain click never hides the cursor.
     * Falls back to capture where the browser refuses, as Safari does.
     */
    lock?: boolean;
    /**
     * Ends the gesture as canceled when Escape is pressed once it has started,
     * and keeps that press from reaching anything else, like a popup around it.
     * `onEnd` gets the last pointer event. Defaults to `false`.
     */
    cancelOnEscape?: boolean;
};
/**
 * Follows the pointer that pressed `el` until it lifts, for a drag of your
 * own: a slider, a splitter, an item dragged to a new place. Uses pointer
 * capture, and listens on the document too, so the gesture keeps going
 * outside the element, outside the window, and when the element moves in the
 * document. With a `threshold`, the capture waits until the pointer passes
 * it. Moves arrive at most once per frame. A release after the pointer
 * moved past `dragThreshold` swallows the click it sends, so a drag never
 * presses what it ends on, like a link. Returns a cleanup that ends it
 * without calling `onEnd`; call it when the component is destroyed.
 *
 * ```ts
 * on: {
 *   pointerdown: (event, { el }) =>
 *     bindDrag(el!, event, {
 *       threshold: dragThreshold,
 *       onMove: ({ x, y }) => moveTo(x, y),
 *       onEnd: (_event, canceled) => (canceled ? putBack() : commit()),
 *     }),
 * }
 * ```
 * @stable
 */
declare function bindDrag(el: HTMLElement, down: PointerEvent, options: BindDragOptions): () => void;
declare const isDragPress: (event: Event) => boolean;
declare function createDragSession(onDestroy?: (cleanup: () => void) => void): {
    /**
     * Whether a press can start a drag now. Check it first, before the
     * component's own guards: ending a stale drag can change what they read.
     */
    accepts(event: PointerEvent): boolean;
    /** Follows the press, like `bindDrag`, as this component's one drag. */
    start(el: HTMLElement, down: PointerEvent, options: BindDragOptions): void;
    /**
     * Waits for the press to move until `pick` decides: `undefined` to keep
     * waiting, `false` to let it go, like a scroll, or `true` to follow it from
     * that move, like `start`. The pointer isn't captured while it waits, so
     * a press that lifts first stays a click, and `onTap` hears it.
     */
    startOnMove(el: HTMLElement, down: PointerEvent, { pick, onTap, ...options }: BindDragOptions & {
        pick: (move: PointerEvent) => boolean | undefined;
        onTap?: (up: PointerEvent) => void;
    }): void;
    /** Ends the running drag, if any, as canceled. */
    cancel: () => void | undefined;
};
type DragSession = ReturnType<typeof createDragSession>;
/**
 * How far a press moves, in CSS pixels, before it counts as a drag rather than a click.
 * @stable
 */
declare const dragThreshold = 3;
/** Whether a movement from where the press started is a drag. */
declare function isDrag(dx: number, dy: number): boolean;
declare function swallowNextClick(doc: Document, untilRelease?: boolean, pointerId?: number): number | undefined;
/**
 * Runs `step` now, then again every `interval` ms after `delay` ms, until the
 * returned function stops it or `step` returns false, like at a bound.
 */
declare function repeatWhileHeld(step: () => boolean, { delay, interval }?: {
    delay?: number | undefined;
    interval?: number | undefined;
}): () => void;
export { bindDrag, createDragSession, dragThreshold, isDrag, isDragPress, type PointerSample, repeatWhileHeld, swallowNextClick, type BindDragOptions, type DragSession, };
