// src/components/button/button.ts
import { isDisabled, watchFormDisabled } from "../../foundation/forms/form.js";
import {
  announcePending,
  runAction
} from "../../foundation/kernel/action.js";
import {
  buttonElement,
  buttonElementAttrs,
  buttonKeydown,
  buttonKeyup,
  buttonRole
} from "../../foundation/platform/button.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { log } from "../../foundation/kernel/change.js";
import { inputSource } from "../../foundation/kernel/input-source.js";
import { sameValue } from "../../foundation/kernel/store.js";
function buttonApiBody(context) {
  const { store, options } = context;
  const changeSource = inputSource();
  const write = (key, value, source) => {
    if (sameValue(store.get()[key], value)) {
      return;
    }
    store.set({ [key]: value });
    log(context, key, value, { reason: "action", source });
  };
  announcePending(context, () => store.get().pending);
  return {
    internal: {
      // A press runs the action, unless the button is disabled or still pending,
      // when the press is refused: preventing the click stops a second submit
      // and a disabled link from navigating. A returned Promise makes the
      // button pending until it settles. Adapters whose framework hands the
      // handler its own event, like React, pass `action` themselves.
      press(event, action = (details) => options().action?.(event, details)) {
        const state = store.get();
        if (isDisabled(state) || state.pending) {
          return event?.preventDefault();
        }
        const source = changeSource("action", event);
        write("error", void 0, source);
        runAction(action, source, {
          pending: (pending) => write("pending", pending, source),
          done: () => {
          },
          failed: (error) => write("error", error, source)
        });
      }
    }
  };
}
var buttonApi = buttonApiBody;
var buttonPrimitive = /* @__PURE__ */ definePrimitive({
  name: "button",
  options: {
    disabled: "boolean",
    focusableWhenDisabled: "boolean",
    type: "string",
    pendingAnnouncement: "string",
    // Internal: passed by renderers.
    action: "action"
  },
  state: (options) => ({
    disabled: !!options.disabled,
    formDisabled: false,
    focusableWhenDisabled: !!options.focusableWhenDisabled,
    type: options.type ?? "button",
    element: "unknown",
    pending: false,
    error: void 0
  }),
  sync: (options) => ({
    disabled: !!options.disabled,
    focusableWhenDisabled: !!options.focusableWhenDisabled,
    type: options.type ?? "button"
  }),
  api: (context) => buttonApi(context),
  slots: (slot) => ({
    root: slot({
      ...buttonRole((state) => state.element),
      focus: "tab-stop",
      state: (state) => ({
        disabled: isDisabled(state),
        pending: state.pending,
        error: state.error
      }),
      attrs: (state) => ({
        ...buttonElementAttrs(state.element, {
          type: state.type,
          disabled: isDisabled(state),
          focusable: state.focusableWhenDisabled
        }),
        // Presses do nothing while it's pending, so screen readers hear it's
        // unavailable. Not the native attribute, which would drop focus.
        ...state.pending && !isDisabled(state) && { "aria-disabled": "true" },
        "aria-busy": state.pending ? "true" : void 0,
        "data-disabled": isDisabled(state) ? "" : void 0,
        "data-pending": state.pending ? "" : void 0
      }),
      press: ({ api }, event) => api.internal.press(event),
      on: {
        keydown: (event, { el }) => buttonKeydown(event, el),
        keyup: (event, { el }) => buttonKeyup(event, el)
      },
      bind(el, { store }) {
        store.set({ element: buttonElement(el) });
        return watchFormDisabled(el, store);
      }
    })
  })
});
var button = buttonPrimitive;
export {
  button
};
