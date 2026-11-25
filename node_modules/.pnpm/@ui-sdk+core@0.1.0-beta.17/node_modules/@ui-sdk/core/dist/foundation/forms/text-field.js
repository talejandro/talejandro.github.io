// src/foundation/forms/text-field.ts
import { afterReset, watchValue, writeValue } from "./value.js";
import { on } from "../kernel/events.js";
var textFields = /* @__PURE__ */ new WeakMap();
var initialText = (options) => {
  const value = options.value ?? options.defaultValue ?? "";
  return { value, filled: value !== "" };
};
var syncText = (options) => options.value === void 0 ? {} : { value: options.value, filled: options.value !== "" };
function textFieldApi({
  store,
  options,
  element
}, change, slot) {
  const control = () => element(slot);
  const isControlled = () => options().value !== void 0;
  let writing = false;
  const read = (value) => store.set({ value, filled: value !== "" });
  function write(value, reason, event) {
    if (!change("value", value, { reason, event })) {
      return false;
    }
    if (!isControlled()) {
      read(value);
    }
    const el = control();
    if (!el || el.value === value) {
      return true;
    }
    writing = true;
    writeValue(el, value, { asUser: true });
    writing = false;
    return true;
  }
  function typed(el, event) {
    if (writing) {
      return;
    }
    const previous = store.get().value;
    const next = el.value;
    if (next === previous) {
      return;
    }
    if (change("value", next, { reason: "input-change", event })) {
      if (!isControlled()) {
        read(next);
      }
      return;
    }
    if (event.isComposing) {
      return;
    }
    const inserted = next.length - previous.length;
    const caret = Math.max(0, (el.selectionStart ?? next.length) - inserted);
    el.value = previous;
    el.setSelectionRange?.(caret, caret);
  }
  const api = {
    getValue: () => store.get().value,
    setValue: (value, {
      reason = "imperative",
      event
    } = {}) => write(value, reason, event),
    clear: ({
      reason = "imperative",
      event
    } = {}) => write("", reason, event),
    focus: () => control()?.focus(),
    internal: {
      clearPress: (event) => write("", "clear-press", event),
      bind(el) {
        textFields.set(el, api);
        if (!isControlled()) {
          if (el.value === "" && el.defaultValue === "") {
            writeValue(el, store.get().value);
          }
          read(el.value);
        }
        const cleanups = [
          // Typing goes through `change` below, and resets through the reset listener.
          watchValue(el, (source) => {
            if (source === "write" && !isControlled()) {
              read(el.value);
            }
          }),
          // Bound on the element, so it runs before frameworks hear the event at their root.
          on(el, "input", (event) => typed(el, event)),
          // Browsers differ on whether an `input` follows the end of a composition.
          on(el, "compositionend", (event) => typed(el, event)),
          // A reset puts the default back, unless the change is canceled. The
          // browser restores the element's own default, which React moves with
          // a controlled input's value, so `defaultValue` wins when it's set.
          on(
            el.ownerDocument,
            "reset",
            (event) => {
              if (event.target !== el.form) {
                return;
              }
              afterReset(event, () => {
                const target = options().defaultValue ?? el.value;
                const show = (value) => {
                  if (el.value !== value) {
                    el.value = value;
                  }
                };
                if (target === store.get().value) {
                  show(target);
                  return;
                }
                if (!change("value", target, { reason: "reset" })) {
                  show(store.get().value);
                } else if (!isControlled()) {
                  show(target);
                  read(target);
                }
              });
            },
            { capture: true }
          )
        ];
        return () => {
          textFields.delete(el);
          cleanups.forEach((cleanup) => cleanup());
        };
      }
    }
  };
  return api;
}
function focusFromSurroundings(event, container, field) {
  const target = event?.target;
  if (!(target instanceof Element) || !container || !field) {
    return;
  }
  const interactive = target.closest(
    "button, a[href], input, textarea, select, label, [tabindex]"
  );
  if (interactive && container.contains(interactive)) {
    return;
  }
  field.focus();
}
export {
  focusFromSurroundings,
  initialText,
  syncText,
  textFieldApi,
  textFields
};
