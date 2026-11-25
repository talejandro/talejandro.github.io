// src/foundation/lists/listbox-value.ts
import "./listbox.js";
import { deriveFromOptions } from "../kernel/derive.js";
import { sameValue } from "../kernel/store.js";
var listFormats = /* @__PURE__ */ new Map();
function formatLabels(labels, {
  maxLabels,
  getMoreLabel
} = {}, locale = "en-US") {
  if (maxLabels === void 0) {
    return labels.join(", ");
  }
  const shown = labels.length > maxLabels ? [
    ...labels.slice(0, maxLabels),
    (getMoreLabel ?? ((count) => `${count} more`))(
      labels.length - maxLabels
    )
  ] : labels;
  if (typeof Intl.ListFormat !== "function") {
    return shown.join(", ");
  }
  const joined = getMoreLabel ? locale : "en-US";
  let format = listFormats.get(joined);
  if (!format) {
    listFormats.set(
      joined,
      format = new Intl.ListFormat(joined, { type: "conjunction" })
    );
  }
  return format.format(shown);
}
function listOf(value) {
  return Array.isArray(value) ? value : value === null || value === void 0 ? [] : [value];
}
var holds = (memo, value) => Array.isArray(value) ? sameValue(memo.values, value) : memo.value === value;
function createValueSelection(config) {
  const { store, options, listbox, toKey, onDestroy } = config;
  let keysMemo;
  let labelsQueued = false;
  let learned = false;
  let lastLabels = [];
  let restoring;
  let stopWaiting;
  let filling = false;
  onDestroy(stopRestoring);
  deriveFromOptions(
    { store },
    ["value", "initial"],
    (synced, state, next) => {
      if (synced.multiple === void 0 || synced.multiple === state.multiple) {
        return;
      }
      const shaped = (value) => synced.multiple ? listOf(value) : Array.isArray(value) ? value[0] ?? null : value;
      return {
        initial: shaped(state.initial),
        ...next.value === void 0 && { value: shaped(state.value) }
      };
    }
  );
  function memoFor(value) {
    const given = options();
    const { itemToValue } = given;
    const waiting = restoring?.value === value ? restoring : void 0;
    const memo = keysMemo?.restoring === waiting ? keysMemo : void 0;
    if (memo && memo.value === value && memo.options === given) {
      return memo;
    }
    if (memo && memo.itemToValue === itemToValue && holds(memo, value)) {
      memo.value = value;
      memo.options = given;
      return memo;
    }
    const values2 = [...listOf(value)];
    const keys2 = values2.map(
      (item, index) => waiting?.keys.get(index) ?? toKey(item)
    );
    return keysMemo = {
      value,
      options: given,
      itemToValue,
      values: values2,
      keys: keys2,
      set: new Set(keys2),
      restoring: waiting
    };
  }
  function stopRestoring() {
    stopWaiting?.();
    stopWaiting = restoring = void 0;
  }
  function fillArrived() {
    const current = restoring;
    if (!current) {
      return;
    }
    if (store.get().value !== current.value) {
      return stopRestoring();
    }
    const values2 = [...listOf(current.value)];
    const keys2 = new Map(current.keys);
    for (const [index, key] of current.keys) {
      const value2 = listbox.valueOf(key);
      if (value2 === void 0) {
        continue;
      }
      values2[index] = value2;
      keys2.delete(index);
    }
    if (keys2.size === current.keys.size) {
      return;
    }
    const value = Array.isArray(current.value) ? values2 : values2[0];
    if (keys2.size) {
      restoring = { value, keys: keys2 };
    } else {
      stopRestoring();
    }
    filling = true;
    try {
      store.set({ value });
    } finally {
      filling = false;
    }
  }
  const values = () => memoFor(store.get().value).values;
  const keys = () => memoFor(store.get().value).keys;
  function isSelected(key, itemValue) {
    const equal = options().isItemEqualToValue;
    if (equal && itemValue !== void 0) {
      return values().some((value) => equal(itemValue, value));
    }
    return memoFor(store.get().value).set.has(key);
  }
  function labelOf(value) {
    const itemToLabel = options().itemToLabel;
    if (itemToLabel) {
      return itemToLabel(value);
    }
    const label = listbox.labelOf(toKey(value));
    if (label !== void 0) {
      return label;
    }
    return typeof value === "string" ? value : toKey(value);
  }
  function queueLabels() {
    if (labelsQueued) {
      return;
    }
    labelsQueued = true;
    queueMicrotask(() => {
      labelsQueued = false;
      store.set({ labels: listbox.labelsVersion() });
    });
  }
  const unlabeled = () => keys().filter((key) => listbox.labelOf(key) === void 0);
  return {
    values,
    keys,
    // The keys of a value, for attributes that render from a state snapshot.
    keysOf: (value) => memoFor(value).keys,
    isSelected,
    labelOf,
    // Each value's label, the same list while nothing changed, so a part that reads it doesn't re-render.
    labels() {
      const next = values().map(labelOf);
      if (next.length !== lastLabels.length || next.some((label, index) => label !== lastLabels[index])) {
        lastLabels = next;
      }
      return lastLabels;
    },
    queueLabels,
    // Learns the labels of values whose items aren't mounted, like on the
    // server or in a closed list, from the items among an adapter's children,
    // so a label that changes while closed still shows.
    learn(find) {
      if (options().itemToLabel) {
        return false;
      }
      const unmounted = new Set(keys().filter((key) => !listbox.element(key)));
      if (!unmounted.size) {
        return false;
      }
      const version = listbox.labelsVersion();
      for (const { value, label } of find(unmounted)) {
        listbox.remember(toKey(value), label, value);
      }
      const changed = listbox.labelsVersion() !== version;
      if (changed && learned) {
        queueLabels();
      }
      learned = true;
      return changed;
    },
    // Whether a closed list must mount its items hidden for the value: for a
    // label only its item knows, or for a value icon in the page, which copies
    // its item's icon. Not for a label the root found among its children.
    needsItems: (hasValueIcon) => unlabeled().length > 0 || hasValueIcon && keys().length > 0,
    // The value with an item added, or removed when it's there, for `multiple`.
    toggled(key, itemValue) {
      if (!isSelected(key, itemValue)) {
        return [...values(), itemValue];
      }
      return values().filter((value) => toKey(value) !== key);
    },
    // The value without one item's key, for removing a chip.
    without: (key) => values().filter((value) => toKey(value) !== key),
    // What selecting nothing is: `null`, or an empty list with `multiple`.
    empty: () => store.get().multiple ? [] : null,
    // Sets the value a browser restored, from the keys it saved, through
    // `write`. Keys whose items haven't arrived hold their place until they
    // do, unless something sets the value first.
    restore(saved, write) {
      stopRestoring();
      let keys2 = [];
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          keys2 = parsed;
        }
      } catch {
      }
      const { multiple } = store.get();
      if (!multiple) {
        keys2 = keys2.slice(0, 1);
      }
      const waiting = /* @__PURE__ */ new Map();
      const found = keys2.map((key, index) => {
        const value2 = listbox.valueOf(key);
        if (value2 === void 0) {
          waiting.set(index, key);
        }
        return value2 ?? key;
      });
      const value = multiple ? found : found[0] ?? null;
      if (!waiting.size) {
        return write(value);
      }
      const request = { value, keys: waiting };
      restoring = request;
      write(value);
      if (restoring !== request) {
        return;
      }
      const held = store.get().value;
      if (!sameValue(held, value)) {
        return stopRestoring();
      }
      restoring = { value: held, keys: waiting };
      stopWaiting = store.subscribe(fillArrived);
    },
    stopRestoring,
    // Whether the value changing now is a restore's late items taking their slots.
    isFilling: () => filling
  };
}
export {
  createValueSelection,
  formatLabels,
  listOf
};
