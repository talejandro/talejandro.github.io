import { isComposing } from "../kernel/events.js";
/**
 * How a control lays out and which arrows it takes.
 * @experimental
 */
type NumberKeyOptions = {
    /** Which way the control runs. Right to left flips Left and Right only on a horizontal one. @defaultValue "horizontal" */
    orientation?: "horizontal" | "vertical";
    /** The control's direction, like `getComputedStyle(el).direction`. @defaultValue "ltr" */
    dir?: "ltr" | "rtl";
    /**
     * Which arrows step. `"vertical"` leaves Left and Right to a text caret, as
     * a number field does, and `"horizontal"` leaves Up and Down to the page. @defaultValue "all"
     */
    arrows?: "all" | "horizontal" | "vertical";
};
/**
 * The move a key asks of a numeric control, or null for keys it leaves alone.
 * Up and Right step up, Down and Left step down, Shift takes the large step
 * and Alt the small one; Page Up and Down take the large step; Home and End go
 * to the bounds. Ctrl and Cmd are the caller's to check. A key an input
 * method is composing with, like an arrow choosing a candidate, is null too.
 * @experimental
 */
declare function stepFromKey(event: {
    key: string;
    shiftKey?: boolean;
    altKey?: boolean;
} & Parameters<typeof isComposing>[0], { orientation, dir, arrows, }?: NumberKeyOptions): {
    bound: "min";
    direction?: undefined;
    size?: undefined;
} | {
    bound: "max";
    direction?: undefined;
    size?: undefined;
} | {
    direction: 1 | -1;
    size: "small" | "step" | "large";
    bound?: undefined;
} | null;
export { type NumberKeyOptions, stepFromKey };
