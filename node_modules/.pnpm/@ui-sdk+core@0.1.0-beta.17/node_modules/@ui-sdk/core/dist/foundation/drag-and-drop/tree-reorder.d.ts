import type { PrimitiveContext } from "../kernel/primitive-types.js";
import { type AutoScrollOptions } from "./auto-scroll.js";
/**
 * One row of a tree in reading order: its key and how deep it is, from 0.
 * @experimental
 */
type TreeReorderRow = {
    key: string;
    depth: number;
};
/**
 * The item being moved and the rows as they show now, kept in state under `TreeReorderOptions.draft`.
 * @experimental
 */
type TreeReorderDraft = {
    /** The key of the item picked up. */
    key: string;
    /** The item and every row under it, which move with it. */
    keys: string[];
    /** Every row as it shows now, the moving ones included. */
    rows: TreeReorderRow[];
    /** Whether a pointer is dragging it, rather than the keyboard moving it. */
    pointer: boolean;
};
/**
 * Why the rows changed: a pointer drag, a keyboard move, or a call from code.
 * @experimental
 */
type TreeReorderReason = "drag" | "move-key" | "imperative";
/**
 * Where an item went: under which parent, and its place among that parent's children.
 * @experimental
 */
type TreePlace = {
    /** The parent's key, or `null` at the top level. */
    parent: string | null;
    /** Its place among the parent's children, from 0. */
    index: number;
};
/**
 * What happened, for the message screen readers hear.
 * @experimental
 */
type TreeReorderMessage = {
    /** `grab` when an item is picked up, `move` for each step, `drop` when it lands, `cancel` when it goes back. */
    type: "grab" | "move" | "drop" | "cancel";
    /** The item's key. */
    key: string;
    /** What the item is called, from `label`, else its text. */
    label: string;
    /** What its parent is called, or `undefined` at the top level. */
    parent: string | undefined;
    /** Its level, from 1. */
    level: number;
    /** Its place among its siblings, from 1. */
    position: number;
    /** How many siblings it has, itself included. */
    total: number;
};
/**
 * How `createTreeReorder` reads, renders and changes the rows.
 * @experimental
 */
type TreeReorderOptions<State extends object> = {
    /** The state key that holds the rows, a `TreeReorderRow[]` in reading order. */
    key: keyof State & string;
    /** The state key that holds the `TreeReorderDraft` while an item moves. Start it at `null`. */
    draft: keyof State & string;
    /**
     * Asks for the new rows and returns whether they went through. Pass the
     * primitive's change: `set: (value, details) => change("rows", value, details)`.
     * `details` says which item moved and where to.
     */
    set: (value: TreeReorderRow[], details: {
        reason: TreeReorderReason;
        event?: Event;
        key: string;
    } & TreePlace) => boolean;
    /** How far a drag goes sideways for each level, in CSS pixels. Defaults to 24. */
    indent?: () => number;
    /** The deepest an item and the rows under it can go, from 0. Defaults to no limit. */
    maxDepth?: () => number;
    /** Whether an item can't be picked up. It still moves aside for others. */
    disabled?: (key: string) => boolean;
    /** The name screen readers hear for an item. Defaults to its text. */
    label?: (key: string) => string | undefined;
    /** The text screen readers hear for each step. Defaults to English. */
    message?: (message: TreeReorderMessage) => string;
    /** Drags a copy of the row above the page while the rows show where it would drop. Defaults to `false`. */
    preview?: boolean;
    /** How a drag with `preview` near a scroller's edge scrolls it, or `false` not to. */
    createAutoScroll?: Omit<AutoScrollOptions, "onScroll" | "ignore"> | false;
};
/**
 * The English messages `createTreeReorder` announces unless you pass `message`.
 * @experimental
 */
declare function treeReorderMessage({ type, label, parent, level, position, total, }: TreeReorderMessage): string;
/**
 * The index past the last row under `rows[index]`.
 * @experimental
 */
