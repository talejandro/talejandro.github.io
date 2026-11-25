// src/components/toggle/toggle-group.ts
import { inOrder, orientationOf } from "../../foundation/focus/collection.js";
import { createOrder } from "../../foundation/kernel/order.js";
import {
  followStop,
  memberDisabled,
  memberFocusable,
  queued
} from "../../foundation/focus/roving-scope.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import { watchFormDisabled } from "../../foundation/forms/form.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { createChange } from "../../foundation/kernel/input-source.js";
function createToggleGroupController() {
  return createController();
}
var isGroupDisabled = (state) => state.disabled || state.formDisabled || state.scopeDisabled;
function nextValue(value, key, pressed, { multiple, order }) {
  if (!multiple) {
    return pressed ? [key] : [];
  }
  const others = value.filter((item) => item !== key);
  return inOrder(pressed ? [...others, key] : others, order);
}
function toggleGroupApiBody(context) {
  const { store, options } = context;
  const change = createChange(context);
  const items = createOrder();
  const ordered = items.list;
  const isPressed = (key) => store.get().value.includes(key);
  const roving = createRovingFocus(context, {
    slot: "toggle",
    key: "stop",
    orientation: () => store.get().orientation,
    loop: () => options().loop ?? true,
    disabled: memberDisabled,
    focusable: memberFocusable,
    preferred: (toggle) => !!toggle.props.preferred?.(),
    claims: (state, toggle) => isGroupDisabled(state) || !memberDisabled(toggle) && (!state.value.length || !!toggle.props.preferred?.())
  });
  const own = {
    bind: roving.bind,
    claim: (toggle) => roving.tabIndex(store.get(), toggle) === "0",
    queueCheck: queued(roving.check),
    keydown(event, el) {
      if (!event.shiftKey) {
        roving.keydown(event, el);
      }
    },
    stop: () => store.get().stop,
    follow: (key, listener) => followStop(store, key, listener),
    orientation: () => store.get().orientation,
    disabled: () => isGroupDisabled(store.get())
  };
  const scope = () => options().toolbar?.() ?? own;
  let previous = store.get();
  store.subscribe(() => {
    const state = store.get();
    if (scope() !== own && (state.value !== previous.value || isGroupDisabled(state) !== isGroupDisabled(previous) || state.scopeDisabled !== previous.scopeDisabled)) {
      scope().queueCheck();
    }
    previous = state;
  });
  function allows(key, pressed) {
    const { multiple, deselectable } = store.get();
    if (api.internal.disabled() || items.get(key)?.disabled()) {
      return false;
    }
    if (pressed === isPressed(key)) {
      return false;
    }
    return pressed || multiple || deselectable;
  }
  function press(key, pressed, details) {
    if (!allows(key, pressed)) {
      return false;
    }
    const { value, multiple } = store.get();
    const order = ordered().map((item) => item.key);
    return change(
      "value",
      nextValue(value, key, pressed, { multiple, order }),
      {
        reason: details.reason ?? "imperative",
        event: details.event
      }
    );
  }
  const api = {
    getValue: () => store.get().value,
    setValue(value, { reason = "imperative", event } = {}) {
      const order = ordered().map((item) => item.key);
      return change(
        "value",
        store.get().multiple ? inOrder(value, order) : value.slice(0, 1),
        {
          reason,
          event
        }
      );
    },
    isPressed,
    toggle: (value, details = {}) => press(value, !isPressed(value), details),
    focus(value) {
      if (value !== void 0) {
        items.get(value)?.el.focus();
      } else if (scope() === own) {
        roving.focus();
      } else {
        ordered()[0]?.el.focus();
      }
    },
    internal: {
      allows,
      press,
      // A disabled toolbar disables the groups in it. Read from state, which
      // follows the toolbar the props pass now, before they're handed over.
      disabled: () => isGroupDisabled(store.get()),
      orientation: () => store.get().orientation,
      subscribe: store.subscribe,
      scope,
      // Whether a toolbar around the group holds the tab stop.
      inToolbar: () => scope() !== own,
      // Each toggle is its own instance, so the agent bridge reads a toggle's marks here.
      elementOf: (key) => items.get(key)?.el,
      // A toggle joins by its value, and the roving group by a key of its own,
      // which stays unique in a toolbar that holds several groups.
      register(key, rovingKey, el, disabled) {
        const remove = items.add({ key, el, disabled });
        const leave = scope().bind(el, {
          key: rovingKey,
          props: { disabled, preferred: () => isPressed(key) }
        });
        return () => {
          remove();
          leave();
        };
      }
    }
  };
  return api;
}
var toggleGroupApi = toggleGroupApiBody;
var toggleGroupPrimitive = /* @__PURE__ */ definePrimitive({
  name: "toggle",
  options: {
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    multiple: "boolean",
    deselectable: "boolean",
    disabled: "boolean",
    orientation: "string",
    loop: "boolean",
    controller: "value",
    // Internal: passed by renderers.
    toolbar: "value"
  },
  state: (options) => ({
    value: options.value ?? options.defaultValue ?? [],
    multiple: !!options.multiple,
    deselectable: options.deselectable ?? true,
    disabled: !!options.disabled,
    formDisabled: false,
    orientation: orientationOf(options.orientation, "horizontal"),
    stop: null,
    scopeDisabled: !!options.toolbar?.()?.disabled()
  }),
  sync: (options) => ({
    multiple: !!options.multiple,
    deselectable: options.deselectable ?? true,
    disabled: !!options.disabled,
    orientation: orientationOf(options.orientation, "horizontal"),
    scopeDisabled: !!options.toolbar?.()?.disabled(),
    ...options.value === void 0 ? {} : { value: options.value }
  }),
  api: toggleGroupApi,
  slots: (slot) => ({
    group: slot({
      // A group, not a toolbar: a toolbar may hold one, and `aria-orientation`
      // isn't allowed on a group.
      role: "group",
      state: (state) => ({
        value: state.value,
        multiple: state.multiple,
        disabled: isGroupDisabled(state),
        orientation: state.orientation
      }),
      attrs: (state) => ({
        "data-orientation": state.orientation,
        "data-disabled": isGroupDisabled(state) ? "" : void 0
      }),
      bind: (el, { store }) => watchFormDisabled(el, store)
    })
  }),
  agent: { actions: ["setValue", "toggle"], closed: true }
});
var toggleGroup = toggleGroupPrimitive;
export {
  createToggleGroupController,
  nextValue,
  toggleGroup
};
