import type { createDismissal } from "./dismissal.js";
import type { createPopupPayload } from "./popup-payload.js";
import type { ChangeOptions } from "../kernel/details.js";
import type { Store } from "../kernel/store.js";
import { createPopupLayer, type Popup, type PopupClose, type PopupOpener, type PopupOpenOptions, type PopupResult, type ReturnMode } from "./popup.js";
import type { Anchor } from "../platform/position.js";
type ShowRequest<Reason extends string, Extra extends object> = PopupOpenOptions<unknown, Reason> & Partial<Extra> & {
    by?: PopupOpener;
    trigger?: string;
};
type HideRequest<Reason extends string, Result> = ChangeOptions<Reason> & {
    focus?: ReturnMode;
    returnValue?: Result;
};
declare function unopened<Reason extends string, Result = string>(reason: Reason, event?: Event): Promise<PopupResult<Reason, Result>>;
declare function createOpenSteps<Reason extends string, Result = string, Extra extends object = {}, PayloadReason extends Reason = Reason>(config: {
    popup: Popup<Reason>;
    store: Pick<Store<{
        open: boolean;
    }>, "get">;
    change: (open: boolean, details: {
        reason: Reason;
        event?: Event;
        returnValue?: Result;
    }) => boolean;
    onDestroy: (cleanup: () => void) => void;
    payload?: ReturnType<typeof createPopupPayload<PayloadReason>>;
    dismissal?: ReturnType<typeof createDismissal>;
    returnFocus?: boolean;
    rules?: {
        open?: (request: ShowRequest<Reason, Extra> & {
            reason: Reason;
            payloadReason: PayloadReason;
        }, open: (by?: PopupOpener) => boolean) => void;
        reopen?: (request: ShowRequest<Reason, Extra> & {
            reason: Reason;
            payloadReason: PayloadReason;
        }, open: (by?: PopupOpener) => boolean) => void;
        close?: (request: HideRequest<Reason, Result> & {
            reason: Reason;
        }, close: () => boolean) => void;
    };
}): {
    api: {
        isOpen: () => boolean;
        setOpen: (open: boolean, { reason, event }?: ChangeOptions<Reason>) => boolean;
        open: (options?: PopupOpenOptions<unknown, PayloadReason> & Partial<Extra>) => Promise<PopupResult<Reason, Result>>;
        close: ({ reason, event, returnValue, }?: ChangeOptions<Reason> & {
            returnValue?: Result;
        }) => boolean;
        toggle: ({ reason, event }?: ChangeOptions<Reason>) => boolean;
    };
    show: (request?: ShowRequest<PayloadReason, Extra>, openReason?: Reason) => Promise<PopupResult<Reason, Result>>;
    attempt: (request: ShowRequest<PayloadReason, Extra>, openReason?: Reason) => {
        opened: boolean;
        result: Promise<PopupResult<Reason, Result>>;
    };
    hide: (request?: HideRequest<Reason, Result>) => boolean;
    takeOver: ({ trigger, payload, anchor, reason, event, }: {
        trigger: string;
        payload: unknown;
        anchor?: Anchor;
        reason: PayloadReason;
        event?: Event;
    }) => void;
    result: (signal?: AbortSignal) => Promise<PopupResult<Reason, Result>>;
    anchor: () => Anchor | undefined;
};
declare function createSteppedPopup<State extends {
    open: boolean;
    mounted: boolean;
}, Reason extends string = string>(layer: Parameters<typeof createPopupLayer<State, Reason>>[0], steps: Omit<Parameters<typeof createOpenSteps<Reason>>[0], "popup" | "store">): {
    popup: {
        bind(el: HTMLElement, config?: import("./popup.js").AttachConfig): () => void;
        keydown: (event: KeyboardEvent) => void;
        triggerKeydown(event: KeyboardEvent): void;
        opening(by: PopupOpener, event?: Event): void;
        opener: () => PopupOpener;
        observe(listener: (open: boolean) => PopupClose<Reason, unknown> | undefined): void;
        requestClose: (reason: import("./popup.js").PopupCloseReason, event?: Event) => void;
        returnFocus(mode: ReturnMode): void;
        initialFocus: (resolve?: (() => HTMLElement | null | undefined | void) | undefined) => void;
        place: () => void | undefined;
        checkPlacement: () => void | undefined;
        updateModal: () => void | undefined;
        layer: () => import("../platform/index.js").Layer | undefined;
        element: () => HTMLElement | undefined;
        mountedAs: (open: boolean) => boolean;
        backdrop(backdrop: HTMLElement): () => void;
    };
    steps: {
        api: {
            isOpen: () => boolean;
            setOpen: (open: boolean, { reason, event }?: ChangeOptions<Reason>) => boolean;
            open: (options?: import("./popup.js").PopupChangeOptions<Reason> & {
                payload?: unknown;
                anchor?: Anchor;
                signal?: AbortSignal;
            } & Partial<{}>) => Promise<PopupResult<Reason, string>>;
            close: ({ reason, event, returnValue, }?: ChangeOptions<Reason> & {
                returnValue?: string | undefined;
            }) => boolean;
            toggle: ({ reason, event }?: ChangeOptions<Reason>) => boolean;
        };
        show: (request?: ShowRequest<Reason, {}>, openReason?: Reason | undefined) => Promise<PopupResult<Reason, string>>;
        attempt: (request: ShowRequest<Reason, {}>, openReason?: Reason | undefined) => {
            opened: boolean;
            result: Promise<PopupResult<Reason, string>>;
        };
        hide: (request?: HideRequest<Reason, string>) => boolean;
        takeOver: ({ trigger, payload, anchor, reason, event, }: {
            trigger: string;
            payload: unknown;
            anchor?: Anchor;
            reason: Reason;
            event?: Event;
        }) => void;
        result: (signal?: AbortSignal) => Promise<PopupResult<Reason, string>>;
        anchor: () => Anchor | undefined;
    };
};
export { createOpenSteps, createSteppedPopup, unopened };
