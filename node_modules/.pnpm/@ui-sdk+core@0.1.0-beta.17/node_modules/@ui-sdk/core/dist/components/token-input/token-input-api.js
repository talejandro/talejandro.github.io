// src/components/token-input/token-input-api.ts
import { announce } from "../../foundation/platform/announce.js";
import { textDiff } from "../../foundation/text/caret.js";
import { createUndoStack } from "../../foundation/kernel/undo-stack.js";
import { isDisabled } from "../../foundation/lists/listbox-parts.js";
import {
  defaultCodec,
  isToken,
  normalizeValue,
  offsetText,
  removedTokens,
  replaceRange,
  sameValue,
  toLabel,
  toText,
  tokenAt,
  tokensOf,
  valueLength
} from "./token-input-model.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
var userReasons = /* @__PURE__ */ new Set(["input-change", "paste", "drop", "cut"]);
var normalized = /* @__PURE__ */ new WeakMap();
function normalizedOnce(value) {
  let result = normalized.get(value);
  if (!result) {
    normalized.set(value, result = normalizeValue(value));
  }
  return result;
}
function initialTokenInputState(options) {
  const initial = normalizedOnce(options.defaultValue ?? []);
  return {
    value: options.value ? normalizedOnce(options.value) : initial,
    initial,
    selected: "",
    hosts: 0,
    custom: false,
    disabled: !!options.disabled,
    formDisabled: false,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form
  };
}
function syncTokenInputState(options) {
  return {
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    ...options.value === void 0 ? {} : { value: normalizedOnce(options.value) },
    ...options.defaultValue === void 0 ? {} : { initial: normalizedOnce(options.defaultValue) }
  };
}
function selectedIds(value, range) {
  if (!range || range.start === range.end) {
    return "";
  }
  let at = 0;
  const ids = [];
  for (const segment of value) {
    if (isToken(segment) && at >= range.start && at < range.end) {
      ids.push(segment.id);
    }
    at += isToken(segment) ? 1 : segment.length;
  }
  return ids.join(" ");
}
var defaultDescription = (token) => `${token.type}${token.status === "pending" ? ", loading" : token.status === "unresolved" ? ", unresolved" : ""}`;
function ownerForm(el, formId) {
  if (!el) {
    return null;
  }
  if (formId === void 0) {
    return el.closest("form");
  }
  const root = el.getRootNode();
  const named = "getElementById" in root ? root.getElementById(formId) : el.ownerDocument.getElementById(formId);
  return named instanceof HTMLFormElement ? named : null;
}
function tokenInputApiBody(context) {
  const { id, store, options, element } = context;
  const change = createChange(context);
  let view;
  let selection = null;
  let focused = false;
  let composing = false;
  let pendingSelection;
  let committed = store.get().value;
  const listeners = /* @__PURE__ */ new Set();
  const history = createUndoStack({ value: store.get().value, selection: null }, () => options().history);
  let messages = [];
  const codec = () => options().codec ?? defaultCodec;
  const describe = (token) => options().getTokenDescription?.(token) ?? defaultDescription(token);
  const editable = () => {
    const state = store.get();
    return !isDisabled(state) && !state.readOnly;
  };
  const emit = (change2) => listeners.forEach((listener) => listener(change2));
  function say(message) {
    messages.push(message);
    announce(messages.join(". "));
    queueMicrotask(() => messages = []);
  }
  function caretAt(offset) {
    return { start: offset, end: offset };
  }
  function commit(next, { reason, event, inputType, selection: after, group, record = true }) {
    const before = committed;
    const value = normalizeValue(next);
    normalized.set(value, value);
    if (sameValue(before, value)) {
      if (after) {
        setSelection(after);
      }
      return false;
    }
    const removed = removedTokens(before, value);
    pendingSelection = after;
    if (after) {
      selection = after;
    }
    committed = value;
    const accepted = change("value", value, {
      reason,
      event,
      inputType,
      removed
    });
    if (!accepted) {
      committed = before;
      pendingSelection = void 0;
      render();
      return false;
    }
    if (record) {
      history.record({ value, selection: after ?? null }, { group });
    }
    emit({
      type: "input",
      ...textDiff(offsetText(before), offsetText(value)),
      user: userReasons.has(reason)
    });
    for (const token of removed) {
      say(`Removed ${describe(token)} ${token.label}`);
    }
    if (options().value !== void 0) {
      setTimeout(() => {
        if (committed !== value || store.get().value === value) {
          return;
        }
        committed = store.get().value;
        render();
      });
    }
    return true;
  }
  function render() {
    if (!view) {
      return;
    }
    view.render(store.get().value);
    const length = valueLength(store.get().value);
    const target = pendingSelection ?? (focused ? selection : null);
    pendingSelection = void 0;
    if (target && focused) {
      view.select({
        start: Math.min(target.start, length),
        end: Math.min(target.end, length)
      });
    }
  }
  let shown = store.get().value;
  store.subscribe(() => {
    const { value } = store.get();
    if (value === shown) {
      return;
    }
    shown = value;
    if (value !== committed) {
      if (!sameValue(value, committed)) {
        history.record({ value, selection: null });
      }
      committed = value;
    }
    render();
  });
  function setSelection(next) {
    selection = next;
    if (next && view && focused) {
      view.select(next);
    }
  }
  function insertAt(range, content, {
    reason,
    event,
    pending
  }) {
    const value = committed;
    const inserted = Array.isArray(content) ? normalizeValue(content) : typeof content === "string" ? [content] : normalizeValue([
      { ...content, ...pending ? { status: "pending" } : {} }
    ]);
    const token = inserted.length === 1 && isToken(inserted[0]) ? inserted[0] : void 0;
    const following = offsetText(value)[range.end];
    if (token && (following === void 0 || !/\s/.test(following))) {
      inserted.push(" ");
    }
    const end = range.start + valueLength(inserted);
    const next = replaceRange(value, range, inserted);
    if (!commit(next, { reason, event, selection: caretAt(end) })) {
      return false;
    }
    if (token) {
      say(`Inserted ${describe(token)} ${token.label}`);
    }
    if (!token || !pending) {
      return true;
    }
    const tokenId = tokenAt(next, range.start).id;
    pending.then(
      (patch) => updateToken(tokenId, { ...patch ?? {}, status: patch?.status }),
      () => {
        say(`Couldn't add ${token.label}`);
        removeToken(tokenId, { reason: "imperative", record: false });
      }
    );
    return true;
  }
  function updateToken(tokenId, patch) {
    const update = (value) => value.map(
      (segment) => isToken(segment) && segment.id === tokenId ? { ...segment, ...patch } : segment
    );
    history.map((entry) => ({ ...entry, value: update(entry.value) }));
    const before = tokensOf(committed).find((token) => token.id === tokenId);
    if (!before) {
      return false;
    }
    const changed = commit(update(committed), {
      reason: "imperative",
      record: false
    });
    if (before.status === "pending" && !patch.status) {
      say(`${patch.label ?? before.label} ready`);
    }
    return changed;
  }
  function removeToken(tokenId, {
    reason = "imperative",
    record = true,
    event
  } = {}) {
    const remove = (value) => value.filter((segment) => !(isToken(segment) && segment.id === tokenId));
    if (!record) {
      history.map((entry) => ({ ...entry, value: remove(entry.value) }));
    }
    return commit(remove(committed), { reason, event, record });
  }
  function undo(event) {
    const entry = history.undo();
    return !!entry && commit(entry.value, {
      reason: "undo",
      event,
      selection: entry.selection ?? void 0,
      record: false
    });
  }
  function redo(event) {
    const entry = history.redo();
    return !!entry && commit(entry.value, {
      reason: "redo",
      event,
      selection: entry.selection ?? void 0,
      record: false
    });
  }
  function submit(event) {
    const onSubmit = options().onSubmit;
    if (onSubmit) {
      return onSubmit(store.get().value, { event });
    }
    ownerForm(element("editor"), store.get().form)?.requestSubmit();
  }
  const canSubmit = () => !!options().onSubmit || !!ownerForm(element("editor"), store.get().form);
  const editor = {
    get element() {
      return element("editor");
    },
    textBefore(length) {
      if (!focused || !selection) {
        return null;
      }
      const caret = selection.end;
      const offset = Math.max(0, caret - length);
      return { text: offsetText(committed).slice(offset, caret), offset };
    },
    selection: () => focused ? selection : null,
    rectAt: (offset) => view?.rectAt(offset) ?? null,
    replace: (range, content, replaceOptions) => insertAt(range, content, {
      reason: "item-press",
      pending: replaceOptions?.pending
    }),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    composing: () => composing,
    tokens: true,
    submit
  };
  const api = {
    id,
    editor,
    getValue: () => store.get().value,
    setValue: (value, { reason = "imperative", event } = {}) => commit(value, {
      reason,
      event,
      selection: caretAt(valueLength(normalizeValue(value)))
    }),
    getText: (custom) => toText(store.get().value, custom ?? codec()),
    getLabel: () => toLabel(store.get().value),
    insert(content, {
      at = "caret",
      resolve,
      reason = "imperative",
      event
    } = {}) {
      const length = valueLength(committed);
      const range = typeof at === "object" ? at : at === "end" || !selection ? caretAt(length) : selection;
      return insertAt(range, content, { reason, event, pending: resolve });
    },
    updateToken,
    removeToken: (tokenId, { reason, event } = {}) => removeToken(tokenId, { reason, event }),
    undo: () => undo(),
    redo: () => redo(),
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    clear: ({ reason = "imperative", event } = {}) => commit([], { reason, event, selection: caretAt(0) }),
    focus({ at = "end" } = {}) {
      const el = element("editor");
      if (!el) {
        return;
      }
      el.focus({ preventScroll: true });
      setSelection(caretAt(at === "start" ? 0 : valueLength(store.get().value)));
    },
    // Internal. Used by slots, the editing module and adapters.
    internal: {
      options,
      editable,
      codec,
      describe,
      commit,
      undo,
      redo,
      submit,
      canSubmit,
      say,
      seal: history.seal,
      // The latest value, which a controlled owner may not have passed back yet.
      latest: () => committed,
      removeToken,
      caretAt,
      setView(next) {
        view = next;
        if (next) {
          render();
        }
      },
      view: () => view,
      setSelection(next) {
        selection = next;
        store.set({ selected: selectedIds(store.get().value, next) });
        emit({ type: "selection" });
      },
      selection: () => selection,
      setFocused(next) {
        focused = next;
        if (!next) {
          emit({ type: "selection" });
        }
      },
      setComposing(next) {
        composing = next;
        emit({ type: next ? "compositionstart" : "compositionend" });
      },
      composing: () => composing,
      // Frameworks render each token's content into its host.
      hosts: () => view?.hosts() ?? [],
      setCustom: (custom) => store.set({ custom }),
      text: () => toText(store.get().value, codec()),
      reset() {
        if (!keepsValueOnReset(options().value, options().defaultValue)) {
          commit(store.get().initial, {
            reason: "reset",
            selection: caretAt(0)
          });
        }
      },
      setFormDisabled: (formDisabled) => store.set({ formDisabled }),
      restore: (saved) => commit(codec().parse(saved), { reason: "restore" })
    }
  };
  return api;
}
var tokenInputApi = tokenInputApiBody;
export {
  initialTokenInputState,
  syncTokenInputState,
  tokenInputApi
};
