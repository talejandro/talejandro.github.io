// src/foundation/forms/toggle-control.ts
import {
  bindHiddenInput,
  bindInternals,
  dispatchChange,
  formInternals,
  hiddenInputStyle,
  isDisabled,
  submitImplicitly,
  valueMissingMessage
} from "./form.js";
import { checkedAttrs } from "../kernel/attrs.js";
import { keepsValueOnReset } from "./value.js";
function checkedAttribute(attribute) {
  if (attribute === null) {
    return void 0;
  }
  return attribute === "indeterminate" ? "indeterminate" : attribute !== "false";
}
function toggleState(options) {
  const checked = options.checked ?? options.defaultChecked ?? false;
  return {
    checked,
    initial: checked,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    value: options.value ?? "on",
    form: options.form,
    formDisabled: false
  };
}
function syncToggle(options) {
  return {
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    value: options.value ?? "on",
    form: options.form,
    // Like the native `defaultChecked`, changing it changes what a reset returns to.
    ...options.defaultChecked === void 0 ? {} : { initial: options.defaultChecked },
    ...options.checked === void 0 ? {} : { checked: options.checked }
  };
}
function toggleControl({
  store,
  element,
  options
}, change, group) {
  const formElement = () => {
    const root = element("root");
    return formInternals(root) ? root : element("input");
  };
  const formOwner = () => {
    const root = element("root");
    return formInternals(root)?.form ?? element("input")?.form ?? group?.owner()?.formOwner();
  };
  function write(checked, details) {
    const owner = group?.owner();
    return group && owner ? group.write(owner, checked, details) : change("checked", checked, details);
  }
  function setState(checked, { reason = "imperative", event } = {}) {
    const state = store.get();
    if (isDisabled(state) || state.readOnly) {
      return false;
    }
    const done = write(checked, { reason, event });
    if (done && reason !== "restore") {
      dispatchChange(formElement());
    }
    return done;
  }
  return {
    // A switch's options take only booleans, so its state never holds anything else.
    getChecked: () => store.get().checked,
    // Sets the state, as a user would. Disabled and read-only controls ignore it.
    setChecked: (checked, details) => setState(checked, details),
    // An indeterminate checkbox becomes checked.
    toggle(details = {}) {
      return setState(store.get().checked !== true, details);
    },
    focus: () => element("root")?.focus(),
    form: formOwner,
    internal: {
      // The state a form restores after a reload, as `String(checked)` saved
      // it. The browser restores a disabled or read-only control too, as a native one.
      restore(saved) {
        write(saved === "indeterminate" ? "indeterminate" : saved === "true", {
          reason: "restore"
        });
      },
      reset() {
        if (group?.owner() || keepsValueOnReset(options().checked, options().defaultChecked)) {
          return;
        }
        change("checked", store.get().initial, { reason: "reset" });
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      root: () => element("root")
    }
  };
}
var isNativeButton = (el) => el instanceof HTMLButtonElement;
var switchState = (state) => ({
  checked: state.checked === true,
  disabled: isDisabled(state),
  readOnly: state.readOnly,
  required: state.required
});
var toggleDataAttrs = (state) => ({
  ...checkedAttrs(state.checked),
  "data-disabled": isDisabled(state) ? "" : void 0,
  "data-readonly": state.readOnly ? "" : void 0,
  "data-required": state.required ? "" : void 0
});
function toggleSlots(role, slot, publicState) {
  return {
    // The control itself: a button in React and Vue, the custom element on the web.
    root: slot({
      // One literal at a time, since TypeScript can't check what a union of roles needs.
      ...role === "checkbox" ? { role: "checkbox" } : { role: "switch" },
      focus: "tab-stop",
      state: publicState,
      attrs: (state) => ({
        type: "button",
        "aria-checked": state.checked === "indeterminate" ? "mixed" : String(state.checked),
        "aria-readonly": state.readOnly ? "true" : void 0,
        "aria-required": state.required ? "true" : void 0,
        // Custom elements and fieldsets disable without the native attribute.
        "aria-disabled": isDisabled(state) ? "true" : void 0,
        disabled: state.disabled ? "" : void 0,
        tabindex: isDisabled(state) ? void 0 : "0",
        ...toggleDataAttrs(state)
      }),
      press: ({ api }, event) => {
        event?.preventDefault();
        api.toggle({ reason: "press", event });
      },
      on: {
        keydown: (event, { api, el }) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!event.repeat) {
              submitImplicitly(api.form());
            }
          } else if (event.key === " " && !isNativeButton(el)) {
            event.preventDefault();
          }
        },
        keyup: (event, { api, el }) => {
          if (event.key === " " && !isNativeButton(el)) {
            api.toggle({ reason: "press", event });
          }
        }
      },
      bind: (el, { api, store }) => bindInternals(el, {
        value: () => store.get().checked === true && store.get().name !== void 0 ? store.get().value : null,
        state: () => String(store.get().checked),
        restore: api.internal.restore,
        valueMissing: () => store.get().required && store.get().checked !== true,
        message: () => valueMissingMessage("checkbox"),
        reset: api.internal.reset,
        disabled: api.internal.setFormDisabled,
        subscribe: store.subscribe
      })
    }),
    // React and Vue: the native input that takes part in the form.
    input: slot({
      attrs: (state) => ({
        type: "checkbox",
        name: state.name,
        value: state.value,
        form: state.form,
        // The default checkedness, which the server renders and a form reset returns to.
        checked: state.initial === true ? "" : void 0,
        required: state.required ? "" : void 0,
        disabled: state.disabled ? "" : void 0,
        "aria-hidden": "true",
        tabindex: "-1",
        style: hiddenInputStyle
      }),
      bind: (el, { api, store }) => bindHiddenInput(el, {
        checked: () => store.get().checked === true,
        indeterminate: () => store.get().checked === "indeterminate",
        subscribe: store.subscribe,
        focus: api.focus,
        control: api.internal.root,
        activate: (event) => api.toggle({ reason: "press", event }),
        reset: api.internal.reset,
        disabled: api.internal.setFormDisabled
      })
    })
  };
}
export {
  checkedAttribute,
  isDisabled,
  switchState,
  syncToggle,
  toggleControl,
  toggleDataAttrs,
  toggleSlots,
  toggleState
};
