// src/foundation/preferences/color-scheme.ts
import { isBrowser } from "../platform/env.js";
import { createPreference, followIn } from "./preference.js";
var sharedByView = /* @__PURE__ */ new WeakMap();
function sharedOf(view) {
  if (!view || typeof view.matchMedia !== "function") {
    return;
  }
  let shared = sharedByView.get(view);
  if (shared) {
    return shared;
  }
  const query = view.matchMedia("(prefers-color-scheme: dark)");
  const listeners = /* @__PURE__ */ new Set();
  shared = {
    query,
    // A browser that doesn't know the feature reports the query as "not all".
    supported: query.media !== "not all",
    listeners,
    notify: () => {
      for (const listener of [...listeners]) {
        listener();
      }
    }
  };
  sharedByView.set(view, shared);
  return shared;
}
var resolve = (value, system) => value === "system" ? system : value;
function createColorScheme(options = {}) {
  const initial = options.initial ?? "unknown";
  const choice = createPreference({
    values: ["system", "light", "dark"],
    defaultValue: options.defaultValue ?? "system",
    attribute: "data-color-scheme",
    global: options.global,
    storage: options.storage,
    onValueChange: options.onValueChange
  });
  const shared = () => sharedOf(options.view ?? (isBrowser ? window : void 0));
  const listeners = /* @__PURE__ */ new Set();
  const systemNow = () => {
    const current = shared();
    const system = current?.supported ? current.query.matches ? "dark" : "light" : initial;
    return system;
  };
  const snapshot = (value, system) => {
    const next = {
      value,
      system,
      resolved: resolve(value, system)
    };
    return next;
  };
  const initialState = snapshot(choice.initialState.value, initial);
  let state = initialState;
  const get = () => {
    const value = choice.get().value;
    const system = systemNow();
    if (state.value !== value || state.system !== system) {
      state = snapshot(value, system);
    }
    return state;
  };
  const notify = () => {
    const next = get();
    for (const listener of [...listeners]) {
      listener(next);
    }
  };
  let lastSystem;
  const onSystem = () => {
    const system = systemNow();
    if (system === lastSystem) {
      return;
    }
    lastSystem = system;
    if (system !== "unknown") {
      options.onSystemValueChange?.(system);
    }
    notify();
  };
  let unwatchChoice;
  const subscribe = (listener) => {
    const entry = (state2) => listener(state2);
    listeners.add(entry);
    const current = shared();
    if (listeners.size === 1) {
      if (current?.supported) {
        lastSystem = systemNow();
        if (current.listeners.size === 0) {
          current.query.addEventListener("change", current.notify);
        }
        current.listeners.add(onSystem);
      }
      unwatchChoice = choice.subscribe(notify);
    }
    return () => {
      if (!listeners.delete(entry) || listeners.size > 0) {
        return;
      }
      unwatchChoice?.();
      unwatchChoice = void 0;
      if (!current?.listeners.delete(onSystem)) {
        return;
      }
      if (current.listeners.size === 0) {
        current.query.removeEventListener("change", current.notify);
      }
    };
  };
  return {
    /** The attribute `Preferences` shows the choice on. */
    attribute: choice.attribute,
    /** Whether `Preferences` puts `data-color-scheme` on `<html>`. */
    global: choice.global,
    /** The choices: `"system"`, `"light"` and `"dark"`. */
    values: choice.values,
    /** The choice when nothing allowed is saved. */
    defaultValue: choice.defaultValue,
    /** Where the choice is kept between visits. */
    storage: choice.storage,
    /** What the server and the first client render show: `defaultValue`, with `initial` as the browser's preference. */
    initialState,
    /** What the color scheme knows now. The same object until something changes. */
    get,
    /**
     * Changes the app's scheme, through `onValueChange`, which can cancel it.
     * The reason defaults to `"imperative"`. Returns whether it changed.
     */
    set: choice.set,
    /** Hears every change, to the app's scheme or the browser's preference. Returns the function that stops it. */
    subscribe,
    /**
     * Keeps `key` in a store set to the color scheme's state. Call it from a
     * part's `bind`: the state starts at `initialState`, catches up a
     * microtask later, once hydration is done, and follows every change after
     * that. Returns the cleanup for `bind`.
     */
    follow: (store, key) => followIn({ get, subscribe }, store, key)
  };
}
function colorSchemeOf(hint) {
  const value = hint?.trim().replace(/^"(.*)"$/, "$1");
  const system = value === "light" || value === "dark" ? value : "unknown";
  return system;
}
export {
  colorSchemeOf,
  createColorScheme
};
