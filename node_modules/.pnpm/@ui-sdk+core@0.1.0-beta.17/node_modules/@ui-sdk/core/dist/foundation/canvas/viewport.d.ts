import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * Where the canvas sits on screen: its origin's offset from the surface's top left, in CSS pixels, and its scale.
 * @experimental
 */
type Viewport = {
    x: number;
    y: number;
    zoom: number;
};
/**
 * A box on the canvas, in canvas units.
 * @experimental
 */
type CanvasRect = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
/**
 * Why the viewport moved.
 * @experimental
 */
type ViewportReason = "wheel" | "drag" | "pinch" | "zoom-key" | "focus-in" | "find-in-page" | "imperative";
/**
 * How `createViewport` keeps the viewport.
 * @experimental
 */
type ViewportOptions<State extends object> = {
    /** The state key that holds the `Viewport`. List it in `live`, so panning renders nothing. */
    key: keyof State & string;
    /** The element that clips the canvas and takes the gestures. */
    surface: () => HTMLElement | null | undefined;
    /** Asks for a new viewport. Defaults to setting the state key; pass the primitive's change to make it controllable. */
    set?: (value: Viewport, details: {
        reason: ViewportReason;
        event?: Event;
    }) => boolean;
    /** @defaultValue 0.1 */
    minZoom?: () => number;
    /** @defaultValue 4 */
    maxZoom?: () => number;
    /** What screen readers hear after a zoom key. Defaults to English, like "Zoom 150%". */
    message?: (zoom: number) => string;
};
/**
 * Pans and zooms a canvas. Call it once in `api` and keep it on the api.
 * Put every item in one world element and give it `style(state)`; position
 * the items inside it in canvas units:
 *
 * ```ts
 * surface: slot({
 *   attrs: () => ({ style: css({ position: "relative", overflow: "hidden", "touch-action": "none" }) }),
 *   on: {
 *     wheel: (event, { api }) => api.viewport.wheel(event),
 *     pointerdown: (event, { el, api }) => event.target === el && api.viewport.pointerdown(event),
 *   },
 * }),
 * world: slot({ live: live((state, { api }) => ({ style: api.viewport.style(state) })) }),
 * ```
 *
 * `toCanvas` and `toScreen` convert points, `fit` shows a box, `reveal`
 * scrolls the least to bring one into view, which a focused item calls, and
 * `bindFindable` pans to whatever the browser scrolls to, like a find in page match.
 * @experimental
 */
declare function createViewport<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: ViewportOptions<State>): {
    /** The viewport now. */
    get(): Viewport;
    /** A point on screen, like a pointer's `clientX` and `clientY`, in canvas units. */
    toCanvas(clientX: number, clientY: number): {
        x: number;
        y: number;
    };
    /** A canvas point on screen, in client pixels. */
    toScreen(point: {
        x: number;
        y: number;
    }): {
        x: number;
        y: number;
    };
    /** Where an element is on the canvas, like a port inside a node, from its box on screen. */
    rectOf(el: Element): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    /** The part of the canvas on screen now. */
    visible(): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    /** Moves to a viewport, keeping the zoom within bounds. */
    setViewport(value: Viewport, details?: {
        reason: ViewportReason;
        event?: Event;
    }): boolean;
    /** Pans by screen pixels. */
    panBy(dx: number, dy: number, details?: {
        reason: ViewportReason;
        event?: Event;
    }): boolean;
    /** Zooms to a scale, keeping the canvas point under a screen point still. Defaults to the surface's center. */
    zoomTo(zoom: number, at?: {
        x: number;
        y: number;
    }, details?: {
        reason: ViewportReason;
        event?: Event;
    }): boolean;
    /** Zooms by a factor, like `1.2` in and `1 / 1.2` out. */
    zoomBy(factor: number, at?: {
        x: number;
        y: number;
    }, details?: {
        reason: ViewportReason;
        event?: Event;
    }): boolean;
    /** Shows a canvas box whole and centered, zooming no further in than `maxZoom`. */
    fit(rect: CanvasRect, fitOptions?: {
        padding?: number;
        maxZoom?: number;
    }, details?: {
        reason: ViewportReason;
        event?: Event;
    }): boolean;
    /** Pans the least distance that brings a canvas box into view, with `padding` screen pixels around it. */
    reveal(rect: CanvasRect, revealOptions?: {
        padding?: number;
    }, details?: {
        reason: ViewportReason;
        event?: Event;
    }): boolean;
    /** Pans with the wheel or a two finger scroll; zooms at the pointer with Ctrl or ⌘, and with a trackpad pinch, which browsers send as Ctrl. */
    wheel(event: WheelEvent): void;
    /** Pans while one pointer drags the surface, and pinches with two. Call it for presses on empty space. */
    pointerdown(event: PointerEvent): void;
    /** `+` and `-` zoom at the center, `0` goes back to 100%. Returns whether it handled the key. */
    keydown(event: KeyboardEvent, at?: {
        x: number;
        y: number;
    }): boolean;
    /** The world element's `style`: one transform for every item, so panning lays nothing out. */
    style(state: State): string;
    /**
     * Turns the browser's scrolls inside `el` into pans, until the returned
     * function runs, so find in page, focus and links to an id bring what
     * they found into view. `el` is a pane that fills the surface and holds
     * only the world, with `overflow: scroll`, since find in page skips what a
     * user can't scroll: it rests scrolled far from its origin, with the world
     * offset to match.
     */
    bindFindable(el: HTMLElement): () => void;
};
export { type CanvasRect, createViewport, type Viewport, type ViewportOptions, type ViewportReason, };
