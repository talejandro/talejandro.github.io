// src/foundation/text/input-history.ts
import { isComposing } from "../kernel/events.js";
import { createCaretRects } from "./caret.js";
var recallableTypes = /* @__PURE__ */ new Set(["text", "search", "url", "tel"]);
var textFieldOf = (event) => {
  const target = event.target;
  return target?.localName === "input" || target?.localName === "textarea" ? target : void 0;
};
function atTextEdge(direction, event) {
  const field = textFieldOf(event);
  if (!field) {
    return true;
  }
  if (field.localName === "input") {
    return recallableTypes.has(field.type);
  }
  const { value } = field;
  const caret = field.selectionStart ?? 0;
  if (caret !== field.selectionEnd) {
    return false;
  }
  const end = direction === "up" ? 0 : value.length;
  if (caret === end) {
    return true;
  }
  const between = direction === "up" ? value.slice(0, caret) : value.slice(caret);
  if (between.includes("\n")) {
    return false;
  }
  const caretAt = createCaretRects(field);
  return caretAt(caret)?.y === caretAt(end)?.y;
}
var sameEntries = (a, b) => a.length === b.length && a.every((entry, index) => Object.is(entry, b[index]));
function createInputHistory(options) {
  const atEdge = options.atEdge ?? atTextEdge;
  let seen = [];
  let at = 0;
  const edits = /* @__PURE__ */ new Map();
  function reset() {
    seen = [...options.entries() ?? []];
    at = seen.length;
    edits.clear();
  }
  function follow(entries, key) {
    const shown = at < seen.length ? key(seen[at]) : void 0;
    const edited = /* @__PURE__ */ new Map();
    for (const [index2, value] of edits) {
      if (index2 < seen.length) {
        edited.set(key(seen[index2]), value);
      }
    }
    const draft = edits.get(seen.length);
    const typing = edits.has(seen.length);
    seen = [...entries];
    edits.clear();
    seen.forEach((entry, index2) => {
      const value = edited.get(key(entry));
      if (value !== void 0) {
        edits.set(index2, value);
      }
    });
    if (typing) {
      edits.set(seen.length, draft);
    }
    const index = seen.findIndex((entry) => key(entry) === shown);
    at = index === -1 ? seen.length : index;
  }
  function step(by, event) {
    const entries = options.entries() ?? [];
    if (!sameEntries(entries, seen)) {
      if (options.getEntryKey) {
        follow(entries, options.getEntryKey);
      } else {
        reset();
      }
    }
    const next = at + by;
    if (next < 0 || next > seen.length) {
      return false;
    }
    edits.set(at, options.read());
    const value = edits.has(next) ? edits.get(next) : seen[next];
    if (options.write(value, event) === false) {
      return false;
    }
    at = next;
    const field = textFieldOf(event);
    field?.setSelectionRange(field.value.length, field.value.length);
    return true;
  }
  return {
    /** Handles ArrowUp and ArrowDown on the field. Returns whether it brought back a value. */
    keydown(event) {
      const direction = event.key === "ArrowUp" ? "up" : event.key === "ArrowDown" ? "down" : null;
      const field = event.target;
      if (!direction || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isComposing(event) || field?.readOnly || field?.getAttribute("aria-expanded") === "true" || // A textarea can't carry `aria-expanded`, so an open menu marks it with `data-open`.
      field?.hasAttribute("data-open") || !atEdge(direction, event)) {
        return false;
      }
      if (!step(direction === "up" ? -1 : 1, event)) {
        return false;
      }
      event.preventDefault();
      return true;
    },
    /** Starts again from the newest value, and forgets edits to values brought back. */
    reset
  };
}
export {
  createInputHistory
};
