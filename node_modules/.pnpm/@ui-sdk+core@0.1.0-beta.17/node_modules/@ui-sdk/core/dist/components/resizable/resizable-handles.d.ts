/** A handle as the page sees it. */
type HandleTarget = {
    el: HTMLElement;
    root: () => HTMLElement | undefined;
    axis: () => "x" | "y" | null;
    cursor: () => string;
    start: (event: PointerEvent) => void;
    hover: (hovered: boolean) => void;
};
/** Makes a handle findable by presses and hovers near it. Returns the cleanup. */
declare function registerHandle(target: HandleTarget): () => void;
/** Ends a handle's drag in the page's eyes: its cursor and the drag styles go. */
declare function releaseHandle(target: HandleTarget): void;
/** The cursor may have changed, like at a limit. */
declare const refreshCursor: (doc: Document) => void;
export { type HandleTarget, refreshCursor, registerHandle, releaseHandle };
