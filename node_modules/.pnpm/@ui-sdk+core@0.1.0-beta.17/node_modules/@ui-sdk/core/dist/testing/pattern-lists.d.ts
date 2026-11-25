import { type PatternContext } from "./pattern-context.js";
/** Listbox: options with aria-selected, one tab stop, arrows, Home and End, selection and typeahead. */
declare function listbox(context: PatternContext): Promise<void>;
/** Tabs: tabs with aria-selected, linked to their panels, one tab stop, wrapping arrows and activation. */
declare function tabs(context: PatternContext): Promise<void>;
/** Radio group: radios with aria-checked, one tab stop on the checked radio, arrows that move and check. */
declare function radioGroup(context: PatternContext): Promise<void>;
/** Toolbar: one tab stop, arrows along its orientation, Home and End. */
declare function toolbar(context: PatternContext): Promise<void>;
declare const menuItemRoles: string[];
/** The items a menu or menubar owns, leaving out those of the menus inside it. */
declare const ownItems: (container: Element) => Element[];
/** Menubar: one tab stop, wrapping arrows, Home and End, and the arrow across it opening an item's menu. */
declare function menubar(context: PatternContext): Promise<void>;
/** Tree view: treeitems with aria-expanded on branches, one tab stop, arrows, Home and End, branches and typeahead. */
declare function tree(context: PatternContext): Promise<void>;
export { listbox, menubar, menuItemRoles, ownItems, radioGroup, tabs, toolbar, tree, };
