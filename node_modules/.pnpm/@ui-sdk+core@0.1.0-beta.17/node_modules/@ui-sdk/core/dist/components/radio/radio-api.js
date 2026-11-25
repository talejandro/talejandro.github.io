// src/components/radio/radio-api.ts
import {
  moveIndex,
  radioStep
} from "../../foundation/focus/collection.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import {
  dispatchChange,
  formInternals,
  isDisabled,
  submitImplicitly
} from "../../foundation/forms/form.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { elements } from "../../foundation/kernel/elements.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
function radioGroupState(options, extra = {}) {
  const value = options.value !== void 0 ? options.value : options.defaultValue ?? null;
  return {
    value,
    initial: value,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    formDisabled: false,
    stop: null,
    exiting: [],
    ...extra
  };
}
function syncRadioGroup(options) {
  return {
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    // Like a native radio's `defaultChecked`, changing it changes what a reset returns to.
    ...options.defaultValue === void 0 ? {} : { initial: options.defaultValue },
    ...options.value === void 0 ? {} : { value: options.value }
  };
}
var isNativeButton = (el) => el instanceof HTMLButtonElement;
function radioGroupApiBody(context, slots = { group: "group", item: "root" }) {
  const { id, store, options, element, props } = context;
  const change = createChange(context);
  let changed = false;
  const enabled = (item) => !item.props?.disabled && !isDisabled(store.get());
  const roving = createRovingFocus(context, {
    slot: slots.item,
    key: "stop",
    remember: false,
    disabled: (item) => !enabled(item),
    focusable: enabled,
    preferred: (item) => store.get().value === item.key,
    claims: (state, item) => (state.value ?? item.key) === item.key,
    move(event, { from, items, rtl }) {
      if (event.shiftKey) {
        return;
      }
      const step = radioStep(event.key, rtl);
      if (step === void 0) {
        return;
      }
      return items[moveIndex(
        items.indexOf(from),
        step,
        items.length,
        options().loop ?? true
      )].key;
    }
  });
  const exitingAfter = (from, value, exiting) => [
    ...exiting.filter((key) => key !== value),
    ...from !== null && hasIndicator(from) && !exiting.includes(from) ? [from] : []
  ];
  deriveFromOptions(context, ["exiting", "stop"], (synced, state) => {
    if (!("value" in synced) || synced.value === state.value) {
      return;
    }
    const value = synced.value ?? null;
    const stop = roving.stopFor((item) => item.key === value);
    return {
      exiting: exitingAfter(state.value, value, state.exiting),
      ...stop !== void 0 && { stop }
    };
  });
  let previous = store.get().value;
  store.subscribe(() => {
    const { value, exiting } = store.get();
    if (value === previous) {
      return;
    }
    const from = previous;
    previous = value;
    changed = true;
    store.set({ exiting: exitingAfter(from, value, exiting) });
    roving.check();
  });
  const hasIndicator = (value) => !!element("indicator", value)?.isConnected;
  const formElement = () => {
    const root = element(slots.group);
    if (formInternals(root)) {
      return root;
    }
    const { value } = store.get();
    return value === null ? void 0 : element("input", value);
  };
  const api = {
    id,
    getValue: () => store.get().value,
    isChanged: () => changed,
    // Checks a radio, as a user would. Disabled radios and read-only groups ignore it.
    setValue(value, { reason = "imperative", event } = {}) {
      const details = { reason, event };
      const state = store.get();
      if (isDisabled(state) || state.readOnly) {
        return false;
      }
      if (value !== null && props(slots.item, value)?.disabled) {
        return false;
      }
      const done = change("value", value, details);
      if (done && reason !== "restore") {
        dispatchChange(formElement());
      }
      return done;
    },
    // Moves focus to the item that holds the tab stop, the checked one if it is enabled.
    focus: () => roving.focus(),
    form: () => formInternals(element(slots.group))?.form ?? elements(context, "input")[0]?.el?.form ?? null,
    internal: {
      // Checks the radio a press landed on. Rating unchecks a checked one.
      check: (key, details) => api.setValue(key, details),
      reset() {
        if (keepsValueOnReset(options().value, options().defaultValue)) {
          return;
        }
        change("value", store.get().initial, { reason: "reset" });
      },
      // The browser restores a disabled or read-only group too, as a native one.
      restore(saved) {
        change("value", saved || null, { reason: "restore" });
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      finishExit(key) {
        store.set({
          exiting: store.get().exiting.filter((value) => value !== key)
        });
      },
      roving,
      group: () => element(slots.group),
      radio: (key) => element(slots.item, key),
      // The props its item rendered with, for parts inside an item.
      itemProps: (key) => props(slots.item, key) ?? {},
      anchor: () => (roving.items()[0] ?? elements(context, slots.item)[0])?.el,
      onKeyDown(event, el) {
        if (event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          if (!event.repeat) {
            submitImplicitly(api.form());
          }
          return;
        }
        if (event.key === " ") {
          if (!isNativeButton(el)) {
            event.preventDefault();
          }
          return;
        }
        const moved = roving.keydown(event, el);
        if (moved && moved.key !== moved.from && !store.get().readOnly) {
          api.setValue(moved.key, { reason: "list-navigation", event });
        }
      }
    }
  };
  return api;
}
var radioGroupApi = radioGroupApiBody;
function itemState(state, key, props) {
  return {
    checked: state.value === key,
    disabled: !!props.disabled || isDisabled(state),
    readOnly: state.readOnly,
    required: state.required
  };
}
function itemData(state, key, props) {
  const { checked, disabled } = itemState(state, key, props);
  return {
    "data-checked": checked ? "" : void 0,
    "data-unchecked": checked ? void 0 : "",
    "data-disabled": disabled ? "" : void 0,
    "data-readonly": state.readOnly ? "" : void 0,
    "data-required": state.required ? "" : void 0
  };
}
export {
  isNativeButton,
  itemData,
  itemState,
  radioGroupApi,
  radioGroupState,
  syncRadioGroup
};
