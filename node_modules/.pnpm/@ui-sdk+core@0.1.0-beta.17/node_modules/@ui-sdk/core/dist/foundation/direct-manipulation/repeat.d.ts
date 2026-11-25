import { type HoldDetails, type HoldInput } from "./hold.js";
/**
 * What `bindRepeat`'s `onStep` receives.
 * @experimental
 */
type RepeatDetails = {
    /**
     * The event behind the step: the press's `pointerdown` or `keydown`, the
     * `pointerup` of a tap, or a `click`.
     */
    event: MouseEvent | KeyboardEvent;
    /**
     * What pressed. `click` is a click with no pointer press behind it, like a
     * screen reader's, Enter or Space when `keys` is empty, or `el.click()`.
     */
    input: HoldInput | "click";
    /** Which step of the press this is, starting at 1. */
    count: number;
};
/**
 * What `bindRepeat`'s `onEnd` receives.
 * @experimental
 */
type RepeatEndDetails = {
    /** The event that ended the press. */
    event: Event;
    /** What pressed. */
    input: HoldInput | "click";
    /** How many times the press stepped. */
    count: number;
};
/**
 * How `bindRepeat` treats a press.
 * @experimental
 */
type BindRepeatOptions = {
    /** How long a press lasts before it starts repeating, in milliseconds. @defaultValue 400 */
    delay?: number;
    /** How often it steps again while held, in milliseconds. @defaultValue 60 */
    repeat?: number;
    /**
     * The keys that press it while it has focus. An empty list leaves keys to
     * the browser, which clicks a button once per key press. @defaultValue [" ", "Enter"]
     */
    keys?: string[];
    /** Whether a press can't start, and a held one stops repeating. */
    disabled?: () => boolean;
    /** Runs as a press starts. Return `false` to ignore it. */
    onPress?: (details: HoldDetails) => boolean | void;
    /**
     * Runs once for each press, then every `repeat` milliseconds while it's
     * held. Return `false` to stop repeating, like at a bound.
     */
    onStep?: (details: RepeatDetails) => boolean | void;
    /** Runs once when a press ends, released or canceled, and after a click's step. */
    onEnd?: (details: RepeatEndDetails) => void;
};
declare function bindRepeatPresses(el: HTMLElement, options: BindRepeatOptions, onRefuse?: (press: HoldDetails) => void): () => void;
/**
 * Makes `el` step once when pressed, then keep stepping while held, like a
 * stepper's arrows or a remote's volume button. A mouse or a key steps as it
 * goes down. A finger or a pen steps on release, or once held, so a scroll
 * that starts on `el` never steps. Repeats wait while the pointer is off `el`
 * and go on when it comes back. A click with no press behind it steps once,
 * and the click that follows a press doesn't step again. Returns a cleanup.
 *
 * ```ts
 * bindRepeat(button, { onStep: () => zoomBy(5) })
 * ```
 * @experimental
 */
declare function bindRepeat(el: HTMLElement, options?: BindRepeatOptions): () => void;
export { bindRepeat, bindRepeatPresses, type BindRepeatOptions, type RepeatDetails, type RepeatEndDetails, };
