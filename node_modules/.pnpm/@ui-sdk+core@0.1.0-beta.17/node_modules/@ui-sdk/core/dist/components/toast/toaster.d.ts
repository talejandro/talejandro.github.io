import type { ActionDetails } from "../../foundation/kernel/action.js";
import { type ChangeDetails } from "../../foundation/kernel/details.js";
import { type Overlays } from "../../page/overlays/overlays.js";
/**
 * What a toast is about. `"error"` is announced assertively, and `"loading"` stays until updated.
 * @stable
 */
type ToastType = "default" | "success" | "error" | "info" | "warning" | "loading";
/**
 * Why a toast closed.
 * @stable
 */
type ToastDismissReason = "timeout" | "close-press" | "swipe" | "escape-key" | "action" | "imperative";
/**
 * What `onDismiss` receives. `cancel()` keeps the toast, like a swipe that snaps back.
 * @stable
 */
type ToastDismissDetails = ChangeDetails<ToastDismissReason>;
/**
 * What a toast's action and close buttons receive after the event: how the button was pressed.
 * @experimental
 */
type ToastActionDetails = ActionDetails;
/**
 * A button in the toast that does something, like Undo.
 * @stable
 */
type ToastAction<Content = unknown> = {
    /** The button's text. */
    label: Content;
    /**
     * Runs when it's pressed. A returned Promise marks the action pending, then
     * dismisses the toast once it resolves. A rejection keeps the toast.
     * `details.source` says how it was pressed, for changes made after an `await`.
     */
    onAction?: (event: Event | undefined, details: ToastActionDetails) => unknown;
    /** Makes the action a link. */
    href?: string;
    /**
     * Whether pressing it dismisses the toast.
     * @defaultValue true
     */
    dismiss?: boolean;
};
/**
 * A button that dismisses the toast, like Cancel.
 * @stable
 */
type ToastCancel<Content = unknown> = {
    /** The button's text. */
    label: Content;
    /** Runs when it's pressed, before the toast closes. `details.source` says how it was pressed. */
    onCancel?: (event: Event | undefined, details: ToastActionDetails) => void;
};
/**
 * Everything a toast can say and do. Every field is optional.
 * @stable
 */
type ToastOptions<Content = unknown> = {
    /** Reuses a toast: a toast with this id that's still showing is updated instead of added again. */
    id?: string;
    /** The main message. */
    title?: Content;
    /** More detail, under the title. */
    description?: Content;
    /**
     * What it's about, for styling through `data-type`, and for how it's announced.
     * @defaultValue "default"
     */
    type?: ToastType;
    /**
     * How long it shows, in ms, while nothing pauses it. `Infinity` keeps it until dismissed.
     * @defaultValue the toaster's duration, 5000, and `Infinity` for `"loading"`
     */
    duration?: number;
    /**
     * How screen readers announce it: `"polite"` waits for a pause, `"assertive"` interrupts.
     * @defaultValue "assertive" for errors, "polite" otherwise
     */
    priority?: "polite" | "assertive";
    /** A button that does something, like Undo. */
    action?: ToastAction<Content>;
    /** A button that dismisses it, like Cancel. */
    cancel?: ToastCancel<Content>;
    /**
     * Whether the user can dismiss it: swiping, Escape and Close parts. Timers and `dismiss()` still close it.
     * @defaultValue true
     */
    dismissible?: boolean;
    /** Anything else, for your own rendering, like an avatar. */
    data?: unknown;
    /** Runs when it closes, with why. Calling `details.cancel()` keeps it. */
    onDismiss?: (details: ToastDismissDetails) => void;
};
/**
 * A toast in the queue, as regions render it.
 * @stable
 */
