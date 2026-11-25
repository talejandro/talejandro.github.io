import type { ShortcutOptions } from "./shortcuts.js";
/**
 * Where a shortcut stands among the open layers: the order of the layer it
 * belongs to, 0 for the page, or null when it belongs to a popup that's
 * closed, whether it left the page or stays in it hidden. One in a persistent
 * layer, like a toast region, stands above every layer, so no modal pauses it.
 */
declare function shortcutOrder(layer: ShortcutOptions["layer"], find: (el: Element) => {
    order?: number;
} | undefined, persistent?: (el: Element) => boolean, inPopup?: (el: Element) => boolean): number | null;
/**
 * Whether a shortcut at `order` may run while the topmost blocking layer,
 * like a modal dialog, opened at `blocking`. Shortcuts of that layer and of
 * layers opened after it run. The page's and those of layers beneath pause.
 */
declare function isShortcutAllowed(order: number | null, blocking: number | undefined): boolean;
/** Whether a key press happened while typing text, where letters are text. */
declare function isTypingIn(target: EventTarget | null | undefined): boolean;
export { isShortcutAllowed, isTypingIn, shortcutOrder };
