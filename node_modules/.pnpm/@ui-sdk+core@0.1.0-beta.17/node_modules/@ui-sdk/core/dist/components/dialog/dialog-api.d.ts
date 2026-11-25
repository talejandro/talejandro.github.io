import type { Layer } from "../../foundation/platform/layers.js";
import { type PopupState } from "../../foundation/popups/create-popup.js";
import type { PopupCloseReason } from "../../foundation/popups/popup.js";
import { type dialogPreset, type drawerPreset } from "../../foundation/popups/popup-presets.js";
import type { SheetConfig } from "../../foundation/popups/presentation.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { DialogCloseProps, DialogDismissReason, DialogOpenChangeReason, DialogOptions, DialogSharedOptions } from "./dialog.js";
type CloseProps = DialogCloseProps;
type DialogState = PopupState & {
    modal: boolean | "trap-focus";
    nested: boolean;
    stack: number;
    pending: string | null;
    errors: Record<string, unknown>;
    apple: boolean;
    presentation: "dialog" | "sheet";
};
declare const ownContent: string;
/**
 * How Dialog refuses a close, for `createDismissal`. A running action refuses
 * every close but the ones above. A dismissal needs `dismissible`, and an
 * outside press needs `closeOnOutsidePress` too. Refused dismissals are
 * attempts the app hears about, except a press beside a non-modal dialog,
 * which is the page's.
 */
