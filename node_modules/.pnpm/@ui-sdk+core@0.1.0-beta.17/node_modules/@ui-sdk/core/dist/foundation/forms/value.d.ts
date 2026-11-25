type TextControl = HTMLInputElement | HTMLTextAreaElement;
/** What changed the value: typing, a write from code, or a form reset. */
type ValueSource = "input" | "write" | "reset";
declare function afterReset(event: Event, run: () => void): void;
declare function writeFromScript(el: Element, write: () => void): void;
declare function writingFromScript(el: Element): boolean;
/**
 * Writes a text control's value. From code by default, and only when it
 * differs: watchers hear a write, a framework's value tracker follows, and no
 * event fires, like for a hidden input that mirrors a component's value.
 * `asUser` writes it the way typing would: past the tracker, so a framework
 * sees a change, then `input` fires so frameworks, form libraries and fields
 * hear it.
 */
declare function writeValue(el: TextControl, value: string, options?: {
    asUser?: boolean;
}): void;
/**
 * Calls `listener` whenever the element's value may have changed: typing,
 * writes to `value` from code, and form resets. Returns a cleanup.
 */
declare function watchValue(el: TextControl, listener: (source: ValueSource) => void): () => void;
declare function keepsValueOnReset(value: unknown, defaultValue: unknown): boolean;
export { afterReset, keepsValueOnReset, type TextControl, type ValueSource, watchValue, writeFromScript, writeValue, writingFromScript, };
