import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * Where a box sits and how big it is, in the units your boxes use, usually CSS pixels.
 * @experimental
 */
type ResizeBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * The edge or corner a handle drags, by compass point, or `move` for the whole box.
 * @experimental
 */
type ResizeHandle = "n" | "e" | "s" | "w" | "ne" | "nw" | "se" | "sw" | "move";
/**
 * The box a pointer is changing, kept in state under `ResizeOptions.draft`.
 * @experimental
 */
type ResizeDraft = {
    key: string;
    handle: ResizeHandle;
    box: ResizeBox;
};
/**
 * Why a box changed: a pointer drag, a key on a handle, or a call from code.
 * @experimental
 */
type ResizeReason = "drag" | "resize-key" | "imperative";
/**
 * What happened, for the message screen readers hear.
 * @experimental
 */
type ResizeMessage = {
    key: string;
    label: string;
    handle: ResizeHandle;
    box: ResizeBox;
};
/**
 * How `createResize` reads and changes boxes.
 * @experimental
 */
type ResizeOptions<State extends object> = {
    /** Every box in state, by key, like `(state) => state.boxes` or `(state) => ({ crop: state.crop })`. */
    boxes: (state: State) => Record<string, ResizeBox>;
    /** The state key that holds the `ResizeDraft` while a pointer drags. Start it at `null`, and list it in `live`. */
    draft: keyof State & string;
    /**
     * Asks for new boxes and returns whether they went through. Pass the
     * primitive's change: `set: (value, details) => change("boxes", value, details)`,
     * or `change("crop", value.crop, details)` for a primitive with one box.
     */
    set: (value: Record<string, ResizeBox>, details: {
        reason: ResizeReason;
        event?: Event;
    }) => boolean;
    /** The smallest a box gets. Defaults to 1 by 1. */
    min?: (key: string) => {
        width: number;
        height: number;
    };
    /** The largest a box gets. */
    max?: (key: string) => {
        width: number;
        height: number;
    } | undefined;
    /** Keeps a box inside an area, like the image a crop sits on. */
    bounds?: (key: string) => {
        left: number;
        top: number;
        right: number;
        bottom: number;
    } | undefined;
    /**
     * Keeps width over height at this ratio, like `16 / 9`. Without one, Shift
     * on a corner keeps the ratio the box had when the drag started.
     */
    aspect?: (key: string) => number | undefined;
    /** The grid a dropped box lands on, and how far an arrow moves an edge. Defaults to 1. */
    step?: () => number;
    /** How far Shift with an arrow moves an edge. Defaults to ten steps. */
    largeStep?: () => number;
    /** How many screen pixels one unit takes, like a canvas's zoom. Defaults to 1. */
    scale?: () => number;
    /** Whether a box can't be changed. */
    disabled?: (key: string) => boolean;
    /** The name screen readers hear for a box. */
    label?: (key: string) => string | undefined;
    /** The text screen readers hear after a change. Defaults to English. */
    message?: (message: ResizeMessage) => string;
};
/**
 * The English messages `createResize` announces unless you pass `message`.
 * @experimental
 */
declare function resizeMessage({ label, handle, box }: ResizeMessage): string;
/** The cursor that shows what each handle does. */
declare const resizeCursors: Record<ResizeHandle, string>;
/**
 * The limits `resizeBox` keeps a box within.
 */
type ResizeLimits = {
    /** The area the box stays inside. */
    bounds?: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    /** The smallest it gets. Defaults to 1 by 1. */
    min?: {
        width: number;
        height: number;
    };
    /** The largest it gets. */
    max?: {
        width: number;
        height: number;
    };
    /** Width over height, kept while it resizes. */
    aspect?: number;
};
/**
 * The box a handle makes when its edges move by `dx` and `dy` from `from`,
 * within the limits, as a drag of that handle makes it.
 */
declare function resizeBox(from: ResizeBox, handle: ResizeHandle, dx: number, dy: number, limits?: ResizeLimits): {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * Lets users resize a slot's parts by handles on their edges and corners, and
 * move them by dragging the box. Call it once in `api`, keep it on the api,
 * and wire the box and its handles:
 *
 * ```ts
 * box: slot<{ value: string }>({
 *   attrs: (state, { key, api }) => ({ style: api.resize.boxStyle(state, key) }),
 *   live: live((state, { key, api }) => ({ style: api.resize.style(state, key) })),
 *   on: { pointerdown: (event, { el, api, key }) => api.resize.pointerdown(event, key, "move", el!) },
 * }),
 * // Each handle is its own part, so give it an `id` like `${box}-${handle}`.
 * handle: slot<{ id: string; box: string; handle: ResizeHandle }>({
 *   attrs: (_state, { props, api }) => api.resize.handleAttrs(props.handle),
 *   on: {
 *     pointerdown: (event, { el, api, props }) => api.resize.pointerdown(event, props.box, props.handle, el!),
 *     keydown: (event, { api, props }) => api.resize.keydown(event, props.box, props.handle),
 *   },
 * }),
 * ```
 *
 * `boxStyle` places the box from state with `left`, `top`, `width` and
 * `height` that read `--resize-x`, `--resize-y`, `--resize-width` and
 * `--resize-height` first, which `style` sets while a pointer drags.
 * @experimental
 */
declare function createResize<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: ResizeOptions<State>): {
    /** The box as it shows now: the draft's while a pointer drags it, else the one in state. */
    box(state: State, key: string): ResizeBox;
    /** Sets a box, in one change. Returns whether it went through. */
    resizeTo(key: string, box: ResizeBox, details?: {
        reason: ResizeReason;
        event?: Event;
    }, handle?: ResizeHandle): boolean;
    /** Moves a handle's edges by an offset, within the limits, like an arrow key does. */
    resizeBy(key: string, handle: ResizeHandle, dx: number, dy: number, details?: {
        reason: ResizeReason;
        event?: Event;
    }): boolean;
    /** Arrows move the handle's edges, or the box for `move`. Returns whether it handled the key. */
    keydown(event: KeyboardEvent, key: string, handle: ResizeHandle): boolean;
    /** Starts a drag of a handle, or of the box with `move`, once the pointer moves past `dragThreshold`. */
    pointerdown(event: PointerEvent, key: string, handle: ResizeHandle, el: HTMLElement): void;
    /** The handle being dragged on a box, if any. */
    dragging(state: State, key: string): ResizeHandle | undefined;
    /**
     * Places the box from state, as a `style` attribute for its `attrs`. Each
     * side reads its custom property first, which `style` sets during a drag.
     */
    boxStyle(state: State, key: string): string | undefined;
    /** The dragged box, as custom properties for the box slot's `live`, or `undefined`. */
    style(state: State, key: string): string | undefined;
    /** A handle's attributes: `data-resize-handle`, its cursor, and no touch scrolling. */
    handleAttrs(handle: ResizeHandle): {
        "data-resize-handle": ResizeHandle;
        style: string;
    };
};
/**
 * What `createResize` returns.
 * @experimental
 */
type Resize = ReturnType<typeof createResize>;
export { createResize, type Resize, type ResizeBox, resizeBox, resizeCursors, type ResizeDraft, type ResizeHandle, type ResizeLimits, resizeMessage, type ResizeMessage, type ResizeOptions, type ResizeReason, };
