import type { ChangeDetails } from "../kernel/details.js";
import type { Part, PrimitiveContext, ReasonFor } from "../kernel/primitive-types.js";
import type { Store } from "../kernel/store.js";
import type { Layer } from "../platform/layers.js";
import type { DismissRules } from "./dismissal.js";
import type { PopupBehavior } from "./popup-behavior.js";
import { createPopupLayer, type Modal, type PopupClose, type PopupCloseReason, type PopupController, type PopupModal, type PopupOpener, type ReturnMode } from "./popup.js";
import { createOpenSteps } from "./popup-steps.js";
import type { PopupPreset } from "./popup-presets.js";
import type { PopupContentProps } from "./popup-slots.js";
import type { PresentationSetting, SheetConfig } from "./presentation.js";
/** The options `createPopup` reads from the primitive's, when it has them. */
type PopupOptions = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?(open: boolean, details: ChangeDetails<any>): void;
    onOpenChangeComplete?: (open: boolean) => void;
    onPayloadChange?: (payload: unknown, details: ChangeDetails<any>) => void;
    modal?: Modal;
    presentation?: PresentationSetting<string>;
    openOnHover?: boolean;
    delay?: number;
    closeDelay?: number;
    disabled?: boolean;
    dismissible?: boolean;
    onDismissAttempt?: (details: never) => void;
};
/**
 * The state a popup keeps. `popupState` makes it.
 * @experimental
 */
type PopupState = {
    /** Whether it's open. False as soon as it starts closing, while `mounted` stays true through the exit animation. */
    open: boolean;
    /** True while it's in the page, including while it animates out. */
    mounted: boolean;
    /** The trigger that opened it last, by key. Null until a trigger binds. */
    trigger: string | null;
    /** The payload of the last open. */
    payload: unknown;
    /**
     * Whether a title is rendered, which names it. `null` until the parts bind,
     * while a title may still render, as on the server.
     */
    titled: boolean | null;
    /** Whether a description is rendered, which describes it. */
    described: boolean;
    /** The `modal` in effect, from the option, the preset and the presentation. */
    modal: Modal;
    /** How it presents while open, decided as it opens. */
    presentation: "popover" | "dialog" | "sheet";
};
/**
 * What a preset's features reach: the popup's state, options and parts, the
 * popup layer, its control and its trigger. The api's `internal` is this
 * object, with the features and what the parts call added.
 */
type PopupCore = {
    label: string;
    role: PopupPreset["role"];
    store: Store<PopupState>;
    options: () => PopupOptions;
    onOptions: (listener: () => void) => void;
    onDestroy: (cleanup: () => void) => void;
    element: (slot: string, key?: string) => HTMLElement | undefined;
    parts: () => Iterable<Part>;
    preset: PopupPreset;
    popup: ReturnType<typeof createPopupLayer<PopupState, string>>;
    control: ReturnType<typeof createOpenSteps<string>>;
    triggerElement: () => HTMLElement | undefined;
    triggerSlot: string;
    triggerDisabled: (key: string) => boolean;
    contentProps: (key?: string) => PopupContentProps;
    rules?: PopupRules;
};
/**
 * What only one popup does, beside its preset's behavior, for a component
 * whose rules no preset has, like a dialog that waits for an action. Each is
 * optional and replaces or extends what `createPopup` does at that step. Our
 * components' escape hatch, typed but not documented.
 * @internal
 */
