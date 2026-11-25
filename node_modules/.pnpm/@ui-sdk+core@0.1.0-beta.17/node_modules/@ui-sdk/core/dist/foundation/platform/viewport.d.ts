/**
 * What `bindViewport` reports, in CSS pixels.
 * @experimental
 */
type ViewportState = {
    /** The on-screen keyboard's height while a field has focus, zoomed in or not. 0 without one. */
    keyboard: number;
    /** How much of the layout viewport's bottom the keyboard covers: less while iOS pans the page, and 0 when the browser resizes the page instead. */
    keyboardInset: number;
    /** The visual viewport's width: what's on screen. */
    width: number;
    /** The visual viewport's height: what's on screen, above the keyboard. */
    height: number;
    /** How far the visual viewport is scrolled down the layout viewport, like when iOS pans a focused field into view. */
    offsetTop: number;
    /** How far the visual viewport is scrolled across the layout viewport. */
    offsetLeft: number;
    /** The pinch-zoom scale, 1 when not zoomed. */
    scale: number;
    /** The safe-area insets around a notch, rounded corners or a home indicator. All 0 without `viewport-fit=cover`. */
    safeArea: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
};
/**
 * Follows the viewport on `el`: `--keyboard-inset`, `--visual-viewport-width`,
 * `--visual-viewport-height` and `--visual-viewport-top`, plus `data-keyboard`
 * while the keyboard covers part of the page. `onChange` hears every change,
 * and once at the start. Returns a cleanup that removes what it wrote.
 * @experimental
 */
declare function bindViewport(el: HTMLElement, { onChange }?: {
    onChange?: (viewport: ViewportState) => void;
}): () => void;
/**
 * Keeps `el` above the on-screen keyboard, like a chat composer or a toolbar
 * at the bottom of the screen: while the keyboard is open, it lifts `el` by as
 * much of it as lies below what's on screen, through its `translate`, and sets
 * `data-keyboard`. Its own translate stays, percentages too, like a toolbar
 * centered with `-50%`. An element below the layout viewport stays put, and
 * scrolling the page or a container around `el` measures it again. Returns a
 * cleanup that puts `el`'s own `translate` back.
 * @experimental
 */
declare function bindAvoidKeyboard(el: HTMLElement): () => void;
export { bindAvoidKeyboard, bindViewport, type ViewportState };
