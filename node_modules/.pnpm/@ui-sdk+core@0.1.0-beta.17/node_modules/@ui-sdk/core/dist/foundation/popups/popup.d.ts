import type { ChangeOptions, ChangeReason, ChangeSource } from "../kernel/details.js";
import type { Store } from "../kernel/store.js";
import { type Layer } from "../platform/layers.js";
import { type PopupBehavior, type PopupBehaviorName } from "./popup-behavior.js";
import type { Anchor, position, PositionOptions } from "../platform/position.js";
/** How a popup was last opened. Decides where focus goes. */
type PopupOpener = "pointer" | "touch" | "keyboard" | "hover" | "imperative" | "initial";
/**
 * Where focus goes. `"trigger"` follows the fallback chain: the trigger, the
 * element focused before opening, the trigger of the popup it was opened from,
 * then the nearest element that survived. `"none"` leaves focus alone. A CSS
 * selector, an element or a function picks a specific element.
 */
type PopupFocusTarget = "trigger" | "none" | (string & {}) | HTMLElement | (() => HTMLElement | null | undefined);
/**
 * What being modal means. `true` makes the rest of the page inert, locks
 * scroll, traps focus and lets an outside press only close the popup. `false`
 * does none of these. A string keeps exactly one effect: `"pointer"` keeps
 * outside presses from reaching the page, and `"trap-focus"` keeps the focus
 * trap. Each component accepts a documented subset.
 * @stable
 */
type Modal = boolean | "pointer" | "trap-focus";
/** What being modal means, as three separate effects. Components map their `modal` option onto it. */
type PopupModal = {
    /** An outside press only closes the popup and reaches nothing else. */
    consumeOutsidePress: boolean;
    /** Tab wraps inside the popup. */
    trapFocus: boolean;
    /** The rest of the page is inert and doesn't scroll. */
    inertAndLock: boolean;
};
/**
 * How a popup closed, which a controller's `open()` resolves with.
 * @stable
 */
type PopupResult<Reason extends string = string, Result = string> = {
    /** Why it closed, like `"escape-key"` or `"close-press"`. `"unmount"` when the component left the page while open, and `"imperative"` when the `signal` aborted. */
    reason: Reason | "unmount";
    /** How the user closed it: `"mouse"`, `"touch"`, `"pen"`, `"keyboard"`, `"virtual"` or `"programmatic"`. */
    source: ChangeSource;
    /** What closed it reported: a Close part's `value`, a form with `method="dialog"` reports its submitter's value, and `close({ returnValue })` passes its own, typed `Result`. */
    returnValue?: Result;
};
type PopupClose<Reason extends string = string, Result = unknown> = {
    reason: Reason;
    source: ChangeSource;
    returnValue?: Result;
};
/**
 * Why a popup asks its component to close: a dismissal its behavior allows, a
 * form with `method="dialog"`, an aborted `signal`, or a sheet swiped away.
 * Presets and presentations decide which of these a given popup can report.
 */
type PopupCloseReason = "outside-press" | "escape-key" | "window-blur" | "focus-out" | "back" | "close-press" | "imperative" | "swipe";
declare function modalTriple(modal: Modal): {
    consumeOutsidePress: boolean;
    trapFocus: boolean;
    inertAndLock: boolean;
};
declare const openerOf: (event?: Event) => PopupOpener;
declare function initialFocusPlan(opener: PopupOpener): "none" | "auto" | "popup";
declare function outsidePressFocus(press: {
    type: string;
    focusable: boolean;
    consumed: boolean;
}): boolean | "later";
declare function firstUsable<T>(candidates: (() => T | null | undefined)[], usable: (value: T) => boolean): NonNullable<T> | undefined;
/**
 * Options every write method on a popup controller takes.
 * @stable
 */
type PopupChangeOptions<Reason extends string = ChangeReason> = ChangeOptions<Reason>;
/**
 * Options for opening a popup from a controller.
 * @stable
 */
type PopupOpenOptions<Payload = unknown, Reason extends string = ChangeReason> = PopupChangeOptions<Reason> & {
    /** Data for the content to render, like the row a menu acts on. Kept until the next open, so it stays put while the popup animates out. On an open popup it replaces the current payload, like another trigger taking it over, and an `anchor` passed with it moves the popup. */
    payload?: Payload;
    /** Positions the popup against this instead of the trigger: an element, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. */
    anchor?: Anchor;
    /** Closes the popup, with reason `"imperative"`, when it aborts. An already aborted signal never opens it. */
    signal?: AbortSignal;
};
/**
 * Opens, closes and inspects a popup from outside it.
 * @stable
 */
type PopupController<Payload = unknown, Reason extends string = ChangeReason, OpenOptions extends object = {}, Result = string, PayloadReason extends Reason = Reason> = {
    /** Whether it's open. False as soon as it starts closing, while it still animates out. */
    isOpen: () => boolean;
    /** Opens or closes it. Returns false when the change was canceled or it was already open or closed. */
    setOpen: (open: boolean, options?: PopupChangeOptions<Reason>) => boolean;
    /**
     * Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly
     * once and never rejects: on the next close from any source, when `signal` aborts, or with reason
     * `"unmount"` when the component leaves the page.
     */
    open: (options?: PopupOpenOptions<Payload, PayloadReason> & OpenOptions) => Promise<PopupResult<Reason, Result>>;
    /** Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed. */
    close: (options?: PopupChangeOptions<Reason> & {
        returnValue?: Result;
    }) => boolean;
    /** Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled. */
    toggle: (options?: PopupChangeOptions<Reason>) => boolean;
    /** The payload of the last open, from a controller or the trigger that opened it. */
    getPayload: () => Payload | undefined;
    /** Moves focus to the trigger that opened it last, or the first trigger. */
    focus: () => void;
};
/** Creates a popup controller. Components wrap it in their own `create<Name>Controller()`. */
declare function createPopupController<Payload = unknown, Reason extends string = ChangeReason, OpenOptions extends object = {}, Result = string, PayloadReason extends Reason = Reason>(): PopupController<Payload, Reason, OpenOptions, Result, PayloadReason>;
type PopupStore<State extends object> = Pick<Store<State>, "get" | "set" | "subscribe">;
/**
 * Derives the state that changes with a controlled `open`, in the same pass
 * as it, like the highlighted item a closing menu clears. `derive` gets the
 * new `open` and the state before it. See `deriveFromOptions`.
 */
