import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * An item of a roving group, as the group's callbacks see it.
 * @stable
 */
type RovingFocusItem<Props = any> = {
    /** The part's key: its `id`, else its `value`. */
    key: string;
    /** The props of the part's newest render. */
    props: Props;
};
/**
 * Which arrows move focus in a roving group: Up and Down, or Left and Right.
 * @stable
 */
type RovingOrientation = "horizontal" | "vertical";
/**
 * What a custom `move` gets besides the event.
 * @stable
 */
type RovingFocusMoveContext<Props = any> = {
    /** The item focus is on. */
    from: RovingFocusItem<Props> & {
        el: HTMLElement;
    };
    /** The items that can take focus now, in document order. */
    items: readonly (RovingFocusItem<Props> & {
        el: HTMLElement;
    })[];
    /** Whether the item is laid out right to left, so Left and Right swap. */
    rtl: boolean;
};
/**
 * How a roving group decides its tab stop and moves focus.
 * @stable
 */
type RovingFocusOptions<State extends object, Props = any> = {
    /** The slot whose parts are the group's items. Each joins in the slot's `bind` with `roving.bind(el, part)`. */
    slot: string;
    /** The state key that holds the key of the item with the tab stop. Start it at `null`, and set it back to `null` to forget the item focused last. */
    key: keyof State & string;
    /** Which arrows move focus when there's no `move`: Up and Down, Left and Right, or `"both"` for all four, like a rating. Defaults to `"vertical"`. */
    orientation?: () => RovingOrientation | "both";
    /** Whether moving past either end wraps around. Defaults to `false`. */
    loop?: () => boolean;
    /** Whether the item focused last keeps the stop, like a toolbar, rather than the preferred one, like tabs. Defaults to `true`. */
    remember?: boolean;
    /** Whether an item can't be activated. Enabled items take the stop first; disabled ones can still take focus. */
    disabled?: (item: RovingFocusItem<Props>) => boolean;
    /** Whether an item can take focus now. An item that can't stays in the group and is skipped, like a tree item under a collapsed branch. Defaults to every item. */
    focusable?: (item: RovingFocusItem<Props>) => boolean;
    /** Whether an item takes the stop before focus has been in the group: the selected tab, the checked radio. */
    preferred?: (item: RovingFocusItem<Props>) => boolean;
    /**
     * Whether an item rendering before any item binds, like on the server, may
     * hold the stop. The first such item does, so server markup has exactly one
     * stop. Defaults to enabled and focusable items. Pass it when the stop
     * should start on a selected item, like
     * `(state, item) => state.value === null || item.key === state.value`.
     */
    claims?: (state: State, item: RovingFocusItem<Props>) => boolean;
    /**
     * The key focus moves to for a key press, or `undefined` to leave the press
     * alone. Replaces the default, which moves along `orientation` with the
     * arrows, Home and End. Use it for any other shape: a tree's visible order,
     * or a grid's rows. Shift is never swallowed, so a list can extend a range.
     * The key may be one that isn't rendered or focusable yet, like the first
     * day of next month in a calendar: the stop moves to it at once, and focus
     * follows when its item can take it, as long as focus is still where the
     * press left it.
     */
    move?: (event: KeyboardEvent, context: RovingFocusMoveContext<Props>) => string | undefined;
    /** Runs once after items join or leave, however many did, once the stop has moved to where the rules put it. */
    onItemsChange?: () => void;
};
declare function createClaim(): (key: string, eligible: boolean) => boolean;
/**
 * One tab stop for a slot's parts, and arrow keys between them, as the
 * WAI-ARIA practices ask of toolbars, listboxes, trees and grids. Call it once
 * in `api`, keep it on the api for the slots, and wire the item slot:
 *
 * ```ts
 * item: slot({
 *   selects: selects({ focused: ({ key }) => [key, null] }),
 *   attrs: (state, part) => ({ tabindex: part.api.roving.tabIndex(state, part) }),
 *   on: { keydown: (event, { el, api }) => api.roving.keydown(event, el!) },
 *   bind: (el, part) => part.api.roving.bind(el, part),
 * })
 * ```
 *
 * The stop lives in state under `key`, so it renders on the server and
 * hydrates: before items bind, the first item `claims` allows holds it. Once
 * they bind, the stop goes to the item focused last (with `remember`), else
 * the first preferred enabled item, else the first enabled one.
 * @stable
 */
declare function createRovingFocus<State extends object, Props = any>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: RovingFocusOptions<State, Props>): {
    /** Joins a bound part to the group. Call it from the item slot's `bind` and return its cleanup. */
    bind(el: HTMLElement, part: RovingFocusItem<Props>): () => void;
    /** The item's `tabindex`: `"0"` for the item with the stop, `"-1"` for the rest. Pure, so `attrs` can call it. */
    tabIndex(state: State, part: RovingFocusItem<Props>): "0" | "-1";
    /**
     * Moves focus for a key pressed on an item's element. Returns the key it
     * moved to, the key it moved from and whether Shift was held, so the
     * caller can extend a selection, or `undefined` when the key isn't the
     * group's. At either end without `loop`, `key` is `from`.
     */
    keydown(event: KeyboardEvent, el: HTMLElement): {
        key: string;
        from: string;
        shift: boolean;
    } | undefined;
    /** The items that can take focus now, in document order, with their elements. */
    items: () => {
        key: string;
        props: Props;
        el: HTMLElement;
    }[];
    /**
     * Focuses an item, or the one with the stop, or the first. An item that
     * isn't rendered or focusable yet takes the stop now and focus once it can.
     */
    focus(itemKey?: string): void;
    /**
     * Moves the stop to an item as if focus had landed on it, for an item
     * whose focus went elsewhere, like a menubar trigger whose menu took it.
     * A group that doesn't `remember` ignores it, since its stop follows the
     * preferred item.
     */
    remember(itemKey: string): void;
    /** Moves the stop to where the group's rules put it now. It also runs on its own after items join or leave and after state changes. */
    check: () => void;
    /**
     * Where the group's rules would put the stop if `preferred` said which
     * items are preferred, like the tab a value from options selects, without
     * moving it. Undefined while the bound items can't decide it, like when
     * none is preferred yet: the item may be about to bind, as when its value
     * changed, and the group decides once it has.
     */
    stopFor: (preferred: (item: RovingFocusItem<Props>) => boolean) => string | undefined;
};
/**
 * What `createRovingFocus` returns.
 * @stable
 */
type RovingFocus = ReturnType<typeof createRovingFocus>;
export { createClaim, createRovingFocus, type RovingFocus, type RovingFocusItem, type RovingFocusMoveContext, type RovingFocusOptions, type RovingOrientation, };
