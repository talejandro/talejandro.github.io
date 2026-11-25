import { type Axis, type AxisMetrics } from "./scroll-area-model.js";
/** What the scrollbars need from the engine. */
type ScrollbarHost = {
    viewport: () => HTMLElement | undefined;
    metrics: Record<Axis, AxisMetrics>;
    track: Record<Axis, number>;
    rtl: () => boolean;
    measure: () => void;
    readDirection: () => void;
    scrollTo: (axis: Axis, position: number, behavior?: ScrollBehavior) => void;
    release: () => void;
    stopEasing: () => void;
    setDragging: (axis: Axis | null) => void;
};
declare function createScrollbarInput(host: ScrollbarHost): {
    forwardWheel: (event: WheelEvent) => void;
    bindThumb: (el: HTMLElement, axis: Axis) => () => void;
    pressTrack: (event: PointerEvent, el: HTMLElement, axis: Axis) => void;
    endPress: (el: HTMLElement) => void;
};
export { createScrollbarInput, type ScrollbarHost };