declare function deriveOpen<State extends {
    open: boolean;
}>(context: {
    store: PopupStore<State>;
}, keys: (keyof State & string)[], derive: (open: boolean, state: State) => Partial<State> | void): void;
declare function popupTriggerAttrs(state: {
    open: boolean;
    mounted: boolean;
    trigger?: string | null;
}, id: string, haspopup: string, key?: string): {
    "data-open": string | undefined;
    "data-closed": string | undefined;
    id: string | undefined;
    "aria-haspopup": string;
    "aria-expanded": string;
    "aria-controls": string | undefined;
};
declare function disabledTriggerAttrs(props: {
    disabled?: boolean;
    focusableWhenDisabled?: boolean;
}): {
    disabled: string | undefined;
    "aria-disabled": string | undefined;
    "data-disabled": string | undefined;
};
declare function popupContentAttrs(state: {
    open: boolean;
    mounted: boolean;
}, id: string): {
    "data-open": string | undefined;
    "data-closed": string | undefined;
    id: string;
    tabindex: string;
    hidden: string | undefined;
};
type ReturnMode = boolean | "later" | "unless-moved";
type AttachConfig = {
    position?: () => PositionOptions;
    anchor?: () => Anchor | null | undefined;
    rendered?: (listener: () => void) => () => void;
    initialFocus?: () => HTMLElement | null | undefined | void;
    backdrop?: () => HTMLElement | undefined;
    host?: () => HTMLElement | undefined;
    inline?: boolean;
    onShow?: (layer: Layer) => (() => void) | void;
    onClose?: () => void;
};
declare function outsideBox(point: {
    x: number;
    y: number;
}, rect: DOMRect): boolean;
declare function resetPopoverStyles(doc: Document, selectors: string[]): void;
/**
 * Writes `resetPopoverStyles` for `selectors` ahead of the first open, with
 * the rule that keeps hidden parts hidden, which the content's bind writes
 * otherwise. Binding still writes both if the popup opens first.
 */
declare function prepareReset(selectors: string[]): void;
declare function createPopupLayer<State extends {
    open: boolean;
    mounted: boolean;
}, Reason extends string = string>(options: Partial<PopupBehavior> & {
    preset: PopupBehaviorName;
    store: PopupStore<State>;
    owner?: {
        component: string;
        id: string;
    };
    trigger: () => HTMLElement | undefined;
    returnTrigger?: () => HTMLElement | undefined;
    close: (reason: PopupCloseReason, details: {
        event?: Event;
        focus: boolean | "later";
        returnValue?: string;
    }) => void;
    modal: () => PopupModal;
    parent?: () => Layer | undefined;
    contains?: (target: Node, event?: Event) => boolean;
    finalFocus?: () => PopupFocusTarget | undefined;
    onOpenChange?: (open: boolean, closed?: PopupClose<Reason>) => void;
    onOpenChangeComplete?: (open: boolean, closed?: PopupClose<Reason>) => void;
    onEscape?: (event: KeyboardEvent) => void;
    onShow?: (layer: Layer) => (() => void) | void;
    persistent?: () => Element[];
    position?: typeof position;
}): {
    bind(el: HTMLElement, config?: AttachConfig): () => void;
    keydown: (event: KeyboardEvent) => void;
    triggerKeydown(event: KeyboardEvent): void;
    opening(by: PopupOpener, event?: Event): void;
    opener: () => PopupOpener;
    observe(listener: (open: boolean) => PopupClose<Reason> | undefined): void;
    requestClose: (reason: PopupCloseReason, event?: Event) => void;
    returnFocus(mode: ReturnMode): void;
    initialFocus: (resolve?: () => HTMLElement | null | undefined | void) => void;
    place: () => void | undefined;
    checkPlacement: () => void | undefined;
    updateModal: () => void | undefined;
    layer: () => Layer | undefined;
    element: () => HTMLElement | undefined;
    mountedAs: (open: boolean) => boolean;
    backdrop(backdrop: HTMLElement): () => void;
};
type Popup<Reason extends string = string> = ReturnType<typeof createPopupLayer<{
    open: boolean;
    mounted: boolean;
}, Reason>>;
export { type AttachConfig, createPopupLayer, createPopupController, deriveOpen, disabledTriggerAttrs, firstUsable, initialFocusPlan, type Modal, modalTriple, openerOf, outsideBox, outsidePressFocus, type Popup, type PopupChangeOptions, type PopupClose, type PopupCloseReason, popupContentAttrs, type PopupController, type PopupFocusTarget, type PopupModal, type PopupOpener, type PopupOpenOptions, type PopupResult, popupTriggerAttrs, prepareReset, resetPopoverStyles, type ReturnMode, };
