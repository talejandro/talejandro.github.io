import type { Store } from "../../foundation/kernel/store.js";
import { type Axis, type ScrollAreaType } from "./scroll-area-model.js";
type ScrollAreaModel = {
    type: ScrollAreaType;
    scrollHideDelay: number;
    stickToEnd: boolean;
    scrollbarsX: number;
    scrollbarsY: number;
    counted: boolean;
    overflowX: boolean;
    overflowY: boolean;
    atXStart: boolean;
    atXEnd: boolean;
    atYStart: boolean;
    atYEnd: boolean;
    scrollingX: boolean;
    scrollingY: boolean;
    hovering: boolean;
    visibleX: boolean;
    visibleY: boolean;
    dragging: Axis | null;
    sticking: boolean;
};
declare const liveKeys: (keyof ScrollAreaModel)[];
/**
 * How a programmatic scroll moves.
 * @stable
 */
type ScrollAreaScrollOptions = {
    /**
     * "smooth" eases there, following content that keeps growing. It's instant
     * when the user prefers reduced motion.
     * @defaultValue "smooth"
     */
    behavior?: "smooth" | "instant";
};
declare function createScrollView(store: Store<ScrollAreaModel>): {
    bindRoot: (el: HTMLElement) => () => void;
    bindViewport: (el: HTMLElement) => () => void;
    bindScrollbar: (el: HTMLElement, axis: Axis) => () => void;
    bindThumb: (el: HTMLElement, axis: Axis) => () => void;
    scrollToEdge: (edge: "start" | "end", { behavior }?: ScrollAreaScrollOptions) => void;
    isAt(edge: "start" | "end"): boolean | undefined;
    focusViewport(): void;
    refresh(): void;
};
export { createScrollView, liveKeys, type ScrollAreaModel, type ScrollAreaScrollOptions, };
