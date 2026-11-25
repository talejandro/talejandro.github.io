/**
 * A WAI-ARIA Authoring Practices pattern, by its APG name.
 * @experimental
 */
type Pattern = "listbox" | "menu" | "menubar" | "tabs" | "radio-group" | "toolbar" | "tree" | "dialog" | "alertdialog" | "disclosure" | "accordion" | "combobox" | "slider" | "switch" | "checkbox";
/**
 * Checks a rendered widget against its WAI-ARIA pattern, and throws one
 * error that lists every problem, each with its element and rule, or returns
 * nothing when there are none. `root` is the widget's element or one around
 * it; a popup's trigger finds a popup rendered elsewhere. Open a menu or a
 * dialog before checking it.
 *
 * It checks roles, required states, names and id references, one tab stop
 * per composite, then drives the pattern's keys from the focused element:
 * arrows (by `aria-orientation`, swapped right to left), Home and End,
 * typeahead, Escape, Enter and Space. After every key, focus must not fall to
 * the body or land in `aria-hidden` or `inert` content. It puts focus and
 * state back where it can; a menu check presses Enter on an item, which runs
 * its action.
 *
 * It holds widgets to more than the APG's letter in three places: Home and
 * End are required in a listbox, tabs and a toolbar, where the APG makes them
 * optional; a modal dialog, one that makes the page behind it inert, needs
 * `aria-modal="true"`; and a tablist needs a name.
 *
 * @example
 * const view = mount(tabs, { defaultValue: "a" }, markup)
 * await checkPattern(view.root, "tabs")
 *
 * @experimental
 */
declare function checkPattern(root: Element, pattern: Pattern): Promise<void>;
export { checkPattern, type Pattern };
