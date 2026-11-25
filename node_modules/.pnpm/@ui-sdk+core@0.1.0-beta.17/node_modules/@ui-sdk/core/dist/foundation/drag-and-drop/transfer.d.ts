import type { PrimitiveContext } from "../kernel/primitive-types.js";
import { type AutoScrollOptions } from "./auto-scroll.js";
/**
 * Every list's item keys, in order, by the list's key.
 * @experimental
 */
type TransferLists = Record<string, string[]>;
/**
 * The item being moved and where every item is now, kept in state under `TransferOptions.draft`.
 * @experimental
 */
type TransferDraft = {
    /** The key of the item being moved. */
    key: string;
    /** The list it started in. */
    from: string;
    /** Every list as it shows now, the moving item included. */
    lists: TransferLists;
    /** Whether a pointer is dragging it, rather than the keyboard moving it. */
    pointer: boolean;
};
/**
 * Why the lists changed: a pointer drag, a keyboard move, or a call from code.
 * @experimental
 */
type TransferReason = "drag" | "move-key" | "imperative";
/**
 * What happened, for the message screen readers hear.
 * @experimental
 */
type TransferMessage = {
    /** `grab` when an item is picked up, `move` for each step, `drop` when it lands, `cancel` when it goes back. */
    type: "grab" | "move" | "drop" | "cancel";
    /** The item's key. */
    key: string;
    /** What the item is called, from `label`, else its text. */
    label: string;
    /** What the list it's in is called, from `listLabel`, else its key. */
    list: string;
    /** Its position in that list, from 1. */
    position: number;
    /** How many items that list has. */
    total: number;
};
/**
 * How `createTransfer` reads, renders and changes the lists.
 * @experimental
 */
type TransferOptions<State extends object> = {
    /** The state key that holds every list, a `TransferLists`. */
    key: keyof State & string;
    /** The state key that holds the `TransferDraft` while an item moves. Start it at `null`. */
    draft: keyof State & string;
    /**
     * Asks for the new lists and returns whether they went through. Pass the
     * primitive's change: `set: (value, details) => change("lists", value, details)`.
     * `details` says what moved, from where to where.
     */
    set: (value: TransferLists, details: {
        reason: TransferReason;
        event?: Event;
        key: string;
        from: string;
        to: string;
        index: number;
    }) => boolean;
    /** The lists in the order Left and Right go through them. Defaults to the order of the value's keys. */
    order?: () => string[];
    /** Whether a list takes an item, like a column at its limit. Lists that don't are skipped. */
    accepts?: (key: string, list: string) => boolean;
    /** Whether an item can't be picked up. */
    disabled?: (key: string) => boolean;
    /** The name screen readers hear for an item. Defaults to its text. */
    label?: (key: string) => string | undefined;
    /** The name screen readers hear for a list. Defaults to its key. */
    listLabel?: (list: string) => string | undefined;
    /** The text screen readers hear for each step. Defaults to English. */
    message?: (message: TransferMessage) => string;
    /** How a drag near a scroller's edge scrolls it, or `false` not to. */
    createAutoScroll?: Omit<AutoScrollOptions, "onScroll" | "ignore"> | false;
};
/**
 * The English messages `createTransfer` announces unless you pass `message`.
 * @experimental
 */
declare function transferMessage({ type, label, list, position, total, }: TransferMessage): string;
/**
 * Lets users move a slot's parts between lists, by dragging them and with
 * the keyboard. Call it once in `api`, keep it on the api, render each
 * list's items from `lists(state)`, and wire both slots:
 *
 * ```ts
 * column: slot<{ value: string }>({ bind: (el, { api, key }) => api.transfer.bindList(el, key) }),
 * card: slot<{ value: string }>({
 *   on: {
 *     keydown: (event, { el, api, key }) => api.transfer.keydown(event, key) || api.roving.keydown(event, el!),
 *     pointerdown: (event, { api, key }) => api.transfer.pointerdown(event, key),
 *   },
 *   bind: (el, { api, key }) => api.transfer.bindItem(el, key),
 * })
 * ```
 *
 * While a pointer drags, a copy of the item with `data-drag-preview` follows
 * it above the page, the item itself shows where it would drop with
 * `data-dragging`, and a drag near a scroller's edge scrolls it.
 * @experimental
 */
declare function createTransfer<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: TransferOptions<State>): {
    /** Joins a list's element, so drags find it. Return its cleanup from the list slot's `bind`. */
    bindList(el: HTMLElement, list: string): () => void;
    /** Joins an item's element. Return its cleanup from the item slot's `bind`. */
    bindItem(el: HTMLElement, key: string): () => void;
    /** The lists to render: the draft's while an item moves, else the value. Pure, so `state` and `attrs` can call it. */
    lists(state: State): TransferLists;
    /** Whether an item is being moved. */
    moving(state: State, key: string): boolean;
    /** Whether a pointer is dragging the item. */
    dragging(state: State, key: string): boolean;
    /**
     * Handles a key pressed on an item and returns whether it did. Space or
     * Enter picks the item up; while it's up, Up and Down move it in its
     * list, Home and End to its ends, Left and Right to the next list that
     * takes it, Space or Enter drops it, Escape puts it back and Tab puts it
     * back and moves on. Every other key is swallowed while it's up.
     */
    keydown(event: KeyboardEvent, key: string): boolean;
    /** Starts a pointer drag of an item once the pointer moves a few pixels, so a click stays a click. */
    pointerdown: (event: PointerEvent, key: string) => void;
    /** Picks an item up, as Space does. Returns whether it did. */
    grab: (key: string) => boolean;
    /** Moves the picked-up item to `index` in `list`, in the draft. Returns whether it moved. */
    moveTo: (list: string, index: number) => boolean;
    /** Drops the picked-up item where it is, committing the draft. */
    drop: (event?: Event) => void;
    /** Puts the picked-up item back where it was. */
    cancel: () => void;
    /** Moves an item to `index` in `list` at once, like a "Move to Done" menu item. Returns whether it went through. */
    move(key: string, list: string, index: number): boolean;
};
/**
 * What `createTransfer` returns.
 * @experimental
 */
type Transfer = ReturnType<typeof createTransfer>;
export { createTransfer, type Transfer, type TransferDraft, type TransferLists, transferMessage, type TransferMessage, type TransferOptions, type TransferReason, };
