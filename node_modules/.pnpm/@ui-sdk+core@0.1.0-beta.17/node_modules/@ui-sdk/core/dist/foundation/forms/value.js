// src/foundation/forms/value.ts
var watchers = /* @__PURE__ */ new WeakMap();
function prototypeValue(el) {
  return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value");
}
function afterReset(event, run) {
  setTimeout(() => {
    if (!event.defaultPrevented) {
      run();
    }
  });
}
var scriptWrites = /* @__PURE__ */ new Set();
function writeFromScript(el, write) {
  if (scriptWrites.has(el)) {
    return write();
  }
  scriptWrites.add(el);
  try {
    write();
  } finally {
    scriptWrites.delete(el);
  }
}
function writingFromScript(el) {
  for (let node = el; node; node = node.parentElement) {
    if (scriptWrites.has(node)) {
      return true;
    }
  }
  return false;
}
function writeValue(el, value, options) {
  if (options?.asUser && !writingFromScript(el)) {
    prototypeValue(el).set.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  } else if (el.value !== value) {
    el.value = value;
  }
}
function notify(el, source) {
  watchers.get(el)?.forEach((listener) => listener(source));
}
function watchValue(el, listener) {
  let listeners = watchers.get(el);
  if (!listeners) {
    listeners = /* @__PURE__ */ new Set();
    watchers.set(el, listeners);
    intercept(el);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size) {
      return;
    }
    watchers.delete(el);
    release(el);
  };
}
var restores = /* @__PURE__ */ new WeakMap();
var wrapped = /* @__PURE__ */ new WeakMap();
function intercept(el) {
  let layer = wrapped.get(el);
  if (!layer || !Object.getOwnPropertyDescriptor(el, "value")) {
    const own = Object.getOwnPropertyDescriptor(el, "value");
    const base = own ?? prototypeValue(el);
    const wrapper2 = {
      configurable: true,
      enumerable: base.enumerable,
      get() {
        return base.get.call(el);
      },
      set(value) {
        base.set.call(el, value);
        notify(el, "write");
      }
    };
    Object.defineProperty(el, "value", wrapper2);
    layer = {
      wrapper: wrapper2,
      unwrap: () => {
        if (own) {
          Object.defineProperty(el, "value", own);
        } else {
          delete el.value;
        }
      }
    };
    wrapped.set(el, layer);
  }
  const { wrapper, unwrap } = layer;
  const onInput = () => notify(el, "input");
  const onReset = (event) => {
    if (event.target === el.form) {
      afterReset(event, () => notify(el, "reset"));
    }
  };
  el.addEventListener("input", onInput);
  el.ownerDocument.addEventListener("reset", onReset, true);
  restores.set(el, () => {
    el.removeEventListener("input", onInput);
    el.ownerDocument.removeEventListener("reset", onReset, true);
    if (Object.getOwnPropertyDescriptor(el, "value")?.set === wrapper.set) {
      unwrap();
      wrapped.delete(el);
    }
  });
}
function release(el) {
  restores.get(el)?.();
  restores.delete(el);
}
function keepsValueOnReset(value, defaultValue) {
  return value !== void 0 && defaultValue === void 0;
}
export {
  afterReset,
  keepsValueOnReset,
  watchValue,
  writeFromScript,
  writeValue,
  writingFromScript
};
