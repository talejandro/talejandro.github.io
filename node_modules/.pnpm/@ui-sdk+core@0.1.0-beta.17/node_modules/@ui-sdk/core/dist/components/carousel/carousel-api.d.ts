import { type CarouselAlign, type CarouselSlidesPerPage } from "./carousel-layout.js";
import type { CarouselOptions, CarouselOrientation, CarouselPageOptions, CarouselPlayingOptions } from "./carousel.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
type State = {
    page: number;
    playing: boolean;
    orientation: CarouselOrientation;
    align: CarouselAlign;
    slidesPerPage: CarouselSlidesPerPage;
    loop: boolean;
    skipSnaps: boolean;
    dragFree: boolean;
    drag: boolean;
    interval: number;
    pageCount: number | null;
    snapping: boolean;
    indicators: string[];
    stop: string | null;
    pages: string[][];
    order: string[];
    inView: string[];
    focused: string | null;
    dragging: boolean;
    paused: boolean;
};
declare function snapType(state: Pick<State, "orientation" | "dragFree">, snapping: boolean): string;
/**
 * `carousel`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface CarouselApi extends ReturnType<typeof carouselApiBody> {
}
declare function carouselApiBody(context: PrimitiveContext<CarouselOptions, State, string>): {
    getPage: () => number;
    getPageCount: () => number | null;
    setPage: (page: number, { reason, event }?: CarouselPageOptions) => boolean;
    next: (options?: CarouselPageOptions) => boolean;
    canNext: () => boolean;
    canPrevious: () => boolean;
    getProgress: () => number;
    previous: (options?: CarouselPageOptions) => boolean;
    isPlaying: () => boolean;
    setPlaying: (playing: boolean, options?: CarouselPlayingOptions) => boolean;
    play: (options?: CarouselPlayingOptions) => boolean;
    pause: (options?: CarouselPlayingOptions) => boolean;
    internal: {
        bindRoot: (root: HTMLElement) => () => void;
        bindViewport: (viewport: HTMLElement) => () => void;
        onViewportKeyDown: (event: KeyboardEvent) => void;
        bindItem(el: HTMLElement, key: string): () => void;
        indicatorPage: (state: State, key: string, props: import("./carousel.js").CarouselIndicatorProps | undefined) => number;
        roving: {
            bind(el: HTMLElement, part: import("../../index.js").RovingFocusItem<import("./carousel.js").CarouselIndicatorProps | undefined>): () => void;
            tabIndex(state: State, part: import("../../index.js").RovingFocusItem<import("./carousel.js").CarouselIndicatorProps | undefined>): "0" | "-1";
            keydown(event: KeyboardEvent, el: HTMLElement): {
                key: string;
                from: string;
                shift: boolean;
            } | undefined;
            items: () => {
                key: string;
                props: import("./carousel.js").CarouselIndicatorProps | undefined;
                el: HTMLElement;
            }[];
            focus(itemKey?: string): void;
            remember(itemKey: string): void;
            check: () => void;
            stopFor: (preferred: (item: import("../../index.js").RovingFocusItem<import("./carousel.js").CarouselIndicatorProps | undefined>) => boolean) => string | undefined;
        };
        bindIndicator(el: HTMLElement, part: {
            key: string;
            props: import("./carousel.js").CarouselIndicatorProps;
        }): () => void;
        pressIndicator(el: HTMLElement | undefined, key: string, props: import("./carousel.js").CarouselIndicatorProps, event?: Event): void;
        onIndicatorKeyDown(event: KeyboardEvent): void;
        id: string;
        canStep: (by: 1 | -1) => boolean;
    };
};
declare const carouselApi: (...args: Parameters<typeof carouselApiBody>) => CarouselApi;
export { carouselApi, type CarouselApi, snapType, type State };
