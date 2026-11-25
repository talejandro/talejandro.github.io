// src/foundation/lists/listbox-keyboard.ts
import { isApple } from "../platform/platform.js";
import { isTypeaheadKey } from "../text/typeahead.js";
import "./listbox.js";
var PAGE = 10;
var pagedElsewhere = /* @__PURE__ */ new WeakSet();
function listStep(event, { apple }) {
  const { key } = event;
  if (key === "ArrowDown") {
    return event.metaKey ? "last" : 1;
  }
  if (key === "ArrowUp") {
    return event.metaKey ? "first" : -1;
  }
  if (key === "PageDown") {
    return PAGE;
  }
  if (key === "PageUp") {
    return -PAGE;
  }
  const emacs = apple && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
  if (emacs && key === "n") {
    return 1;
  }
  if (emacs && key === "p") {
    return -1;
  }
}
function listKeyDown(event, {
  listbox,
  highlighted,
  choose,
  focusInput
}) {
  const step = event.key === "Home" ? "first" : event.key === "End" ? "last" : listStep(event, { apple: isApple() });
  if (step !== void 0) {
    event.preventDefault();
    return listbox.move(step, event);
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (highlighted === null) {
      return;
    }
    const el = listbox.element(highlighted);
    if (event.key === "Enter" && el?.matches("a[href]")) {
      return el.click();
    }
    return choose(highlighted, event);
  }
  if (isTypeaheadKey(event)) {
    focusInput();
  }
}
export {
  PAGE,
  listKeyDown,
  listStep,
  pagedElsewhere
};
