import type { CarouselPage } from "./carousel-layout.js";
import type { CarouselAxis } from "./carousel-motion.js";
type Slide = {
    el: HTMLElement;
    key: string;
};
/** Reads each slide's place along the axis, and the viewport's size, range and scroll padding. */
declare function readCarouselLayout(viewport: HTMLElement, slides: readonly Slide[], axis: CarouselAxis): {
    slides: {
        key: string;
        box: {
            start: number;
            size: number;
        };
    }[];
    viewportSize: number;
    maxScroll: number;
    paddingStart: number;
    paddingEnd: number;
};
/**
 * Lays the slides out from slide `first` with CSS `order`, the rest after it
 * in their own order, so a looping track rotates without moving any element
 * in the document. Focus, Tab and screen readers keep the slides' own order.
 */
declare function writeSlideOrder(slides: readonly Slide[], first: number): void;
declare function clearSlideOrder(slides: readonly Slide[]): void;
/**
 * Groups snap at their first slide, with a scroll margin that lines the
 * group up, so the browser's snap points are the pages. With one slide to a
 * page, every slide snaps by `align`, written on the server, so this is skipped.
 */
declare function writeSnapAreas(slides: readonly Slide[], pages: readonly CarouselPage[], vertical: boolean): void;
declare function clearSnapAreas(slides: readonly Slide[], align: string): void;
/**
 * Labels a slide "1 of 5" unless the author named it, again whenever the
 * slides change. A label written by an earlier bind, like StrictMode's, is
 * still ours.
 */
declare function labelSlide(el: HTMLElement, key: string, store: {
    get: () => {
        order: string[];
    };
    subscribe: (listener: () => void) => () => void;
}): () => void;
export { clearSlideOrder, clearSnapAreas, labelSlide, readCarouselLayout, writeSlideOrder, writeSnapAreas, };
