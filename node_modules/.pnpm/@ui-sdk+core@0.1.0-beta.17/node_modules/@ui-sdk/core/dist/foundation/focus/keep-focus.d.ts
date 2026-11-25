/**
 * Focuses the element `element()` returns if focus fell to the page, or
 * sits where it can't stay or on an ancestor of the element, a microtask and
 * a task from now. A focused element that a framework moves,
 * or renders as a new element in another place, loses focus: React puts it
 * back after its commit, plain DOM code doesn't, and other frameworks render
 * a microtask later, or a task later. Call it after a keyboard move.
 * @stable
 */
declare function keepFocus(element: () => HTMLElement | undefined): void;
export { keepFocus };
