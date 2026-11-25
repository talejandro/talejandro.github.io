import type { CarouselIndicatorProps, CarouselPageChangeReason } from "./carousel.js";
import type { State } from "./carousel-api.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
declare function carouselIndicators(context: PrimitiveContext<object, State, string>, go: (page: number, reason: CarouselPageChangeReason, event?: Event) => boolean): {
    indicatorPage: (state: State, key: string, props: CarouselIndicatorProps | undefined) => number;
    roving: {
        bind(el: HTMLElement, part: import("../../index.js").RovingFocusItem<CarouselIndicatorProps | undefined>): () => void;
        tabIndex(state: State, part: import("../../index.js").RovingFocusItem<CarouselIndicatorProps | undefined>): "0" | "-1";
        keydown(event: KeyboardEvent, el: HTMLElement): {
            key: string;
            from: string;
            shift: boolean;
        } | undefined;
        items: () => {
            key: string;
            props: CarouselIndicatorProps | undefined;
            el: HTMLElement;
        }[];
        focus(itemKey?: string): void;
        remember(itemKey: string): void;
        check: () => void;
        stopFor: (preferred: (item: import("../../index.js").RovingFocusItem<CarouselIndicatorProps | undefined>) => boolean) => string | undefined;
    };
    bindIndicator(el: HTMLElement, part: {
        key: string;
        props: CarouselIndicatorProps;
    }): () => void;
    pressIndicator(el: HTMLElement | undefined, key: string, props: CarouselIndicatorProps, event?: Event): void;
    onIndicatorKeyDown(event: KeyboardEvent): void;
};
export { carouselIndicators };
