import type { ContentScroll } from "./content-scroll.js";
import type { SheetPhysics } from "./physics.js";
type SheetConfig = {
    /** Resting extents, ascending, in px. 0 (dismissed) is implied. */
    snapPoints: readonly {
        id: string;
        extent: number;
    }[];
    /** The rubber band's dimension: the container's size on the axis, in px. */
    dimension: number;
    /** Whether a swipe can close the sheet. */
    dismissible: boolean;
    /** Whether dragging up on scrollable content first expands the sheet. */
    expandOnScroll: boolean;
    physics: SheetPhysics;
    /** The hand-off to scroll areas under the finger, for sheets with scrollable content. */
    contentScroll?: ContentScroll;
};
/** What the scroll area under the finger can do, or null when there is none. */
type ScrollContext = {
    atStart: boolean;
    atEnd: boolean;
} | null;
/** Why a sheet moved to a snap point: a swipe, new geometry, or a call from code. */
type SheetSnapReason = "swipe" | "content-resize" | "imperative";
type SheetEvent = {
    type: "down";
    time: number;
    x: number;
    y: number;
    pointer: "touch" | "mouse" | "pen";
} | {
    type: "move";
    time: number;
    x: number;
    y: number;
    scroll: ScrollContext;
}
/** `velocity` is the finger's, along y, in px/ms. */
 | {
    type: "up";
    time: number;
    velocity: number;
} | {
    type: "settled";
}
/** The scroll-snap driver's browser scroll came to rest. */
 | {
    type: "rest";
    extent: number;
}
/** Settle on a snap point, like a handle press, a controller or new geometry. `reason` comes back on the snap effect. */
 | {
    type: "snap-to";
    time: number;
    id: string;
    reason: SheetSnapReason;
} | {
    type: "close";
    time: number;
}
/** A refused dismissal, like Escape on a sheet that can't be dismissed: a small push toward closing that springs back. */
 | {
    type: "nudge";
    time: number;
};
type SheetEffect = 
/** Cancel any animation and show this extent. */
{
    type: "move";
    extent: number;
} | {
    type: "settle";
    from: number;
    to: number;
    velocity: number;
    response: number;
    dampingRatio: number;
}
/** Scroll the content forward by `delta` px (negative scrolls back). */
 | {
    type: "scroll";
    delta: number;
}
/** Let the content coast at `velocity` px/ms, forward when positive. */
 | {
    type: "fling-scroll";
    velocity: number;
} | {
    type: "snap";
    id: string;
    reason: SheetSnapReason;
} | {
    type: "dismiss";
    reason: "swipe" | "imperative";
} | {
    type: "attempt-dismiss";
    reason: "swipe";
};
type SheetState = {
    phase: "idle";
    extent: number;
    restingIndex: number;
} | {
    phase: "pending";
    extent: number;
    restingIndex: number;
    originX: number;
    originY: number;
    slop: number;
} | {
    phase: "dragging";
    extent: number;
    restingIndex: number;
    /** The finger's y when `anchorExtent` was shown 1:1. */
    anchorY: number;
    /** The unconstrained extent at `anchorY`, before the rubber band. */
    anchorExtent: number;
    lastY: number;
    /** The finger currently scrolls the content instead of moving the sheet. */
    isScrollingContent: boolean;
} | {
    phase: "scrolling";
    extent: number;
    restingIndex: number;
    lastY: number;
} | {
    phase: "settling";
    extent: number;
    restingIndex: number;
    /** The snap point it settles on, -1 for dismissal. */
    targetIndex: number;
    from: number;
    to: number;
    velocity: number;
    response: number;
    dampingRatio: number;
    startTime: number;
};
declare function initialState(extent: number, restingIndex: number): {
    phase: "idle";
    extent: number;
    restingIndex: number;
};
declare function next(state: SheetState, event: SheetEvent, config: SheetConfig): {
    state: SheetState;
    effects: SheetEffect[];
};
declare function currentMotion(state: SheetState, time: number): {
    extent: number;
    velocity: number;
};
declare function startDragging(state: {
    extent: number;
    restingIndex: number;
}, y: number): {
    phase: "dragging";
    extent: number;
    restingIndex: number;
    anchorY: number;
    anchorExtent: number;
    lastY: number;
    isScrollingContent: boolean;
};
declare function largestExtent(config: SheetConfig): number;
declare function snapExtents(config: SheetConfig): number[];
export { currentMotion, initialState, largestExtent, next, type SheetConfig, type SheetEffect, type SheetEvent, type SheetSnapReason, type SheetState, snapExtents, startDragging, };
