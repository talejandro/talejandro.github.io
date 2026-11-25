/**
 * Where Shift ranges start, and what they add to.
 */
type RangeAnchor = {
    key: string;
    base: readonly string[];
};
/**
 * The keys from `from` to `to` in list order, both included, in either direction.
 */
declare function keysBetween(order: readonly string[], from: string, to: string): string[];
/**
 * The selection a Shift range makes: the anchor's base, unless the range
 * replaces the selection, plus every key between the anchor and `to` that can
 * be chosen. Set the anchor (`{ key, base: selection }`) on every choice made
 * without Shift, so extending a range again replaces the range, not the base,
 * like a file manager.
 */
declare function rangeSelection(order: readonly string[], anchor: RangeAnchor, to: string, { additive, selectable, }: {
    additive: boolean;
    selectable: (key: string) => boolean;
}): string[];
/**
 * The selection with `key` added, or removed when it's there, like Ctrl+Space.
 */
declare function toggledKeys(selected: readonly string[], key: string): string[];
/**
 * Every key that can be chosen, or none once they all are, like Ctrl+A pressed
 * twice. Keys that can't be chosen keep whatever state they had.
 */
declare function allToggled(selected: readonly string[], selectable: readonly string[]): string[];
/**
 * Whether two key lists hold the same keys in the same order, so an unchanged selection fires no change.
 */
declare function isSameKeys(a: readonly string[], b: readonly string[]): boolean;
export { allToggled, isSameKeys, keysBetween, type RangeAnchor, rangeSelection, toggledKeys, };
