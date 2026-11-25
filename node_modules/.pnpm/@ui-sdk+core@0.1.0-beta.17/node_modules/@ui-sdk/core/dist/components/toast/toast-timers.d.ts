/**
 * Why a region's timers are paused: the pointer on it, focus in it, the window
 * or the page going away, a swipe, or a reason of your own.
 * @stable
 */
type ToastPauseReason = "item-hover" | "focus-in" | "window-blur" | "page-hide" | "swipe" | (string & {});
/** What a countdown needs to know about a toast. */
type TimedToast = {
    id: string;
    version: number;
    duration: number;
    held: boolean;
};
declare function createToastTimers(expire: (id: string) => unknown, now?: () => number): {
    /**
     * The toasts on screen now, and the ids still in the queue. Countdowns for
     * toasts that left the queue are dropped.
     */
    update(next: readonly TimedToast[], queued: Set<string>): void;
    /** Pauses every countdown for a reason, until that reason is cleared. */
    pause(reason: ToastPauseReason): void;
    /** Clears one reason. Countdowns resume once no reason is left. */
    resume(reason: ToastPauseReason): void;
    /** Whether anything pauses the countdowns now. */
    isPaused: () => boolean;
    /** The time a toast has left, in ms, for tests and devtools. */
    remaining(id: string): number | undefined;
    /** Stops every countdown, for when the region leaves the page. */
    destroy(): void;
};
export { createToastTimers, type TimedToast, type ToastPauseReason };
