// src/components/checkbox/checkbox-group.ts
import { dev, warn } from "#dev";
import { inOrder } from "../../foundation/focus/collection.js";
import { documentOrder } from "../../foundation/kernel/order.js";
import {
  bindHiddenInput,
  bindInternals,
  formInternals,
  hiddenInputStyle,
  isDisabled,
  valueMissingMessage
} from "../../foundation/forms/form.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
function groupChecked(selected, all) {
  const count = all.filter((value) => selected.includes(value)).length;
  if (count === 0) {
    return false;
  }
  return count === all.length ? true : "indeterminate";
}
function createCheckboxGroupController() {
  return createController();
}
var same = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);
var submitted = (state) => state.enabled.filter((value) => state.value.includes(value));
function checkboxGroupApiBody(context) {
  const { id, store, element } = context;
  const change = createChange(context);
  const children = /* @__PURE__ */ new Map();
  const disabled = () => isDisabled(store.get());
  const all = () => store.get().allValues ?? store.get().children;
  function firstEnabled() {
    for (const value of store.get().children) {
      const child = children.get(value);
      if (child?.el.isConnected && !child.disabled()) {
        return child.el;
      }
    }
  }
  function setValue(value, details) {
    if (same(value, store.get().value)) {
      return true;
    }
    return change("value", inOrder(value, all()), details);
  }
  function refreshChildren() {
    const ordered = [...children.entries()].filter(([, child]) => child.el.isConnected).sort(([, a], [, b]) => documentOrder(a.el, b.el)).map(([value]) => value);
    const enabled = ordered.filter((value) => !children.get(value).disabled());
    const ids = ordered.map((value) => children.get(value).el.id).join(" ");
    const state = store.get();
    store.set({
      ...same(ordered, state.children) ? {} : { children: ordered },
      ...same(enabled, state.enabled) ? {} : { enabled },
      ids
    });
  }
  const api = {
    id,
    getValue: () => store.get().value,
    setValue: (value, { reason = "imperative", event } = {}) => !disabled() && setValue(value, { reason, event }),
    focus: () => firstEnabled()?.focus(),
    name: () => store.get().name,
    form: () => store.get().form,
    disabled,
    readOnly: () => store.get().readOnly,
    checked: (value) => store.get().value.includes(value),
    // A parent checkbox: checked when all are, indeterminate when some are.
    parentChecked: () => groupChecked(store.get().value, all()),
    setChild(value, checked, details) {
      if (disabled()) {
        return false;
      }
      const current = store.get().value;
      return setValue(
        checked ? [...current.filter((item) => item !== value), value] : current.filter((item) => item !== value),
        details
      );
    },
    // Whether every enabled checkbox is checked, so a parent's press can only uncheck.
    allEnabledChecked() {
      const current = store.get().value;
      return all().every(
        (value) => children.get(value)?.disabled() || current.includes(value)
      );
    },
    // The form the group belongs to, for its checkboxes.
    formOwner: () => formInternals(element("group"))?.form ?? element("group-input")?.form ?? null,
    // Checks or unchecks every enabled checkbox. Disabled ones keep their state.
    setAll(checked, details) {
      if (disabled()) {
        return false;
      }
      const locked = (value) => children.get(value)?.disabled() ?? false;
      const current = store.get().value;
      const next = checked ? [.../* @__PURE__ */ new Set([...current, ...all().filter((value) => !locked(value))])] : current.filter((value) => locked(value));
      return setValue(next, details);
    },
    // The ids of the checkboxes in the group, for a parent's aria-controls.
    childIds: () => store.get().ids,
    // Checkboxes in the group register as they bind.
    register(value, el, isDisabled2) {
      if (!el.id) {
        el.id = `${id}-${value.replace(/[\s%]/g, encodeURIComponent)}`;
      }
      if (dev) {
        const other = children.get(value)?.el;
        if (other && other !== el && other.isConnected) {
          warn(
            `two checkboxes in a group share the value "${value}". Give each its own \`value\`.`,
            {
              component: "checkbox-group",
              id
            }
          );
        }
      }
      children.set(value, { el, disabled: isDisabled2 });
      queueMicrotask(refreshChildren);
      return () => {
        if (children.get(value)?.el === el) {
          children.delete(value);
        }
        queueMicrotask(refreshChildren);
      };
    },
    subscribe: store.subscribe,
    internal: {
      reset() {
        const { value, defaultValue } = context.options();
        if (keepsValueOnReset(value, defaultValue)) {
          return;
        }
        change("value", store.get().initial, { reason: "reset" });
      },
      // The browser restores a disabled group too, as a native one.
      restore(saved) {
        setValue(saved ? saved.split("\n") : [], { reason: "restore" });
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      // A checkbox in the group was disabled or enabled.
      refreshChildren: () => queueMicrotask(refreshChildren),
      anchor: firstEnabled
    }
  };
  return api;
}
var checkboxGroupApi = checkboxGroupApiBody;
var checkboxGroupPrimitive = /* @__PURE__ */ definePrimitive({
  name: "checkbox",
  label: "checkbox-group",
  options: {
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    allValues: "list",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    controller: "value"
  },
  state: (options) => {
    const value = options.value ?? options.defaultValue ?? [];
    return {
      value,
      initial: value,
      allValues: options.allValues,
      disabled: !!options.disabled,
      readOnly: !!options.readOnly,
      required: !!options.required,
      name: options.name,
      form: options.form,
      formDisabled: false,
      children: [],
      enabled: [],
      ids: ""
    };
  },
  sync: (options) => ({
    allValues: options.allValues,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    // Like the native `defaultChecked`, changing it changes what a reset returns to.
    ...options.defaultValue === void 0 ? {} : { initial: options.defaultValue },
    ...options.value === void 0 ? {} : { value: options.value }
  }),
  live: ["ids"],
  api: checkboxGroupApi,
  slots: (slot) => ({
    group: slot({
      role: "group",
      state: (state) => ({
        value: state.value,
        disabled: isDisabled(state),
        readOnly: state.readOnly,
        required: state.required
      }),
      attrs: (state) => ({
        "aria-disabled": isDisabled(state) ? "true" : void 0,
        "data-disabled": isDisabled(state) ? "" : void 0,
        "data-readonly": state.readOnly ? "" : void 0,
        "data-required": state.required ? "" : void 0
      }),
      bind: (el, { api, store }) => bindInternals(el, {
        value: () => submitted(store.get()),
        name: () => store.get().name,
        state: () => store.get().value.join("\n"),
        restore: api.internal.restore,
        valueMissing: () => store.get().required && submitted(store.get()).length === 0,
        message: () => valueMissingMessage("checkbox"),
        anchor: api.internal.anchor,
        focus: api.focus,
        reset: api.internal.reset,
        disabled: api.internal.setFormDisabled,
        subscribe: store.subscribe
      })
    }),
    // React and Vue: an unnamed native checkbox that carries the group's
    // `required`, so the browser blocks submission until one is checked.
    // The checkboxes themselves submit the values. Its own name keeps its
    // `data-slot` apart from the checkboxes' inputs.
    "group-input": slot({
      attrs: (state) => ({
        type: "checkbox",
        form: state.form,
        checked: state.initial.length ? "" : void 0,
        required: state.required ? "" : void 0,
        disabled: state.disabled ? "" : void 0,
        "aria-hidden": "true",
        tabindex: "-1",
        style: hiddenInputStyle
      }),
      bind: (el, { api, store }) => bindHiddenInput(el, {
        checked: () => submitted(store.get()).length > 0,
        subscribe: store.subscribe,
        focus: api.focus,
        reset: api.internal.reset,
        disabled: api.internal.setFormDisabled
      })
    })
  }),
  agent: { actions: ["setValue", "setAll"] }
});
var checkboxGroup = checkboxGroupPrimitive;
export {
  checkboxGroup,
  createCheckboxGroupController,
  groupChecked
};
