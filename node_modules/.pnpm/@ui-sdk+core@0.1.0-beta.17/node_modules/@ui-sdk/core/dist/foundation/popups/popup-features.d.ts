import { position, type Anchor, type PositionProps } from "../platform/position.js";
import { type Side } from "../platform/sides.js";
import type { PopupCore, PopupState } from "./create-popup.js";
import type { PopupContentProps, PopupTriggerProps } from "./popup-slots.js";
declare function contentAnchor(el: HTMLElement, setting: Anchor | string | null | undefined, fallback: () => Anchor | null | undefined): {
    getBoundingClientRect: () => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
} | {
    x: number;
    y: number;
} | null | undefined;
declare function placementOptions(props: PositionProps, defaults: {
    side?: Side;
    align: NonNullable<PositionProps["align"]>;
    sideOffset?: number;
    alignOffset?: number;
}, arrow?: HTMLElement): {
    side: Side;
    align: "center" | "end" | "start";
    sideOffset: number;
    alignOffset: number;
    collisionPadding: number | undefined;
    arrow: HTMLElement | undefined;
    arrowPadding: number | undefined;
};
declare const placement: {
    position: typeof position;
    prepare: () => void;
    anchor: typeof contentAnchor;
    options: typeof placementOptions;
};
declare function pressOpening(core: PopupCore): {
    press: (key: string, props: PopupTriggerProps, event?: Event) => void | Promise<import("./popup.js").PopupResult<string, string>>;
    keydown(event: KeyboardEvent, el: HTMLElement, key: string, props: PopupTriggerProps): boolean;
    contains: (target: Node, event?: Event) => boolean;
    initialFocus(content: HTMLElement, setting?: PopupContentProps["initialFocus"], preferred?: () => HTMLElement | undefined): HTMLElement | undefined;
    contentAttrs: (state: PopupState, id: string, role: string | undefined) => {
        "aria-labelledby": string | undefined;
        "aria-describedby": string | undefined;
        "aria-modal": string | undefined;
        "data-presentation": "dialog" | "popover" | "sheet" | undefined;
    };
    triggerAttrs(state: PopupState, id: string, key: string, props: PopupTriggerProps, role?: string): {
        disabled: string | undefined;
        "aria-disabled": string | undefined;
        "data-disabled": string | undefined;
        "aria-haspopup": string | undefined;
        type: string;
        "data-open": string | undefined;
        "data-closed": string | undefined;
        id: string | undefined;
        "aria-expanded": string;
        "aria-controls": string | undefined;
    };
};
declare function hoverOpening(core: PopupCore, group?: ReturnType<typeof warmGroup>): {
    clear: () => void;
    enter(event: PointerEvent, key?: string, payload?: unknown): void;
    leave: (event: PointerEvent) => false | void;
    leaveContent(event: PointerEvent): void;
};
declare function focusOpening(core: PopupCore): {
    clear: () => void;
    enter(key: string, payload: unknown, event: FocusEvent): void;
    leave(event: FocusEvent): void;
    keydown(event: KeyboardEvent): boolean;
    triggerAttrs(state: PopupState, id: string, key: string, props: PopupTriggerProps, role?: string): {
        "aria-describedby": string | undefined;
        "data-disabled": string | undefined;
        "data-open": string | undefined;
        "data-closed": string | undefined;
    };
};
declare function triggerName(core: PopupCore): {
    contentAttrs: (state: PopupState, id: string) => {
        "aria-labelledby": string | undefined;
        "aria-label": string | undefined;
        "aria-modal": string | undefined;
    };
};
declare function warmGroup(core: PopupCore): {
    delay: (delay: number) => number;
    opening: (event?: Event) => void;
    change(open: boolean): void;
    instant: () => boolean;
    join(): void;
};
declare const styleReset: {
    prepare(name: string, contentSlot: string): void;
    bind(el: HTMLElement): void;
};
export { contentAnchor, focusOpening, hoverOpening, placement, placementOptions, pressOpening, styleReset, triggerName, warmGroup, };
