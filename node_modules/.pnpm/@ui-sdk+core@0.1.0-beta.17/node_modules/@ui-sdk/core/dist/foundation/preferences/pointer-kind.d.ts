/**
 * How precise a pointer is: `"fine"` for a mouse, trackpad or stylus,
 * `"coarse"` for a finger, `"none"` without one, or `"unknown"` before it's known.
 * @experimental
 */
type PointerPrecision = "fine" | "coarse" | "none" | "unknown";
/**
 * Whether a pointer can hover: `"hover"`, `"none"`, or `"unknown"` before it's known.
 * @experimental
 */
type PointerHover = "hover" | "none" | "unknown";
/**
 * Everything a pointer kind knows, named after the media features it reads.
 * @experimental
 */
type PointerKindState = {
    /** The main pointer's precision: `"coarse"` on a phone. */
    pointer: PointerPrecision;
    /** Whether the main pointer can hover. */
    hover: PointerHover;
    /** The most precise of all the pointers, like `"fine"` for a tablet with a trackpad. */
    anyPointer: PointerPrecision;
    /** Whether any of the pointers can hover. */
    anyHover: PointerHover;
};
/**
 * Options for `createPointerKind`.
 * @experimental
 */
type PointerKindOptions = {
    /**
     * What the server and the first client render assume, so hydration
     * matches, like `pointerKindOf`'s guess from the request. Fields left out are `"unknown"`.
     */
    initial?: Partial<PointerKindState>;
    /** The window to read, like an iframe's. Defaults to the page's window. */
    view?: Window;
};
/**
 * A primitive's store, or any state with `get` and `set`, that `follow` keeps in step.
 * @experimental
 */
type PointerKindStore<Key extends string> = {
    /** The current state. */
    get: () => {
        [K in Key]: PointerKindState;
    };
    /** Writes part of the state. */
    set: (partial: {
        [K in Key]: PointerKindState;
    }) => void;
};
/**
 * The device's pointer: whether it's a finger or a mouse, and whether it can
 * hover, for behavior like opening on tap where nothing hovers. Style with
 * the media queries instead. Read it like a preference, with `get`,
 * `subscribe`, `follow`, or `usePreference` in a framework.
 * @experimental
 */
declare function createPointerKind(options?: PointerKindOptions): {
    /** What the server and the first client render show: `initial`, and `"unknown"` for the rest. */
    initialState: PointerKindState;
    /** What the pointer kind knows now. The same object until something changes. */
    get: () => PointerKindState;
    /** Hears every change, like a mouse plugged into a tablet. Returns the function that stops it. */
    subscribe: (listener: (state: PointerKindState) => void) => () => void;
    /**
     * Keeps `key` in a store set to the pointer kind's state. Call it from a
     * part's `bind`: the state starts at `initialState`, catches up a
     * microtask later, once hydration is done, and follows every change after
     * that. Returns the cleanup for `bind`.
     */
    follow: <Key extends string>(store: PointerKindStore<Key>, key: Key) => () => void;
};
/**
 * A pointer kind, from `createPointerKind`.
 * @experimental
 */
type PointerKind = ReturnType<typeof createPointerKind>;
/**
 * A guess at the pointer from a request's `Sec-CH-UA-Mobile` header, for
 * `createPointerKind`'s `initial`: a finger without hover on a phone, a mouse
 * otherwise. Only Chromium browsers send it, so it's empty without one.
 * @experimental
 */
declare function pointerKindOf(mobileHint: string | null | undefined): Partial<PointerKindState>;
export { type PointerHover, type PointerKind, type PointerKindOptions, type PointerKindState, type PointerKindStore, type PointerPrecision, createPointerKind, pointerKindOf, };
