import type { RovingFocusMoveContext } from "./roving-focus.js";
/**
 * A box on screen, like `getBoundingClientRect()` returns.
 * @experimental
 */
type SpatialRect = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
/**
 * The key of the box nearest `from` in a direction, `[1, 0]` for right, or
 * `undefined` when none lies that way. Boxes inside a 45° cone come first, and
 * distance to the side counts double, so a box straight ahead beats a closer
 * one off to the side. Pure, so a test or a server can run it.
 * @experimental
 */
declare function nearestInDirection(from: SpatialRect, candidates: readonly {
    key: string;
    rect: SpatialRect;
}[], direction: readonly [number, number]): string | undefined;
/**
 * A `move` for `createRovingFocus` that sends each arrow to the nearest item on
 * screen in its direction. Home and End go to the first and last item in
 * the document. Directions are physical: Left is left in either reading
 * direction, since the items sit where they're drawn. Arrows with Alt, Ctrl
 * or ⌘ are left alone, for a component's own shortcuts, like nudging.
 *
 * ```ts
 * createRovingFocus(context, { slot: "card", key: "focused", move: spatialMove() })
 * ```
 * @experimental
 */
declare function spatialMove(options?: {
    /** Where an item is on screen. Defaults to its element's `getBoundingClientRect()`. */
    rect?: (el: HTMLElement, key: string) => SpatialRect;
}): (event: KeyboardEvent, { from, items }: RovingFocusMoveContext) => string | undefined;
export { nearestInDirection, spatialMove, type SpatialRect };
