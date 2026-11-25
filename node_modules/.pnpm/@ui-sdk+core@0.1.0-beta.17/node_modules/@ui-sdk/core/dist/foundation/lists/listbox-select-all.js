// src/foundation/lists/listbox-select-all.ts
import { pressKeepsFocus } from "../focus/press-keeps-focus.js";
import { textOf } from "../text/typeahead.js";
import "./listbox.js";
import { optionId, SELECT_ALL } from "./listbox-keys.js";
import { checkedAttrs } from "../kernel/attrs.js";
import "./listbox-value.js";
import { live } from "../kernel/live.js";
var groupOf = (key) => key === SELECT_ALL ? void 0 : key.slice(SELECT_ALL.length + 1);
function coverage({ listbox, selection, limit }, key) {
  const keys = listbox.selectable(groupOf(key));
  let selected = 0;
  for (const item of keys) {
    if (selection.isSelected(item)) {
      selected++;
    }
  }
  const max = limit?.();
  const fits = max === void 0 || selection.keys().length + keys.length - selected <= max;
  return { keys, selected, fits };
}
function selectAllState(api, key, highlighted) {
  const { keys, selected, fits } = coverage(api.internal, key);
  const checked = keys.length > 0 && selected === keys.length;
  return {
    checked,
    indeterminate: selected > 0 && !checked,
    highlighted: highlighted === key,
    disabled: !keys.length || !checked && !fits
  };
}
function toggledAll(api, key) {
  const { listbox, selection } = api.internal;
  const { keys, selected, fits } = coverage(api.internal, key);
  if (!keys.length) {
    return void 0;
  }
  if (selected === keys.length) {
    const removed = new Set(keys);
    return selection.values().filter((value) => !removed.has(selection.keysOf([value])[0]));
  }
  if (!fits) {
    return void 0;
  }
  const added = keys.filter((item) => !selection.isSelected(item));
  for (const item of added) {
    const entry = listbox.find(item);
    if (entry) {
      listbox.remember(item, entry.label, entry.value);
    }
  }
  return [...selection.values(), ...added.map((item) => listbox.valueOf(item))];
}
function selectAllFeature({ focus }) {
  return {
    slots: { "select-all": selectAllPart({ focus }) },
    extend(api) {
      api.internal.hooks.choose = (key, event) => {
        const value = toggledAll(api, key);
        if (value) {
          api.internal.changeValue(value, { reason: "item-press", event });
        }
      };
    }
  };
}
function selectAllPart({ focus }) {
  return {
    present: (state) => state.multiple,
    state: (state, { api, key }) => selectAllState(api, key, state.highlighted),
    role: "option",
    focus,
    attrs: (state, { id, api, key }) => {
      const { checked, indeterminate, disabled } = selectAllState(
        api,
        key,
        state.highlighted
      );
      return {
        id: optionId(id, key),
        tabindex: focus === "roving" || state.focusInList ? "-1" : void 0,
        "aria-selected": String(checked),
        "aria-checked": checked ? "true" : indeterminate ? "mixed" : "false",
        "aria-disabled": disabled ? "true" : void 0,
        "data-disabled": disabled ? "" : void 0,
        ...checkedAttrs(indeterminate ? "indeterminate" : checked)
      };
    },
    live: live((state, { key }) => ({
      "data-highlighted": state.highlighted === key ? "" : void 0
    })),
    on: {
      ...pressKeepsFocus,
      pointermove: (event, { api, key }) => api.internal.hover(key, event)
    },
    press: ({ api, key }, event) => api.internal.choose(key, event),
    bind: (el, { api, key }) => api.internal.listbox.register(key, el, () => ({
      value: key,
      label: textOf(el),
      pinned: true
    }))
  };
}
export {
  selectAllFeature
};
