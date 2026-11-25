/**
 * The top layer (the popover attribute) keeps popups above everything without
 * portals. Older browsers lack it, and adapters portal to the body instead.
 * @stable
 */
declare function supportsTopLayer(): boolean;
/**
 * Where a popup should render. An explicit container wins. Without top layer
 * support, the body. Otherwise null: render in place.
 */
declare function portalTarget(container?: Element | DocumentFragment | null): Element | DocumentFragment | null;
declare function activeElement(doc?: Document): HTMLElement | null;
declare function composedHops(node: Node): Node[];
declare function composedContains(container: Node, node: Node): boolean;
declare function composedClosest<T extends Element>(node: Node, selector: string): T | null;
declare function prefersReducedMotion(): boolean;
/**
 * Overrides platform detection for shortcuts and their labels, like in tests or on the server.
 * @stable
 */
declare function setPlatform(platform: "apple" | "other"): void;
declare function isApple(): boolean;
declare function initialApple(): boolean;
/**
 * "mod+shift+n" becomes "Meta+Shift+N" on Apple platforms and "Control+Shift+N" elsewhere.
 * @stable
 */
declare function ariaKeyshortcuts(shortcut: string, apple?: boolean): string;
/**
 * What to show next to an item: "⌘N" on Apple platforms, "Ctrl+N" elsewhere.
 * The text is wrapped in a left-to-right isolate, so a right-to-left layout
 * never reorders it into "N⌘".
 * @stable
 */
declare function formatShortcut(shortcut: string, apple?: boolean): string;
/**
 * Whether a key press matches a shortcut like `"mod+k"`. `mod` is Command on
 * Apple platforms and Control elsewhere, and letters match by physical key
 * when the layout types another character, like Option+N on a Mac.
 * @experimental
 */
declare function matchesShortcut(event: KeyboardEvent, shortcut: string, apple?: boolean): boolean;
declare function hasCommandModifier(keys: string): boolean;
export { activeElement, ariaKeyshortcuts, composedClosest, composedContains, composedHops, formatShortcut, hasCommandModifier, initialApple, isApple, matchesShortcut, portalTarget, prefersReducedMotion, setPlatform, supportsTopLayer, };
