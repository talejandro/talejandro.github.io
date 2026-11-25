// src/components/toggle/toggle.ts
import {
  buttonElement,
  buttonElementAttrs,
  buttonKeydown,
  buttonKeyup,
  buttonRole
} from "../../foundation/platform/button.js";
import { watchFormDisabled } from "../../foundation/forms/form.js";
import {
  itemIconPart
} from "../../foundation/lists/item-icon.js";
import { createController } from "../../foundation/kernel/controller.js";
import {
  createDetails
} from "../../foundation/kernel/details.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  changeSource,
  createChange
} from "../../foundation/kernel/input-source.js";
import {
  createToggleGroupController,
  toggleGroup
} from "./toggle-group.js";
function createToggleController() {
  return createController();
}
var isDisabled = (state) => state.disabled || state.groupDisabled || state.formDisabled;
var keyOf = (options) => options.value ?? options.id;
var scopeOf = (options) => options.group?.()?.internal.scope() ?? options.toolbar?.();
function fromGroup(group, key, toolbar) {
  return {
    roving: true,
    focusableWhenDisabled: true,
    pressed: group.isPressed(key),
    groupDisabled: group.internal.disabled() || !!toolbar?.disabled(),
    orientation: group.internal.orientation()
  };
}
function fromToolbar(toolbar) {
  return {
    roving: true,
    focusableWhenDisabled: true,
    groupDisabled: toolbar.disabled(),
    orientation: toolbar.orientation()
  };
}
function toggleState(options) {
  const group = options.group?.();
  const toolbar = options.toolbar?.();
  const disabled = !!options.disabled;
  const scope = scopeOf(options);
  const own = {
    pressed: options.pressed ?? options.defaultPressed ?? false,
    disabled,
    formDisabled: false,
    focusableWhenDisabled: !!options.focusableWhenDisabled,
    element: "unknown",
    roving: false,
    groupDisabled: false,
    tabStop: false,
    orientation: void 0
  };
  if (!scope) {
    return own;
  }
  const joined = group ? fromGroup(group, keyOf(options), toolbar) : { ...own, ...fromToolbar(toolbar) };
  return {
    ...own,
    ...joined,
    // Servers render before anything binds, so the first eligible toggle claims the stop.
    tabStop: scope.claim({
      key: options.id,
      props: { disabled: () => disabled, preferred: () => !!joined.pressed }
    })
  };
}
function toggleApiBody(context) {
  const { id, store, options, element } = context;
  const change = createChange(context);
  const group = () => options().group?.();
  const scope = () => scopeOf(options());
  const key = () => options().value ?? id;
  const api = {
    isPressed: () => store.get().pressed,
    setPressed(pressed, { reason = "imperative", event } = {}) {
      if (isDisabled(store.get())) {
        return false;
      }
      const owner = group();
      if (!owner) {
        return change("pressed", pressed, { reason, event });
      }
      if (!owner.internal.allows(key(), pressed)) {
        return false;
      }
      const details = createDetails(
        { reason, event },
        changeSource(reason, event)
      );
      options().onPressedChange?.(pressed, details);
      if (details.canceled) {
        return false;
      }
      return owner.internal.press(key(), pressed, {
        reason: reason === "press" ? "item-press" : reason,
        event
      });
    },
    toggle: (details) => api.setPressed(!store.get().pressed, details),
    focus: () => element("root")?.focus(),
    internal: {
      // Joins the group or the toolbar, and follows its value, tab stop and
      // settings from then on.
      join(el) {
        const roving = scope();
        if (!roving) {
          return () => {
          };
        }
        const owner = group();
        const disabled = () => isDisabled(store.get());
        const follow = () => {
          const stop = roving.stop();
          const toolbar = options().toolbar?.();
          store.set({
            ...owner ? fromGroup(owner, key(), toolbar) : fromToolbar(toolbar ?? roving),
            tabStop: stop === null ? store.get().tabStop : stop === id
          });
        };
        const leave = owner ? owner.internal.register(key(), id, el, disabled) : roving.bind(el, { key: id, props: { disabled } });
        const unfollow = [roving.follow(id, follow)];
        if (owner?.internal.inToolbar()) {
          unfollow.push(owner.internal.subscribe(follow));
        }
        let wasDisabled = disabled();
        const unwatch = store.subscribe(() => {
          if (disabled() === wasDisabled) {
            return;
          }
          wasDisabled = disabled();
          roving.queueCheck();
        });
        follow();
        return () => {
          leave();
          unfollow.forEach((stop) => stop());
          unwatch();
        };
      },
      keydown(event, el) {
        buttonKeydown(event, el);
        scope()?.keydown(event, el);
      }
    }
  };
  return api;
}
var toggleApi = toggleApiBody;
var togglePrimitive = /* @__PURE__ */ definePrimitive({
  name: "toggle",
  options: {
    pressed: "boolean",
    defaultPressed: "boolean",
    onPressedChange: "callback",
    value: "string",
    disabled: "boolean",
    focusableWhenDisabled: "boolean",
    controller: "value",
    // Internal: passed by renderers.
    group: "value",
    toolbar: "value"
  },
  state: toggleState,
  controlled: ["pressed"],
  sync: (options) => {
    const group = options.group?.();
    if (group) {
      return {
        ...fromGroup(group, keyOf(options), options.toolbar?.()),
        disabled: !!options.disabled
      };
    }
    const toolbar = options.toolbar?.();
    if (toolbar) {
      return {
        ...fromToolbar(toolbar),
        disabled: !!options.disabled,
        ...options.pressed === void 0 ? {} : { pressed: options.pressed }
      };
    }
    return {
      disabled: !!options.disabled,
      focusableWhenDisabled: !!options.focusableWhenDisabled,
      ...options.pressed === void 0 ? {} : { pressed: options.pressed }
    };
  },
  api: toggleApi,
  slots: (slot) => ({
    root: slot({
      ...buttonRole((state) => state.element),
      focus: "tab-stop",
      state: (state) => ({
        pressed: state.pressed,
        disabled: isDisabled(state)
      }),
      attrs: (state) => ({
        // Never "submit": a toggle changes state, it doesn't send a form.
        ...buttonElementAttrs(state.element, {
          type: "button",
          disabled: isDisabled(state),
          focusable: state.focusableWhenDisabled,
          tabindex: state.roving ? state.tabStop ? "0" : "-1" : void 0
        }),
        "aria-pressed": String(state.pressed),
        "data-pressed": state.pressed ? "" : void 0,
        "data-disabled": isDisabled(state) ? "" : void 0,
        "data-orientation": state.orientation
      }),
      press({ api, el, store }, event) {
        if (isDisabled(store.get())) {
          return event?.preventDefault();
        }
        if (store.get().roving && el && document.activeElement !== el) {
          el.focus({ preventScroll: true });
        }
        api.toggle({ reason: "press", event });
      },
      on: {
        keydown: (event, { api, el }) => api.internal.keydown(event, el),
        keyup: (event, { el }) => buttonKeyup(event, el)
      },
      bind(el, { api, store }) {
        store.set({ element: buttonElement(el) });
        const cleanups = [watchFormDisabled(el, store), api.internal.join(el)];
        return () => cleanups.forEach((cleanup) => cleanup());
      }
    }),
    // An icon inside the toggle. In a group, the group gets `data-has-icons`.
    icon: slot(
      itemIconPart({
        component: "toggle",
        item: '[data-slot="toggle"]',
        list: '[data-slot="toggle-group"]'
      })
    )
  }),
  agent: { actions: ["setPressed"] }
});
var toggle = togglePrimitive;
export {
  createToggleController,
  createToggleGroupController,
  toggle,
  toggleGroup
};
