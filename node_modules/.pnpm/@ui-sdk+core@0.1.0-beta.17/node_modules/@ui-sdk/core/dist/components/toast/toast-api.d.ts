import { type ActionDetails } from "../../foundation/kernel/action.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import { type ToastPauseReason } from "./toast-timers.js";
import { type ToastDismissReason, type Toaster } from "./toaster.js";
import type { ToastButtonState, ToastItem, ToastRegionOptions } from "./toast.js";
declare const findItem: (items: readonly ToastItem[], id: string) => ToastItem | undefined;
declare const isExpanded: (state: {
    alwaysExpanded: boolean;
    hovered: boolean;
    focused: boolean;
}) => boolean;
declare const hasToasts: (items: readonly ToastItem[]) => boolean;
type ToastRegionInternalOptions = ToastRegionOptions & {
    placed?: boolean;
    label?: string;
};
declare const initialToastState: (options: ToastRegionInternalOptions) => {
    items: readonly ToastItem[];
    toaster: Toaster;
    side: "top" | "bottom";
    align: "center" | "end" | "start";
    maxVisible: number;
    alwaysExpanded: boolean;
    shortcut: string | null;
    label: string | undefined;
    hovered: boolean;
    focused: boolean;
    buttons: Readonly<Record<string, ToastButtonState>>;
};
declare const syncToastState: (options: ToastRegionInternalOptions) => {
    toaster: Toaster;
    side: "top" | "bottom";
    align: "center" | "end" | "start";
    maxVisible: number;
    alwaysExpanded: boolean;
    shortcut: string | null;
    label: string | undefined;
};
/** What a toast region holds. */
type ToastRegionStoreState = ReturnType<typeof initialToastState>;
declare function toastRegionApiBody(context: PrimitiveContext<ToastRegionInternalOptions, ToastRegionStoreState, string>): {
    /** Moves focus to the newest toast, or back where it was when focus is already in the region. Returns whether it moved. */
    focus: () => boolean;
    /** Pauses every timer in the region for a reason, until `resume(reason)`. Other reasons keep their own hold. */
    pause: (reason: ToastPauseReason) => void;
    /** Clears one pause reason. Timers run again once no reason is left. */
    resume: (reason: ToastPauseReason) => void;
    internal: {
        bindRegion: (el: HTMLElement) => () => void;
        bindToast: (el: HTMLElement, toastId: string) => () => void;
        regionKeydown: (event: KeyboardEvent, region: HTMLElement) => void;
        label: (toastId: string) => void;
        press: (key: string, toastId: string, handler: ((event: Event | undefined, details: ActionDetails) => unknown) | undefined, dismiss: boolean, reason: "action" | "close-press", event?: Event) => void;
        close: (toastId: string, reason: ToastDismissReason, event?: Event) => boolean;
        toaster: () => Toaster;
        connect: () => () => void;
    };
};
declare const toastRegionApi: (...args: Parameters<typeof toastRegionApiBody>) => ToastRegionApi;
/** What a toast region's instance can do. */
interface ToastRegionApi extends ReturnType<typeof toastRegionApiBody> {
}
export { findItem, hasToasts, initialToastState, isExpanded, syncToastState, type ToastRegionApi, toastRegionApi, type ToastRegionInternalOptions, type ToastRegionStoreState, };
