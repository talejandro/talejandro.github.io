import type { ChangeDetails, ChangeReason } from "../kernel/details.js";
import type { ValueStorage } from "../storage/storage.js";
/**
 * A color scheme the app can choose: `"light"`, `"dark"`, or `"system"`,
 * which follows the browser's preference. Style `"system"` with CSS
 * `prefers-color-scheme`, so it renders right before the preference is known.
 * @experimental
 */
type ColorSchemeValue = "system" | "light" | "dark";
/**
 * A scheme as the browser knows it: `"light"`, `"dark"`, or `"unknown"` on
 * the server, before hydration, and in browsers without `prefers-color-scheme`.
 * @experimental
 */
type SystemColorScheme = "light" | "dark" | "unknown";
/**
 * Everything a color scheme knows, from `get`, `subscribe` and `follow`.
 * @experimental
 */
type ColorSchemeState = {
    /** What the app chose. `"system"` follows the browser's preference. */
    value: ColorSchemeValue;
    /** What the browser prefers. */
    system: SystemColorScheme;
    /** What shows: `value`, or `system` when `value` is `"system"`. */
    resolved: SystemColorScheme;
};
/**
 * Options for `createColorScheme`.
 * @experimental
 */
type ColorSchemeOptions = {
    /**
     * The scheme the app starts with, like a choice saved in a cookie that the
     * server read.
     * @defaultValue "system"
     */
    defaultValue?: ColorSchemeValue;
    /**
     * The browser's preference the server and the first client render assume,
     * so hydration matches. Read the request's `Sec-CH-Prefers-Color-Scheme`
     * hint with `colorSchemeOf`.
     * @defaultValue "unknown"
     */
    initial?: SystemColorScheme;
    /** Called before the app's scheme changes. `details.cancel()` keeps the current one. */
    onValueChange?: (value: ColorSchemeValue, details: ChangeDetails<ChangeReason>) => void;
    /** Called when the browser's preference changes, while something subscribes or follows. */
    onSystemValueChange?: (value: "light" | "dark") => void;
    /**
     * Where the choice is kept between visits, from `createLocalStorage`,
     * `createSessionStorage` or `createCookieStorage`. A cookie the server reads
     * renders from the first render; the others are read back once something
     * subscribes or follows, after hydration, with the reason `"restore"`.
     */
    storage?: ValueStorage;
    /**
     * Whether `Preferences` puts `data-color-scheme` on `<html>`, for a page
     * that styles by it everywhere. Otherwise it goes on the `Preferences` element.
     * @defaultValue false
     */
    global?: boolean;
    /** The window to read, like an iframe's. Defaults to the page's window. */
    view?: Window;
};
/**
 * A primitive's store, or any state with `get` and `set`, that `follow` keeps in step.
 * @experimental
 */
type ColorSchemeStore<Key extends string> = {
    /** The current state. */
    get: () => {
        [K in Key]: ColorSchemeState;
    };
    /** Writes part of the state. */
    set: (partial: {
        [K in Key]: ColorSchemeState;
    }) => void;
};
/**
 * The app's color scheme: a choice of `"system"`, `"light"` or `"dark"`, the
 * browser's preference, and what shows. Create one per scope, like the page
 * or a dark sidebar. They share one query per window. It's a preference on
 * `data-color-scheme`, so pass it to `Preferences` with any others.
 * @experimental
 */
declare function createColorScheme(options?: ColorSchemeOptions): {
    /** The attribute `Preferences` shows the choice on. */
    attribute: `data-${string}`;
    /** Whether `Preferences` puts `data-color-scheme` on `<html>`. */
    global: boolean;
    /** The choices: `"system"`, `"light"` and `"dark"`. */
    values: readonly ("system" | "light" | "dark")[];
    /** The choice when nothing allowed is saved. */
    defaultValue: "system" | "light" | "dark";
    /** Where the choice is kept between visits. */
    storage: {
        id: string;
        kind: "local" | "session" | "cookie";
        readsOnServer: boolean;
        script: (options: import("../../index.js").StorageScriptOptions) => string | undefined;
        available: () => boolean;
        get: () => string | null;
        set: (value: string) => boolean;
        remove: () => boolean;
        subscribe(listener: (value: string | null) => void): () => void;
    } | undefined;
    /** What the server and the first client render show: `defaultValue`, with `initial` as the browser's preference. */
    initialState: ColorSchemeState;
    /** What the color scheme knows now. The same object until something changes. */
    get: () => ColorSchemeState;
    /**
     * Changes the app's scheme, through `onValueChange`, which can cancel it.
     * The reason defaults to `"imperative"`. Returns whether it changed.
     */
    set: (next: "system" | "light" | "dark", change?: {
        reason?: ChangeReason;
        event?: Event;
    }) => boolean;
    /** Hears every change, to the app's scheme or the browser's preference. Returns the function that stops it. */
    subscribe: (listener: (state: ColorSchemeState) => void) => () => void;
    /**
     * Keeps `key` in a store set to the color scheme's state. Call it from a
     * part's `bind`: the state starts at `initialState`, catches up a
     * microtask later, once hydration is done, and follows every change after
     * that. Returns the cleanup for `bind`.
     */
    follow: <Key extends string>(store: ColorSchemeStore<Key>, key: Key) => () => void;
};
/**
 * A color scheme, from `createColorScheme`.
 * @experimental
 */
type ColorScheme = ReturnType<typeof createColorScheme>;
/**
 * The browser's preference a `Sec-CH-Prefers-Color-Scheme` request header
 * reports: `"light"`, `"dark"`, or `"unknown"` when it's missing or unknown.
 * @experimental
 */
declare function colorSchemeOf(hint: string | null | undefined): SystemColorScheme;
export { type ColorScheme, type ColorSchemeOptions, type ColorSchemeState, type ColorSchemeStore, type ColorSchemeValue, type SystemColorScheme, colorSchemeOf, createColorScheme, };