declare function subtreeEnd(rows: readonly TreeReorderRow[], index: number): number;
/** The parent of `rows[index]` and its place among the parent's children. */
declare function placeOf(rows: readonly TreeReorderRow[], index: number): {
    parent: number | undefined;
    position: number;
};
/**
 * The depths a block can take between two rows without changing anyone
 * else's parent: no deeper than the row above's child, and no shallower
 * than the row below, which would adopt it.
 */
declare function depthRange(above: TreeReorderRow | undefined, below: TreeReorderRow | undefined, maxDepth?: number): {
    min: number;
    max: number;
};
/**
 * The rows with the block at `key` moved before the row `before`, or to the
 * end, at `depth`, its children keeping their depths under it. The same
 * array when it's already there.
 */
declare function movedRows(rows: readonly TreeReorderRow[], key: string, before: string | null, depth: number): TreeReorderRow[];
/**
 * Lets users reorder and nest a tree's rows by dragging them and with the
 * keyboard. Render the rows from `rows(state)`, each indented by its depth,
 * and leave out the ones inside collapsed items: only rows with an element
 * take part. Call it once in `api`, keep it on the api, and wire the row
 * slot:
 *
 * ```ts
 * row: slot<{ value: string }>({
 *   on: {
 *     keydown: (event, { el, api, key }) => api.tree.keydown(event, key) || api.roving.keydown(event, el!),
 *     pointerdown: (event, { api, key }) => api.tree.pointerdown(event, key),
 *   },
 *   bind: (el, { api, key }) => api.tree.bind(el, key),
 * })
 * ```
 *
 * Space or Enter picks a row up with everything under it; then Up and Down
 * move it between the rows on screen, Left and Right take it out a level and
 * in one, Space or Enter drops it, and Escape puts it back. A drag goes in a
 * level for every `indent` it goes sideways. An item never takes another's
 * children: where the row below is deeper, the item goes in as deep.
 * @experimental
 */
declare function createTreeReorder<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: TreeReorderOptions<State>): {
    /** Joins a row's element. Return its cleanup from the row slot's `bind`. */
    bind(el: HTMLElement, key: string): () => void;
    /** The rows to render: the draft's while an item moves, else the value. Pure, so `state` and `attrs` can call it. */
    rows(state: State): TreeReorderRow[];
    /** Whether a row is picked up, by itself or under the item that is. */
    moving(state: State, key: string): boolean;
    /** Whether a pointer is dragging the row, by itself or under the item it drags. */
    dragging(state: State, key: string): boolean;
    /**
     * Handles a key pressed on a row and returns whether it did. Space or
     * Enter picks the row up; while it's up, Up and Down move it between the
     * rows on screen, Left and Right out a level and in one, Space or Enter
     * drops it, Escape puts it back, and Tab puts it back and moves on.
     * Every other key is swallowed while it's up.
     */
    keydown(event: KeyboardEvent, key: string): boolean;
    /** Starts a pointer drag of a row once the pointer moves a few pixels, so a click stays a click. */
    pointerdown: (event: PointerEvent, key: string) => void;
    /** Picks a row up, as Space does. Returns whether it did. */
    grab: (key: string) => boolean;
    /** Moves the picked-up row to `slot` among the other rows on screen, as near `depth` as fits there. */
    place: (slot: number, depth: number) => boolean;
    /** Drops the picked-up row where it is, committing the draft. */
    drop: (event?: Event) => void;
    /** Puts the picked-up row back where it was. */
    cancel: () => void;
    /**
     * Moves an item and its children before the row `before`, or to the end,
     * at `depth` as near as fits there, like an "Indent" menu item. Returns
     * whether it went through.
     */
    move(key: string, before: string | null, depth: number): boolean;
};
/**
 * What `createTreeReorder` returns.
 * @experimental
 */
type TreeReorder = ReturnType<typeof createTreeReorder>;
export { createTreeReorder, depthRange, movedRows, placeOf, subtreeEnd, type TreePlace, type TreeReorder, type TreeReorderDraft, treeReorderMessage, type TreeReorderMessage, type TreeReorderOptions, type TreeReorderReason, type TreeReorderRow, };
