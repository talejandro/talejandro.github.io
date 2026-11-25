/**
 * Starts tracking input, so later changes can tell how they were caused. A
 * microtask later, before any key or pointer press can come, so a primitive
 * that calls it as it's made reads no `document` then, as on a server. Safe
 * to call often.
 */
declare function trackInput(): void;
/**
 * How an event came about: a mouse, a finger, a pen or the keyboard. A click
 * with no pointer or key behind it is `"virtual"`, which may be assistive
 * technology. An event a script dispatched, like `el.click()`, is `"programmatic"`.
 * Without an event, how the user is working now, by their last key or pointer
 * press: `sourceOf() === "keyboard"` while they use the keyboard.
 * @stable
 */
declare function sourceOf(event?: Event): "mouse" | "touch" | "pen" | "keyboard" | "virtual" | "programmatic";
/**
 * Whether the focus that just moved came from the keyboard, rather than a
 * pointer, a popup moving it in or back, or the window getting focus back.
 * @stable
 */
declare function isFocusFromKeyboard(): boolean;
declare function restoreFocus(el: HTMLElement): void;
declare function moveFocus(el: HTMLElement): void;
declare const modalityOf: (opener: string) => "keyboard" | "pointer";
declare function trackModality(el: HTMLElement, initial: "keyboard" | "pointer", keys?: () => (HTMLElement | undefined)[]): () => void;
export { isFocusFromKeyboard, modalityOf, moveFocus, restoreFocus, sourceOf, trackInput, trackModality, };
