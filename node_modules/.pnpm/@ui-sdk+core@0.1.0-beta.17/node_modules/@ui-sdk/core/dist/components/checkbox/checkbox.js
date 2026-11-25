// src/components/checkbox/checkbox.ts
import { animateIn, animateOut } from "../../foundation/motion/presence.js";
import { createController } from "../../foundation/kernel/controller.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  checkedAttribute,
  isDisabled,
  switchState,
  syncToggle,
  toggleControl,
  toggleDataAttrs,
  toggleSlots,
  toggleState
} from "../../foundation/forms/toggle-control.js";
import { live } from "../../foundation/kernel/live.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import {
  checkboxGroup,
  createCheckboxGroupController
} from "./checkbox-group.js";
function createCheckboxController() {
  return createController();
}
function fromGroup(options) {
  const group = options.group?.();
  if (!group) {
    return void 0;
  }
  const parent = !!options.parent;
  return {
    checked: parent ? group.parentChecked() : group.checked(options.value ?? "on"),
    // A parent stands for the others, so it submits nothing.
    name: parent ? void 0 : options.name ?? group.name(),
    disabled: !!options.disabled || group.disabled(),
    readOnly: !!options.readOnly || group.readOnly(),
    form: options.form ?? group.form()
  };
}
function checkboxSync(options) {
  const group = fromGroup(options);
  if (!group) {
    return syncToggle(options);
  }
  return {
    ...group,
    required: !!options.required,
    value: options.value ?? "on"
  };
}
function checkboxApiBody(context) {
  const { store, element, options } = context;
  const change = createChange(context);
  const group = () => options().group?.();
  const isParent = () => !!options().parent;
  const control = toggleControl(
    context,
    change,
    {
      owner: group,
      write(owner, checked, details) {
        const { reason, event } = details;
        const forGroup = {
          reason: reason === "press" ? "item-press" : reason,
          event
        };
        const accepted = isParent() ? owner.setAll(
          checked === true && !owner.allEnabledChecked(),
          forGroup
        ) : owner.setChild(store.get().value, checked === true, forGroup);
        if (!accepted) {
          return false;
        }
        change(
          "checked",
          isParent() ? owner.parentChecked() : owner.checked(store.get().value),
          details
        );
        return true;
      }
    }
  );
  let changed = false;
  const exitingAfter = (was, checked) => checked === false && was !== false && !!element("indicator");
  deriveFromOptions(
    context,
    ["exiting"],
    (synced, state) => "checked" in synced && synced.checked !== state.checked ? { exiting: exitingAfter(state.checked, synced.checked) } : void 0
  );
  let previous = store.get().checked;
  store.subscribe(() => {
    const { checked } = store.get();
    if (checked === previous) {
      return;
    }
    const was = previous;
    previous = checked;
    changed = true;
    store.set({ exiting: exitingAfter(was, checked) });
  });
  return {
    ...control,
    isChanged: () => changed,
    internal: {
      ...control.internal,
      // Joins the group, and follows its value from then on.
      joinGroup(el) {
        const owner = group();
        if (!owner) {
          return () => {
          };
        }
        const follow = () => {
          const { name, disabled: disabled2, readOnly, form } = fromGroup(options());
          store.set({
            checked: isParent() ? owner.parentChecked() : owner.checked(store.get().value),
            controls: isParent() ? owner.childIds() || void 0 : void 0,
            name,
            disabled: disabled2,
            readOnly,
            form
          });
        };
        const unsubscribe = owner.subscribe(follow);
        follow();
        if (isParent()) {
          return unsubscribe;
        }
        const join = () => owner.register(store.get().value, el, () => isDisabled(store.get()));
        let leave = join();
        let { value } = store.get();
        let disabled = isDisabled(store.get());
        const unsubscribeSelf = store.subscribe(() => {
          const state = store.get();
          if (state.value !== value) {
            value = state.value;
            leave();
            leave = join();
          } else if (isDisabled(state) !== disabled) {
            owner.internal.refreshChildren();
          }
          disabled = isDisabled(state);
        });
        return () => {
          unsubscribe();
          unsubscribeSelf();
          leave();
        };
      },
      finishExit() {
        store.set({ exiting: false });
      }
    }
  };
}
var checkboxApi = checkboxApiBody;
var checkboxState = (state) => ({
  ...switchState(state),
  indeterminate: state.checked === "indeterminate"
});
var checkboxPrimitive = /* @__PURE__ */ definePrimitive({
  name: "checkbox",
  options: {
    checked: checkedAttribute,
    defaultChecked: checkedAttribute,
    onCheckedChange: "callback",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    value: "string",
    form: "string",
    controller: "value",
    parent: "boolean",
    // Internal: passed by renderers.
    group: "value"
  },
  state: (options) => {
    const group = fromGroup(options);
    return {
      ...toggleState(group ? { ...options, ...group } : options),
      exiting: false,
      controls: void 0
    };
  },
  controlled: ["checked"],
  live: ["controls"],
  sync: checkboxSync,
  api: checkboxApi,
  slots: (slot) => {
    const { root, input } = toggleSlots("checkbox", slot, checkboxState);
    return {
      root: slot({
        ...root,
        // A parent checkbox points at the checkboxes it controls.
        live: live((state) => ({ "aria-controls": state.controls })),
        bind: (el, part) => {
          const leave = part.api.internal.joinGroup(el);
          const unbind = root.bind?.(el, part);
          return () => {
            unbind?.();
            leave();
          };
        }
      }),
      input,
      indicator: slot({
        props: { keepMounted: "boolean" },
        present: (state, { props }) => !!props.keepMounted || state.checked !== false || state.exiting,
        state: checkboxState,
        attrs: (state) => toggleDataAttrs(state),
        bind(el, { api, store, props }) {
          let stop;
          let shown = store.get().checked !== false;
          if (shown && api.isChanged()) {
            stop = animateIn(el);
          }
          const unsubscribe = store.subscribe(() => {
            const { checked, exiting } = store.get();
            el.toggleAttribute("data-checked", checked === true);
            el.toggleAttribute("data-unchecked", checked === false);
            el.toggleAttribute(
              "data-indeterminate",
              checked === "indeterminate"
            );
            if (checked !== false === shown) {
              return;
            }
            shown = checked !== false;
            stop?.();
            stop = void 0;
            if (shown) {
              stop = animateIn(el);
            } else if (exiting || props.keepMounted) {
              stop = animateOut(el, () => {
                stop = void 0;
                api.internal.finishExit();
              });
            }
          });
          return () => {
            unsubscribe();
            stop?.();
          };
        }
      })
    };
  },
  agent: { actions: ["setChecked"] }
});
var checkbox = checkboxPrimitive;
export {
  checkbox,
  checkboxGroup,
  createCheckboxController,
  createCheckboxGroupController
};
