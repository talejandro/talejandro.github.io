/**
 * A part that left the page while it held focus.
 * @stable
 */
type LostFocus<Props = any> = {
    /** The part's key. */
    key: string;
    /** The props of the part's last render. */
    props: Props;
    /** Its element, now out of the page or about to be. */
    el: HTMLElement;
};
/**
 * Keeps focus in a collection when the part that holds it leaves the page.
 * Call it once in `api`, and `bind` each part from its slot's `bind`. When
 * a bound part leaves with focus inside it, or focus fell to the page from
 * it, `fallback` names the element to focus instead, a microtask later, once
 * the framework is done removing. Nested parts work: focus belongs to the
 * innermost bound part around it.
 *
 * ```ts
 * const recovery = createFocusRecovery({
 *   fallback: (lost) => context.element("item", lost.props.parent),
 * })
 * // In the item slot:
 * bind: (el, part) => part.api.recovery.bind(el, part),
 * ```
 * @stable
 */
declare function createFocusRecovery<Props = any>(options: {
    /** The element to focus instead of a part that left with focus, or nothing to let focus go. */
    fallback: (lost: LostFocus<Props>) => HTMLElement | null | undefined;
}): {
    /** Tracks a bound part. Call it from the slot's `bind` and return its cleanup. */
    bind(el: HTMLElement, part: {
        key: string;
        props: Props;
    }): () => void;
};
/**
 * What `createFocusRecovery` returns.
 * @stable
 */
type FocusRecovery = ReturnType<typeof createFocusRecovery>;
export { createFocusRecovery, type FocusRecovery, type LostFocus };
