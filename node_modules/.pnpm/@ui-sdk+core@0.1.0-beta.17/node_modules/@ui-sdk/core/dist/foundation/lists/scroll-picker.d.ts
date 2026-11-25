/**
 * What `onSelect` hears with the option it brought to the center.
 * @experimental
 */
type ScrollPickerSelectDetails = {
    /** The option at the center. */
    element: HTMLElement;
    /** What moved it there: a scroll, a drag's pointer, or a Page Up or Page Down key. */
    event?: Event;
};
/**
 * How `bindScrollPicker` scrolls and what it reports.
 * @experimental
 */
type ScrollPickerOptions = {
    /**
     * Which way the list scrolls. A horizontal list runs from the right in right-to-left text.
     * @defaultValue the list's `aria-orientation`, or "vertical"
     */
    orientation?: "horizontal" | "vertical";
    /**
     * Runs when someone's scroll, drag, or Page Up or Page Down brings another
     * enabled option to the center, with its index among all the options.
     * Select it here. Clicks and arrow keys select through the list itself.
     */
    onSelect?: (index: number, details: ScrollPickerSelectDetails) => void;
};
/**
 * Where `at` falls among the option `centers`, ascending, as a fractional
 * index: 2 at the third option's center, 2.5 halfway to the fourth. Past
 * either end it carries on at the spacing of the last two.
 */
declare function pickerPosition(centers: readonly number[], at: number): number;
/**
 * The enabled index nearest `position`, a fractional index from
 * `pickerPosition`, or -1 when every option is disabled.
 */
declare function nearestEnabled(position: number, count: number, isDisabled: (index: number) => boolean): number;
/**
 * Makes a scrolling list of options pick by scrolling, like a wheel of hours
 * or a thumbwheel of pages: the option at the center is the value. Scrolling,
 * a drag with the mouse or a flick selects the option at the center as it
 * passes, and settles on the nearest enabled one when it stops. When the list
 * selects an option itself, from a click, an arrow key or code, it scrolls
 * there smoothly without selecting the ones it passes. Each option gets
 * `--picker-offset`, its distance from the center in options, so a wheel can
 * be drawn in CSS. Give the list `scroll-snap-type` and its options
 * `scroll-snap-align: center`. Returns a cleanup.
 *
 * ```ts
 * const unbind = bindScrollPicker(listboxElement, {
 *   onSelect: (index) => controller.setValue(hours[index]),
 * })
 * ```
 * @experimental
 */
declare function bindScrollPicker(list: HTMLElement, options?: ScrollPickerOptions): () => void;
export { bindScrollPicker, nearestEnabled, pickerPosition, type ScrollPickerOptions, type ScrollPickerSelectDetails, };
