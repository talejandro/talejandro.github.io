/**
 * How a scroll area shows its scrollbars.
 * @stable
 */
type ScrollAreaType = "auto" | "always" | "scroll" | "hover";
type Axis = "x" | "y";
/** One axis of the viewport: where it is and how far it can go. */
type AxisMetrics = {
    position: number;
    client: number;
    scroll: number;
};
declare const edgeTolerance = 1;
declare const minThumbSize = 16;
/**
 * The axis a scroll area's start and end refer to: the vertical one, or the
 * horizontal one when only that overflows, like a carousel.
 */
declare function mainAxis({ overflowX, overflowY, }: {
    overflowX: boolean;
    overflowY: boolean;
}): "x" | "y";
declare function maxScroll({ client, scroll }: AxisMetrics): number;
declare function overflows(metrics: AxisMetrics): boolean;
/** How far the content reaches past each edge, and how far along the scroll is, from 0 to 1. */
declare function edgesOf(metrics: AxisMetrics): {
    before: number;
    after: number;
    atStart: boolean;
    atEnd: boolean;
    progress: number;
};
/** The thumb's length and its offset from the start of the track, in pixels. */
declare function thumbGeometry(metrics: AxisMetrics, track: number): {
    size: number;
    offset: number;
};
/** The scroll position for a thumb dragged `delta` pixels along a track, from where the drag started. */
declare function draggedPosition(start: number, delta: number, metrics: AxisMetrics, track: number): number;
/** The scroll position that centers the thumb on a point of the track. */
declare function positionAt(point: number, metrics: AxisMetrics, track: number): number;
/**
 * Which way a press on the track pages: toward the start (-1), toward the end
 * (1), or not at all once the thumb is under the pointer (0). `point` is along
 * the track, from its start.
 */
declare function pageDirection(point: number, thumb: {
    size: number;
    offset: number;
}): 0 | 1 | -1;
/** One page, for a viewport this long. */
declare function pageLength(client: number): number;
/**
 * A wheel delta in pixels. Firefox reports mouse wheels in lines, and some
 * devices in pages, so a wheel forwarded from a scrollbar scrolls as far as
 * it would over the content.
 */
declare function wheelPixels(delta: number, mode: number, lineHeight: number, page: number): number;
/** Why a scrollbar wants to show: the inputs `scrollbarShown` weighs. */
type ScrollbarSignals = {
    overflow: boolean;
    hovering: boolean;
    scrolling: boolean;
    dragging: boolean;
};
/**
 * Whether a scrollbar should show now, before the hide delay. "always" shows
 * even without overflow, "auto" whenever there's overflow, "scroll" while
 * scrolling, and "hover" while the pointer is over the scroll area too.
 */
declare function scrollbarShown(type: ScrollAreaType, signals: ScrollbarSignals): boolean;
/**
 * Whether a scroll area sticking to the end still follows it after the
 * viewport scrolled by `delta` (positive toward the end). Moving away from the
 * end lets go, whatever moved it: the user, find in page, or the app. Reaching
 * the end while moving toward it follows again. Content growing or shrinking
 * scrolls nothing toward the start and changes nothing.
 */
declare function followsEnd(following: boolean, scroll: {
    delta: number;
    after: number;
}): boolean;
/** Whether a key pressed in the viewport asks to scroll toward the start, which lets go of the end. */
declare function scrollsTowardStart(key: string, shiftKey: boolean, editing: boolean): boolean;
export { type Axis, type AxisMetrics, draggedPosition, edgesOf, edgeTolerance, followsEnd, mainAxis, maxScroll, minThumbSize, overflows, pageDirection, pageLength, positionAt, type ScrollAreaType, scrollbarShown, type ScrollbarSignals, scrollsTowardStart, thumbGeometry, wheelPixels, };
