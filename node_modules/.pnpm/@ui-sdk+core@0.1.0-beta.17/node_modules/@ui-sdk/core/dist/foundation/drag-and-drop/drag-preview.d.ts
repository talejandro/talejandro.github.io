/**
 * Shows a copy of `el` over the page, in the top layer where the browser
 * has one, at `el`'s place, and moves it with the pointer from the point
 * the drag started at. The copy has `data-drag-preview`, is hidden from
 * screen readers and from pointer hit testing, and has no ids.
 *
 * ```ts
 * const preview = bindDragPreview(el, { x: event.clientX, y: event.clientY })
 * // onMove: preview.move(x, y)
 * // onEnd: preview.remove()
 * ```
 * @experimental
 */
declare function bindDragPreview(el: HTMLElement, from: {
    x: number;
    y: number;
}): {
    /** The copy, for styles a drag sets as it goes. */
    el: HTMLElement;
    /** Moves the copy as far as the pointer moved from where the drag started. */
    move(x: number, y: number): void;
    /** Takes the copy out of the page. */
    remove(): void;
};
/**
 * What `bindDragPreview` returns.
 * @experimental
 */
type DragPreview = ReturnType<typeof bindDragPreview>;
export { bindDragPreview, type DragPreview };
