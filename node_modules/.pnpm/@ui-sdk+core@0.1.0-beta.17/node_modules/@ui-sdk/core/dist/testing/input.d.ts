/**
 * Waits for what a component schedules after rendering or an event: microtasks,
 * a timer and two frames. A tooltip's name and focus moving into a menu that
 * opened on a press both arrive this way. `mount`'s `view.settle()` is the same.
 *
 * @example
 * await user.click(screen.getByRole("button", { name: "Options" }))
 * await act(settle)
 * await checkPattern(screen.getByRole("menu"), "menu")
 *
 * @experimental
 */
declare function settle(): Promise<void>;
/**
 * Presses keys one after another on the focused element, like `keys("Tab", "ArrowDown", "Enter")`.
 * Tab from outside `scope` goes into it.
 */
declare function keys(doc: Document, names: string[], scope?: Element): Promise<void>;
/** Types text into the focused element, a key per character. */
declare const type: (doc: Document, text: string) => Promise<void>;
/**
 * Clicks an element with a mouse: down, focus, up, then click. A disabled form
 * control, by itself or a fieldset, gets the pointer events and nothing else, as in browsers.
 */
declare function click(el: Element): Promise<void>;
/** Moves a mouse onto an element, like resting on a trigger. */
declare function hover(el: Element): Promise<void>;
/**
 * Drags an element with a mouse onto another, or by a distance: down, moves
 * past the drag threshold in steps, then up where it ends.
 */
declare function drag(el: Element, target: {
    to: Element;
} | {
    by: {
        x: number;
        y: number;
    };
}): Promise<void>;
export { click, drag, hover, keys, settle, type };
