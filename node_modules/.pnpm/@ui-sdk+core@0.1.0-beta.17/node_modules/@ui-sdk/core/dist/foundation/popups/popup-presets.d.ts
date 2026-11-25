import type { Side } from "../platform/sides.js";
import type { Modal } from "./popup.js";
import type { PopupCore } from "./create-popup.js";
import { createDismissal } from "./dismissal.js";
import type { PopupBehaviorName } from "./popup-behavior.js";
import { type focusOpening, hoverOpening, placement, pressOpening, styleReset, triggerName, type warmGroup } from "./popup-features.js";
import { createPopupPayload } from "./popup-payload.js";
declare function sheetPresentation(core: PopupCore, dismissal?: ReturnType<typeof createDismissal>): {
    open: () => void;
    resolve: () => string;
    bind(el: HTMLElement, config: import("./presentation.js").SheetConfig): () => void;
};
/**
 * How a kind of popup behaves, and the code for it. Pass one of the presets
 * to `createPopup`, like `popoverPreset`.
 * @experimental
 */
type PopupPreset = {
    /** How Tab, Escape, outside presses and the window losing focus behave, by the pattern it follows. */
    behavior: PopupBehaviorName;
    /** The content's role. None for content that isn't a widget of its own, like a hover card. */
    role?: "dialog" | "alertdialog" | "menu" | "tooltip";
    /** The `modal` it has when the primitive's option doesn't say. Without one, the primitive keeps `modal` in its state itself, or it's never modal. */
    modal?: Modal;
    /** The side it opens on when its content doesn't say. */
    side?: Side;
    /** Milliseconds the pointer rests on the trigger before it opens, unless the `delay` option says. */
    delay?: number;
    /** Milliseconds before it closes once the pointer has left, unless the `closeDelay` option says. */
    closeDelay?: number;
    /** Milliseconds keyboard focus rests on the trigger before it opens. `delay` by default. */
    focusDelay?: number;
    /** The data each trigger hands the content, its `payload`. */
    payload?: typeof createPopupPayload;
    /** Placement beside the trigger. */
    placement?: typeof placement;
    /** Presenting as a sheet, with the `presentation` option. */
    presentation?: typeof sheetPresentation;
    /** `dismissible` and `onDismissAttempt`. Hover content takes neither, since WCAG 1.4.13 needs it dismissible. */
    dismissal?: typeof createDismissal;
    /** Opening on a press, with a button trigger and focus moving in. Without it, resting the pointer and keyboard focus open it. */
    press?: typeof pressOpening;
    /** Opening when the pointer rests on the trigger. */
    hover?: typeof hoverOpening;
    /** Opening when keyboard focus rests on the trigger. */
    focus?: typeof focusOpening;
    /** One open at a time, the next opening at once while one is warm. */
    group?: typeof warmGroup;
    /** Naming an untitled popup after the trigger that opened it, whose name is copied since the page, its trigger included, goes inert. */
    triggerName?: typeof triggerName;
    /** Undoing the browser's own popover styles. */
    resetStyles?: typeof styleReset;
};
/**
 * Rich content opened from a button: a non-modal dialog by default, part of
 * the page's Tab order, placed beside its trigger, that can open on hover with
 * `openOnHover` and present as a sheet. For `createPopup`.
 * @experimental
 */
declare const popoverPreset: {
    payload: typeof createPopupPayload;
    behavior: "popover";
    role: "dialog";
    dismissal: typeof createDismissal;
    modal: false;
    placement: {
        position: typeof import("../../index.js").position;
        prepare: () => void;
        anchor: typeof import("./popup-features.js").contentAnchor;
        options: typeof import("./popup-features.js").placementOptions;
    };
    presentation: typeof sheetPresentation;
    press: typeof pressOpening;
    hover: typeof hoverOpening;
    resetStyles: {
        prepare(name: string, contentSlot: string): void;
        bind(el: HTMLElement): void;
    };
};
/**
 * A modal dialog by default: it holds focus, makes the page inert and locks
 * its scroll, and can present as a sheet. Not placed beside its trigger. An
 * untitled one is named after the trigger that opened it. For `createPopup`.
 * @experimental
 */
declare const dialogPreset: {
    payload: typeof createPopupPayload;
    behavior: "dialog";
    role: "dialog";
    dismissal: typeof createDismissal;
    modal: true;
    presentation: typeof sheetPresentation;
    press: typeof pressOpening;
    triggerName: typeof triggerName;
    resetStyles: {
        prepare(name: string, contentSlot: string): void;
        bind(el: HTMLElement): void;
    };
};
declare const alertDialogPreset: {
    payload: typeof createPopupPayload;
    behavior: "dialog";
    role: "alertdialog";
    dismissal: typeof createDismissal;
    press: typeof pressOpening;
    triggerName: typeof triggerName;
    resetStyles: {
        prepare(name: string, contentSlot: string): void;
        bind(el: HTMLElement): void;
    };
};
declare const drawerPreset: {
    payload: typeof createPopupPayload;
    behavior: "dialog";
    role: "dialog";
    dismissal: typeof createDismissal;
    press: typeof pressOpening;
    triggerName: typeof triggerName;
    resetStyles: {
        prepare(name: string, contentSlot: string): void;
        bind(el: HTMLElement): void;
    };
};
declare const menuPreset: {
    payload: typeof createPopupPayload;
    behavior: "menu";
    role: "menu";
    dismissal: typeof createDismissal;
    placement: {
        position: typeof import("../../index.js").position;
        prepare: () => void;
        anchor: typeof import("./popup-features.js").contentAnchor;
        options: typeof import("./popup-features.js").placementOptions;
    };
    presentation: typeof sheetPresentation;
};
declare const selectPreset: {
    behavior: "select";
    modal: "pointer";
    dismissal: typeof createDismissal;
    placement: {
        position: typeof import("../../index.js").position;
        prepare: () => void;
        anchor: typeof import("./popup-features.js").contentAnchor;
        options: typeof import("./popup-features.js").placementOptions;
    };
    presentation: typeof sheetPresentation;
};
declare const comboboxPreset: {
    behavior: "combobox";
    modal: false;
    dismissal: typeof createDismissal;
    placement: {
        position: typeof import("../../index.js").position;
        prepare: () => void;
        anchor: typeof import("./popup-features.js").contentAnchor;
        options: typeof import("./popup-features.js").placementOptions;
    };
    presentation: typeof sheetPresentation;
};
declare const datePickerPreset: {
    behavior: "popover";
    dismissal: typeof createDismissal;
    placement: {
        position: typeof import("../../index.js").position;
        prepare: () => void;
        anchor: typeof import("./popup-features.js").contentAnchor;
        options: typeof import("./popup-features.js").placementOptions;
    };
    presentation: typeof sheetPresentation;
};
declare const triggerMenuPreset: {
    behavior: "combobox";
    dismissal: typeof createDismissal;
    placement: {
        position: typeof import("../../index.js").position;
        prepare: () => void;
        anchor: typeof import("./popup-features.js").contentAnchor;
        options: typeof import("./popup-features.js").placementOptions;
    };
};
export { alertDialogPreset, comboboxPreset, datePickerPreset, dialogPreset, drawerPreset, menuPreset, popoverPreset, type PopupPreset, selectPreset, triggerMenuPreset, };
