import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * Where an item is, in the units your positions use, usually CSS pixels.
 * @experimental
 */
type MovePoint = {
    x: number;
    y: number;
};
/**
 * The items a pointer is dragging and how far, kept in state under `MoveOptions.draft`.
 * @experimental
 */
type MoveDraft = {
    keys: string[];
    dx: number;
    dy: number;
};
/**
 * Why positions changed: a pointer drag, a keyboard nudge, or a call from code.
 * @experimental
 */
type MoveReason = "drag" | "move-key" | "imperative";
/**
 * What happened, for the message screen readers hear.
 * @experimental
 */
type MoveMessage = {
    /** The keys that moved. */
    keys: string[];
    /** What the first is called, from `label`, else its key. */
    label: string;
    /** Where the first is now. */
    at: MovePoint;
};
/**
 * How `createMove` reads and changes positions.
 * @experimental
 */
type MoveOptions<State extends object> = {
    /** The state key that holds every item's position, a `Record<string, MovePoint>`. */
    key: keyof State & string;
    /** The state key that holds the `MoveDraft` while a pointer drags. Start it at `null`, and list it in `live`. */
    draft: keyof State & string;
    /**
     * Asks for new positions and returns whether they went through. Pass the
     * primitive's change: `set: (value, details) => change("positions", value, details)`.
     */
    set: (value: Record<string, MovePoint>, details: {
        reason: MoveReason;
        event?: Event;
    }) => boolean;
    /** The keys that move together with the one pressed, like the selection when it holds it. Defaults to that one key. */
    group?: (key: string) => string[];
    /** The grid a dropped position lands on, and how far Alt with an arrow nudges. Defaults to 1. */
    step?: () => number;
    /** How far Alt with Shift and an arrow nudges. Defaults to ten steps. */
    largeStep?: () => number;
    /**
     * How many screen pixels one unit of position takes, like a canvas's zoom,
     * so a drag follows the pointer when the items are scaled. Defaults to 1.
     */
    scale?: () => number;
    /** Keeps positions inside a box, like the board's size minus a card's. */
    bounds?: (key: string) => {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    } | undefined;
    /** Whether an item can't be moved. */
    disabled?: (key: string) => boolean;
    /** The name screen readers hear for an item. */
    label?: (key: string) => string | undefined;
    /** The text screen readers hear after a move. Defaults to English. */
    message?: (message: MoveMessage) => string;
};
/**
 * The English messages `createMove` announces unless you pass `message`.
 * @experimental
 */
declare function moveMessage({ keys, label, at }: MoveMessage): string;
/**
 * Lets users move a slot's parts in two dimensions, by dragging them and
 * with Alt and the arrows. Call it once in `api`, keep it on the api, and
 * wire the item slot:
 *
 * ```ts
 * card: slot<{ value: string }>({
 *   attrs: (state, { key }) => ({ style: css({ left: `${state.positions[key].x}px`, top: `${state.positions[key].y}px` }) }),
 *   live: live((state, { key, api }) => ({ style: api.move.style(state, key) })),
 *   on: {
 *     keydown: (event, { el, api, key }) => api.move.keydown(event, key) || api.roving.keydown(event, el!),
 *     pointerdown: (event, { el, api, key }) => api.move.pointerdown(event, key, el!),
 *   },
 * })
 * ```
 *
 * While a pointer drags, `style(state, key)` gives the dragged items a
 * `translate` and `--move-x` and `--move-y`, and `dragging(state, key)` says
 * which are moving. The drop commits once, with every moved key, through `set`.
 * @experimental
 */
declare function createMove<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: MoveOptions<State>): {
    /** Moves items by an offset, in one change. Returns whether it went through. */
    moveBy(keys: string[], dx: number, dy: number, details?: {
        reason: MoveReason;
        event?: Event;
    }): boolean;
    /** Moves one item to a point. */
    moveTo(key: string, point: MovePoint, details?: {
        reason: MoveReason;
        event?: Event;
    }): boolean;
    /** Alt with an arrow nudges the item's group. Returns whether it handled the key. */
    keydown(event: KeyboardEvent, key: string): boolean;
    /** Starts a drag once the pointer moves past `dragThreshold`, so a click stays a click. Escape puts the items back. */
    pointerdown(event: PointerEvent, key: string, el: HTMLElement): void;
    /** Whether a pointer is dragging the item. */
    dragging(state: State, key: string): boolean;
    /** The dragged item's offset, as a `style` attribute for a slot's `live`, or `undefined`. */
    style(state: State, key: string): string | undefined;
};
export { createMove, type MoveDraft, moveMessage, type MoveMessage, type MoveOptions, type MovePoint, type MoveReason, };
