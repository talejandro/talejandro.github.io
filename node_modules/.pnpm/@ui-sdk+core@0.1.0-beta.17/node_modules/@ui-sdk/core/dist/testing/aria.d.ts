import { accessibleName, roleOf } from "../foundation/text/accessible-name.js";
declare const isGone: (el: Element) => boolean;
declare const isUnreachable: (el: Element) => boolean;
/** Whether `display: none` on `el` or an element around it hides it, like a closed branch its styles hide. */
declare function isUndisplayed(el: Element | null, known?: Map<Element, boolean>): boolean;
/**
 * Every element in `scope` with one of `roles`, in page order, leaving out what isn't rendered or is
 * hidden from screen readers, like a form's hidden native input. With `displayed` false it keeps what
 * styles hide, like a collapsed tree branch's group, for structure checks.
 */
declare function withRole(scope: Element, roles: string[], { displayed }?: {
    displayed?: boolean | undefined;
}): Element[];
/** Whether an attribute is "true" or "false", as a boolean state must be. */
declare const hasBoolean: (el: Element, attribute: string) => boolean;
/** A checked state as a screen reader reads it: aria-checked, or a native input's `checked`. */
declare const checkedOf: (el: Element) => string;
declare const isReadOnly: (el: Element) => boolean;
/** The elements in `scope`, itself included, that Tab stops at. */
declare function tabStops(scope: Element): Element[];
/** The elements in `scope` that can take focus, by Tab or by script, like roving items. */
declare function focusables(scope: Element): Element[];
declare const ids: (el: Element, attribute: string) => string[];
/** The element an id reference names, in the document or shadow root `el` is in, as ARIA resolves it. */
declare function byId(el: Element, id: string): HTMLElement | null;
/** The id references in `scope` that point at nothing, with the attribute that holds each. */
declare function danglingReferences(scope: Element): {
    el: Element;
    attribute: string;
    id: string;
}[];
/** Whether `el` reads right to left: the nearest `dir`, else its computed direction. */
declare function isRtl(el: Element): boolean;
/** A short selector that names an element in a problem, like `button#tabs-tab-b[role=tab]`. */
declare function describe(el: Element | null | undefined): string;
export { accessibleName, byId, checkedOf, danglingReferences, describe, focusables, hasBoolean, ids, isGone, isReadOnly, isRtl, isUndisplayed, isUnreachable, roleOf, tabStops, withRole, };
