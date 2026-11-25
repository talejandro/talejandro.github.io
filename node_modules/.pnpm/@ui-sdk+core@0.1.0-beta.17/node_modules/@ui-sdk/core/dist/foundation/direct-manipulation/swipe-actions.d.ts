import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * The side of a row its actions sit on: `start` shows by swiping toward the end, left to right in English.
 * @experimental
 */
type SwipeSide = "start" | "end";
/**
 * The row whose actions show, and on which side.
 * @experimental
 */
type SwipeOpen = {
    key: string;
    side: SwipeSide;
};
/**
 * A row a pointer is swiping, kept in state under `SwipeActionsOptions.draft`.
 * @experimental
 */
type SwipeDraft = {
    key: string;
    /** How far the row has moved, in pixels, positive to the right. */
    x: number;
    /** Whether letting go now runs the first action. */
    full: boolean;
};
/**
 * How `createSwipeActions` keeps its rows.
 * @experimental
 */
type SwipeActionsOptions<State extends object> = {
    /** The state key that holds the `SwipeOpen` row, or `null`. */
    key: keyof State & string;
    /** The state key that holds the `SwipeDraft` while a pointer swipes. Start it at `null`, and list it in `live`. */
    draft: keyof State & string;
    /**
     * Runs a side's first action when a swipe goes past `fullSwipe` of the
     * row's width, and returns whether it did. Without it, a long swipe only
     * opens the row.
     */
    onFullSwipe?: (key: string, side: SwipeSide, details: {
        event: Event;
    }) => boolean;
    /** How far across the row a swipe runs the first action, as a fraction of its width. @defaultValue 0.6 */
    fullSwipe?: () => number;
    /** Whether a row can't be swiped. */
    disabled?: (key: string) => boolean;
};
/**
 * Lets users swipe a list's rows aside to their actions. Call it once in
 * `api`, keep it on the api, and wire a row, its moving content, and the
 * actions on each side under it:
 *
 * ```ts
 * row: slot<{ value: string }>({
 *   on: {
 *     pointerdown: (event, { el, api, key }) => api.swipe.pointerdown(event, key, el!),
 *     keydown: (event, { api, key }) => api.swipe.keydown(event, key),
 *   },
 *   bind: (el, { api, key }) => api.swipe.bindRow(el, key),
 * }),
 * content: slot<{ value: string }>({
 *   attrs: () => ({ style: "transform: translateX(var(--swipe-x, 0px))" }),
 *   live: live((state, { api, key }) => api.swipe.contentAttrs(state, key)),
 * }),
 * actions: slot<{ id: string; row: string; side: SwipeSide }>({
 *   attrs: (state, { api, props }) => api.swipe.actionsAttrs(state, props.row, props.side),
 *   bind: (el, { api, props }) => api.swipe.bindActions(el, props.row, props.side),
 * }),
 * ```
 * @experimental
 */
declare function createSwipeActions<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: SwipeActionsOptions<State>): {
    /** The row whose actions show, if any. */
    open: () => SwipeOpen | null;
    /** How far a row has moved, in pixels, positive to the right: the swipe's, or the open side's width. */
    offset(state: State, key: string): number;
    /**
     * Live attributes for the row's moving content: `--swipe-x`, its offset;
     * `data-swipe`, the side it shows, to show only that side's actions;
     * `data-swiping` while a pointer moves it, to turn off a transition; and
     * `data-full` while letting go would run the first action.
     */
    contentAttrs(state: State, key: string): {
        style: string;
        "data-swipe": "end" | "start" | undefined;
        "data-swiping": string | undefined;
        "data-full": string | undefined;
    };
    /** The actions on a side: `data-side`, and `inert` unless the row is open on that side, so Tab skips hidden buttons. */
    actionsAttrs(state: State, key: string, side: SwipeSide): {
        "data-side": SwipeSide;
        inert: string | undefined;
    };
    /** Joins a row, for its direction and to close it on a press elsewhere. Return its cleanup from `bind`. */
    bindRow(el: HTMLElement, key: string): () => void;
    /** Joins the actions on one side of a row, which a swipe measures to know how far it opens. */
    bindActions(el: HTMLElement, key: string, side: SwipeSide): () => void;
    /** Opens a row's actions on a side, closing any other row's. With `focus`, its first action takes focus. */
    show(key: string, side: SwipeSide, { focus }?: {
        focus?: boolean | undefined;
    }): boolean;
    /** Closes the open row. With `focus`, the row takes focus back, as after Escape. */
    close({ focus }?: {
        focus?: boolean | undefined;
    }): boolean;
    /**
     * Follows a press on a row that may become a swipe across it. The press
     * stays a press until the pointer moves a few pixels across, so clicks
     * and vertical scrolls keep working.
     */
    pointerdown(event: PointerEvent, key: string, el: HTMLElement): void;
    /**
     * Handles a key on a row or its actions and returns whether it did. Left
     * and Right open the actions on the side the row would swipe toward and
     * focus the first, then move between them; toward the row's content from
     * the last one, or Escape, closes them and puts focus back on the row.
     */
    keydown(event: KeyboardEvent, key: string): boolean;
};
/**
 * What `createSwipeActions` returns.
 * @experimental
 */
type SwipeActions = ReturnType<typeof createSwipeActions>;
export { createSwipeActions, type SwipeActions, type SwipeActionsOptions, type SwipeDraft, type SwipeOpen, type SwipeSide, };
