declare function isTabbable(el: Element): el is HTMLElement;
declare function radioGroup(el: Element): HTMLInputElement[];
declare function tabbables(root: ParentNode): HTMLElement[];
declare function composedTabbables(root: ParentNode): HTMLElement[];
declare function positiveTabStops(stops: HTMLElement[], root: Element): HTMLElement[];
declare function nextTabbable(node: Node, skip?: Element): HTMLElement | undefined;
declare const focusables = "a[href],button,input:not([type=\"hidden\"]),select,textarea,iframe,summary,[contenteditable]:not([contenteditable=\"false\"]),[tabindex]";
/**
 * Makes `el` a tab stop while `wanted()` holds and nothing inside it can take
 * focus, so keyboard users can still reach and scroll content without
 * controls, as axe's scrollable-region-focusable asks. It checks again when
 * focusable content comes or goes, looking at the whole subtree only when
 * something may have stopped taking focus, so streaming text costs little.
 * Call `check` after anything else `wanted` reads changes. A `tabindex` the
 * author wrote is theirs and stays.
 */
declare function bindTabStop(el: HTMLElement, wanted: () => boolean, { skipWhenHolding, }?: {
    skipWhenHolding?: boolean;
}): {
    check: () => void;
    stop: () => void;
};
export { bindTabStop, composedTabbables, focusables, isTabbable, nextTabbable, positiveTabStops, radioGroup, tabbables, };
