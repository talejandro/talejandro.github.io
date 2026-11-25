/**
 * What pressed: a pointer's type, or `keyboard` for a key.
 * @stable
 */
type HoldInput = "mouse" | "touch" | "pen" | "keyboard";
/**
 * What `bindHold`'s callbacks receive.
 * @stable
 */
type HoldDetails = {
    /** The event that started the press: its `pointerdown` or `keydown`. */
    event: PointerEvent | KeyboardEvent;
    /** What pressed. */
    input: HoldInput;
};
/**
 * What `bindHold` reports when a press ends.
 * @stable
 */
type HoldEndDetails = {
    /** The event that ended the press. */
    event: Event;
    /** What pressed. */
    input: HoldInput;
    /** Whether the press lasted past `delay`. */
    held: boolean;
    /**
     * Whether it ended without a release: the pointer moved past `tolerance`, a
     * finger started to scroll, Escape was pressed, or focus left the element or
     * the window. A canceled press doesn't click.
     */
    canceled: boolean;
};
/**
 * How `bindHold` treats a press.
 * @stable
 */
type BindHoldOptions = {
    /** How long a press lasts before it's held, in milliseconds. @defaultValue 500 */
    delay?: number;
    /**
     * Runs `onHold` again this often while held, in milliseconds, like a
     * stepper's button. Without it, `onHold` runs once.
     */
    repeat?: number;
    /**
     * How far a pointer can move before it's held, in pixels, before the press
     * is canceled, like when a finger starts to scroll. @defaultValue 10
     */
    tolerance?: number;
    /**
     * The keys that press it while it has focus. A short press clicks it, as a
     * pointer's does. An empty list leaves keys alone. @defaultValue [" ", "Enter"]
     */
    keys?: string[];
    /** Whether a press can't start, and a held one stops repeating. */
    disabled?: () => boolean;
    /** Runs as a press starts. Return `false` to ignore it, like a mouse press where only touch holds. */
    onPress?: (details: HoldDetails) => boolean | void;
    /**
     * Runs once the press is held, then every `repeat` milliseconds. Return
     * `false` to stop repeating, like at a bound; the press goes on until it ends.
     */
    onHold?: (details: HoldDetails & {
        count: number;
    }) => boolean | void;
    /** Runs once when the press ends, released or canceled. */
    onEnd?: (details: HoldEndDetails) => void;
};
/**
 * Makes `el` respond to a press that's held: after `delay`, `onHold` runs, and
 * runs again every `repeat` milliseconds when set. Works with a mouse, touch,
 * a pen, and Space or Enter while `el` has focus. Only a short press that's
 * released clicks, so a held button keeps its click; a held or canceled one doesn't.
 *
 * While pressed, `el` has `data-holding`, and `data-held` once held, and
 * `--hold-delay` is `delay`, so CSS can fill a hold-to-confirm button over it.
 * It turns off iOS's long-press callout on `el`, and the context menu a
 * long press opens while a finger or pen presses. Returns a cleanup that
 * stops a press under way without calling `onEnd`.
 *
 * ```ts
 * bindHold(button, {
 *   delay: 1000,
 *   onHold: () => deleteProject(),
 * })
 * ```
 * @stable
 */
declare function bindHold(el: HTMLElement, options?: BindHoldOptions): () => void;
export { bindHold, type BindHoldOptions, type HoldDetails, type HoldEndDetails, type HoldInput, };