type PopupRules = DismissRules & {
    /** Asks to close for a dismissal the popup layer saw, like Escape or an outside press. Closes by default. */
    dismiss?: (reason: PopupCloseReason, details: {
        event?: Event;
        focus: ReturnMode;
        returnValue?: string;
    }) => void;
    /** The element it opens from, for placement, nesting and focus return, when that isn't its trigger slot's, like a combobox's input. */
    trigger?: () => HTMLElement | undefined;
    /** Whether a close returns focus when its request doesn't say, like after an item is chosen. True by default; false for a list whose focus stays in an input. */
    returnFocus?: boolean;
    /** Whether a press on something outside the popup counts as inside. Its triggers do by default. */
    contains?: (target: Node, event?: Event) => boolean;
    /** Elements that stay usable while the popup makes the page inert. Presses on them never dismiss it. */
    persistent?: () => Element[];
    /** Escape while it's the topmost layer. Closes by default. */
    onEscape?: (event: KeyboardEvent) => void;
    /** Runs as it shows, with its layer. Returns a cleanup for when it hides. */
    onShow?: (layer: Layer) => (() => void) | void;
    /** More of what `onOpenChange` hears, like which character opened a trigger menu. */
    details?: () => object;
    /** Runs as it starts opening or closing, with why it closed. */
    onOpenChange?: (open: boolean, closed?: PopupClose) => void;
    /** Runs once opening or closing has finished, after any animation. */
    onOpenChangeComplete?: (open: boolean, closed?: PopupClose) => void;
    /**
     * Decides an open: call `open` to go on, with how it opens when the rules
     * decide that, or return without calling it to refuse. The request has what
     * the controller's `open()` was passed.
     */
    open?: (request: {
        trigger?: string;
        event?: Event;
        by?: PopupOpener;
        [option: string]: unknown;
    }, open: (by?: PopupOpener) => boolean) => void;
    /** Decides a close: call `close` to go on, or return without calling it to stay open. */
    close?: (request: {
        reason: string;
        event?: Event;
    }, close: () => boolean) => void;
    /** What the content's `initialFocus` of `"auto"` prefers to its first focusable element, like an autofocused one. */
    preferredFocus?: () => HTMLElement | undefined;
    /** More of what its content binds with, like a sheet's snap points. */
    bind?: () => Partial<SheetConfig>;
    /** The layer it nests under, like a submenu's under its parent menu. By default, the open popup around its trigger. */
    parent?: () => Layer | undefined;
    /** What being modal does while it shows, when the `modal` in its state doesn't say it all, like a submenu that never locks the page. */
    modal?: () => PopupModal;
    /** How it asks to present, when that isn't its `presentation` option, like a context menu that's always a popover. */
    presentation?: () => PresentationSetting<string> | undefined;
    /** An open popup asked to open again. Another trigger takes it over by default. */
    reopen?: (request: {
        trigger?: string;
        event?: Event;
        [option: string]: unknown;
    }) => void;
};
type Feature<Preset extends PopupPreset, Key extends keyof PopupPreset> = NonNullable<PopupPreset[Key]> extends (...args: never[]) => infer Made ? Preset extends Required<Pick<PopupPreset, Key>> ? Made : Made | undefined : never;
type PopupMethod = "isOpen" | "setOpen" | "open" | "close" | "toggle" | "getPayload" | "focus";
type ControllerOf<Options> = Options extends {
    controller?: infer Controller;
} ? NonNullable<Controller> : never;
type PopupApiOf<Options> = [ControllerOf<Options>] extends [never] ? PopupController<unknown, ReasonFor<Options, "open">, {}, string, string extends ReasonFor<Options, "payload"> ? ReasonFor<Options, "open"> : Extract<ReasonFor<Options, "payload">, ReasonFor<Options, "open">>> : Pick<ControllerOf<Options>, Extract<keyof ControllerOf<Options>, PopupMethod>>;
/**
 * Makes a primitive a popup. Call it in `api`, spread `popupSlots(slot)`
 * into `slots` and `popupState(options)` into `state`. It brings the top
 * layer, presence, Escape, outside presses, focus moving in and back,
 * modality, nesting under other popups, several triggers that each hand the
 * content a `payload`, and server rendering.
 *
 * `preset` is the behavior: `popoverPreset` from `@ui-sdk/core/popover`,
 * `dialogPreset` from `@ui-sdk/core/dialog`, `tooltipPreset` from
 * `@ui-sdk/core/tooltip` or `hoverCardPreset` from `@ui-sdk/core/hover-card`.
 * Each follows its WAI-ARIA
 * pattern: how Tab, Escape, outside presses and the window losing focus
 * behave, whether it's placed beside its trigger, whether a press, resting
 * the pointer or keyboard focus opens it, the content's role and the `modal`
 * it has unless the primitive's option says. It carries the code for that
 * too, so a popup bundles only its own preset's.
 *
 * It reads `open`, `modal`, `presentation`, `openOnHover`, `delay`,
 * `closeDelay`, `disabled`, `dismissible` and `onDismissAttempt` from the
 * primitive's options when it has them, and changes `open` and `payload`
 * through `createChange`, so `onOpenChange` and `onPayloadChange` hear every
 * reason: `trigger-press`, `trigger-hover`, `trigger-focus`, `escape-key`,
 * `outside-press`, `focus-out`, `window-blur`, `close-press` and `imperative`.
 *
 * Returns the api a popup controller drives, `{ isOpen, setOpen, open, close,
 * toggle, getPayload, focus }`, plus `internal`, which the parts call. Spread
 * it to add methods.
 *
 * @example
 * api: (context) => createPopup(context, { preset: hoverCardPreset }),
 * @example
 * api: (context) => ({ ...createPopup(context, { preset: popoverPreset }), pick }),
 *
 * @experimental
 */
declare function createPopup<Options extends PopupOptions, State extends PopupState, Preset extends PopupPreset>(primitiveContext: PrimitiveContext<Options, State, string>, config: {
    /** The behavior, like `popoverPreset` or `hoverCardPreset`. */
    preset: Preset;
    /**
     * The slot that is the popup.
     * @defaultValue "content"
     */
    slot?: string;
    /**
     * The slot that opens it.
     * @defaultValue "trigger"
     */
    trigger?: string;
    /**
     * The content's role, like `"alertdialog"`.
     * @defaultValue the preset's
     */
    role?: PopupPreset["role"];
    /**
     * What only this popup does, from its core, beside the preset's behavior.
     * @internal
     */
    rules?: (core: PopupCore) => PopupRules;
    /**
     * Its behavior where it differs from its preset's, like a submenu that stays open when the window loses focus.
     * @internal
     */
    behavior?: Partial<PopupBehavior>;
}): PopupApiOf<Options> & {
    internal: PopupCore & {
        dismissal: Feature<Preset, "dismissal">;
        presentation: Feature<Preset, "presentation">;
        press: Feature<Preset, "press">;
        group: Feature<Preset, "group">;
        hover: Feature<Preset, "hover">;
        focus: Feature<Preset, "focus">;
        triggerName: Feature<Preset, "triggerName">;
        rules: PopupRules | undefined;
    };
};
/**
 * The state a popup's `api` and parts read, from the primitive's first
 * options: `open` from `open` or `defaultOpen`, `mounted`, the `trigger` that
 * opened it last, its `payload`, whether a title and a description render
 * (`titled`, `described`), the `modal` in effect and its `presentation`.
 * Spread it into `state`, with the primitive's own keys beside it.
 *
 * @example
 * state: (options: LinkPreviewOptions) => ({ ...popupState(options), href: options.href }),
 *
 * @experimental
 */
declare function popupState(options: {
    open?: boolean;
    defaultOpen?: boolean;
}): PopupState;
export { createPopup, type PopupCore, type PopupOptions, type PopupRules, type PopupState, popupState, };
