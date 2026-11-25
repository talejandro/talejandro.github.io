// src/foundation/preferences/pointer-kind.ts
import { isBrowser } from "../platform/env.js";
import { followIn } from "./preference.js";
var features = {
  pointerFine: "(pointer: fine)",
  pointerCoarse: "(pointer: coarse)",
  pointerNone: "(pointer: none)",
  hover: "(hover: hover)",
  hoverNone: "(hover: none)",
  anyFine: "(any-pointer: fine)",
  anyCoarse: "(any-pointer: coarse)",
  anyNone: "(any-pointer: none)",
  anyHover: "(any-hover: hover)",
  anyHoverNone: "(any-hover: none)"
};
var sharedByView = /* @__PURE__ */ new WeakMap();
function sharedOf(view) {
  if (!view || typeof view.matchMedia !== "function") {
    return;
  }
  let shared = sharedByView.get(view);
  if (shared) {
    return shared;
  }
  const queries = Object.fromEntries(
    Object.entries(features).map(([name, query]) => [
      name,
      view.matchMedia(query)
    ])
  );
  const listeners = /* @__PURE__ */ new Set();
  shared = {
    queries,
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
var precision = (fine, coarse, none) => fine.matches ? "fine" : coarse.matches ? "coarse" : none.matches ? "none" : "unknown";
var hovering = (hover, none) => hover.matches ? "hover" : none.matches ? "none" : "unknown";
var read = ({ queries: q }) => {
  const state = {
    pointer: precision(q.pointerFine, q.pointerCoarse, q.pointerNone),
    hover: hovering(q.hover, q.hoverNone),
    anyPointer: precision(q.anyFine, q.anyCoarse, q.anyNone),
    anyHover: hovering(q.anyHover, q.anyHoverNone)
  };
  return state;
};
var same = (a, b) => a.pointer === b.pointer && a.hover === b.hover && a.anyPointer === b.anyPointer && a.anyHover === b.anyHover;
function createPointerKind(options = {}) {
  const initialState = {
    pointer: "unknown",
    hover: "unknown",
    anyPointer: "unknown",
    anyHover: "unknown",
    ...options.initial
  };
  const shared = () => sharedOf(options.view ?? (isBrowser ? window : void 0));
  let state = initialState;
  const get = () => {
    const current = shared();
    if (!current) {
      return state;
    }
    const next = read(current);
    if (!same(state, next)) {
      state = next;
    }
    return state;
  };
  const listeners = /* @__PURE__ */ new Set();
  const notify = () => {
    const next = get();
    for (const listener of [...listeners]) {
      listener(next);
    }
  };
  const subscribe = (listener) => {
    const entry = (state2) => listener(state2);
    listeners.add(entry);
    const current = shared();
    if (listeners.size === 1 && current) {
      if (current.listeners.size === 0) {
        for (const query of Object.values(current.queries)) {
          query.addEventListener("change", current.notify);
        }
      }
      current.listeners.add(notify);
    }
    return () => {
      if (!listeners.delete(entry) || listeners.size > 0) {
        return;
      }
      if (!current?.listeners.delete(notify) || current.listeners.size > 0) {
        return;
      }
      for (const query of Object.values(current.queries)) {
        query.removeEventListener("change", current.notify);
      }
    };
  };
  return {
    /** What the server and the first client render show: `initial`, and `"unknown"` for the rest. */
    initialState,
    /** What the pointer kind knows now. The same object until something changes. */
    get,
    /** Hears every change, like a mouse plugged into a tablet. Returns the function that stops it. */
    subscribe,
    /**
     * Keeps `key` in a store set to the pointer kind's state. Call it from a
     * part's `bind`: the state starts at `initialState`, catches up a
     * microtask later, once hydration is done, and follows every change after
     * that. Returns the cleanup for `bind`.
     */
    follow: (store, key) => followIn({ get, subscribe }, store, key)
  };
}
function pointerKindOf(mobileHint) {
  const hint = mobileHint?.trim();
  const guess = hint === "?1" ? { pointer: "coarse", hover: "none" } : hint === "?0" ? { pointer: "fine", hover: "hover" } : {};
  return guess;
}
export {
  createPointerKind,
  pointerKindOf
};
