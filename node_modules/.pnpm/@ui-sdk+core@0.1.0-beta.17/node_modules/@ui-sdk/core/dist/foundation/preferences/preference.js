// src/foundation/preferences/preference.ts
import {
  createDetails
} from "../kernel/details.js";
import { changeSource } from "../kernel/input-source.js";
import { literal, readSaved } from "../storage/storage.js";
var checkAttribute = (attribute) => {
  if (!/^data-[a-z0-9-]+$/.test(attribute)) {
    throw new Error(
      `A preference only shows itself on data-* attributes, not "${attribute}".`
    );
  }
};
function followIn(source, store, key) {
  const write = () => {
    const next = source.get();
    if (store.get()[key] !== next) {
      store.set({ [key]: next });
    }
  };
  let stopped = false;
  let unsubscribe;
  queueMicrotask(() => {
    if (stopped) {
      return;
    }
    unsubscribe = source.subscribe(write);
    write();
  });
  return () => {
    stopped = true;
    unsubscribe?.();
  };
}
function createPreference(options) {
  checkAttribute(options.attribute);
  const { storage, values } = options;
  const isValue = (value2) => value2 != null && values.includes(value2);
  if (!isValue(options.defaultValue)) {
    throw new Error(
      `"${options.defaultValue}" isn't one of the preference's values.`
    );
  }
  let synced = storage?.readsOnServer ? storage.get() : void 0;
  const startValue = isValue(synced) ? synced : options.defaultValue;
  let value = startValue;
  const initialState = { value: startValue };
  let state = initialState;
  const listeners = /* @__PURE__ */ new Set();
  let peeked;
  let changed = false;
  const shown = () => {
    if (synced !== void 0 || changed || !storage || storage.readsOnServer) {
      return value;
    }
    peeked ??= storage.get();
    return isValue(peeked) ? peeked : value;
  };
  const get = () => {
    const current = shown();
    if (state.value !== current) {
      state = { value: current };
    }
    return state;
  };
  const set = (next, change = {}) => {
    if (next === shown() || !isValue(next)) {
      return false;
    }
    const reason = change.reason ?? "imperative";
    const details = createDetails(
      { reason, event: change.event },
      changeSource(reason, change.event)
    );
    options.onValueChange?.(next, details);
    if (details.canceled) {
      return false;
    }
    value = next;
    changed = true;
    if (reason !== "restore" && reason !== "storage-sync" && storage?.set(next)) {
      synced = next;
    }
    const current = get();
    for (const listener of [...listeners]) {
      listener(current);
    }
    return true;
  };
  let unwatch;
  const subscribe = (listener) => {
    const entry = (state2) => listener(state2);
    listeners.add(entry);
    if (listeners.size === 1 && storage) {
      const current = storage.get();
      if (current !== synced) {
        const first = synced === void 0;
        synced = current;
        if (isValue(current)) {
          set(current, { reason: "restore" });
        } else if (!first) {
          set(options.defaultValue, { reason: "restore" });
        }
      }
      unwatch = storage.subscribe((next) => {
        synced = next;
        set(isValue(next) ? next : options.defaultValue, {
          reason: "storage-sync"
        });
      });
    }
    return () => {
      if (!listeners.delete(entry) || listeners.size > 0) {
        return;
      }
      unwatch?.();
      unwatch = void 0;
    };
  };
  return {
    /** The attribute that shows the value. */
    attribute: options.attribute,
    /** Whether the attribute goes on `<html>`. */
    global: options.global ?? false,
    /** Every value people can choose. */
    values,
    /** The value when nothing allowed is saved. */
    defaultValue: options.defaultValue,
    /** Where the value is kept between visits. */
    storage,
    /** What the server and the first client render show: `defaultValue`, or the value a cookie keeps. */
    initialState,
    /**
     * The current state, the same object until the value changes. In the
     * browser it's the saved value even before anything subscribes, for a
     * render in the browser only. Hydrate from `initialState`.
     */
    get,
    /**
     * Changes the value, through `onValueChange`, which can cancel it, and
     * saves it. The reason defaults to `"imperative"`. Returns whether it changed.
     */
    set,
    /** Hears every change. The first subscriber reads back the saved value. Returns the function that stops it. */
    subscribe,
    /**
     * Keeps `key` in a store set to the preference's state. Call it from a
     * part's `bind`: the state starts at `initialState`, catches up a
     * microtask later, once hydration is done, and follows every change after
     * that. Returns the cleanup for `bind`.
     */
    follow: (store, key) => followIn({ get, subscribe }, store, key)
  };
}
function preferencesScript(preferences) {
  const list = preferences.map((preference) => {
    checkAttribute(preference.attribute);
    const { storage } = preference;
    return [
      storage?.kind ?? null,
      storage?.id ?? null,
      preference.attribute,
      preference.global,
      preference.values,
      preference.defaultValue
    ];
  });
  return `(function(r,p){var t=document.currentScript,e=t&&t.parentElement;for(var j=0;j<p.length;j++){try{var x=p[j],s=x[0]?r(x[0],x[1]):null;if(x[4].indexOf(s)<0)s=x[5];var o=x[3]?document.documentElement:e;if(o)o.setAttribute(x[2],s)}catch(n){}}})(${readSaved},${literal(list)})`;
}
export {
  createPreference,
  followIn,
  preferencesScript
};
