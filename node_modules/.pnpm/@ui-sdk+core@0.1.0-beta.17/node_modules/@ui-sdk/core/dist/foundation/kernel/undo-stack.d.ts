/**
 * How an undo stack keeps entries.
 * @experimental
 */
type UndoStackOptions = {
    /**
     * How many entries are kept.
     * @defaultValue 100
     */
    limit?: number;
    /**
     * Milliseconds of pause after which typing starts a new entry.
     * @defaultValue 500
     */
    groupDelay?: number;
};
/**
 * An undo stack for any state: a board's columns, a drawing, a form. Record
 * the state after each edit; `undo` and `redo` return the state to show.
 * Edits of one `group` within `groupDelay` join one entry, like a run of
 * typing or a drag's steps.
 *
 * ```ts
 * const stack = createUndoStack(lists)
 * stack.record(next) // after each change
 * if (matchesShortcut(event, "mod+z")) show(stack.undo())
 * ```
 *
 * `options` can be a getter, read on every edit, so a limit or delay set
 * after creation, like a web component's `history` property, applies.
 * @experimental
 */
declare function createUndoStack<State>(initial: State, options?: UndoStackOptions | (() => UndoStackOptions | undefined)): {
    /**
     * Records the state after an edit. Edits of the same `group`, like
     * "insert" or "delete", join the last entry while they come within
     * `groupDelay` of each other. Without a group, the edit is its own entry.
     */
    record(state: State, { group, time }?: {
        group?: string;
        time?: number;
    }): void;
    /** Ends the open group, so the next edit starts an entry, like after a caret jump. */
    seal(): void;
    /** Steps back, and returns the state to show, or `undefined` at the first entry. */
    undo(): State | undefined;
    /** Steps forward again, and returns the state to show, or `undefined` at the last entry. */
    redo(): State | undefined;
    /** Whether there's an entry to step back to. */
    canUndo: () => boolean;
    /** Whether there's an entry to step forward to. */
    canRedo: () => boolean;
    /** Rewrites every entry, like a token's status changing everywhere without an entry of its own. */
    map(update: (state: State) => State): void;
    /** Starts over from `state`, like after a controlled value from outside. */
    reset(state: State): void;
};
export { createUndoStack, type UndoStackOptions };
