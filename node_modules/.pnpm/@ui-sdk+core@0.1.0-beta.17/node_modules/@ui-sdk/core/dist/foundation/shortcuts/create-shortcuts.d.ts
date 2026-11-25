/**
 * Runs when a shortcut's keys are pressed. The key press is already marked handled.
 * @stable
 */
type ShortcutHandler = (event: KeyboardEvent) => void;
/**
 * Where and when a registered shortcut runs.
 * @stable
 */
type ShortcutOptions = {
    /**
     * A named scope, like `"editor"`. The shortcut runs only while `setScope(name, true)` is in effect.
     * @defaultValue undefined, so it runs in every scope
     */
    scope?: string;
    /**
     * An element inside a popup, or a function that returns one. The shortcut belongs to that popup: it
     * runs only while the popup is open, and keeps running while a modal is open above the page. An
     * element on the page makes it a page shortcut, which a modal pauses. An element in a persistent
     * layer, like a toast region, keeps it running over every modal. A closed popup's content that
     * stays in the page, hidden, keeps it from running.
     * @defaultValue undefined, a page shortcut
     */
    layer?: Element | (() => Element | null | undefined);
    /**
     * Whether it runs while focus is in a text field. Shortcuts with Command, Control or Option
     * always do. Other keys typed into a field are text, so they don't run unless this is set.
     * @defaultValue false
     */
    allowInInput?: boolean;
    /**
     * Whether it runs again while the keys are held down, like `j` moving through a list.
     * @defaultValue false, so it runs once per press
     */
    repeat?: boolean;
    /** Checked each time the keys are pressed, and by `list()`. The shortcut runs only while it returns true. */
    when?: () => boolean;
    /** What the shortcut does, for a help screen that lists them. */
    description?: string;
};
/**
 * A registered shortcut, as `list()` describes it for a help screen.
 * @stable
 */
type ShortcutInfo = {
    /** The keys it was registered with, like `"mod+k"`. */
    keys: string;
    /** The keys formatted for this platform: `⌘K` on Apple platforms and `Ctrl+K` elsewhere. */
    hint: string;
    /** The keys as `aria-keyshortcuts` names them, like `"Meta+K"`. */
    ariaKeyshortcuts: string;
    /** What it does, from `description`. */
    description?: string;
    /** Its named scope, from `scope`. */
    scope?: string;
};
/**
 * Keys like `"mod+k"`, or a function read on every key press, for keys that change. Nothing turns it off.
 * @stable
 */
type ShortcutKeys = string | (() => string | null | undefined);
/**
 * Creates a set of keyboard shortcuts with one key listener. The page has
 * one, the shared `shortcuts`, which components and apps register into.
 */
declare function createShortcuts(): {
    /**
     * Registers a shortcut, like `register("mod+k", openSearch)`. Keys are
     * `+`-separated: `mod` is Command on Apple platforms and Control elsewhere.
     * Returns a function that unregisters it.
     */
    register(keys: ShortcutKeys, handler: ShortcutHandler, options?: ShortcutOptions): () => void;
    /** The shortcuts that would run now, oldest first, formatted for this platform. For a help screen. */
    list(): {
        keys: string;
        hint: string;
        ariaKeyshortcuts: string;
        description: string | undefined;
        scope: string | undefined;
    }[];
    /** Turns a named scope on or off. Shortcuts registered with that `scope` run only while it's on. */
    setScope(name: string, active: boolean): void;
    /** Whether a named scope is on. */
    isScopeActive: (name: string) => boolean;
    /** Unregisters every shortcut and stops listening. */
    destroy(): void;
};
export { createShortcuts, type ShortcutHandler, type ShortcutInfo, type ShortcutKeys, type ShortcutOptions, };
