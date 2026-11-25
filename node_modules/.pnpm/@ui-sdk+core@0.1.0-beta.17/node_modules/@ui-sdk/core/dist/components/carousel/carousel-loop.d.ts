import { type CarouselLoopView, type CarouselPage, type CarouselSlideBox } from "./carousel-layout.js";
import type { CarouselMotion } from "./carousel-motion.js";
type Slide = {
    el: HTMLElement;
    key: string;
};
declare function createCarouselLoop(options: {
    slides: () => Slide[];
    /** The viewport's motion, while it's bound. */
    motion: () => CarouselMotion | undefined;
    /** The pages, and their indexes in the order they rest, as last laid out. */
    pages: () => readonly CarouselPage[];
    visual: () => readonly number[];
    /** Measures again, after a rotation wrote the slides' order. */
    measure: () => void;
}): {
    /** Whether the carousel loops seamlessly now. */
    isActive: () => boolean;
    /** Whether a rotation is measuring, which keeps the scroll position for it. */
    isRotating: () => boolean;
    /**
     * Writes the slides' order for the current rotation before a measure, and
     * returns the slide shown first, or undefined when it doesn't loop.
     */
    prepare(slides: Slide[], loops: boolean): number | undefined;
    /**
     * A looping carousel's pages from measured slides, with `first` shown
     * first, or null when it can't loop seamlessly and rewinds instead.
     */
    layout(boxes: readonly CarouselSlideBox[], next: CarouselLoopView, first: number | undefined): {
        slides: number[];
        position: number;
        leader: number;
        margin: number;
    }[] | null;
    /** Clears the rotation, when the viewport goes. */
    reset(slides: Slide[]): void;
    /**
     * Rotates, if it must, so the page at `index` lies ahead the way the
     * carousel heads: `heading`, the step's way, or else the short way round.
     */
    rotateToward(index: number, heading?: 1 | -1): void;
    /** Rotates at rest, so the current page sits mid-track. */
    recenter(): void;
};
export { createCarouselLoop };
