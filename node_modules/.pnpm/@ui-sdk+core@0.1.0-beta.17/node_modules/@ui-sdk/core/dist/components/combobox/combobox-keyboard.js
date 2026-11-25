// src/components/combobox/combobox-keyboard.ts
import { isRTL } from "../../foundation/platform/env.js";
import { isApple } from "../../foundation/platform/platform.js";
import { listKeyDown, listStep } from "../../foundation/lists/listbox-keyboard.js";
import "../../foundation/lists/listbox.js";
import "../../foundation/popups/popup.js";
import { isComposing } from "../../foundation/kernel/events.js";
import "../../foundation/lists/listbox-value.js";
function createComboboxKeyboard({
  store,
  listbox,
  selection,
  show,
  hide,
  choose,
  create,
  remove,
  itemLabelled,
  commitCustom,
  hasCreate,
  allowCustomValue,
  chips,
  inputElement,
  focusInput,
  highlightOnOpen
}) {
  function onInputKeyDown(event) {
    const { open } = store.get();
    const input = event.target;
    if (event.altKey && event.key === "ArrowDown" && !open) {
      event.preventDefault();
      show({ event, by: "keyboard" });
      return;
    }
    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault();
      hide({ reason: "escape-key", event });
      return;
    }
    const step = listStep(event, { apple: isApple() });
    if (step !== void 0) {
      return moveHighlight(event, step, open);
    }
    switch (event.key) {
      case "Enter": {
        const { multiple, query } = store.get();
        const adds = multiple && allowCustomValue() && !!query.trim();
        if (open || adds && !isComposing(event)) {
          onEnter(event);
        }
        return;
      }
      case "Tab":
        if (open) {
          hide({ reason: "focus-out", event });
        }
        return;
      case "Backspace":
        if (store.get().multiple && input.value === "" && input.selectionStart === 0 && selection.values().length) {
          event.preventDefault();
          remove(selection.values().at(-1), event);
        }
        return;
      case "ArrowLeft":
      case "ArrowRight":
        return focusLastChip(event, input);
    }
  }
  function moveHighlight(event, step, open) {
    if (open) {
      event.preventDefault();
      return listbox.move(step, event);
    }
    if (step !== 1 && step !== -1) {
      return;
    }
    event.preventDefault();
    highlightOnOpen(step === -1 ? "last" : "first");
    show({ event, by: "keyboard" });
  }
  function onEnter(event) {
    const { highlighted, query, multiple, open } = store.get();
    event.preventDefault();
    if (open && highlighted !== null) {
      const el = listbox.element(highlighted);
      if (el?.matches("a[href]")) {
        return el.click();
      }
      return choose(highlighted, event);
    }
    const text = query.trim();
    const exact = text ? itemLabelled(text, listbox.entries()) : void 0;
    if (exact) {
      return choose(exact.key, event);
    }
    if (hasCreate()) {
      return create(event);
    }
    if (allowCustomValue() && commitCustom("input-change", event) && !multiple) {
      hide({ reason: "item-press", event });
    }
  }
  function onListKeyDown(event) {
    if (!store.get().focusInList || event.target === inputElement()) {
      return;
    }
    listKeyDown(event, {
      listbox,
      highlighted: store.get().highlighted,
      choose,
      focusInput
    });
  }
  function focusLastChip(event, input) {
    const back = event.key === "ArrowLeft" !== isRTL(input);
    if (!back || input.selectionStart !== 0 || input.selectionEnd !== 0) {
      return;
    }
    const last = chips().at(-1);
    if (!last) {
      return;
    }
    event.preventDefault();
    last.focus();
  }
  function onChipKeyDown(event, el, value) {
    const list = chips();
    const index = list.indexOf(el);
    const input = inputElement();
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight": {
        event.preventDefault();
        const previous = event.key === "ArrowLeft" !== isRTL(el);
        const next = list[index + (previous ? -1 : 1)];
        if (next) {
          next.focus();
        } else if (!previous) {
          input?.focus();
        }
        return;
      }
      case "Backspace":
      case "Delete": {
        event.preventDefault();
        const neighbour = list[index - 1] ?? list[index + 1];
        remove(value, event);
        (neighbour ?? input)?.focus();
        return;
      }
      case "Escape":
        event.preventDefault();
        input?.focus();
        return;
    }
  }
  function onTriggerKeyDown(event) {
    if (store.get().open || event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }
    event.preventDefault();
    highlightOnOpen(event.key === "ArrowUp" ? "last" : "first");
    show({ event, by: "keyboard" });
  }
  return { onInputKeyDown, onListKeyDown, onChipKeyDown, onTriggerKeyDown };
}
export {
  createComboboxKeyboard
};
