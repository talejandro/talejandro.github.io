// src/foundation/lists/async-options.ts
function createAsyncOptions(load, {
  debounce = 200,
  query = "",
  immediate = false,
  minLength = 0
} = {}) {
  let state = {
    query,
    items: [],
    status: "idle",
    error: void 0,
    hasMore: false
  };
  const listeners = /* @__PURE__ */ new Set();
  let timer;
  let controller;
  let page = 0;
  function set(patch) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  }
  function cancel() {
    clearTimeout(timer);
    timer = void 0;
    controller?.abort();
    controller = void 0;
  }
  const tooShort = (text) => text.trim().length < minLength;
  function clear(text) {
    cancel();
    set({
      query: text,
      items: [],
      status: "idle",
      error: void 0,
      hasMore: false
    });
  }
  function run(next) {
    if (tooShort(state.query)) {
      clear(state.query);
      return;
    }
    controller?.abort();
    const current = new AbortController();
    controller = current;
    page = next;
    set({ status: "loading", error: void 0 });
    load(state.query, { signal: current.signal, page: next }).then(
      (result) => {
        if (current.signal.aborted) {
          return;
        }
        controller = void 0;
        const items = Array.isArray(result) ? result : result?.items ?? [];
        const hasMore = !Array.isArray(result) && !!result?.hasMore;
        set({
          items: next === 0 ? items : [...state.items, ...items],
          status: "idle",
          hasMore
        });
      },
      (error) => {
        if (current.signal.aborted) {
          return;
        }
        controller = void 0;
        set({ status: "error", error });
      }
    );
  }
  if (immediate) {
    run(0);
  }
  return {
    /** The current items, text and status. */
    getState: () => state,
    /** Runs `listener` after every change. Returns an unsubscribe. */
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Loads for new text once typing pauses, replacing any load still running. */
    setQuery(next) {
      if (next === state.query && (state.status === "loading" || timer !== void 0)) {
        return;
      }
      if (tooShort(next)) {
        clear(next);
        return;
      }
      cancel();
      set({ query: next, status: "loading", error: void 0 });
      timer = setTimeout(() => {
        timer = void 0;
        run(0);
      }, debounce);
    },
    /** Loads the current text again, now. */
    reload() {
      cancel();
      run(0);
    },
    /** Loads the next page and appends it, when `load` said there's more. */
    loadMore() {
      if (state.status === "loading" || !state.hasMore) {
        return;
      }
      run(page + 1);
    },
    /** Stops any pending or running load. */
    cancel() {
      cancel();
      if (state.status === "loading") {
        set({ status: "idle" });
      }
    }
  };
}
export {
  createAsyncOptions
};
