declare function keyboardHeight(view: Window): (size: ViewportSize, event?: Event) => number;
declare function keyboardInset(view: Window, size: ViewportSize, keyboard: number): number;
declare function trackKeyboard(el: HTMLElement, onChange?: {
    before: () => void;
    after: () => void;
}): () => void;
type ViewportSize = {
    width: number;
    layoutHeight: number;
    height: number;
    offsetTop: number;
    scale: number;
};
declare function measureViewport(view: Window, viewport: VisualViewport): {
    width: number;
    layoutHeight: number;
    height: number;
    offsetTop: number;
    scale: number;
};
type ViewportFollower = (size: ViewportSize, event: Event) => void;
declare function followViewport(view: Window, viewport: VisualViewport, follower: ViewportFollower): () => void;
/**
 * Measures the viewport for `trackKeyboard` later in the same task. Like
 * `measureScrollerEarly`: a dialog calls it as it starts to open, while
 * reading layout is free, instead of after it rendered and locked the page.
 */
declare function measureViewportEarly(view: Window | null | undefined): void;
export { followViewport, keyboardHeight, keyboardInset, measureViewport, measureViewportEarly, trackKeyboard, type ViewportSize, };
