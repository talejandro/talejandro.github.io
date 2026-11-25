import { focusOpening, hoverOpening, warmGroup } from "./popup-features.js";
import { createPopupPayload } from "./popup-payload.js";
/**
 * A tooltip: it describes its trigger, opens when the pointer rests on it
 * and at once on keyboard focus, never takes focus, and only one is open at a
 * time, the next opening at once while one is warm. For `createPopup`.
 * @experimental
 */
declare const tooltipPreset: {
    payload: typeof createPopupPayload;
    behavior: "tooltip";
    role: "tooltip";
    side: "top";
    delay: number;
    closeDelay: number;
    focusDelay: number;
    placement: {
        position: typeof import("../../index.js").position;
        prepare: () => void;
        anchor: typeof import("./popup-features.js").contentAnchor;
        options: typeof import("./popup-features.js").placementOptions;
    };
    hover: typeof hoverOpening;
    focus: typeof focusOpening;
    group: typeof warmGroup;
    resetStyles: {
        prepare(name: string, contentSlot: string): void;
        bind(el: HTMLElement): void;
    };
};
/**
 * A preview of what a link points to: it opens when the pointer or keyboard
 * focus rests on the link, Tab moves from the link into it, and focus leaving
 * closes it. For `createPopup`.
 * @experimental
 */
declare const hoverCardPreset: {
    payload: typeof createPopupPayload;
    behavior: "hoverCard";
    delay: number;
    closeDelay: number;
    placement: {
        position: typeof import("../../index.js").position;
        prepare: () => void;
        anchor: typeof import("./popup-features.js").contentAnchor;
        options: typeof import("./popup-features.js").placementOptions;
    };
    hover: typeof hoverOpening;
    focus: typeof focusOpening;
    resetStyles: {
        prepare(name: string, contentSlot: string): void;
        bind(el: HTMLElement): void;
    };
};
export { hoverCardPreset, tooltipPreset };
