import type { SheetPhysics } from "../../foundation/motion/physics.js";
/** Which way the carousel scrolls, as the viewport lays it out. */
type CarouselAxis = {
    vertical: boolean;
    rtl: boolean;
};
type CarouselMotionOptions = {
    viewport: HTMLElement;
    /** The element that holds the slides, which the rubber band stretches. */
    content: () => HTMLElement | undefined;
    axis: () => CarouselAxis;
    /** Each page's resting scroll position, ascending. */
    positions: () => readonly number[];
    /** The largest scroll position, as last measured. */
    maxScroll: () => number;
    /** The viewport's size along the axis, which the rubber band stretches against. */
    viewportSize: () => number;
    physics: () => SheetPhysics;
    /** Whether a mouse or pen can drag the slides. */
    canDrag: () => boolean;
    /** Whether a drag coasts to wherever it stops, instead of a page. */
    dragFree: () => boolean;
    reducedMotion: () => boolean;
    /** Snapping goes off while the carousel moves itself, and back on once it rests on a page. */
    setSnapping: (snapping: boolean) => void;
    /** A drag was released, and it's heading for this page index. */
    onRelease: (index: number, event: PointerEvent) => void;
    /** The user's own scroll came to rest. `touch` says whether a finger drove it. */
    onScrollRest: (position: number, cause: {
        touch: boolean;
        event?: Event;
    }) => void;
    onDragChange: (dragging: boolean) => void;
    /** A spring came to rest, from a drag's release or a programmatic move. */
    onSettle: () => void;
    /** The scroll position changed: a frame of a spring or a drag, or the user's scroll. */
    onScroll: () => void;
};
declare function createCarouselMotion(options: CarouselMotionOptions): {
    position: () => number;
    /** Whether the user holds or scrolls it: a finger, a drag, or a scroll that hasn't come to rest. */
    isHeld: () => boolean;
    /** Whether it's held, or a spring is moving it, so new layout shouldn't jump it. */
    isMoving: () => boolean;
    /** Moves to a page index: springs there from wherever it is, or jumps without `animate`. */
    moveTo(index: number, { animate }?: {
        animate?: boolean | undefined;
    }): void;
    /**
     * Moves the scroll position from `from` by `delta` after a looping track
     * rotated by as much, so the same slides stay in view, along with a
     * running spring. `from` is read before the rotation, since the browser
     * may snap the moved slides on its own. `remap` turns the old page
     * indexes into the new ones.
     */
    shift(from: number, delta: number, remap: (index: number) => number): void;
    destroy(): void;
};
type CarouselMotion = ReturnType<typeof createCarouselMotion>;
export { type CarouselAxis, type CarouselMotion, type CarouselMotionOptions, createCarouselMotion, };
