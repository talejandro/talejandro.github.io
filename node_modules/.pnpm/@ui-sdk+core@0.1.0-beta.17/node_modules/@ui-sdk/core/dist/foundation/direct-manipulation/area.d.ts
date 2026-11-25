import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * A point in an area, in its own units.
 * @experimental
 */
type AreaValue = {
    x: number;
    y: number;
};
/**
 * Why the value changed: a press on the surface, a drag, a key, or a call
 * from code, with the names a slider reports.
 * @experimental
 */
type AreaReason = "track-press" | "drag" | "step-key" | "imperative";
/**
 * One axis's range and step.
 * @experimental
 */
type AreaAxis = {
    min?: number;
    max?: number;
    step?: number;
    label?: string;
};
/**
 * How `createArea` reads and changes its value.
 * @experimental
 */
type AreaOptions<State extends object> = {
    /**
     * Reads the point from state, like `(state) => state.value`, or one made
     * from other state, like a color's saturation and brightness.
     */
    value: (state: State) => AreaValue;
    /**
     * Asks for a new value and returns whether it went through. Pass the
     * primitive's change: `set: (value, details) => change("value", value, details)`.
     */
    set: (value: AreaValue, details: {
        reason: AreaReason;
        event?: Event;
    }) => boolean;
    /** The x axis, left to right. @defaultValue `{ min: 0, max: 1, step: 0.01 }` */
    x?: () => AreaAxis;
    /** The y axis, bottom to top, like a chart: a higher value sits higher. @defaultValue `{ min: 0, max: 1, step: 0.01 }` */
    y?: () => AreaAxis;
    /** The text screen readers hear for the value. Defaults to each axis's label and percentage. */
    valueText?: (value: AreaValue) => string;
    /** Runs when a press or a drag ends, or a key changed the value, with the value it ended on, like Slider's `onValueCommit`. */
    onCommit?: (value: AreaValue, details: {
        reason: AreaReason;
        event?: Event;
    }) => void;
    /** Whether it can't change. */
    disabled?: () => boolean;
};
/**
 * Lets users pick a point on a surface. Call it once in `api`, keep it on
 * the api, and wire the surface and its thumb:
 *
 * ```ts
 * area: slot({ on: { pointerdown: (event, { el, api }) => api.area.pointerdown(event, el!) } }),
 * thumb: slot({
 *   attrs: (state, { api }) => ({ ...api.area.thumbAttrs(state), style: api.area.thumbStyle(state) }),
 *   on: { keydown: (event, { api }) => api.area.keydown(event) },
 * })
 * ```
 *
 * The thumb's style sets `inset-inline-start` and `top` in percentages and `--area-x` and
 * `--area-y` from 0 to 1, for a gradient or a crosshair.
 * @experimental
 */
declare function createArea<State extends object>(context: Pick<PrimitiveContext<any, State, any>, "store" | "onDestroy">, options: AreaOptions<State>): {
    /** Sets the value, snapped to each axis's step. Returns whether it changed. */
    set: (next: AreaValue) => boolean;
    /** Jumps the thumb under the pointer and follows it until it lifts. Call from the surface's `pointerdown`. */
    pointerdown(event: PointerEvent, el: HTMLElement): void;
    /**
     * Handles a key on the thumb and returns whether it did. Arrows step an
     * axis, Shift ten steps; Page Up and Page Down step y by a tenth of its
     * range; Home and End go to x's ends.
     */
    keydown(event: KeyboardEvent): boolean;
    /** Where the value sits, from 0 to 1 on each axis, with y from the bottom. */
    fractions(state: State): {
        x: number;
        y: number;
    };
    /** The thumb's position, as a `style` attribute. */
    thumbStyle(state: State): string;
    /** The thumb's role and value for screen readers, and `data-area-thumb` for the surface to find it. */
    thumbAttrs(state: State): {
        role: string;
        tabindex: string;
        "aria-roledescription": string;
        "aria-valuemin": string;
        "aria-valuemax": string;
        "aria-valuenow": string;
        "aria-valuetext": string;
        "aria-disabled": string | undefined;
        "data-area-thumb": string;
    };
};
/**
 * What `createArea` returns.
 * @experimental
 */
type Area = ReturnType<typeof createArea>;
export { type Area, type AreaAxis, type AreaOptions, type AreaReason, type AreaValue, createArea, };
