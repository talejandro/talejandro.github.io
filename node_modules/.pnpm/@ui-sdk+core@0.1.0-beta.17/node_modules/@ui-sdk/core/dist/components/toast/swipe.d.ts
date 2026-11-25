import type { DragSession } from "../../foundation/drag-and-drop/pointer.js";
/** A direction a swipe can dismiss toward. */
type SwipeDirection = "up" | "down" | "left" | "right";
declare function along(direction: SwipeDirection, x: number, y: number): number;
/**
 * Where a swiped element shows, from how far the pointer moved: freely toward
 * an allowed direction, and resisting on the rest of that axis.
 */
declare function swipeOffset(x: number, y: number, axis: "x" | "y", directions: SwipeDirection[]): {
    x: number;
    y: number;
};
/**
 * Which direction a released swipe dismisses toward, or null when it snaps
 * back. Far enough, or fast enough toward a direction, dismisses. Velocity is
 * in px per ms.
 */
declare function swipeOutcome({ x, y, velocityX, velocityY, directions, threshold, flick, }: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    directions: SwipeDirection[];
    threshold?: number;
    flick?: number;
}): SwipeDirection | null;
declare function swipeAxis(x: number, y: number, directions: SwipeDirection[]): "x" | "y" | null | undefined;
type SwipeCallbacks = {
    onStart: (axis: "x" | "y") => void;
    onMove: (offset: {
        x: number;
        y: number;
    }) => void;
    onEnd: (direction: SwipeDirection | null, event: PointerEvent) => void;
};
/**
 * Follows a press on `el` that may become a swipe toward `directions`, as the
 * session's one drag. The press stays a press until the pointer moves past a
 * few pixels along an axis with a direction, so clicks on buttons inside keep
 * working. Then the pointer is captured until it lifts.
 */
declare function trackSwipe(drags: DragSession, el: HTMLElement, down: PointerEvent, directions: SwipeDirection[], callbacks: SwipeCallbacks): void;
export { along, swipeAxis, type SwipeDirection, swipeOffset, swipeOutcome, trackSwipe, };
