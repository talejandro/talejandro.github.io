import type { SheetSnapReason } from "../motion/machine.js";
import { type SheetPhysics } from "../motion/physics.js";
import { type ResolvedSnapPoint, type SnapPoint } from "../motion/snap-points.js";
import type { Layer } from "../platform/layers.js";
import { type SheetSide } from "./sheet-axis.js";
import type { PhysicalSide } from "../platform/sides.js";
import { type SheetDriverName } from "./sheet-driver.js";
import { type SheetOutlet } from "./sheet-effects.js";
/**
 * What a sheet reads from its component. Only `host` and `onDismiss` are
 * required; the rest default to a bottom sheet at its own size that can be
 * dismissed, so Menu, Select and Dialog can present as one with a few lines.
 * Getters are read when they matter, so option changes apply while it's open.
 */
type SheetOptions = {
    /** The full-screen element the sheet sits in. It goes into the top layer. */
    host: HTMLElement;
    /** The edge it comes from. Defaults to `"bottom"`. */
    side?: () => SheetSide;
    /** Where it can rest. Defaults to `["content"]`, its own size. */
    snapPoints?: () => readonly SnapPoint[];
    /** The snap point the sheet should rest on, from the component's state. Defaults to the first. */
    snapPoint?: () => SnapPoint | null;
    /** Whether a swipe can dismiss it. Defaults to true. */
    dismissible?: () => boolean;
    /** At or below this snap point the page stays usable and undimmed. */
    modalAbove?: () => SnapPoint | undefined;
    /** Defaults to `"auto"`. */
    driver?: () => SheetDriverName;
    /** Whether a drag on scrollable content grows the sheet first. Defaults to true. */
    expandOnScroll?: () => boolean;
    physics?: () => Partial<SheetPhysics> | undefined;
    backdrop?: () => HTMLElement | undefined;
    /** Dims with the host's own `::backdrop` instead of a `backdrop` element, like a popup presented as a sheet. */
    hostBackdrop?: boolean;
    outlets?: () => readonly SheetOutlet[];
    /** The sheet this one opened from, which it pushes back while open. */
    parent?: () => Sheet | undefined;
    themeColor?: () => boolean;
    preventEdgeSwipe?: () => boolean;
    /** Whether a mouse press on `target` may drag the sheet. Defaults to empty space and text, never controls. */
    canMouseDrag?: (target: Element) => boolean;
    /** A swipe dismissed it; it's already settling closed. Close the component here. */
    onDismiss: (event?: Event) => void;
    /** The resting snap point changed, at release or when a programmatic move starts. */
    onSnap?: (point: SnapPoint, reason: SheetSnapReason, event?: Event) => void;
    /** It came to rest, on a snap point or closed (null). */
    onRest?: (point: SnapPoint | null) => void;
    /** A swipe tried to dismiss it while `dismissible` is false. */
    onDismissAttempt?: (event?: Event) => void;
    onDragChange?: (dragging: boolean) => void;
    /** The geometry changed: the resolved side and snap points. */
    onLayout?: (layout: {
        side: PhysicalSide;
        snapPoints: readonly ResolvedSnapPoint[];
    }) => void;
};
/** Whether a mouse press on `target` may drag a sheet: empty space and text, not controls. */
declare const isDragSurface: (target: Element) => boolean;
/** A sheet attached to an element, for the component that owns it. */
type Sheet = {
    element: HTMLElement;
    /** The sheet this one opened from. */
    parent: () => Sheet | undefined;
    /** Shows the sheet at its snap point, rising from closed unless `animate` is false. */
    open: (animate: boolean) => void;
    /** Settles closed. Presence waits for the animation. */
    close: () => void;
    /** Moves to a snap point. `reason` comes back through `onSnap` if it's a change. */
    snapTo: (point: SnapPoint, reason: SheetSnapReason) => void;
    /** A refused dismissal: a small push toward closing that springs back. */
    nudge: () => void;
    /** The resolved snap points, ascending. */
    snapPoints: () => readonly ResolvedSnapPoint[];
    /** The snap point it rests on or is settling to. */
    target: () => SnapPoint | null;
    /** Whether resting at `point` leaves the page usable, because it's at or below `modalAbove`. */
    isInteractiveAt: (point: SnapPoint | null) => boolean;
    /** Measures again, like after an option that changes the geometry. */
    refresh: () => void;
    destroy: () => void;
};
/** Open sheets by their popup layer, so a sheet opened from inside another stacks on it. */
declare const sheetLayers: WeakMap<Layer, () => Sheet | undefined>;
/** The sheet of the nearest layer above `layer` that has one. */
declare function parentSheet(layer: Layer): (() => Sheet | undefined) | undefined;
declare function attachSheet(el: HTMLElement, input: SheetOptions): Sheet;
export { attachSheet, isDragSurface, parentSheet, type Sheet, sheetLayers, type SheetOptions, };
export type { SheetDriverName } from "./sheet-driver.js";
export { prepareVariables as prepareSheet } from "./sheet-effects.js";
export type { SheetKeyframes, SheetOutlet } from "./sheet-effects.js";
export type { SheetSide } from "./sheet-axis.js";
