import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * The rectangle being drawn, relative to the surface, and what it selects so far.
 * @experimental
 */
type LassoDraft = {
    left: number;
    top: number;
    right: number;
    bottom: number;
    keys: string[];
};
/**
 * How `createLasso` finds items and changes the selection.
 * @experimental
 */
type LassoOptions<State extends object> = {
    /** The slot whose parts the rectangle selects. */
    slot: string;
    /** The state key that holds the `LassoDraft` while one is drawn. Start it at `null`, and list it in `live`. */
    draft: keyof State & string;
    /** The selection now, which Shift adds to. */
    selected: () => string[];
    /** Asks for a new selection. Pass the primitive's change. */
    set: (keys: string[], details: {
        reason: "lasso";
        event?: Event;
    }) => boolean;
    /** Whether an item can be selected. Defaults to every item. */
    selectable?: (key: string) => boolean;
    /** What screen readers hear when the rectangle lifts. Defaults to English. */
    message?: (count: number) => string;
};
/**
 * Lets users select a slot's parts by drawing a rectangle on the surface
 * around them. Call it once in `api`, and start it from the surface's
 * `pointerdown` when the press lands on the surface itself:
 *
 * ```ts
 * root: slot({
 *   on: { pointerdown: (event, { el, api }) => event.target === el && api.lasso.pointerdown(event, el!) },
 * }),
 * // Render it always: its style hides it until a rectangle is drawn.
 * lasso: slot({
 *   live: live((state, { api }) => ({ style: api.lasso.style(state) })),
 * }),
 * ```
 *
 * Item boxes are read once, when the drag starts, so drawing measures nothing.
 * @experimental
 */
declare function createLasso<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy" | "parts">, options: LassoOptions<State>): {
    /** Starts a rectangle on `surface` once the pointer moves past `dragThreshold`. Escape lets go without selecting. */
    pointerdown(event: PointerEvent, surface: HTMLElement): void;
    /** Whether the rectangle touches an item now. */
    touches(state: State, key: string): boolean;
    /** The rectangle as a `style` attribute for its part, hidden while none is drawn. */
    style(state: State): string;
};
export { createLasso, type LassoDraft, type LassoOptions };
