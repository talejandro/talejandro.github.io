// src/foundation/forms/form-internals.ts
import {
  claimInvalidFocus,
  focusWith,
  labelledBy,
  labelsOf,
  validityChanged
} from "./form.js";
var callbacksOf = /* @__PURE__ */ new WeakMap();
var customMessages = /* @__PURE__ */ new WeakMap();
function formCallback(el, type, ...args) {
  if (type === "customValidity") {
    customMessages.set(el, args[0]);
  }
  const callback = callbacksOf.get(el)?.[type];
  callback?.(...args);
  return !!callback;
}
function bindElementInternals(el, internals, options) {
  let reported = "";
  const sync = () => {
    const value = options.value();
    if (value instanceof FormData) {
      internals.setFormValue(value, options.state());
    } else if (Array.isArray(value)) {
      const data = new FormData();
      const name = options.name?.();
      if (name) {
        for (const item of value) {
          data.append(name, item);
        }
      }
      internals.setFormValue(data, options.state());
    } else {
      internals.setFormValue(value, options.state());
    }
    const missing = options.valueMissing();
    const custom = customMessages.get(el);
    const invalid = options.invalid?.();
    if (custom) {
      internals.setValidity(
        { customError: true },
        custom,
        options.anchor?.() ?? el
      );
    } else if (invalid) {
      internals.setValidity(
        invalid.flags,
        invalid.message,
        invalid.anchor ?? options.anchor?.() ?? el
      );
    } else if (missing) {
      internals.setValidity(
        { valueMissing: true },
        options.message(),
        options.anchor?.() ?? el
      );
    } else {
      internals.setValidity({});
    }
    if ((invalid?.message ?? "") === reported) {
      return;
    }
    reported = invalid?.message ?? "";
    validityChanged(el);
  };
  sync();
  const unsubscribe = options.subscribe(sync);
  const unfocus = options.focus ? focusWith(el, options.focus) : () => {
  };
  if (el.matches(":disabled")) {
    options.disabled(true);
  }
  callbacksOf.set(el, {
    reset: () => {
      options.reset();
      sync();
    },
    disabled: (disabled) => options.disabled(disabled),
    restore: (state) => {
      if (typeof state === "string") {
        options.restore(state);
      }
    },
    customValidity: sync
  });
  const unlabel = labelledBy(el, () => labelsOf(el));
  const onInvalid = () => {
    if (options.focus) {
      claimInvalidFocus(el, internals.form);
    }
  };
  el.addEventListener("invalid", onInvalid);
  return () => {
    el.removeEventListener("invalid", onInvalid);
    unsubscribe();
    unlabel();
    callbacksOf.delete(el);
    unfocus();
  };
}
export {
  bindElementInternals,
  formCallback
};
