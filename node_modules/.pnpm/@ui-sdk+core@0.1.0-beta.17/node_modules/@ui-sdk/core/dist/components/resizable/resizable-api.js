// src/components/resizable/resizable-api.ts
import { isRTL } from "../../foundation/platform/env.js";
import { deriveState } from "../../foundation/kernel/derive.js";
import { resizableDom } from "./resizable-dom.js";
import {
  allHandleBounds,
  carryLayout,
  constraintsOf,
  endDelta,
  fitLayout,
  homeDelta,
  initialLayout,
  isAbsolute,
  isCollapsed,
  keyDelta,
  resizeAt,
  resizePanel,
  sameLayout,
  sameSize,
  toggleTarget,
  toPercent
} from "./resizable-layout.js";
import { loadLayout, saveLayout } from "./resizable-storage.js";
import { orientationOf } from "../../foundation/focus/collection.js";
import {
  createChange,
  createCommit
} from "../../foundation/kernel/input-source.js";
function settings(options) {
  return {
    orientation: orientationOf(options.orientation, "horizontal"),
    disabled: !!options.disabled,
    step: options.step ?? 1,
    largeStep: options.largeStep ?? 10
  };
}
var sameRecord = (a, b) => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
};
var sameConstraints = (a, b) => a.length === b.length && a.every((panel, index) => {
  const other = b[index];
  return sameSize(panel.min, other.min) && sameSize(panel.max, other.max) && sameSize(panel.collapsed, other.collapsed) && panel.collapsible === other.collapsible && panel.initial === other.initial;
});
var remSize = () => typeof document === "undefined" ? 16 : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
function shownValues(state, locked) {
  const { layout, ids, constraints, handles } = state;
  const sizes = {};
  const handleValues = {};
  ids.forEach((id, index) => sizes[id] = layout[index]);
  const bounds = layout.length === constraints.length ? allHandleBounds(layout, constraints, locked) : [];
  for (const [key, index] of Object.entries(handles)) {
    const range = bounds[index];
    if (!range) {
      continue;
    }
    const before = state.handleValues[key];
    const value = {
      panel: ids[index],
      now: layout[index],
      ...range,
      disabled: !!locked[index]
    };
    handleValues[key] = before && sameHandleValue(before, value) ? before : value;
  }
  return { sizes, handleValues };
}
var shownKeys = [
  "layout",
  "ids",
  "constraints",
  "handles",
  "hovering",
  "dragging"
];
var sameHandleValue = (a, b) => a.panel === b.panel && sameSize(a.now, b.now) && sameSize(a.min, b.min) && sameSize(a.max, b.max) && a.disabled === b.disabled;
function resizableApiBody(context) {
  const { store, options } = context;
  const change = createChange(context);
  const commit = createCommit(context);
  let space = 0;
  let sizes = [];
  let drag;
  let keys;
  const expanded = /* @__PURE__ */ new Map();
  let requested;
  const dom = resizableDom(context, () => api.internal);
  const refresh = dom.refresh;
  const current = () => requested ?? store.get().layout;
  const isDisabled = () => store.get().disabled || store.get().formDisabled;
  const handleDisabled = (key) => isDisabled() || !!context.props("handle", key)?.disabled;
  function locked() {
    const result = [];
    for (const [key, index] of Object.entries(store.get().handles)) {
      if (context.props("handle", key)?.disabled) {
        result[index] = true;
      }
    }
    return result;
  }
  const vertical = () => store.get().orientation === "vertical";
  const indexOf = (panel) => typeof panel === "number" ? panel : store.get().ids.indexOf(panel);
  function remember(previous, next) {
    const { ids, constraints } = store.get();
    next.forEach((size, index) => {
      const panel = constraints[index];
      if (!panel || !isCollapsed(panel, size) || isCollapsed(panel, previous[index])) {
        return;
      }
      const before = drag && !isCollapsed(panel, drag.base[index]) ? drag.base[index] : previous[index];
      expanded.set(ids[index], before);
    });
  }
  function request(next, reason, event) {
    const previous = current();
    if (sameLayout(next, previous)) {
      return false;
    }
    stopWaiting?.();
    const before = requested;
    requested = next;
    if (!change("layout", next, { reason, event })) {
      requested = before;
      return false;
    }
    remember(previous, next);
    return true;
  }
  function complete(start, reason, event) {
    const layout = current();
    const asked = requested;
    requested = void 0;
    if (options().layout === void 0) {
      return finish(start, layout, reason, event);
    }
    const applied2 = store.get().layout;
    if (!asked || sameLayout(applied2, asked)) {
      return finish(start, applied2, reason, event);
    }
    waitForOwner(() => finish(start, store.get().layout, reason, event));
  }
  let stopWaiting;
  function waitForOwner(done) {
    stopWaiting?.();
    const before = store.get().layout;
    const answer = () => {
      stopWaiting?.();
      done();
    };
    const unsubscribe = store.subscribe(() => {
      if (store.get().layout !== before) {
        answer();
      }
    });
    const timer = setTimeout(answer, 100);
    stopWaiting = () => {
      unsubscribe();
      clearTimeout(timer);
      stopWaiting = void 0;
    };
  }
  function finish(start, layout, reason, event) {
    if (sameLayout(start, layout)) {
      return;
    }
    const { autoSaveId, storage } = options();
    if (autoSaveId !== void 0) {
      saveLayout(autoSaveId, store.get().ids, layout, storage);
    }
    commit("layout", layout.slice(), { reason, event });
  }
  function commitNow(next, reason, event) {
    const start = current();
    if (!request(next, reason, event)) {
      return false;
    }
    complete(start, reason, event);
    return true;
  }
  function startLayout(ids, constraints) {
    const { layout, defaultLayout, autoSaveId, storage } = options();
    const previous = store.get();
    if (layout?.length === ids.length) {
      return layout;
    }
    const saved = autoSaveId === void 0 ? void 0 : loadLayout(autoSaveId, ids, storage);
    if (saved) {
      return fitLayout(saved, constraints);
    }
    if (previous.ids.length) {
      return carryLayout(previous, ids, constraints);
    }
    if (defaultLayout?.length === ids.length) {
      return fitLayout(defaultLayout, constraints);
    }
    return initialLayout(constraints);
  }
  function setPanels(ids, panelSizes, measured = space) {
    sizes = panelSizes;
    if (measured > 0) {
      space = measured;
    }
    const rem = remSize();
    const constraints = panelSizes.map(
      (panel) => constraintsOf(panel, space, rem)
    );
    const state = store.get();
    const idsChanged = ids.length !== state.ids.length || ids.some((id, index) => id !== state.ids[index]);
    if (!idsChanged && sameConstraints(constraints, state.constraints)) {
      return;
    }
    if (!idsChanged) {
      store.set({ constraints });
      if (drag) {
        return;
      }
      request(fitLayout(current(), constraints), "resize");
      requested = void 0;
      return;
    }
    const layout = idsChanged ? startLayout(ids, constraints) : fitLayout(state.layout, constraints);
    requested = void 0;
    store.set({ ids, constraints, layout });
  }
  function setSpace(next) {
    if (sameSize(next, space) || next <= 0) {
      return;
    }
    space = next;
    if (!sizes.some(
      (panel) => isAbsolute(panel.minSize) || isAbsolute(panel.maxSize) || isAbsolute(panel.collapsedSize)
    )) {
      return;
    }
    const rem = remSize();
    const constraints = sizes.map((panel) => constraintsOf(panel, space, rem));
    store.set({ constraints });
    if (!drag) {
      request(fitLayout(current(), constraints), "resize");
    }
  }
  const handleIndex = (key) => {
    const index = store.get().handles[key];
    return index === void 0 || index < 0 || index >= store.get().ids.length - 1 ? null : index;
  };
  function collapsePanel(index, reason, event, handles = []) {
    const { constraints } = store.get();
    const layout = current();
    const panel = constraints[index];
    if (!panel?.collapsible || isCollapsed(panel, layout[index])) {
      return false;
    }
    const next = resizePanel(
      layout,
      constraints,
      index,
      panel.collapsed,
      1,
      handles
    );
    return isCollapsed(panel, next[index]) && commitNow(next, reason, event);
  }
  function expandPanel(index, reason, event, handles = []) {
    const { constraints, ids } = store.get();
    const layout = current();
    const panel = constraints[index];
    if (!panel || !isCollapsed(panel, layout[index])) {
      return false;
    }
    const target = Math.max(
      panel.min,
      expanded.get(ids[index]) ?? panel.initial ?? panel.min
    );
    const next = resizePanel(layout, constraints, index, target, 1, handles);
    return !isCollapsed(panel, next[index]) && commitNow(next, reason, event);
  }
  function toggle(handle, event) {
    const target = toggleTarget(store.get().constraints, handle);
    if (target === null) {
      return;
    }
    const panel = store.get().constraints[target];
    if (isCollapsed(panel, current()[target])) {
      expandPanel(target, "collapse", event, locked());
    } else {
      collapsePanel(target, "collapse", event, locked());
    }
  }
  deriveState(
    context,
    ["layout"],
    ({ controlledLayout, layout, ids }) => controlledLayout && controlledLayout.length === ids.length && !sameLayout(controlledLayout, layout) ? { layout: controlledLayout } : void 0
  );
  let applied;
  store.subscribe(() => {
    const { controlledLayout, layout } = store.get();
    if (!controlledLayout || layout !== controlledLayout || applied === controlledLayout) {
      return;
    }
    applied = controlledLayout;
    requested = void 0;
  });
  let shown;
  deriveState(context, ["sizes", "handleValues"], (state) => {
    const from = shown?.from;
    if (!from || !shownKeys.every((key) => state[key] === from[key])) {
      shown = { from: state, values: shownValues(state, locked()) };
    }
    return shown.values;
  });
  const api = {
    getLayout: () => current().slice(),
    setLayout(layout, { reason = "imperative", event } = {}) {
      refresh();
      const { constraints } = store.get();
      if (layout.length !== constraints.length) {
        return false;
      }
      return commitNow(fitLayout(layout, constraints), reason, event);
    },
    collapse: (panel, { reason = "imperative", event } = {}) => collapsePanel(indexOf(panel), reason, event),
    expand: (panel, { reason = "imperative", event } = {}) => expandPanel(indexOf(panel), reason, event),
    resize(panel, size, { reason = "imperative", event } = {}) {
      refresh();
      const index = indexOf(panel);
      const target = toPercent(size, space, remSize());
      if (index < 0 || index >= current().length || target === void 0) {
        return false;
      }
      return commitNow(
        resizePanel(current(), store.get().constraints, index, target),
        reason,
        event
      );
    },
    isCollapsed(panel) {
      const index = indexOf(panel);
      const constraints = store.get().constraints[index];
      return !!constraints && isCollapsed(constraints, current()[index]);
    },
    internal: {
      setPanels,
      setSpace,
      // Which panel each handle follows, by handle key, read from the document.
      setHandles(handles) {
        if (!sameRecord(handles, store.get().handles)) {
          store.set({ handles });
        }
      },
      // A handle's `disabled` prop changed, so what the handles show is
      // worked out again.
      relock: () => store.set({ handles: { ...store.get().handles } }),
      handleIndex,
      handleDisabled,
      vertical,
      // A drag from a pointer. Deltas are percent of the space panels share,
      // from where the drag started.
      startDrag(handle, key) {
        if (isDisabled() || drag) {
          return false;
        }
        refresh();
        const base = current().slice();
        drag = { handle, key, base };
        store.set({ dragging: key });
        return true;
      },
      dragBy(delta, event) {
        if (!drag) {
          return;
        }
        request(
          resizeAt(
            drag.base,
            store.get().constraints,
            drag.handle,
            delta,
            0.5,
            locked()
          ),
          "drag",
          event
        );
      },
      // `restore` puts back the layout from before the drag, like on Escape.
      endDrag(event, restore = false) {
        const ended = drag;
        if (!ended) {
          return;
        }
        drag = void 0;
        store.set({ dragging: null });
        request(
          fitLayout(restore ? ended.base : current(), store.get().constraints),
          "drag",
          event
        );
        complete(ended.base, "drag", event);
      },
      keydown(event, key, el) {
        const handle = handleIndex(key);
        if (handle === null || handleDisabled(key)) {
          return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          refresh();
          return toggle(handle, event);
        }
        const { constraints, step, largeStep } = store.get();
        const layout = current();
        const delta = event.key === "Home" ? homeDelta(layout, constraints, handle) : event.key === "End" ? endDelta(layout, constraints, handle) : keyDelta(event.key, {
          vertical: vertical(),
          rtl: isRTL(el),
          step,
          largeStep,
          shiftKey: event.shiftKey
        });
        if (delta === null) {
          return;
        }
        event.preventDefault();
        if (!keys) {
          refresh();
        }
        keys ??= { start: current().slice() };
        keys.event = event;
        request(
          resizeAt(
            current(),
            store.get().constraints,
            handle,
            delta,
            1,
            locked()
          ),
          "step-key",
          event
        );
      },
      // The key came up, or focus left while it was down, so its keyup goes
      // elsewhere and the last keydown stands for it.
      commitKeys(event) {
        if (!keys) {
          return;
        }
        const { start, event: last } = keys;
        keys = void 0;
        complete(start, "step-key", event ?? last);
      },
      // A double-click.
      toggle(key, event) {
        const handle = handleIndex(key);
        if (handle === null || handleDisabled(key)) {
          return;
        }
        refresh();
        toggle(handle, event);
      },
      // What a handle's separator says. The same object until it changes.
      handleValue: (key) => store.get().handleValues[key] ?? null,
      ...dom.bindings
    }
  };
  store.subscribe(() => {
    if (!drag || !isDisabled()) {
      return;
    }
    dom.stopAll();
    api.internal.endDrag();
  });
  context.onDestroy(() => {
    dom.stopAll();
    stopWaiting?.();
  });
  return api;
}
var resizableApi = resizableApiBody;
export {
  resizableApi,
  settings
};
