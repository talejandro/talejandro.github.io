import { type PatternContext } from "./pattern-context.js";
/** A composite widget: its container, its items as they are now, and how problems name them. */
type Composite = {
    container: Element;
    items: () => Element[];
    /** What an item is called in a problem, like "option". */
    noun: string;
    /** The APG pattern a problem cites, like "listbox". */
    source: string;
};
/** The item that has focus: the focused one, or the one `aria-activedescendant` names. */
declare function currentItem(context: PatternContext, composite: Composite): Element | undefined;
declare function checkTabStop(context: PatternContext, composite: Composite, required?: boolean): void;
/** Focuses the composite's tab stop, as Tab would, and returns the item that has focus. */
declare function enter(context: PatternContext, composite: Composite): Promise<Element | undefined>;
/** Presses a key that moves one item forward or back, and checks it did. */
declare function expectStep(context: PatternContext, composite: Composite, key: string, forward: boolean, wraps: boolean | undefined): Promise<Element>;
/**
 * Checks the arrows, and Home and End where the pattern has them: from the
 * item that has focus, forward and back, then past both ends. Returns the
 * item focus started on, for `returnTo`.
 */
declare function checkNavigation(context: PatternContext, composite: Composite, moves: {
    next: string[];
    previous: string[];
    /** Whether arrows wrap past the ends: required, forbidden, or left open. */
    wraps?: boolean;
    homeEnd: boolean;
    /** Runs after every move, for what a move also changes, like checking a radio. */
    onMove?: (key: string, item: Element) => void;
}): Promise<Element | undefined>;
/** Moves focus back to `target` with the arrows, which also restores a selection that follows focus. */
declare function returnTo(context: PatternContext, composite: Composite, target: Element | undefined, arrows: {
    next: string;
    previous: string;
}): Promise<void>;
/**
 * Types the first letter of an item's name, which only that item starts
 * with, and checks focus moved to it. When the focused item is the only one,
 * an arrow moves off it first.
 */
declare function checkTypeahead(context: PatternContext, composite: Composite, arrows: {
    next: string;
    previous: string;
}): Promise<void>;
export { checkNavigation, checkTabStop, checkTypeahead, currentItem, enter, expectStep, returnTo, type Composite, };
