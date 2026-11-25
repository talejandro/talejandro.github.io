/**
 * A side of the anchor. `start` and `end` are logical: left and right, swapped in right-to-left layouts.
 * @stable
 */
type Side = "top" | "bottom" | "left" | "right" | "start" | "end";
/** A side on screen, after logical sides are resolved. */
type PhysicalSide = "top" | "bottom" | "left" | "right";
declare function physicalSide(side: Side, rtl?: boolean): "top" | "right" | "bottom" | "left";
declare const opposite: Record<PhysicalSide, PhysicalSide>;
export { opposite, physicalSide, type PhysicalSide, type Side };
