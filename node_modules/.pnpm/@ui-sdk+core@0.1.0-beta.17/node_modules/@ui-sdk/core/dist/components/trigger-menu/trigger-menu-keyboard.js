// src/components/trigger-menu/trigger-menu-keyboard.ts
import { isApple } from "../../foundation/platform/platform.js";
import { listStep } from "../../foundation/lists/listbox-keyboard.js";
function createTriggerMenuKeyboard({
  store,
  listbox,
  active,
  inArguments,
  choose,
  accept,
  dismiss,
  caretMove
}) {
  function move(event, step) {
    event.preventDefault();
    store.set({ navigated: true });
    listbox.move(step, event);
  }
  function onKeyDown(event) {
    if (!active()) {
      return;
    }
    const { open, highlighted } = store.get();
    const step = listStep(event, { apple: isApple() });
    const arrow = event.key === "ArrowDown" || event.key === "ArrowUp";
    if (step !== void 0) {
      if (open && !(arrow && (event.altKey || event.metaKey))) {
        move(event, step);
      }
      return;
    }
    switch (event.key) {
      case "Enter":
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (!open && !inArguments()) {
          return;
        }
        event.preventDefault();
        if (inArguments()) {
          return accept(event, { tab: false });
        }
        if (highlighted !== null) {
          choose(highlighted, event, { tab: false });
        }
        return;
      case "Tab":
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (inArguments()) {
          event.preventDefault();
          return accept(event, { tab: true });
        }
        if (open && highlighted !== null) {
          event.preventDefault();
          choose(highlighted, event, { tab: true });
        }
        return;
      case "Escape":
        if (open) {
          return;
        }
        event.preventDefault();
        dismiss(event);
        return;
      case "Home":
      case "End":
        caretMove(event);
        return;
    }
  }
  return { onKeyDown };
}
export {
  createTriggerMenuKeyboard
};
