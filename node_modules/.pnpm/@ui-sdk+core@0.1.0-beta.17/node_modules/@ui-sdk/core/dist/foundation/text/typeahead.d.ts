declare const normalize: (text: string) => string;
/**
 * Whether a key press types a character a typeahead should search for: one
 * printable character, without a shortcut modifier.
 * @stable
 */
declare function isTypeaheadKey(event: KeyboardEvent): boolean;
declare function textOf(el: Element): string;
/**
 * What a user would type to find an item: its text, with whitespace collapsed
 * as the page shows it, or its `aria-label` when it shows none, like an item
 * with only an icon. Skips text a user can't see, like shortcut hints marked
 * `aria-hidden`.
 * @stable
 */
declare function labelOf(el: HTMLElement): string;
/**
 * Typeahead as the WAI-ARIA Authoring Practices describe it for menus,
 * listboxes and trees: typed characters build a query that clears after
 * `timeout` ms, and the next item whose label starts with it is the match.
 * Pressing the same character again steps through the items that start with
 * it, unless a label starts with the repeated characters, like "Llama" for
 * "ll". Case and accents fold the way the user's language folds them.
 *
 * Returns `search(key, labels, current)`, which gives the index to focus or
 * -1, with `reset()` and `active()` (whether a query is in progress, so Space
 * continues it rather than activating).
 *
 * @example
 * const typeahead = createTypeahead()
 * // In a keydown handler:
 * if (isTypeaheadKey(event)) {
 *   const items = elements(context, "item")
 *   const index = typeahead(event.key, items.map((item) => labelOf(item.el)), current)
 *   if (index !== -1) items[index].el.focus()
 * }
 * @stable
 */
declare function createTypeahead(timeout?: number): ((key: string, labels: string[], current: number) => number) & {
    reset: () => void;
    active: () => boolean;
};
export { createTypeahead, isTypeaheadKey, labelOf, normalize, textOf };
