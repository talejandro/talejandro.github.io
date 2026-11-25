import { type ChangeSource } from "./details.js";
/**
 * What an action receives after its event.
 * @experimental
 */
type ActionDetails = {
    /**
     * How it was pressed, like `"mouse"`, `"keyboard"` or `"agent"`. When an
     * agent pressed it, a change the action makes after an `await` comes once
     * the press is over and reports `"programmatic"`. Wrap the change in
     * `withSource(source, ...)` from the `observe` entry and it reports `"agent"`.
     */
    source: ChangeSource;
};
declare const popupResult: <T extends object>(promise: T) => T;
declare const isPromise: (value: unknown) => value is PromiseLike<unknown>;
declare const canceledAction: unique symbol;
declare function runAction(action: (details: ActionDetails) => unknown, source: ChangeSource, handlers: {
    pending: (pending: boolean) => void;
    done: () => void;
    failed: (error: unknown) => void;
}): void;
declare function announcePending(context: {
    store: {
        subscribe: (listener: () => void) => () => void;
    };
    options: () => {
        pendingAnnouncement?: string;
    };
    onDestroy: (cleanup: () => void) => void;
}, isPending: () => boolean): void;
export { type ActionDetails, announcePending, canceledAction, isPromise, popupResult, runAction, };
