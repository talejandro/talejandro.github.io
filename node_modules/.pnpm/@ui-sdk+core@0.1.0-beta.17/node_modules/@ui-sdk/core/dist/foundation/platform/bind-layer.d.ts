/**
 * Why a layer of your own is asked to close.
 * @experimental
 */
type LayerDismissReason = "escape-key" | "outside-press" | "window-blur";
/**
 * Makes an element a layer in the stack our popups share, until the returned
 * cleanup runs. Escape goes to the topmost layer, so a menu opened from inside
 * yours closes first; a press outside every layer in a tree closes them from
 * the top; and modal ones keep presses from reaching the page. With
 * `topLayer`, the element joins the browser's top layer as a manual popover,
 * over dialogs and `overflow: hidden`, and you position it yourself. Popover
 * elements get the browser's own `[popover]` styles, so reset `inset`,
 * `margin`, `padding`, `border` and `background` in yours.
 *
 * ```ts
 * ring: slot({
 *   bind: (el, { api }) => bindLayer(el, { topLayer: true, onDismiss: (reason, event) => api.close(reason, event) }),
 * })
 * ```
 * @experimental
 */
declare function bindLayer(el: HTMLElement, options: {
    /** Runs when Escape, a press outside or the window losing focus asks the layer to close. */
    onDismiss: (reason: LayerDismissReason, event: Event) => void;
    /** Other elements that count as inside, like the trigger that opened it. */
    contains?: (target: Node) => boolean;
    /** Whether a press outside only closes the layer, without reaching the page beneath. Defaults to `false`. */
    modal?: boolean;
    /** Whether the element joins the browser's top layer. Defaults to `false`. */
    topLayer?: boolean;
    /** Whether the window losing focus closes it, like a click into an iframe. Defaults to `false`. */
    closeOnBlur?: boolean;
}): () => void;
export { bindLayer, type LayerDismissReason };
