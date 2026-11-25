// src/foundation/lists/inline-edit.ts
import { focusables } from "../focus/tabbable.js";
import { isComposing } from "../kernel/events.js";
function createInlineEdit(context, options) {
  const { store } = context;
  const editing = () => store.get()[options.key];
  let input;
  let origin;
  let start = { text: "", typed: false };
  let inputHolder = null;
  const set = (id) => store.set({ [options.key]: id });
  function finish(refocus) {
    set(null);
    const targets = [origin, inputHolder];
    origin = void 0;
    inputHolder = null;
    input = void 0;
    if (refocus) {
      queueMicrotask(() => {
        const back = targets.find((el) => el?.isConnected);
        const active = back?.ownerDocument.activeElement;
        if (back && (!active || active === back.ownerDocument.body || !active.isConnected)) {
          back.focus();
        }
      });
    }
  }
  const api = {
    /** The id being edited, or `null`. */
    editing(state) {
      return state[options.key];
    },
    /** Starts editing an id. With `text`, the input starts with it instead of the value, as typing does. */
    start(id, details = {
      reason: "imperative"
    }) {
      if (options.disabled?.(id) || editing() === id) {
        return false;
      }
      const active = typeof document === "undefined" ? null : document.activeElement;
      origin = active instanceof HTMLElement ? active : void 0;
      start = details.text === void 0 ? { text: options.value(id), typed: false } : { text: details.text, typed: true };
      set(id);
      return true;
    },
    /**
     * Handles a key pressed where the value shows and returns whether it
     * started editing: Enter or F2 with the text, a printable character
     * with that character.
     */
    keydown(event, id) {
      if (event.defaultPrevented || editing() || event.ctrlKey || event.metaKey || event.altKey) {
        return false;
      }
      if (event.key === "Enter" || event.key === "F2") {
        event.preventDefault();
        return api.start(id, { reason: "edit-key", event });
      }
      if (event.key.length === 1 && event.key !== " ") {
        event.preventDefault();
        return api.start(id, { reason: "type", event, text: event.key });
      }
      return false;
    },
    /** Starts editing on a double click, as most tables do. */
    dblclick(event, id) {
      return api.start(id, { reason: "double-click", event });
    },
    /** Fills and focuses the input once it renders. Return its cleanup from the input slot's `bind`. */
    bindInput(el) {
      input = el;
      inputHolder = el.parentElement?.closest(focusables) ?? null;
      el.value = start.text;
      el.focus();
      if (start.typed) {
        el.setSelectionRange(el.value.length, el.value.length);
      } else {
        el.select();
      }
      return () => {
        if (input === el) {
          input = void 0;
        }
      };
    },
    /** Handles a key in the input: Enter and Tab save, Escape puts the text back. Returns whether it handled the key. */
    inputKeydown(event) {
      if (isComposing(event)) {
        return false;
      }
      if (event.key === "Enter" && !(event.target instanceof HTMLTextAreaElement && event.shiftKey)) {
        event.preventDefault();
        return api.end("enter-key", event);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        api.cancel();
        return true;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        return api.end("tab-key", event);
      }
      return false;
    },
    /** Saves what the input holds and stops editing. Returns whether it saved. */
    end(reason = "imperative", event) {
      const id = editing();
      if (!id) {
        return false;
      }
      const text = input?.value ?? start.text;
      const saved = text === options.value(id) || options.commit(id, text, { reason, event });
      if (!saved) {
        if (reason !== "focus-out") {
          input?.focus();
        }
        return false;
      }
      finish(reason !== "focus-out");
      return true;
    },
    /** Stops editing without saving. */
    cancel() {
      if (editing()) {
        finish(true);
      }
    }
  };
  return api;
}
export {
  createInlineEdit
};