type Toast<Content = unknown> = Omit<ToastOptions<Content>, "id" | "type" | "duration" | "priority"> & {
    /** Unique within its toaster. */
    id: string;
    /** What it's about. */
    type: ToastType;
    /** How long it shows, in ms. */
    duration: number;
    /** How screen readers announce it. */
    priority: "polite" | "assertive";
    /** Increases with every update, so a region announces it again and restarts its timer. */
    version: number;
    /** When it was added, relative to the others. Newer toasts have a higher order. */
    order: number;
};
/** A message, or the options for a toast, or a function of the settled value that returns either. */
type PromiseMessage<Content, Value> = Content | ToastOptions<Content> | ((value: Value) => Content | ToastOptions<Content>);
type ToasterInternals = {
    close: (id: string, reason: ToastDismissReason, event?: Event) => boolean;
    attachRegion: (placed: boolean) => () => void;
    hasPlacedRegion: () => boolean;
};
declare function toasterInternals(toaster: object): ToasterInternals;
/**
 * Creates a queue of toasts and the function that adds to it. Most apps use
 * the shared `toast`. Create another for a second region with its own place
 * and toasts, and pass it to that region as `toaster`.
 * @stable
 */
declare function createToaster<Content = string>({ duration: defaultDuration, overlays, }?: {
    /**
     * How long toasts show, in ms, unless a toast says otherwise.
     * @defaultValue 5000
     */
    duration?: number;
    /**
     * The registry whose host renders this toaster's region when the app hasn't placed one.
     * @defaultValue the shared `overlays`
     */
    overlays?: Overlays;
}): ((message: Content | ToastOptions<Content>, options?: ToastOptions<Content>) => string) & {
    /** Shows a success toast. Returns its id. */
    success: (message: Content | ToastOptions<Content>, options?: ToastOptions<Content>) => string;
    /** Shows an error toast, announced assertively. Returns its id. */
    error: (message: Content | ToastOptions<Content>, options?: ToastOptions<Content>) => string;
    /** Shows an informational toast. Returns its id. */
    info: (message: Content | ToastOptions<Content>, options?: ToastOptions<Content>) => string;
    /** Shows a warning toast. Returns its id. */
    warning: (message: Content | ToastOptions<Content>, options?: ToastOptions<Content>) => string;
    /** Shows a loading toast, which stays until you update or dismiss it. Returns its id. */
    loading: (message: Content | ToastOptions<Content>, options?: ToastOptions<Content>) => string;
    /**
     * Shows a loading toast for a Promise, then turns it into a success or an
     * error toast when it settles. A toast dismissed while loading stays closed.
     * Returns its id.
     */
    promise<Value>(promise: Promise<Value> | (() => Promise<Value>), messages: {
        /** While it's pending. */
        loading: Content | ToastOptions<Content>;
        /** Once it resolves. Without it, the toast closes. */
        success?: PromiseMessage<Content, Value>;
        /** Once it rejects. Without it, the toast closes. */
        error?: PromiseMessage<Content, unknown>;
    }, options?: ToastOptions<Content>): string;
    update: (id: string, options: Content | ToastOptions<Content>) => boolean;
    /** Closes one toast by id, or every toast without one. */
    dismiss(id?: string): void;
    /** The toasts in the queue, newest first. The same array until something changes. */
    toasts: () => readonly Toast<Content>[];
    /** Calls `listener` whenever a toast is added, updated or closed. Returns a function that stops it. */
    subscribe(listener: () => void): () => void;
};
/**
 * A queue of toasts, from `createToaster()`. Call it to show one.
 * @stable
 */
type Toaster<Content = string> = ReturnType<typeof createToaster<Content>>;
/**
 * Shows a toast from anywhere: `toast("Saved")`, `toast.success(...)`,
 * `toast.promise(save(), { loading, success, error })`. The overlay host, or a
 * region you place, shows it.
 * @stable
 */
declare const toast: Toaster;
export { createToaster, toast, type Toast, type ToastAction, type ToastActionDetails, type ToastCancel, type ToastDismissDetails, type ToastDismissReason, type Toaster, toasterInternals, type ToastOptions, type ToastType, };
