import type { SheetConfig, SheetSnapReason } from "../motion/machine.js";
import type { PhysicalSide } from "../platform/sides.js";
import type { SheetMotion } from "./sheet-effects.js";
/**
 * How a sheet's motion is driven. `"auto"` picks scroll snap for a bottom sheet on a touch screen, and the pointer driver otherwise.
 * @stable
 */
type SheetDriverName = "pointer" | "scroll-snap" | "auto";
type SheetDriverOptions = {
    /** The moving surface. */
    sheet: HTMLElement;
    /** The full-screen element the sheet sits in, in the top layer. */
    host: HTMLElement;
    side: () => PhysicalSide;
    /** The machine's geometry and physics, read on every event. */
    config: () => SheetConfig;
    /** The sheet's own size along its axis, measured at the last layout. */
    size: () => number;
    /** Where a closed sheet sits: just past the edge, below Safari's floating toolbar for a bottom sheet. */
    closedExtent: () => number;
    reducedMotion: () => boolean;
    /** Whether this sheet, and not one stacked above it, owns a press on `target`. */
    owns: (target: EventTarget | null) => boolean;
    /** Whether a press on `target` may start a mouse drag, like on the handle or empty space. */
    canMouseDrag: (target: Element) => boolean;
    /** The resting snap point changes, at release or when a programmatic move starts. */
    onSnap: (id: string, reason: SheetSnapReason, event?: Event) => void;
    /** The sheet came to rest on a snap point, or closed (null). */
    onRest: (id: string | null) => void;
    /** A swipe dismissed the sheet; it's already settling closed. */
    onDismiss: (event?: Event) => void;
    /** A swipe tried to dismiss a sheet that can't be dismissed. */
    onDismissAttempt: (event?: Event) => void;
    onDragChange: (dragging: boolean) => void;
    /** Whether resting at a snap point leaves the page usable, so presses beside the sheet reach it. */
    isInteractive: (id: string) => boolean;
    /** A frame a finger drove, after the sheet moved. Effects follow it. */
    onFrame: (extent: number) => void;
    /** The sheet started moving on its own. Effects play the same motion. */
    onMotion: (motion: SheetMotion) => void;
    /** A motion that waited for the sheet's first frame started, at this time. */
    onMotionStart: (startTime: number) => void;
};
type SheetDriver = {
    /** Shows the sheet at a snap point: rising from closed, or there at once. */
    open: (id: string, animate: boolean) => void;
    /** Settles closed. Its animation is on the sheet, so presence waits for it. */
    close: () => void;
    snapTo: (id: string, reason: SheetSnapReason) => void;
    /** A refused dismissal: a small push toward closing that springs back. */
    nudge: () => void;
    /**
     * The geometry changed: keep the resting snap point and move to its new
     * extent, at once when `immediate`. If that point is gone, `fallback`, or
     * else the nearest.
     */
    relayout: (immediate: boolean, fallback?: string) => void;
    /** The snap point it rests on or is settling to, or null when closed or closing. */
    target: () => string | null;
    /** Whether a gesture or a settle is in progress. */
    isMoving: () => boolean;
    destroy: () => void;
};
declare const openHold = 1000;
declare function afterFirstFrame(view: Window, start: (frameTime: number) => void): void;
declare const toolbarBleed = 120;
declare function closedExtentFor(side: PhysicalSide): number;
declare function sampleTranslate(motion: {
    duration: number;
    extentAt: (elapsed: number) => number;
}, translate: (extent: number) => string): string[];
declare const reducedSettle = 200;
declare const reducedFade = 150;
declare function setStyles(el: HTMLElement, styles: Record<string, string>): () => void;
export { afterFirstFrame, closedExtentFor, openHold, reducedFade, reducedSettle, sampleTranslate, setStyles, type SheetDriver, type SheetDriverName, type SheetDriverOptions, toolbarBleed, };
