// src/foundation/kernel/undo-stack.ts
var defaults = {};
function createUndoStack(initial, options = defaults) {
  const settings = () => (typeof options === "function" ? options() : options) ?? defaults;
  let entries = [initial];
  let index = 0;
  let open = null;
  return {
    /**
     * Records the state after an edit. Edits of the same `group`, like
     * "insert" or "delete", join the last entry while they come within
     * `groupDelay` of each other. Without a group, the edit is its own entry.
     */
    record(state, { group, time = Date.now() } = {}) {
      const { limit = 100, groupDelay = 500 } = settings();
      entries = entries.slice(0, index + 1);
      const joins = !!group && open?.group === group && time - open.time < groupDelay;
      if (joins) {
        entries[index] = state;
      } else {
        entries.push(state);
        if (entries.length > limit + 1) {
          entries.shift();
        }
        index = entries.length - 1;
      }
      open = group ? { group, time } : null;
    },
    /** Ends the open group, so the next edit starts an entry, like after a caret jump. */
    seal() {
      open = null;
    },
    /** Steps back, and returns the state to show, or `undefined` at the first entry. */
    undo() {
      open = null;
      if (index === 0) {
        return void 0;
      }
      return entries[--index];
    },
    /** Steps forward again, and returns the state to show, or `undefined` at the last entry. */
    redo() {
      open = null;
      if (index === entries.length - 1) {
        return void 0;
      }
      return entries[++index];
    },
    /** Whether there's an entry to step back to. */
    canUndo: () => index > 0,
    /** Whether there's an entry to step forward to. */
    canRedo: () => index < entries.length - 1,
    /** Rewrites every entry, like a token's status changing everywhere without an entry of its own. */
    map(update) {
      entries = entries.map(update);
    },
    /** Starts over from `state`, like after a controlled value from outside. */
    reset(state) {
      entries = [state];
      index = 0;
      open = null;
    }
  };
}
export {
  createUndoStack
};
