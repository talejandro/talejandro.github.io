// src/foundation/lists/listbox-behavior.ts
import { createFilteredListbox } from "./listbox.js";
import {
  itemKey
} from "./listbox-engine.js";
import { listStep } from "./listbox-keyboard.js";
import { optionId } from "./listbox-keys.js";
import { isApple } from "../platform/platform.js";
import { isTypeaheadKey } from "../text/typeahead.js";
function createListbox(context, options) {
  const { id, store } = context;
  const { key: stateKey } = options;
  const focus = options.focus ?? "real";
  const highlighted = (state = store.get()) => state[stateKey];
  let list;
  let placed;
  let queued = false;
  const metaOf = ({ key, props }) => ({
    value: props.value ?? key,
    label: props.label,
    keywords: props.keywords,
    disabled: props.disabled
  });
  const engine = createFilteredListbox({
    store: {
      get: () => ({ highlighted: highlighted() }),
      set: (patch) => store.set({ [stateKey]: patch.highlighted })
    },
    focus,
    items: () => options.items?.(),
    toKey: itemKey,
    filter: () => options.filter?.() ?? "contains",
    query: () => options.query?.() ?? "",
    rank: () => typeof options.filter?.() === "function",
    loop: () => options.loop?.() ?? true,
    skipDisabled: true,
    active: () => true,
    container: () => list?.isConnected ? list : void 0,
    scrollRoot: () => void 0,
    onHighlight: (key, index, event) => options.onHighlight?.(key, { index, event }),
    onLastReached: options.onEnd,
    onRegister() {
      if (!placed || queued) {
        return;
      }
      queued = true;
      queueMicrotask(() => {
        queued = false;
        if (placed) {
          place(placed);
        }
      });
    }
  });
  const noItems = [];
  function place(step, event) {
    const key = engine.stepKey(step) ?? null;
    if (key !== highlighted()) {
      engine.highlight(key, { event });
    }
  }
  return {
    /** Joins a bound option. Call it from the option slot's `bind` and return its cleanup. */
    bind(el, part) {
      if (!list?.isConnected) {
        list = el.closest('[role="listbox"]') ?? void 0;
      }
      const unregister = engine.register(part.key, el, () => metaOf(part));
      if (focus === "virtual") {
        return unregister;
      }
      const focused = () => {
        if (highlighted() !== part.key) {
          placed = void 0;
          engine.highlight(part.key, { focus: false });
        }
      };
      el.addEventListener("focus", focused);
      return () => {
        el.removeEventListener("focus", focused);
        unregister();
      };
    },
    /** An option's attributes: its `id`, `data-highlighted` and `aria-disabled`, with `tabindex` for real focus. */
    attrs: (state, part) => ({
      id: optionId(id, part.key),
      tabindex: focus === "real" ? "-1" : void 0,
      "data-highlighted": highlighted(state) === part.key ? "" : void 0,
      "aria-disabled": part.props.disabled ? "true" : void 0
    }),
    /** The id of the highlighted option, for `aria-activedescendant` with virtual focus. */
    activeId(state) {
      const key = highlighted(state);
      return key === null ? void 0 : optionId(id, key);
    },
    /**
     * Moves the highlight for the arrows, PageUp and PageDown, and with real
     * focus also Home, End and typing an option's name. Returns the key it
     * moved to, or undefined for a key it leaves alone, like Enter.
     */
    keydown(event) {
      const current = highlighted();
      let to;
      if (focus === "real" && (event.key === "Home" || event.key === "End")) {
        to = engine.stepKey(event.key === "Home" ? "first" : "last");
      } else if (focus === "real" && isTypeaheadKey(event) && (event.key !== " " || engine.typing())) {
        to = engine.search(event.key, current)?.key;
        if (to === void 0) {
          return;
        }
      } else {
        const step = listStep(event, { apple: isApple() });
        if (step === void 0) {
          return;
        }
        to = engine.stepKey(step);
      }
      event.preventDefault();
      placed = void 0;
      engine.highlight(to ?? null, { event });
      return to;
    },
    /** Highlights an option, or none with `null`. */
    highlight(key, { event } = {}) {
      placed = void 0;
      engine.highlight(key, { event });
    },
    /**
     * Moves the highlight by a step, or to the first or last option, and to
     * none when no option matches. The first or last stays there as options
     * mount, like after the query changed.
     */
    move(step, event) {
      placed = typeof step === "string" ? step : void 0;
      place(step, event);
    },
    /** The data to render now: `items` filtered by `query`. Empty without `items`. */
    items: () => engine.visibleData()?.list ?? noItems,
    /** Whether a bound option matches `query`. Options from `items` always do, since `items()` already left the others out. */
    shows: (part) => engine.matches(part.key, metaOf(part)),
    /** How many options match `query`. */
    count: () => engine.count()
  };
}
export {
  createListbox
};