declare function dialogRefusal(reason: string, policy: {
    dismissible: boolean;
    outsidePress: boolean;
    pending: boolean;
    beside: boolean;
}): "attempt" | "silent" | undefined;
/** What a component built on Dialog adds to its behavior, like a sheet. */
type DialogRules = {
    /** Its preset: `dialogPreset`, which presents as a sheet, or Drawer's. Alert Dialog's is the default, so it doesn't carry a sheet's code. */
    preset?: typeof dialogPreset | typeof drawerPreset;
    /** More of what its content binds with, like the sheet it presents as. */
    bind?: () => Partial<SheetConfig>;
    /** Runs when the popup shows, with its layer. Returns a cleanup. */
    onShow?: (layer: Layer) => (() => void) | void;
    /** Runs on open before it mounts, and on close before it animates out. */
    onOpenChange?: (open: boolean) => void;
    /** Runs before a dismissal is decided. Return true to handle it instead, like a sheet stepping down on Android's back. */
    intercept?: (reason: PopupCloseReason, event?: Event) => boolean;
    /** Runs after a dismissal was refused, after `onDismissAttempt`. */
    onRefuse?: (reason: DialogDismissReason) => void;
};
declare function dialogApiBody(context: PrimitiveContext<DialogSharedOptions, DialogState, string>, alert: boolean, extra?: DialogRules): {
    internal: import("../../foundation/popups/create-popup.js").PopupCore & {
        dismissal: {
            allows(reason: string, event?: Event): boolean;
            sheet: {
                dismissible: () => boolean;
                onDismissAttempt: (event?: Event) => void | undefined;
            };
        };
        presentation: {
            open: () => void;
            resolve: () => string;
            bind(el: HTMLElement, config: SheetConfig): () => void;
        } | undefined;
        press: {
            press: (key: string, props: import("../../index.js").PopupTriggerProps, event?: Event) => void | Promise<import("../../index.js").PopupResult<string, string>>;
            keydown(event: KeyboardEvent, el: HTMLElement, key: string, props: import("../../index.js").PopupTriggerProps): boolean;
            contains: (target: Node, event?: Event) => boolean;
            initialFocus(content: HTMLElement, setting?: import("../../index.js").PopupContentProps["initialFocus"], preferred?: () => HTMLElement | undefined): HTMLElement | undefined;
            contentAttrs: (state: PopupState, id: string, role: string | undefined) => {
                "aria-labelledby": string | undefined;
                "aria-describedby": string | undefined;
                "aria-modal": string | undefined;
                "data-presentation": "dialog" | "popover" | "sheet" | undefined;
            };
            triggerAttrs(state: PopupState, id: string, key: string, props: import("../../index.js").PopupTriggerProps, role?: string): {
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
        group: {
            delay: (delay: number) => number;
            opening: (event?: Event) => void;
            change(open: boolean): void;
            instant: () => boolean;
            join(): void;
        } | undefined;
        hover: {
            clear: () => void;
            enter(event: PointerEvent, key?: string, payload?: unknown): void;
            leave: (event: PointerEvent) => false | void;
            leaveContent(event: PointerEvent): void;
        } | undefined;
        focus: {
            clear: () => void;
            enter(key: string, payload: unknown, event: FocusEvent): void;
            leave(event: FocusEvent): void;
            keydown(event: KeyboardEvent): boolean;
            triggerAttrs(state: PopupState, id: string, key: string, props: import("../../index.js").PopupTriggerProps, role?: string): {
                "aria-describedby": string | undefined;
                "data-disabled": string | undefined;
                "data-open": string | undefined;
                "data-closed": string | undefined;
            };
        } | undefined;
        triggerName: {
            contentAttrs: (state: PopupState, id: string) => {
                "aria-labelledby": string | undefined;
                "aria-label": string | undefined;
                "aria-modal": string | undefined;
            };
        };
        rules: import("../../foundation/popups/create-popup.js").PopupRules | undefined;
    } & {
        options: () => DialogOptions;
        show: (request?: import("../../index.js").PopupChangeOptions<string> & {
            payload?: unknown;
            anchor?: import("../../index.js").Anchor;
            signal?: AbortSignal;
        } & Partial<{}> & {
            by?: import("../../foundation/popups/index.js").PopupOpener;
            trigger?: string;
        }, openReason?: string | undefined) => Promise<import("../../index.js").PopupResult<string, string>>;
        hide: (request?: import("../../index.js").ChangeOptions<string> & {
            focus?: import("../../foundation/popups/popup.js").ReturnMode;
            returnValue?: string | undefined;
        }) => boolean;
        takeOver: ({ trigger, payload, anchor, reason, event, }: {
            trigger: string;
            payload: unknown;
            anchor?: import("../../index.js").Anchor;
            reason: string;
            event?: Event;
        }) => void;
        alert: boolean;
        initialFocus: () => HTMLElement | undefined;
        closePress: (key: string, props: CloseProps, event?: Event) => boolean | undefined;
        shortcutPress: (key: string, event: KeyboardEvent) => boolean | undefined;
        shortcutOf: (el: HTMLElement) => string | undefined;
        backdropElement: () => HTMLElement | undefined;
    };
    focus: () => void;
    close: (options?: (import("../../index.js").PopupChangeOptions<DialogOpenChangeReason> & {
        returnValue?: any;
    }) | undefined) => boolean;
    open: (options?: (import("../../index.js").PopupChangeOptions<import("./dialog.js").DialogPayloadChangeReason> & {
        payload?: any;
        anchor?: import("../../index.js").Anchor;
        signal?: AbortSignal;
    }) | undefined) => Promise<import("../../index.js").PopupResult<DialogOpenChangeReason, any>>;
    toggle: (options?: import("../../index.js").PopupChangeOptions<DialogOpenChangeReason> | undefined) => boolean;
    isOpen: () => boolean;
    setOpen: (open: boolean, options?: import("../../index.js").PopupChangeOptions<DialogOpenChangeReason> | undefined) => boolean;
    getPayload: () => any;
};
declare const dialogApi: (...args: Parameters<typeof dialogApiBody>) => DialogApi;
/**
 * `dialog`'s api, which its slots and controller call. Adapters
 * expose it as `api`.
 * @stable
 */
interface DialogApi extends ReturnType<typeof dialogApiBody> {
}
export { type DialogApi, type DialogRules, dialogApi, type DialogState, dialogRefusal, ownContent, };
