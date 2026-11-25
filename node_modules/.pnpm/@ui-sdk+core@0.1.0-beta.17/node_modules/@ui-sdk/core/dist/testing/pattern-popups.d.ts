import { type PatternContext } from "./pattern-context.js";
/** Menu: an open menu and its button, items with their states, arrows, Home and End, typeahead, Escape and Enter. */
declare function menu(context: PatternContext): Promise<void>;
declare const dialog: (context: PatternContext) => Promise<void>;
declare const alertdialog: (context: PatternContext) => Promise<void>;
/** Combobox: a name and aria-expanded, Down opening its popup, Down and Up moving the active option, and Escape. */
declare function combobox(context: PatternContext): Promise<void>;
export { alertdialog, combobox, dialog, menu };
