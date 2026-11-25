// src/components/toolbar/toolbar-fields.ts
import { fieldKeepsKey } from "../../foundation/focus/collection.js";
import { isRTL } from "../../foundation/platform/env.js";
function placeCaret(el, forward) {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) || el.selectionStart === null) {
    return;
  }
  const at = forward ? el.value.length : 0;
  el.setSelectionRange(at, at);
}
function fieldKeeps(event, el) {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
    return false;
  }
  return fieldKeepsKey(event.key, {
    start: el.selectionStart,
    end: el.selectionEnd,
    length: el.value.length,
    rtl: isRTL(el),
    usesUpDown: el instanceof HTMLTextAreaElement || el.type === "number"
  });
}
export {
  fieldKeeps,
  placeCaret
};
