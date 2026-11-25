declare const roles: readonly ["alert", "alertdialog", "application", "article", "banner", "blockquote", "button", "caption", "cell", "checkbox", "code", "columnheader", "combobox", "complementary", "contentinfo", "definition", "deletion", "dialog", "document", "emphasis", "feed", "figure", "form", "generic", "grid", "gridcell", "group", "heading", "img", "insertion", "link", "list", "listbox", "listitem", "log", "main", "marquee", "math", "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "meter", "navigation", "none", "note", "option", "paragraph", "presentation", "progressbar", "radio", "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar", "search", "searchbox", "separator", "slider", "spinbutton", "status", "strong", "subscript", "superscript", "switch", "tab", "table", "tablist", "tabpanel", "term", "textbox", "time", "timer", "toolbar", "tooltip", "tree", "treegrid", "treeitem"];
declare const focusableRoles: readonly ["button", "checkbox", "combobox", "gridcell", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "searchbox", "slider", "spinbutton", "switch", "tab", "textbox", "treeitem"];
declare const pressableRoles: readonly ["button", "checkbox", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "tab", "treeitem"];
declare const keyedRoles: readonly ["combobox", "grid", "listbox", "menu", "menubar", "radiogroup", "slider", "spinbutton", "tablist", "toolbar", "tree", "treegrid"];
declare const ariaSupport: {
    readonly "aria-activedescendant": readonly ["application", "combobox", "grid", "group", "listbox", "menu", "menubar", "radiogroup", "row", "searchbox", "spinbutton", "tablist", "textbox", "toolbar", "tree", "treegrid"];
    readonly "aria-autocomplete": readonly ["combobox", "searchbox", "textbox"];
    readonly "aria-checked": readonly ["checkbox", "menuitemcheckbox", "menuitemradio", "option", "radio", "switch", "treeitem"];
    readonly "aria-colcount": readonly ["grid", "table", "treegrid"];
    readonly "aria-colindex": readonly ["cell", "columnheader", "gridcell", "row", "rowheader"];
    readonly "aria-colspan": readonly ["cell", "columnheader", "gridcell", "rowheader"];
    readonly "aria-expanded": readonly ["application", "button", "checkbox", "columnheader", "combobox", "gridcell", "link", "listbox", "menuitem", "menuitemcheckbox", "menuitemradio", "row", "rowheader", "switch", "tab", "treeitem"];
    readonly "aria-level": readonly ["heading", "listitem", "row", "treeitem"];
    readonly "aria-modal": readonly ["alertdialog", "dialog"];
    readonly "aria-multiline": readonly ["searchbox", "textbox"];
    readonly "aria-multiselectable": readonly ["grid", "listbox", "tablist", "tree", "treegrid"];
    readonly "aria-orientation": readonly ["listbox", "menu", "menubar", "radiogroup", "scrollbar", "separator", "slider", "tablist", "toolbar", "tree", "treegrid"];
    readonly "aria-placeholder": readonly ["searchbox", "textbox"];
    readonly "aria-posinset": readonly ["article", "listitem", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "row", "tab", "treeitem"];
    readonly "aria-pressed": readonly ["button"];
    readonly "aria-readonly": readonly ["checkbox", "columnheader", "combobox", "grid", "gridcell", "listbox", "menuitemcheckbox", "menuitemradio", "radiogroup", "rowheader", "searchbox", "slider", "spinbutton", "switch", "textbox"];
    readonly "aria-required": readonly ["checkbox", "columnheader", "combobox", "gridcell", "listbox", "radiogroup", "rowheader", "searchbox", "spinbutton", "switch", "textbox", "tree", "treegrid"];
    readonly "aria-rowcount": readonly ["grid", "table", "treegrid"];
    readonly "aria-rowindex": readonly ["cell", "columnheader", "gridcell", "row", "rowheader"];
    readonly "aria-rowspan": readonly ["cell", "columnheader", "gridcell", "rowheader"];
    readonly "aria-selected": readonly ["columnheader", "gridcell", "option", "row", "rowheader", "tab", "treeitem"];
    readonly "aria-setsize": readonly ["article", "listitem", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "row", "tab", "treeitem"];
    readonly "aria-sort": readonly ["columnheader", "rowheader"];
    readonly "aria-valuemax": readonly ["meter", "progressbar", "scrollbar", "separator", "slider", "spinbutton"];
    readonly "aria-valuemin": readonly ["meter", "progressbar", "scrollbar", "separator", "slider", "spinbutton"];
    readonly "aria-valuenow": readonly ["meter", "progressbar", "scrollbar", "separator", "slider", "spinbutton"];
    readonly "aria-valuetext": readonly ["meter", "progressbar", "scrollbar", "separator", "slider", "spinbutton"];
};
declare const namelessRoles: readonly ["caption", "code", "deletion", "emphasis", "generic", "insertion", "none", "paragraph", "presentation", "strong", "subscript", "superscript"];
declare const requiredStates: {
    readonly checkbox: readonly ["aria-checked"];
    readonly combobox: readonly ["aria-expanded"];
    readonly menuitemcheckbox: readonly ["aria-checked"];
    readonly menuitemradio: readonly ["aria-checked"];
    readonly meter: readonly ["aria-valuenow"];
    readonly option: readonly ["aria-selected"];
    readonly radio: readonly ["aria-checked"];
    readonly slider: readonly ["aria-valuenow"];
    readonly switch: readonly ["aria-checked"];
    readonly tab: readonly ["aria-selected"];
};
/**
 * A WAI-ARIA role a part can declare with its slot's `role`.
 */
type Role = (typeof roles)[number];
type RoleAria = keyof typeof ariaSupport;
type AriaOf<R> = {
    [K in RoleAria]: R extends (typeof ariaSupport)[K][number] ? K : never;
}[RoleAria];
type RequiredAria<R> = R extends keyof typeof requiredStates ? (typeof requiredStates)[R][number] : never;
type NamelessRole = (typeof namelessRoles)[number];
type FocusableRole = (typeof focusableRoles)[number];
type PressableRole = (typeof pressableRoles)[number];
type KeyedRole = (typeof keyedRoles)[number];
/**
 * How a part that takes focus gets it. `"roving"`: one of a set holds the tab
 * stop, and keys move it. `"tab-stop"`: always in the tab order.
 * `"active-descendant"`: focus stays on another element, which points at the
 * part with `aria-activedescendant`. `"native"`: the element focuses on its
 * own, like a `<button>` or an `<input>`.
 */
type Focus = "roving" | "tab-stop" | "active-descendant" | "native";
/**
 * A key a part handles, by `KeyboardEvent.key`, or `"typeahead"` for typed
 * characters that move to a matching item. Modifiers are written as in
 * shortcuts, like `"mod+a"`.
 */
type HandledKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Home" | "End" | "PageUp" | "PageDown" | "Enter" | " " | "Escape" | "Tab" | "typeahead" | (string & {});
/**
 * A need a slot's role has that another element meets, with the reason, like
 * `keys: { none: "The combobox's input handles them." }`.
 */
type Unneeded = {
    none: string;
};
/**
 * The needs a role has that a slot doesn't meet: `"keydown"` when it lists
 * `keys` with no `on.keydown` to handle them.
 */
declare function unmetNeeds(role: string, slot: {
    focus?: unknown;
    press?: unknown;
    keys?: unknown;
    on?: {
        keydown?: unknown;
    };
}): ("press" | "keys" | "focus" | "keydown")[];
declare const knownRoles: Set<string>;
/**
 * The ARIA attributes a part renders that its role doesn't take, and the
 * states the role requires that it renders without, like `aria-checked` on a checkbox.
 */
declare function ariaProblems(role: string, attrs: Record<string, unknown>): {
    notAllowed: string[];
    missing: string[];
};
export { type AriaOf, ariaProblems, type Focus, type FocusableRole, type HandledKey, type KeyedRole, knownRoles, type NamelessRole, type PressableRole, type RequiredAria, type RoleAria, type Role, type Unneeded, unmetNeeds, };
