import { createShortcuts, type ShortcutHandler, type ShortcutInfo, type ShortcutKeys, type ShortcutOptions } from "./create-shortcuts.js";
/**
 * Registers a shortcut in the shared `shortcuts`, like `registerShortcut("mod+k", open)`.
 * Returns a function that unregisters it.
 * @stable
 */
declare function registerShortcut(keys: ShortcutKeys, handler: ShortcutHandler, options?: ShortcutOptions): () => void;
/**
 * A set of keyboard shortcuts, like the shared `shortcuts`.
 * @stable
 */
type Shortcuts = ReturnType<typeof createShortcuts>;
/**
 * The shared shortcuts every component registers into. One per page, even
 * when two copies of the package load. It listens only once something registers.
 * @stable
 */
declare const shortcuts: Shortcuts;
export { registerShortcut, type ShortcutHandler, type ShortcutInfo, type ShortcutKeys, type ShortcutOptions, shortcuts, type Shortcuts, };
