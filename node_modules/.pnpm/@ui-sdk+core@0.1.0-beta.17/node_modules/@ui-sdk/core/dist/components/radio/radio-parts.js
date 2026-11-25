// src/components/radio/radio-parts.ts
import {
  bindHiddenInput,
  bindInternals,
  hiddenInputStyle,
  isDisabled,
  nameFromLabels,
  valueMissingMessage
} from "../../foundation/forms/form.js";
import { selects } from "../../foundation/kernel/selects.js";
import {
  isNativeButton,
  itemData,
  itemState
} from "./radio-api.js";
function bindRadioGroup(el, api, store) {
  const unbind = bindInternals(el, {
    value: () => store.get().value,
    state: () => store.get().value ?? "",
    restore: api.internal.restore,
    valueMissing: () => store.get().required && store.get().value === null,
    message: () => valueMissingMessage("radio"),
    anchor: api.internal.anchor,
    focus: api.focus,
    reset: api.internal.reset,
    disabled: api.internal.setFormDisabled,
    subscribe: store.subscribe
  });
  const onClick = (event) => {
    if (event.target === el) {
      api.focus();
    }
  };
  let pressedLabel = null;
  const onPointerDown = (event) => {
    pressedLabel = isDisabled(store.get()) ? event.target?.closest?.("label") ?? null : null;
  };
  const onFocusIn = (event) => {
    const label = pressedLabel;
    pressedLabel = null;
    const target = event.target;
    if (label?.control === target && target !== el) {
      target.blur();
    }
  };
  const doc = el.ownerDocument;
  el.addEventListener("click", onClick);
  el.addEventListener("focusin", onFocusIn);
  doc.addEventListener("pointerdown", onPointerDown, true);
  return () => {
    unbind();
    el.removeEventListener("click", onClick);
    el.removeEventListener("focusin", onFocusIn);
    doc.removeEventListener("pointerdown", onPointerDown, true);
  };
}
var radioGroupAttrs = (state) => ({
  "aria-orientation": state.orientation,
  "data-orientation": state.orientation,
  "aria-required": state.required ? "true" : void 0,
  "aria-readonly": state.readOnly ? "true" : void 0,
  "aria-disabled": isDisabled(state) ? "true" : void 0,
  "data-disabled": isDisabled(state) ? "" : void 0,
  "data-readonly": state.readOnly ? "" : void 0,
  "data-required": state.required ? "" : void 0
});
function radioSlots(slot, groupState, radioAttrs = () => ({})) {
  return {
    group: slot({
      role: "radiogroup",
      keys: { none: "Focus stays on a radio, whose keydown handles them." },
      state: groupState,
      attrs: radioGroupAttrs,
      bind: (el, { api, store }) => bindRadioGroup(el, api, store)
    }),
    item: slot({
      role: "radio",
      focus: "roving",
      keys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " "],
      props: { value: "string", disabled: "boolean" },
      // Until there's a stop, the checked item holds it, or with nothing
      // checked, the first enabled one claims it: those hear a change to null.
      // Radios never read which indicators are exiting.
      selects: selects({
        value: ({ key }) => [key, null],
        stop: ({ key }) => [key, null],
        exiting: []
      }),
      state: (state, { key, props }) => itemState(state, key, props),
      attrs: (state, { key, props, api }) => {
        const { checked, disabled } = itemState(state, key, props);
        return {
          type: "button",
          "aria-checked": String(checked),
          // Disabled items are skipped, like native radios.
          disabled: props.disabled ? "" : void 0,
          "aria-disabled": disabled ? "true" : void 0,
          tabindex: disabled ? props.disabled ? void 0 : "-1" : api.internal.roving.tabIndex(state, { key, props }),
          ...itemData(state, key, props),
          ...radioAttrs(state, key, api)
        };
      },
      press({ api, key, props }, event) {
        event?.preventDefault();
        if (props.disabled) {
          return;
        }
        api.internal.check(key, { reason: "item-press", event });
      },
      on: {
        // A group's disabled leaves the item focusable to scripts, so a press
        // mustn't focus it either, like a disabled native radio.
        mousedown: (event, { store, key, props }) => {
          if (itemState(store.get(), key, props).disabled) {
            event.preventDefault();
          }
        },
        keydown: (event, { api, el }) => api.internal.onKeyDown(event, el),
        keyup: (event, { api, el, key, props }) => {
          if (event.key === " " && !isNativeButton(el) && !props.disabled) {
            api.internal.check(key, { reason: "item-press", event });
          }
        }
      },
      bind(el, part) {
        const unregister = part.api.internal.roving.bind(el, part);
        const unname = nameFromLabels(el);
        return () => {
          unname();
          unregister();
        };
      }
    }),
    // React and Vue: a native radio per item, so the form submits, resets and validates them.
    input: slot({
      props: { value: "string", disabled: "boolean" },
      attrs: (state, { id, key, props }) => ({
        type: "radio",
        // Required radios need a group to validate as one.
        name: state.name ?? (state.required ? id : void 0),
        value: key,
        form: state.form,
        checked: state.initial === key ? "" : void 0,
        required: state.required ? "" : void 0,
        disabled: state.disabled || props.disabled ? "" : void 0,
        "aria-hidden": "true",
        tabindex: "-1",
        style: hiddenInputStyle
      }),
      bind: (el, { api, store, key }) => bindHiddenInput(el, {
        checked: () => store.get().value === key,
        subscribe: store.subscribe,
        // The browser focuses an invalid radio on submit. Focus goes to the group's tab stop.
        focus: api.focus,
        control: () => api.internal.radio(key),
        activate: (event) => {
          if (!api.internal.itemProps(key).disabled) {
            api.internal.check(key, { reason: "item-press", event });
          }
        },
        reset: api.internal.reset,
        disabled: api.internal.setFormDisabled
      })
    })
  };
}
export {
  bindRadioGroup,
  radioGroupAttrs,
  radioSlots
};
