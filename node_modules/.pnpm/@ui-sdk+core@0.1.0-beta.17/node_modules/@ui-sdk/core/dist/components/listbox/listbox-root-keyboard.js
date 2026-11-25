// src/components/listbox/listbox-root-keyboard.ts
import { stepFor } from "../../foundation/focus/collection.js";
import { sourceOf } from "../../foundation/kernel/modality.js";
import { isRTL } from "../../foundation/platform/env.js";
import { isTypeaheadKey } from "../../foundation/text/typeahead.js";
import "../../foundation/lists/listbox.js";
import { isDisabled } from "../../foundation/lists/listbox-parts.js";
import { PAGE, pagedElsewhere } from "../../foundation/lists/listbox-keyboard.js";
var withModifier = (event) => event.ctrlKey || event.metaKey;
function createListboxKeyboard({
  store,
  listbox,
  choose,
  toggle,
  replace,
  extend,
  toggleAll,
  anchorKey
}) {
  function navigate(event, step, current) {
    const state = store.get();
    const extending = event.shiftKey && state.multiple;
    const next = extending ? listbox.stepKey(step, { loop: false }) : listbox.stepKey(step);
    if (next === void 0) {
      return;
    }
    event.preventDefault();
    if (next !== current) {
      listbox.highlight(next, { event });
    }
    const why = { reason: "list-navigation", event };
    if (extending) {
      return extend(next, { from: current, additive: additive(event) }, why);
    }
    if (state.activation !== "automatic" || withModifier(event)) {
      return;
    }
    if (state.multiple) {
      replace(next, why);
    } else {
      choose(next, why);
    }
  }
  const additive = (event) => store.get().activation === "manual" || withModifier(event);
  function activate(event, current) {
    if (current === null) {
      return;
    }
    event.preventDefault();
    const el = listbox.element(current);
    if (event.key === "Enter" && el?.matches("a[href]")) {
      return el.click();
    }
    const state = store.get();
    const why = { reason: "item-press", event };
    if (!state.multiple) {
      return choose(current, why);
    }
    if (event.shiftKey) {
      return extend(
        current,
        { from: anchorKey(), additive: additive(event) },
        why
      );
    }
    if (state.activation === "manual" || withModifier(event)) {
      return toggle(current, why);
    }
    replace(current, why);
  }
  function typed(event, current) {
    const found = listbox.search(event.key, current);
    if (!found) {
      return false;
    }
    event.preventDefault();
    listbox.highlight(found.key, { event });
    const state = store.get();
    if (state.activation !== "automatic") {
      return true;
    }
    const why = { reason: "list-navigation", event };
    if (state.multiple) {
      replace(found.key, why);
    } else {
      choose(found.key, why);
    }
    return true;
  }
  function onKeyDown(event, root) {
    if (event.target.closest('[role="listbox"]') !== root) {
      return;
    }
    const state = store.get();
    if (isDisabled(state) || event.altKey) {
      return;
    }
    const current = state.highlighted ?? state.stop;
    if (withModifier(event) && event.key.toLowerCase() === "a" && !event.shiftKey) {
      if (!state.multiple) {
        return;
      }
      event.preventDefault();
      return toggleAll({ reason: "list-navigation", event });
    }
    const step = stepFor(event.key, state.orientation, isRTL(root));
    if (step !== void 0) {
      return navigate(event, step, current);
    }
    const page = event.key === "PageDown" ? PAGE : event.key === "PageUp" ? -PAGE : 0;
    if (page && !pagedElsewhere.has(root)) {
      return navigate(event, page, current);
    }
    if (event.key === " " && listbox.typing()) {
      if (typed(event, current)) {
        return;
      }
      listbox.resetTyping();
    }
    if (event.key === " " || event.key === "Enter") {
      return activate(event, current);
    }
    if (isTypeaheadKey(event) && !withModifier(event)) {
      typed(event, current);
    }
  }
  function press(key, event) {
    const state = store.get();
    if (isDisabled(state)) {
      return;
    }
    const el = listbox.element(key);
    if (el && !state.virtualFocus && el.ownerDocument.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
    const why = { reason: "item-press", event };
    if (!state.multiple) {
      return choose(key, why);
    }
    const pointer = event;
    const source = event ? sourceOf(event) : "touch";
    const modifiers = !!pointer && source !== "touch" && source !== "virtual";
    if (modifiers && pointer.shiftKey) {
      return extend(key, { from: null, additive: additive(pointer) }, why);
    }
    if (state.activation === "manual" || !modifiers || withModifier(pointer)) {
      return toggle(key, why);
    }
    replace(key, why);
  }
  return { onKeyDown, press };
}
export {
  createListboxKeyboard
};
