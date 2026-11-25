// src/components/toolbar/toolbar.ts
import { watchFormDisabled } from "../../foundation/forms/form.js";
import { flagWhileBound } from "../../foundation/kernel/bound-keys.js";
import {
  buttonElement,
  buttonElementAttrs,
  buttonKeydown,
  buttonKeyup,
  buttonRole
} from "../../foundation/platform/button.js";
import { stepFor } from "../../foundation/focus/collection.js";
import { isRTL } from "../../foundation/platform/env.js";
import {
  followStop,
  memberDisabled,
  memberFocusable,
  queued
} from "../../foundation/focus/roving-scope.js";
import { fieldKeeps, placeCaret } from "./toolbar-fields.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { onProps } from "../../foundation/kernel/part.js";
import { selects } from "../../foundation/kernel/selects.js";
function createToolbarController() {
  return createController();
}
var elementOf = (state, key) => state.elements[key] ?? (state.bound ? "button" : "unknown");
var across = (orientation) => orientation === "horizontal" ? "vertical" : "horizontal";
var isToolbarDisabled = (state) => state.disabled || state.formDisabled;
var isDisabled = (state, props) => !!(props.disabled || props.groupDisabled || isToolbarDisabled(state));
var isFocusable = (state, props) => !isDisabled(state, props) || (props.focusableWhenDisabled ?? true);
var usingKeys = /* @__PURE__ */ new Set([
  "Enter",
  " ",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight"
]);
function toolbarApiBody(context) {
  const { store, options, props } = context;
  const orientation = () => store.get().orientation;
  const roving = createRovingFocus(context, {
    slot: "button",
    key: "stop",
    orientation,
    loop: () => options().loop ?? true,
    disabled: memberDisabled,
    focusable: memberFocusable
  });
  const fields = /* @__PURE__ */ new Map();
  function move(event, el) {
    if (event.shiftKey || fields.get(el)?.(event)) {
      return;
    }
    const moved = roving.keydown(event, el);
    const next = moved && moved.key !== moved.from && roving.items().find((item) => item.key === moved.key);
    if (!next) {
      return;
    }
    const step = stepFor(event.key, orientation(), isRTL(el));
    placeCaret(
      next.el,
      step === "last" || typeof step === "number" && step > 0
    );
  }
  const scope = {
    bind: roving.bind,
    claim: (item) => roving.tabIndex(store.get(), item) === "0",
    queueCheck: queued(roving.check),
    keydown: move,
    stop: () => store.get().stop,
    follow: (key, listener) => followStop(store, key, listener),
    orientation,
    disabled: () => isToolbarDisabled(store.get())
  };
  const disabledScope = { ...scope, disabled: () => true };
  const itemProps = (slot, key) => props(slot, key) ?? {};
  function join(part, el, keeps) {
    const { slot, key } = part;
    const disabled = () => isDisabled(store.get(), itemProps(slot, key));
    const focusable = () => isFocusable(store.get(), itemProps(slot, key));
    const leave = roving.bind(el, { key, props: { disabled, focusable } });
    let rules = [disabled(), focusable()];
    const unwatch = onProps(part, () => {
      if (rules[0] === disabled() && rules[1] === focusable()) {
        return;
      }
      rules = [disabled(), focusable()];
      scope.queueCheck();
    });
    if (keeps) {
      fields.set(el, keeps);
    }
    const refuse = (event) => {
      if (!disabled()) {
        return;
      }
      if (event instanceof KeyboardEvent) {
        if (!usingKeys.has(event.key)) {
          return;
        }
        move(event, el);
        if (!keeps?.(event)) {
          event.preventDefault();
        }
        event.stopImmediatePropagation();
        return;
      }
      if (event.type !== "pointerdown") {
        event.preventDefault();
      }
      event.stopImmediatePropagation();
    };
    const types = ["click", "pointerdown", "keydown"];
    for (const type of types) {
      el.addEventListener(type, refuse, true);
    }
    return () => {
      unwatch();
      leave();
      if (fields.get(el) === keeps) {
        fields.delete(el);
      }
      for (const type of types) {
        el.removeEventListener(type, refuse, true);
      }
    };
  }
  return {
    focus: () => roving.focus(),
    internal: {
      orientation,
      scope,
      // The scope for toggles and toggle groups in a group, disabled or not.
      scopeIn: (groupDisabled) => groupDisabled ? disabledScope : scope,
      join,
      isStop: (key, enabled) => roving.tabIndex(store.get(), {
        key,
        props: { disabled: () => !enabled }
      }) === "0",
      // Arrow keys from any item, after the item's own handlers, so a component
      // rendered through it, like a number field, keeps the keys it uses.
      keydown: (event) => move(event, event.target),
      setElement(key, el) {
        const element = buttonElement(el);
        const { elements } = store.get();
        if ((elements[key] ?? "button") !== element) {
          store.set({ elements: { ...elements, [key]: element } });
        }
      }
    }
  };
}
var toolbarApi = toolbarApiBody;
function itemAttrs(state, key, props, api) {
  const disabled = isDisabled(state, props);
  const focusable = isFocusable(state, props);
  return {
    disabled,
    focusable,
    tabindex: focusable ? api.internal.isStop(key, !disabled) ? "0" : "-1" : void 0,
    data: {
      "data-disabled": disabled ? "" : void 0,
      "data-orientation": state.orientation
    }
  };
}
var fromOptions = (options) => ({
  orientation: options.orientation === "vertical" ? "vertical" : "horizontal",
  disabled: !!options.disabled
});
var toolbarPrimitive = /* @__PURE__ */ definePrimitive({
  name: "toolbar",
  options: {
    orientation: "string",
    loop: "boolean",
    disabled: "boolean",
    controller: "value"
  },
  state: (options) => ({
    ...fromOptions(options),
    formDisabled: false,
    stop: null,
    elements: {},
    bound: false
  }),
  sync: fromOptions,
  api: toolbarApi,
  slots: (slot) => ({
    root: slot({
      role: "toolbar",
      keys: (state) => [
        ...state.orientation === "vertical" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"],
        "Home",
        "End"
      ],
      state: (state) => ({
        orientation: state.orientation,
        disabled: isToolbarDisabled(state)
      }),
      attrs: (state) => ({
        "aria-orientation": state.orientation,
        "data-orientation": state.orientation,
        "data-disabled": isToolbarDisabled(state) ? "" : void 0
      }),
      on: {
        keydown: (event, { api }) => api.internal.keydown(event)
      },
      bind: (el, { store }) => {
        const cleanups = [
          flagWhileBound(store, "bound", { now: true }),
          watchFormDisabled(el, store)
        ];
        return () => cleanups.forEach((cleanup) => cleanup());
      }
    }),
    button: slot({
      ...buttonRole((state, { key }) => elementOf(state, key)),
      focus: "roving",
      press: {
        none: "The author's click does the work, and Enter and Space on other elements send one."
      },
      props: {
        id: "id",
        disabled: "boolean",
        focusableWhenDisabled: "boolean",
        // From the group the item sits in.
        groupDisabled: { kind: "boolean", from: "group.disabled" }
      },
      // Buttons rendered as other elements record which in `elements`, each
      // reading only its own entry.
      selects: selects({
        stop: ({ key }) => [key, null],
        elements: ({ key }) => [key]
      }),
      state: (state, { props }) => ({
        disabled: isDisabled(state, props),
        orientation: state.orientation
      }),
      attrs: (state, { key, props, api }) => {
        const item = itemAttrs(state, key, props, api);
        return {
          ...buttonElementAttrs(elementOf(state, key), {
            type: "button",
            disabled: item.disabled,
            focusable: item.focusable,
            tabindex: item.tabindex
          }),
          ...item.data
        };
      },
      on: {
        keydown: (event, { el }) => buttonKeydown(event, el),
        keyup: (event, { el }) => buttonKeyup(event, el)
      },
      bind(el, part) {
        part.api.internal.setElement(part.key, el);
        return part.api.internal.join(part, el);
      }
    }),
    link: slot({
      props: {
        id: "id",
        groupDisabled: { kind: "boolean", from: "group.disabled" }
      },
      selects: selects({
        stop: ({ key }) => [key, null],
        elements: [],
        bound: []
      }),
      state: (state, { props }) => ({
        disabled: isDisabled(state, props),
        orientation: state.orientation
      }),
      attrs: (state, { key, props, api }) => {
        const item = itemAttrs(state, key, props, api);
        return {
          tabindex: item.tabindex,
          "aria-disabled": item.disabled ? "true" : void 0,
          ...item.data
        };
      },
      bind: (el, part) => part.api.internal.join(part, el)
    }),
    // A text field. Arrows move its caret, and leave it only from the end they point at.
    input: slot({
      props: {
        id: "id",
        disabled: "boolean",
        focusableWhenDisabled: "boolean",
        // From the group the item sits in.
        groupDisabled: { kind: "boolean", from: "group.disabled" }
      },
      selects: selects({
        stop: ({ key }) => [key, null],
        elements: [],
        bound: []
      }),
      state: (state, { props }) => ({
        disabled: isDisabled(state, props),
        orientation: state.orientation
      }),
      attrs: (state, { key, props, api }) => {
        const item = itemAttrs(state, key, props, api);
        const native = item.disabled && !item.focusable;
        return {
          tabindex: item.tabindex,
          disabled: native ? "" : void 0,
          // A field that keeps focus while disabled can't be edited either.
          readonly: item.disabled && !native ? "" : void 0,
          "aria-disabled": item.disabled && !native ? "true" : void 0,
          ...item.data
        };
      },
      bind: (el, part) => part.api.internal.join(part, el, (event) => fieldKeeps(event, el))
    }),
    group: slot({
      role: "group",
      props: { id: "id", disabled: "boolean" },
      state: (state, { props }) => ({
        disabled: !!props.disabled || isToolbarDisabled(state),
        orientation: state.orientation
      }),
      attrs: (state, { props }) => ({
        "data-disabled": props.disabled || isToolbarDisabled(state) ? "" : void 0,
        "data-orientation": state.orientation
      })
    }),
    separator: slot({
      role: "separator",
      state: (state) => ({ orientation: across(state.orientation) }),
      attrs: (state) => ({
        "aria-orientation": across(state.orientation),
        "data-orientation": across(state.orientation)
      })
    })
  })
});
var toolbar = toolbarPrimitive;
export {
  createToolbarController,
  toolbar
};
