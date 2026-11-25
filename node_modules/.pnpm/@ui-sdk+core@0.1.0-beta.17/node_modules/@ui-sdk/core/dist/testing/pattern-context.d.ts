declare const stopped: Error;
declare function createContext(root: Element): {
    root: Element;
    doc: Document;
    problems: Set<string>;
    problem: (el: Element | null | undefined, rule: string) => void;
    press: (key: string) => Promise<void>;
    focus: (el: Element) => Promise<void>;
    checkReferences: () => void;
    /** Checks id references in a popup that renders outside the root too. */
    watch: (el: Element) => Set<Element>;
};
/** What every pattern check receives. */
type PatternContext = ReturnType<typeof createContext>;
/** The pattern's element: the root, one inside it, or a popup its root or a part of it controls. */
declare function findWidget(context: PatternContext, roles: string[]): Element | undefined;
declare function requireName(context: PatternContext, el: Element, source: string): void;
/**
 * The orientation assistive technology reads, from `aria-orientation` or the
 * role's default. A `data-orientation` that says otherwise is a problem: the
 * arrows a person is told to use aren't the ones that work.
 */
declare function orientationOf(context: PatternContext, el: Element): "horizontal" | "vertical";
/** The arrows that move forward and back along an orientation. Horizontal ones swap right to left. */
declare function arrowsFor(orientation: "horizontal" | "vertical", rtl: boolean): {
    next: string;
    previous: string;
};
/** Flags widgets inside a composite that it can't own, like a button in a listbox. */
declare function checkOwned(context: PatternContext, container: Element, allowed: string[], source: string): void;
/** The element whose `aria-controls` names a popup, outside the popup itself. */
declare function triggerOf(popup: Element): Element | undefined;
/** The popup with one of `roles` that an element's `aria-controls` names. */
declare function popupOf(el: Element, roles: string[]): HTMLElement | null | undefined;
/** Whether a popup is open: rendered, and not hidden by `hidden` or `display: none`. */
declare function isShown(el: Element | null | undefined): boolean;
export { arrowsFor, checkOwned, createContext, findWidget, isShown, orientationOf, popupOf, requireName, stopped, triggerOf, type PatternContext, };
