// src/components/input/input.ts
import {
  watchValue,
  writeValue
} from "../../foundation/forms/value.js";
import { watchFieldsets } from "../../foundation/forms/form.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  focusFromSurroundings,
  initialText,
  syncText,
  textFields,
  textFieldApi
} from "../../foundation/forms/text-field.js";
import { select } from "../../foundation/kernel/selects.js";
import { createChange, inputSource } from "../../foundation/kernel/input-source.js";
import { isApple } from "../../foundation/platform/platform.js";
function createInputController() {
  return createController();
}
function textState(state, props) {
  return {
    filled: state.filled,
    disabled: !!props.disabled,
    readOnly: !!props.readOnly,
    required: !!props.required
  };
}
function textAttrs(state, props) {
  return {
    "data-filled": state.filled ? "" : void 0,
    "data-disabled": props.disabled ? "" : void 0,
    "data-readonly": props.readOnly ? "" : void 0,
    "data-required": props.required ? "" : void 0
  };
}
var inputPrimitive = /* @__PURE__ */ definePrimitive({
  name: "input",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    controller: "value"
  },
  state: (options) => initialText(options),
  live: ["value"],
  sync: syncText,
  api: (context) => textFieldApi(context, createChange(context), "root"),
  slots: (slot) => ({
    root: slot({
      props: { disabled: "boolean", readOnly: "boolean", required: "boolean" },
      state: (state, { props }) => textState(state, props),
      attrs: (state, { props }) => textAttrs(state, props),
      bind: (el, { api }) => api.internal.bind(el)
    })
  }),
  agent: { actions: ["setValue", "clear"] }
});
var input = inputPrimitive;
function fitContent(el) {
  if (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")) {
    el.style.setProperty("field-sizing", "content");
    return () => el.style.removeProperty("field-sizing");
  }
  let width = -1;
  const fit = () => {
    el.style.height = "auto";
    const borders = el.offsetHeight - el.clientHeight;
    el.style.height = `${el.scrollHeight + borders}px`;
  };
  fit();
  const unwatch = watchValue(el, fit);
  const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(([entry]) => {
    if (entry.contentRect.width === width) {
      return;
    }
    width = entry.contentRect.width;
    fit();
  });
  observer?.observe(el);
  return () => {
    unwatch();
    observer?.disconnect();
    el.style.removeProperty("height");
  };
}
var textareaPrimitive = /* @__PURE__ */ definePrimitive({
  name: "textarea",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    controller: "value",
    autoResize: "boolean",
    onSubmit: "callback",
    submitShortcut: "string"
  },
  // `autoResize` is state, so turning it on or off after mount reaches the bound root.
  state: (options) => ({
    ...initialText(options),
    autoResize: !!options.autoResize
  }),
  live: ["value"],
  sync: (options) => ({
    ...syncText(options),
    autoResize: !!options.autoResize
  }),
  api: (context) => {
    const field = textFieldApi(context, createChange(context), "root");
    const { options, store, element } = context;
    function submitKey(event) {
      const shortcut = options().submitShortcut;
      if (!shortcut || event.key !== "Enter") {
        return;
      }
      const mod = isApple() ? event.metaKey : event.ctrlKey;
      const submits = shortcut === "enter" ? !event.shiftKey && !mod && !event.altKey : mod && !event.shiftKey;
      if (!submits) {
        return;
      }
      const { onSubmit } = options();
      const form = element("root")?.form;
      if (!onSubmit && !form) {
        return;
      }
      event.preventDefault();
      if (onSubmit) {
        onSubmit(store.get().value, { event });
      } else {
        form?.requestSubmit();
      }
    }
    return { ...field, internal: { ...field.internal, submitKey } };
  },
  slots: (slot) => ({
    root: slot({
      props: { disabled: "boolean", readOnly: "boolean", required: "boolean" },
      state: (state, { props }) => textState(state, props),
      attrs: (state, { props }) => textAttrs(state, props),
      on: { keydown: (event, { api }) => api.internal.submitKey(event) },
      bind: (el, { api, store }) => {
        const unbind = api.internal.bind(el);
        let unfit;
        const follow = () => {
          const { autoResize } = store.get();
          if (autoResize && !unfit) {
            unfit = fitContent(el);
          } else if (!autoResize && unfit) {
            unfit();
            unfit = void 0;
          }
        };
        follow();
        const unfollow = select(store, "autoResize", true, follow);
        return () => {
          unbind();
          unfollow();
          unfit?.();
        };
      }
    })
  }),
  agent: { actions: ["setValue", "clear"] }
});
var textarea = textareaPrimitive;
var fieldSelector = 'input:not([type="hidden"]), textarea';
function groupAttrs(state) {
  return {
    "data-filled": state.filled ? "" : void 0,
    "data-disabled": state.disabled ? "" : void 0,
    "data-readonly": state.readOnly ? "" : void 0
  };
}
var inputGroupPrimitive = /* @__PURE__ */ definePrimitive({
  // Its parts are `input-group` and `input-clear`.
  name: "input",
  state: (_options) => ({
    filled: false,
    disabled: false,
    readOnly: false
  }),
  api: ({ store, element }) => {
    inputSource();
    const control = () => element("group")?.querySelector(fieldSelector) ?? void 0;
    return {
      control,
      // Empties the field the way typing would, then returns focus to it.
      clear(event) {
        const el = control();
        if (!el || store.get().disabled || store.get().readOnly) {
          return;
        }
        const field = textFields.get(el);
        if (field) {
          field.internal.clearPress(event);
        } else {
          writeValue(el, "", { asUser: true });
        }
        el.focus();
      },
      internal: {
        // Sets the state the group shows, like the docs' attribute tables do without a field.
        update: (state) => store.set(state)
      }
    };
  },
  slots: (slot) => ({
    group: slot({
      state: (state) => state,
      attrs: (state) => groupAttrs(state),
      // Presses on the group's own text and icons focus the field, like a label would.
      press: ({ api, el }, event) => focusFromSurroundings(event, el, api.control()),
      bind: (el, { store, api }) => {
        let field;
        let fieldsetDisabled = false;
        let cleanups = [];
        let active = true;
        const update = () => {
          if (!field) {
            return;
          }
          store.set({
            filled: field.value !== "",
            disabled: field.disabled || fieldsetDisabled,
            readOnly: field.readOnly
          });
        };
        const find = () => {
          if (!active) {
            return;
          }
          const next = api.control();
          if (next === field) {
            return;
          }
          cleanups.forEach((cleanup) => cleanup());
          cleanups = [];
          field = next;
          if (!field) {
            return;
          }
          const observer = new MutationObserver(update);
          observer.observe(field, { attributeFilter: ["disabled", "readonly"] });
          cleanups = [
            watchValue(field, update),
            watchFieldsets(field, (disabled) => {
              fieldsetDisabled = disabled;
              update();
            }),
            () => observer.disconnect()
          ];
          update();
        };
        queueMicrotask(find);
        const children = new MutationObserver(find);
        children.observe(el, { childList: true, subtree: true });
        return () => {
          active = false;
          children.disconnect();
          cleanups.forEach((cleanup) => cleanup());
        };
      }
    }),
    // Shown while the field has text it can clear.
    clear: slot({
      present: (state) => state.filled && !state.disabled && !state.readOnly,
      state: (state) => state,
      attrs: (state) => ({ type: "button", ...groupAttrs(state) }),
      press: ({ api }, event) => api.clear(event)
    })
  }),
  // The Input inside is the component an agent reads and clears.
  agent: { shown: () => false }
});
var inputGroup = inputGroupPrimitive;
export {
  createInputController,
  input,
  inputGroup,
  textarea
};
