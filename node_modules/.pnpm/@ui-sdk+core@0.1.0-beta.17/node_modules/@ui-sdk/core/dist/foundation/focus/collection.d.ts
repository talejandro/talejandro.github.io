/**
 * An orientation as the option gives it. A custom element passes its
 * `orientation` attribute as written, so anything but the two values is the
 * default, never an invalid `aria-orientation`.
 */
declare const orientationOf: (value: unknown, fallback: "horizontal" | "vertical") => "horizontal" | "vertical";
/** Which way a selection moved, on screen. */
type Direction = "none" | "left" | "right" | "up" | "down";
declare function stepFor(key: string, orientation: "horizontal" | "vertical" | "both", rtl: boolean): 1 | -1 | "first" | "last" | undefined;
declare function radioStep(key: string, rtl: boolean): 1 | -1 | undefined;
/** An item of a roving group, as the tab stop decision sees it. */
type RovingCandidate = {
    key: string;
    /** Whether it can't be activated. */
    disabled: boolean;
    /** Whether it can take focus at all. */
    focusable: boolean;
    /** Whether it's selected, checked or pressed, so Tab lands on it first. */
    preferred: boolean;
};
declare function rovingStop(items: readonly RovingCandidate[], remembered?: string | null): string;
declare function fieldKeepsKey(key: string, field: {
    start: number | null;
    end: number | null;
    length: number;
    rtl: boolean;
    usesUpDown: boolean;
}): boolean;
declare function moveIndex(index: number, step: number | "first" | "last", count: number, loop: boolean): number;
declare function inOrder(values: readonly string[], order: readonly string[]): string[];
declare function scrollToShow(scroll: number, viewport: number, start: number, size: number, before?: number, after?: number): number;
export { type Direction, fieldKeepsKey, inOrder, moveIndex, orientationOf, radioStep, type RovingCandidate, rovingStop, scrollToShow, stepFor, };
