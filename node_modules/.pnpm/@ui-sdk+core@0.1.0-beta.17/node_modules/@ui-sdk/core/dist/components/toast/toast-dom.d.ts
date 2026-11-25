import type { SwipeDirection } from "./swipe.js";
declare function addToastStyles(doc: Document): void;
/**
 * Where a toast can be swiped to dismiss it: toward the edge its region sits
 * on, and toward the side it's aligned to. `start` and `end` follow the
 * writing direction.
 */
declare function swipeDirections(side: "top" | "bottom", align: "start" | "center" | "end", rtl: boolean): SwipeDirection[];
/**
 * The stacking variables for each shown toast, newest first: its position
 * (`index`), and how far the toasts in front of it reach when the stack is
 * expanded (`offset`, the sum of their heights). Closing toasts keep the
 * place they had, so the rest close up around them.
 */
declare function stackLayout(toasts: readonly {
    id: string;
    index: number;
    leaving: boolean;
}[], heights: Map<string, number>): {
    layout: Map<string, {
        index: number;
        offset: number;
    }>;
    total: number;
    front: number | undefined;
};
/**
 * A toast's border-box height with its content laid out freely, whatever
 * height the stack gives it, so the stack can animate between known heights.
 */
declare function naturalHeight(el: HTMLElement): number;
/**
 * Writes a height as a pixel variable. A toast with no layout, like one under
 * a hidden ancestor, has no height to measure, so its variables stay unset and
 * the page's own styles apply until it's laid out.
 */
declare function writeHeight(el: HTMLElement, name: string, height: number): void;
/**
 * Where focus goes when the focused toast closes: the next toast, else the
 * one before it, else back where it was before it entered the region. Never
 * the page's body.
 */
declare function focusAfterClose<T>(toasts: readonly T[], closing: T, fallback: T | undefined): T | undefined;
/**
 * Whether a press landed on selectable text, rather than around it. A mouse
 * drag that starts there selects the text, so it doesn't swipe.
 */
declare function pressedText(event: PointerEvent): boolean;
/**
 * Follows where the user's attention is for a region: the pointer over it
 * (touch doesn't hover), focus in it, and the window or page going away. A
 * window losing focus to an iframe on the page hasn't gone away. A page that's
 * hidden from the start reports it at once. Returns a cleanup.
 */
declare function watchAttention(el: HTMLElement, report: {
    hover: (hovered: boolean) => void;
    focus: (focused: boolean, from?: HTMLElement) => void;
    away: (reason: "window-blur" | "page-hide", away: boolean) => void;
}): () => void;
export { addToastStyles, focusAfterClose, naturalHeight, pressedText, stackLayout, swipeDirections, watchAttention, writeHeight, };
