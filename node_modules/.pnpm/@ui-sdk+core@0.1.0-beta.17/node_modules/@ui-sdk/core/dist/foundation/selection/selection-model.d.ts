import type { PrimitiveContext, ReasonFor } from "../kernel/primitive-types.js";
type Why<Reason extends string> = {
    reason: Reason;
    event?: Event;
};
declare function createKeySelection<Reason extends string>(config: {
    keys: () => readonly string[];
    set: (keys: string[], why: Why<Reason>) => boolean;
    order: () => readonly string[];
    selectable: (key: string) => boolean;
}): {
    toggle(key: string, why: Why<Reason>): void;
    replace(key: string, why: Why<Reason>): void;
    extend(to: string, { from, additive }: {
        from: string | null;
        additive: boolean;
    }, why: Why<Reason>): void;
    toggleAll(why: Why<Reason>): void;
    anchor: () => string | null;
    setAnchor(key: string | null): void;
    resetAnchor(): void;
};
/**
 * How `createSelection` reads and changes a selection.
 * @stable
 */
type SelectionOptions<Key extends string, Reason extends string> = {
    /** The state key that holds the selected keys, a `string[]`. */
    key: Key;
    /**
     * Asks for a new selection and returns whether it went through. Pass the
     * primitive's change, so `on<Key>Change`, `cancel()` and controlled values
     * work: `set: (value, details) => change("value", value, details)`.
     */
    set: (value: string[], details: Why<Reason>) => boolean;
    /** Every key in list order, for ranges and select all, like the visible items' keys. */
    order: () => readonly string[];
    /** Whether more than one item can be selected. Defaults to `false`. */
    multiple?: () => boolean;
    /** Whether a key can be chosen, toggled, or added to a range. Replacing the selection can still remove it. Defaults to every item. */
    selectable?: (key: string) => boolean;
};
/**
 * The selection rules of a listbox, for any collection whose selection is a
 * `string[]` in state: `choose` selects one item, `toggle` adds or removes one
 * (Ctrl+click, Space), `extend` selects a Shift range from the anchor, and
 * `toggleAll` is Ctrl+A. Every choice without Shift moves the anchor. A
 * selection set from outside, like a controlled value or a controller, starts
 * ranges over. In single mode, `toggle` unselects the selected item, and
 * `extend` and `toggleAll` choose.
 *
 * ```ts
 * const change = createChange(context)
 * const selection = createSelection(context, {
 *   key: "value",
 *   set: (value, details) => change("value", value, details),
 *   order: () => roving.items().map((item) => item.key),
 *   multiple: () => !!context.options().multiple,
 * })
 * selection.extend(key, { reason: "item-press", event })
 * ```
 * @stable
 */
declare function createSelection<Options, State extends object, Key extends keyof State & string, Reason extends string = ReasonFor<Options, Key>>(context: Pick<PrimitiveContext<Options, State, any>, "store" | "options" | "onDestroy">, options: SelectionOptions<Key, Reason>): {
    /** Whether an item is selected. */
    isSelected: (key: string) => boolean;
    /** Selects only this item, and starts the next range there. */
    choose: (key: string, why: Why<Reason>) => void;
    /** Adds or removes one item, and starts the next range there. In single mode, selects it or clears it. */
    toggle(key: string, why: Why<Reason>): void;
    /**
     * Selects the range from the anchor to `key`, keeping what was selected
     * when the anchor was set. Without an anchor, the range starts at `from`,
     * like the item focus was on. `additive: false` drops what was selected
     * before. In single mode, chooses `key`.
     */
    extend(key: string, why: Why<Reason> & {
        from?: string | null;
        additive?: boolean;
    }): void;
    /** Selects every selectable item in `order`, or none once they all are, like Ctrl+A. Only in multiple mode. */
    toggleAll(why: Why<Reason>): void;
    /** The key ranges start from, or `null`. */
    anchor: () => string | null;
    /**
     * Starts the next range at `key` without changing the selection, like when
     * arrow keys move focus but don't select. The range keeps what's selected now. `null` clears it.
     */
    setAnchor: (key: string | null) => void;
};
/**
 * What `createSelection` returns.
 * @stable
 */
type SelectionModel = ReturnType<typeof createSelection>;
export { createKeySelection, createSelection, type SelectionModel, type SelectionOptions, };
