import type { PrimitiveContext } from "../kernel/primitive-types.js";
import { type AutoScrollOptions } from "./auto-scroll.js";
/**
 * The item being moved and the order it's in now, kept in state under `ReorderOptions.draft`.
 * @stable
 */
type ReorderDraft = {
    /** The key of the item picked up. */
    key: string;
    /** Every key moving together, in list order, the picked-up item included. */
    keys: string[];
    /** Every key in the order the list shows now, the moving items included. */
    order: string[];
    /** Whether a pointer is dragging it, rather than the keyboard moving it. */
    pointer: boolean;
};
/**
 * What happened, for the message screen readers hear.
 * @stable
 */
type ReorderMessage = {
    /** `grab` when an item is picked up, `move` for each step, `drop` when it lands, `cancel` when it goes back. */
    type: "grab" | "move" | "drop" | "cancel";
    /** The item's key. */
    key: string;
    /** What the item is called, from `label`, else its text. */
    label: string;
    /** How many items move together. */
    count: number;
    /** Its position now, from 1. */
    position: number;
    /** How many items the list has. */
    total: number;
};
/**
 * Why an order changed: a pointer drag, a keyboard move, or a call from code.
 * @stable
 */
type ReorderReason = "drag" | "move-key" | "imperative";
/**
 * How `createReorder` reads, renders and changes an order.
 * @stable
 */
type ReorderOptions<State extends object, Props = any> = {
    /** The slot whose parts are the items. Each joins in the slot's `bind` with `reorder.bind(el, part)`. */
    slot: string;
    /** The state key that holds the order, a `string[]` of item keys. */
    key: keyof State & string;
    /** The state key that holds the `ReorderDraft` while an item moves. Start it at `null`. */
    draft: keyof State & string;
    /**
     * Asks for a new order and returns whether it went through. Pass the
     * primitive's change, so `on<Key>Change`, `cancel()` and controlled values
     * work: `set: (value, details) => change("value", value, details)`.
     */
    set: (value: string[], details: {
        reason: ReorderReason;
        event?: Event;
    }) => boolean;
    /**
     * Whether the items run top to bottom, along a line, or wrap in rows like a
     * grid of photos, which picks the arrows and how a drag finds its place.
     * Defaults to `"vertical"`.
     */
    orientation?: () => ReorderOrientation;
    /** The keys that move with the one picked up, like the selection when it holds it. Defaults to that one key. */
    group?: (key: string) => string[];
    /**
     * Drags a copy of the item above the page while the item itself shows
     * where it would drop, so a list that scrolls neither clips it nor grows
     * under it. A drag near a scroller's edge scrolls it. Defaults to `false`.
     */
    preview?: boolean;
    /** How a drag with `preview` near a scroller's edge scrolls it, or `false` not to. */
    createAutoScroll?: Omit<AutoScrollOptions, "onScroll" | "ignore"> | false;
    /** Whether an item can't be picked up. It still moves aside for others. */
    disabled?: (item: {
        key: string;
        props: Props;
    }) => boolean;
    /** The name screen readers hear for an item. Return `undefined` for the default, its text. */
    label?: (key: string) => string | undefined;
    /** The text screen readers hear for each step. Defaults to English. */
    message?: (message: ReorderMessage) => string;
};
/**
 * How the items of a reorderable list run.
 * @stable
 */
type ReorderOrientation = "horizontal" | "vertical" | "grid";
/**
 * The English messages `createReorder` announces unless you pass `message`.
 * @stable
 */
declare function reorderMessage({ type, label: name, count, position, total, }: ReorderMessage): string;
declare function dropIndex(middles: readonly number[], pointer: number, { reversed }?: {
    reversed?: boolean;
}): number;
declare function gridDropIndex(rects: readonly {
    left: number;
    top: number;
    right: number;
    bottom: number;
}[], point: {
    x: number;
    y: number;
}, { reversed }?: {
    reversed?: boolean;
}): number;
declare function columnsOf(tops: readonly number[]): number;
declare function movedTo(order: readonly string[], key: string | readonly string[], index: number): string[];
/**
 * Lets users reorder a slot's parts by dragging them and with the keyboard.
 * The moving item and its order live in state under `draft`, so the list
 * renders the order as it changes; only dropping commits it through `set`,
 * and screen readers hear each step through `announce`. Call it once in
 * `api`, keep it on the api, render the items in `reorder.order(state)`,
 * and wire the item slot:
 *
 * ```ts
 * item: slot<{ value: string }>({
 *   on: {
 *     keydown: (event, { el, api, key }) => api.reorder.keydown(event, key) || api.roving.keydown(event, el!),
 *     pointerdown: (event, { api, key }) => api.reorder.pointerdown(event, key),
 *   },
 *   bind: (el, part) => part.api.reorder.bind(el, part),
 * })
 * ```
 *
 * While a pointer drags an item, its element gets `--drag-x` and `--drag-y`,
 * how far to translate it so it stays under the pointer as the list reorders
 * around it. Wire `pointerdown` on a handle part instead, with the item's
 * key, to drag by a handle.
 * @stable
 */
declare function createReorder<State extends object, Props = any>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: ReorderOptions<State, Props>): {
    /** Joins a bound part to the list. Call it from the item slot's `bind` and return its cleanup. */
    bind(el: HTMLElement, part: {
        key: string;
        props: Props;
    }): () => void;
    /** The order to render: the draft's while an item moves, else the value. Pure, so `state` and `attrs` can call it. */
    order(state: State): string[];
    /** Whether an item is picked up, by itself or with its group. */
    moving(state: State, key: string): boolean;
    /** Whether a pointer is dragging the item, by itself or with its group. */
    dragging(state: State, key: string): boolean;
    /**
     * Handles a key pressed on an item and returns whether it did. Space or
     * Enter picks the item up; while it's up, arrows, Home and End move it,
     * Space or Enter drops it, Escape puts it back and Tab puts it back and
     * moves on. Every other key is swallowed while an item is up, so pass
     * keys on only when this returns `false`.
     */
    keydown(event: KeyboardEvent, key: string): boolean;
    /** Starts a pointer drag of an item once the pointer moves a few pixels, so a click stays a click. */
    pointerdown: (event: PointerEvent, key: string) => void;
    /** Picks an item up, as Space does. Returns whether it did. */
    grab: (key: string) => boolean;
    /** Moves the picked-up item to `index` in the draft, counting from 0. */
    moveTo: (index: number) => void;
    /** Drops the picked-up item where it is, committing the draft. */
    drop: (event?: Event) => void;
    /** Puts the picked-up item back where it was. */
    cancel: () => void;
    /** Moves an item to `index` at once, like a "Move to top" menu item. Returns whether it went through. */
    move(key: string, index: number): boolean;
};
/**
 * What `createReorder` returns.
 * @stable
 */
type Reorder = ReturnType<typeof createReorder>;
export { columnsOf, createReorder, dropIndex, gridDropIndex, movedTo, type Reorder, type ReorderDraft, reorderMessage, type ReorderMessage, type ReorderOptions, type ReorderOrientation, type ReorderReason, };
