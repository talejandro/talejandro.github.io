import { type DismissAttemptDetails, type DismissAttemptReason } from "../kernel/details.js";
/** The options a dismissable layer takes, for the dismissals its `Reason` lists. */
type DismissOptions<Reason extends string> = {
    /**
     * Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a
     * sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false`
     * while it holds unsaved work, and ask in `onDismissAttempt`.
     * @defaultValue true
     */
    dismissible?: boolean;
    /**
     * Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or
     * a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
     */
    onDismissAttempt?: (details: DismissAttemptDetails<Extract<Reason, DismissAttemptReason>>) => void;
};
/**
 * How a close is refused: `"attempt"` refuses it and tells `onDismissAttempt`
 * when someone tried on purpose, and `"silent"` refuses it without a word.
 */
type Refusal = "attempt" | "silent";
/** What a layer refuses beyond `dismissible`, like Dialog's closes while an action runs. */
type DismissRules = {
    /** How a close is refused, or undefined to leave it to `dismissible`. */
    refusal?: (reason: string) => Refusal | undefined;
    /** Runs after `onDismissAttempt` heard a refused attempt, like a sheet nudging. */
    refused?: (reason: DismissAttemptReason) => void;
};
/**
 * The dismissal policy of a layer, from its options and any rules of its own.
 * `allows(reason, event)` decides a close, and `sheet` is what its sheet
 * presentation takes.
 */
declare function createDismissal(options: () => {
    dismissible?: boolean;
    onDismissAttempt?: (details: never) => void;
}, rules?: DismissRules): {
    allows(reason: string, event?: Event): boolean;
    sheet: {
        dismissible: () => boolean;
        onDismissAttempt: (event?: Event) => void | undefined;
    };
};
export { createDismissal, type DismissOptions, type DismissRules, type Refusal };
