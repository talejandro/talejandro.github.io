import { type PhysicalSide, type Side } from "../platform/sides.js";
/**
 * The edge a sheet comes from. `start` and `end` follow the writing direction, like a popup's `side`.
 * @stable
 */
type SheetSide = Side;
declare function resolveSide(side: SheetSide, el: Element): "top" | "right" | "bottom" | "left";
declare const isVertical: (side: PhysicalSide) => side is "top" | "bottom";
/** A pointer position as the machine reads it: `y` along the axis, growing toward the edge, and `x` across it. */
declare function axisPoint(side: PhysicalSide, clientX: number, clientY: number, into: {
    x: number;
    y: number;
}): {
    x: number;
    y: number;
};
/** The `translate` that moves a sheet `offset` px toward its edge from where it's laid out. */
declare function translateValue(side: PhysicalSide, offset: number): string;
/** The sheet's own size along its axis, ignoring transforms. */
declare function sizeAlong(el: HTMLElement, side: PhysicalSide): number;
/**
 * What a scroll area under the finger can do, in the machine's terms: `atStart`
 * means it can't scroll further the way a finger moving toward the edge
 * scrolls it, and `atEnd` the other way. Null when no scroll area inside the
 * sheet scrolls along the axis.
 */
declare function scrollContext(target: EventTarget | null, sheet: HTMLElement, side: PhysicalSide): {
    atStart: boolean;
    atEnd: boolean;
    area: HTMLElement;
} | null;
declare function scrollAreaAt(target: EventTarget | null, sheet: HTMLElement, side: PhysicalSide): HTMLElement | null;
/** Scrolls the area forward, away from the sheet's edge, by `delta` px, or back when negative. */
declare function scrollForward(area: HTMLElement, side: PhysicalSide, delta: number): void;
export { axisPoint, isVertical, resolveSide, scrollAreaAt, scrollContext, scrollForward, type SheetSide, sizeAlong, translateValue, };
