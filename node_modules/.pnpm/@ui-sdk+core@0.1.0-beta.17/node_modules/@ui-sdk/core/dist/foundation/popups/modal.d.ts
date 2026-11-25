/**
 * Stops the page from scrolling while a modal is open. The first lock on a
 * document freezes its scroller and the last release unfreezes it. On iOS,
 * `modal` also gets touch scrolling of its own contained, so a drag never
 * scrolls the page behind it. Returns a release that is safe to call twice.
 */
declare function lockScroll(doc?: Document, modal?: HTMLElement): () => void;
declare function scrollLockStyles({ scrollbar, gutter, padding, }: {
    scrollbar: number;
    gutter: boolean;
    padding: number;
}): Record<string, string>;
/**
 * Measures the document's scroller for a scroll lock later in the same task.
 * A dialog calls it as it starts to open, before the framework renders it.
 * Layout is still clean then, so the read is free. Read after the dialog was
 * inserted and the page made inert, it makes the browser lay out the whole
 * page in the middle of the task, on top of the layout the next frame does.
 */
declare function measureScrollerEarly(doc: Document): void;
/**
 * Who a touch gesture belongs to, decided once, when a finger lands.
 * `"browser"`: a pinch, or panning a zoomed page. `"element"`: something under
 * the finger moves on its own, like a scrolling list, a slider or a text
 * selection. `"page"`: nothing does, so the drag would scroll the page behind
 * the modal, and it's stopped.
 */
declare function touchOwner(start: {
    fingers: number;
    zoomed: boolean;
    scroller: boolean;
    slider: boolean;
    selecting: boolean;
}): "browser" | "element" | "page";
declare function inertOutside(keep: HTMLElement[]): (() => void) & {
    keep(el: HTMLElement): () => void;
};
export { inertOutside, lockScroll, measureScrollerEarly, scrollLockStyles, touchOwner, };
