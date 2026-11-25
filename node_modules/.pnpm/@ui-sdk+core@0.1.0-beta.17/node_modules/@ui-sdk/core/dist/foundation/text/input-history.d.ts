/**
 * What `createInputHistory` takes.
 * @experimental
 */
type InputHistoryOptions<T> = {
    /** The earlier values, oldest first. */
    entries: () => readonly T[] | undefined;
    /** The value the field shows now. */
    read: () => T;
    /** Shows a value, as if the user typed it. Return `false` when the change was canceled. */
    write: (value: T, event: KeyboardEvent) => boolean | void;
    /**
     * Whether the caret can't move any further in `direction`, so the arrow
     * reaches the earlier values. Defaults to the first and last line of a
     * textarea, and anywhere in a text input.
     */
    atEdge?: (direction: "up" | "down", event: KeyboardEvent) => boolean;
    /**
     * A key for each value, like a message's id. With it, values are matched by key: values made
     * again from the same messages keep their place, and so does the value shown when a new one
     * arrives. Without it, values are compared as they are, and any change starts over.
     */
    getEntryKey?: (entry: T) => string;
};
/**
 * Steps through earlier values with the arrow keys, like a terminal or a
 * chat box: ArrowUp brings back the previous value, ArrowDown the next, and
 * ArrowDown past the newest brings back what was being typed. Edits to a value
 * brought back last until `entries` changes, like after a send.
 *
 * ```ts
 * const history = createInputHistory({
 *   entries: () => options().history,
 *   read: () => store.get().value,
 *   write: (value) => store.set({ value }),
 * })
 * root: slot({ on: { keydown: (event, { api }) => api.history.keydown(event) } })
 * ```
 * @experimental
 */
declare function createInputHistory<T>(options: InputHistoryOptions<T>): {
    /** Handles ArrowUp and ArrowDown on the field. Returns whether it brought back a value. */
    keydown(event: KeyboardEvent): boolean;
    /** Starts again from the newest value, and forgets edits to values brought back. */
    reset: () => void;
};
export { createInputHistory, type InputHistoryOptions };
