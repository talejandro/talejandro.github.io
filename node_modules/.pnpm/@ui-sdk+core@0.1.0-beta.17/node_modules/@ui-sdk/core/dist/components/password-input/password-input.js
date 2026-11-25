// src/components/password-input/password-input.ts
import {
  buttonElement,
  buttonElementAttrs,
  buttonKeydown,
  buttonKeyup,
  buttonRole
} from "../../foundation/platform/button.js";
import { watchFieldsets } from "../../foundation/forms/form.js";
import { afterReset } from "../../foundation/forms/value.js";
import { createController } from "../../foundation/kernel/controller.js";
import { on } from "../../foundation/kernel/events.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  focusFromSurroundings,
  initialText,
  syncText,
  textFieldApi
} from "../../foundation/forms/text-field.js";
import { createChange } from "../../foundation/kernel/input-source.js";
function createPasswordInputController() {
  return createController();
}
var settings = (options) => ({
  disabled: !!options.disabled,
  readOnly: !!options.readOnly,
  required: !!options.required,
  name: options.name,
  form: options.form,
  autoComplete: options.autoComplete ?? "current-password"
});
var isDisabled = (state) => state.disabled || state.formDisabled || state.controlDisabled;
function publicState(state) {
  return {
    visible: state.visible,
    capsLock: state.capsLock,
    filled: state.filled,
    disabled: isDisabled(state),
    readOnly: state.readOnly,
    required: state.required
  };
}
function dataAttrs(state) {
  return {
    "data-visible": state.visible ? "" : void 0,
    "data-capslock": state.capsLock ? "" : void 0,
    "data-filled": state.filled ? "" : void 0,
    "data-disabled": isDisabled(state) ? "" : void 0,
    "data-readonly": state.readOnly ? "" : void 0,
    "data-required": state.required ? "" : void 0
  };
}
var controlIdOf = (state, id) => state.controlId ?? `${id}-control`;
var typeOf = (visible) => visible ? "text" : "password";
function showText(el, visible) {
  const type = typeOf(visible);
  const focused = el.ownerDocument.activeElement === el;
  const {
    selectionStart: start,
    selectionEnd: end,
    selectionDirection: direction,
    value
  } = el;
  if (el.type !== type) {
    el.type = type;
  }
  if (!focused || start === null || end === null) {
    return;
  }
  const restore = () => {
    if (el.ownerDocument.activeElement === el && el.value === value && el.type === type) {
      el.setSelectionRange(start, end, direction ?? void 0);
    }
  };
  restore();
  requestAnimationFrame(restore);
}
function watchDisabled(el, onChange) {
  onChange(el.disabled);
  const observer = new MutationObserver(() => onChange(el.disabled));
  observer.observe(el, { attributeFilter: ["disabled"] });
  return () => observer.disconnect();
}
var passwordInputPrimitive = /* @__PURE__ */ definePrimitive({
  name: "password-input",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    visible: "boolean",
    defaultVisible: "boolean",
    onVisibleChange: "callback",
    autoComplete: "string",
    name: "string",
    form: "string",
    required: "boolean",
    disabled: "boolean",
    readOnly: "boolean",
    controller: "value",
    // Internal: passed by renderers.
    controlId: "string"
  },
  state: (options) => ({
    ...initialText(options),
    visible: options.visible ?? options.defaultVisible ?? false,
    capsLock: false,
    formDisabled: false,
    controlDisabled: false,
    controlId: options.controlId ?? null,
    toggleElement: "unknown",
    ...settings(options)
  }),
  live: ["value"],
  controlled: ["value", "visible"],
  sync: (options) => ({
    ...syncText(options),
    ...options.visible === void 0 ? {} : { visible: options.visible },
    ...options.controlId === void 0 ? {} : { controlId: options.controlId },
    ...settings(options)
  }),
  api: (context) => {
    const { store, element } = context;
    const change = createChange(context);
    const text = textFieldApi(context, change, "control");
    const control = () => element("control");
    let selection;
    function setVisible(visible, {
      reason = "imperative",
      event
    } = {}) {
      return change("visible", visible, { reason, event });
    }
    function hide(reason, event) {
      const el = control();
      if (!store.get().visible || !el) {
        return;
      }
      showText(el, false);
      setVisible(false, { reason, event });
      setTimeout(() => {
        if (el.type !== typeOf(store.get().visible)) {
          showText(el, store.get().visible);
        }
      });
    }
    return {
      ...text,
      isVisible: () => store.get().visible,
      setVisible: (visible, { reason, event } = {}) => setVisible(visible, { reason, event }),
      toggleVisible: ({
        reason,
        event
      } = {}) => setVisible(!store.get().visible, { reason, event }),
      internal: {
        ...text.internal,
        control,
        // A press from a pointer brings focus back to the field, with its caret,
        // so typing goes on. Keys and screen readers keep focus on the toggle,
        // which says whether it's pressed.
        togglePress(event) {
          if (isDisabled(store.get())) {
            return;
          }
          setVisible(!store.get().visible, { reason: "toggle-press", event });
          const el = control();
          const pointer = !!event && event instanceof MouseEvent && event.detail > 0;
          if (!pointer || !el || el.ownerDocument.activeElement === el) {
            return;
          }
          el.focus({ preventScroll: true });
          if (selection) {
            el.setSelectionRange(...selection);
          }
        },
        // Mouse events carry modifier state too, so a click into the field
        // shows the warning before any key.
        capsLock(event) {
          store.set({ capsLock: !!event.getModifierState?.("CapsLock") });
        },
        // A field removed or hidden while it has focus blurs after its part let go
        // of it, so this takes the event's target.
        blurred(el) {
          store.set({ capsLock: false });
          if (el && el.selectionStart !== null && el.selectionEnd !== null) {
            selection = [
              el.selectionStart,
              el.selectionEnd,
              el.selectionDirection ?? "none"
            ];
          }
        },
        bindControl(el) {
          let shown = store.get().visible;
          if (el.type !== typeOf(shown)) {
            showText(el, shown);
          }
          const view = el.ownerDocument.defaultView;
          const onPageHide = (event) => hide("page-hide", event);
          view?.addEventListener("pagehide", onPageHide);
          const cleanups = [
            text.internal.bind(el),
            // Only a change of visibility, not every keystroke, which also reaches subscribers.
            store.subscribe(() => {
              if (store.get().visible === shown) {
                return;
              }
              shown = store.get().visible;
              showText(el, shown);
            }),
            watchFieldsets(el, (formDisabled) => store.set({ formDisabled })),
            watchDisabled(
              el,
              (controlDisabled) => store.set({ controlDisabled })
            ),
            // Captured, so the field is a password field before the page's own
            // submit handlers run, and before the browser decides whether to offer to save it.
            on(
              el.ownerDocument,
              "submit",
              (event) => {
                if (event.target === el.form) {
                  hide("form-submit", event);
                }
              },
              { capture: true }
            ),
            on(
              el.ownerDocument,
              "reset",
              (event) => {
                if (event.target === el.form) {
                  afterReset(event, () => hide("reset"));
                }
              },
              { capture: true }
            ),
            () => view?.removeEventListener("pagehide", onPageHide)
          ];
          return () => cleanups.forEach((cleanup) => cleanup());
        }
      }
    };
  },
  slots: (slot) => ({
    root: slot({
      state: publicState,
      attrs: dataAttrs,
      // Presses on the root's own text and icons focus the field, like a label would.
      press: ({ api, el }, event) => focusFromSurroundings(event, el, api.internal.control())
    }),
    control: slot({
      props: { id: "string" },
      state: publicState,
      attrs: (state, { id, props }) => ({
        type: typeOf(state.visible),
        id: props.id ?? controlIdOf(state, id),
        name: state.name,
        form: state.form,
        autocomplete: state.autoComplete,
        // A shown password is plain text: never send it to a spellchecking
        // service, and never let the keyboard correct or capitalize it.
        autocapitalize: "off",
        autocorrect: "off",
        spellcheck: "false",
        required: state.required ? "" : void 0,
        disabled: state.disabled ? "" : void 0,
        readonly: state.readOnly ? "" : void 0,
        ...dataAttrs(state)
      }),
      on: {
        keydown: (event, { api }) => api.internal.capsLock(event),
        keyup: (event, { api }) => api.internal.capsLock(event),
        mousedown: (event, { api }) => api.internal.capsLock(event),
        focusout: (event, { api }) => api.internal.blurred(event.target)
      },
      bind: (el, { api }) => api.internal.bindControl(el)
    }),
    toggle: slot({
      ...buttonRole((state) => state.toggleElement),
      focus: "tab-stop",
      state: publicState,
      attrs: (state, { id }) => ({
        // Never "submit": Enter in the field submits the form, it doesn't press the toggle.
        ...buttonElementAttrs(state.toggleElement, {
          type: "button",
          disabled: isDisabled(state),
          focusable: false
        }),
        "aria-pressed": String(state.visible),
        "aria-controls": controlIdOf(state, id),
        ...dataAttrs(state)
      }),
      on: {
        // Focus stays in the field, so the caret, the selection and the
        // on-screen keyboard stay where they are.
        mousedown: (event) => {
          if (event.button === 0) {
            event.preventDefault();
          }
        },
        keydown: (event, { el }) => buttonKeydown(event, el),
        keyup: (event, { el }) => buttonKeyup(event, el)
      },
      press: ({ api }, event) => api.internal.togglePress(event),
      bind: (el, { store }) => {
        store.set({ toggleElement: buttonElement(el) });
      }
    })
  }),
  agent: {
    actions: ["setValue", "clear", "setVisible", "toggleVisible"],
    secret: true
  }
});
var passwordInput = passwordInputPrimitive;
export {
  createPasswordInputController,
  passwordInput
};
