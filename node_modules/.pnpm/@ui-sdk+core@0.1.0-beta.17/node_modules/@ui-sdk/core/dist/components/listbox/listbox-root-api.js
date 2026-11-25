// src/components/listbox/listbox-root-api.ts
import { createClaim } from "../../foundation/focus/roving-focus.js";
import { dispatchChange, formInternals } from "../../foundation/forms/form.js";
import { createItemIcons } from "../../foundation/lists/item-icon.js";
import {
  createListboxEngine,
  highlightable,
  highlightFromCode,
  itemKey,
  revealInList
} from "../../foundation/lists/listbox-engine.js";
import { isDisabled } from "../../foundation/lists/listbox-parts.js";
import { isSameKeys } from "../../foundation/selection/listbox-range.js";
import { createKeySelection } from "../../foundation/selection/selection-model.js";
import { createListboxKeyboard } from "./listbox-root-keyboard.js";
import { createValueSelection } from "../../foundation/lists/listbox-value.js";
import { orientationOf } from "../../foundation/focus/collection.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
function initialListboxStore(options) {
  const empty = () => options.multiple ? [] : null;
  return {
    value: options.value !== void 0 ? options.value : options.defaultValue ?? empty(),
    initial: options.defaultValue ?? empty(),
    highlighted: null,
    stop: null,
    labels: 0,
    icons: 0,
    formDisabled: false,
    groupLabels: [],
    ...syncListboxStore(options)
  };
}
function syncListboxStore(options) {
  return {
    multiple: !!options.multiple,
    // The APG's models: selection follows focus in a single list, and waits for Space with several.
    activation: options.activation ?? (options.multiple ? "manual" : "automatic"),
    deselectable: !!options.deselectable,
    orientation: orientationOf(options.orientation, "vertical"),
    keepInView: options.keepInView ?? true,
    virtualFocus: !!options.virtualFocus,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form,
    items: options.items,
    // Like a native select's default, changing it changes what a reset returns to.
    ...options.defaultValue === void 0 ? {} : { initial: options.defaultValue },
    ...options.value === void 0 ? {} : { value: options.value }
  };
}
var noFiltering = { data: (data) => data, matches: () => true };
function listboxApiBody(context) {
  const { id, store, options, element } = context;
  const change = createChange(context);
  const toKey = (value) => itemKey(value, options().itemToValue);
  const rootElement = () => element("root");
  let focusInside = false;
  let remembered = null;
  let requested = null;
  let checkQueued = false;
  let revealed = false;
  const listbox = createListboxEngine(
    {
      store,
      focus: () => store.get().virtualFocus ? "virtual" : "real",
      items: () => store.get().items,
      toKey,
      filter: () => void 0,
      query: () => "",
      loop: () => options().loop ?? true,
      skipDisabled: true,
      active: () => focusInside,
      container: rootElement,
      keepInView: () => store.get().keepInView,
      onHighlight: (key, index, event) => options().onHighlight?.(
        key === null ? null : listbox.valueOf(key) ?? null,
        { index, event }
      ),
      onRegister: () => queueCheck()
    },
    noFiltering
  );
  const selection = createValueSelection({
    store,
    options,
    listbox,
    toKey,
    onDestroy: context.onDestroy
  });
  const icons = createItemIcons(store);
  const order = () => listbox.entries().map((entry) => entry.key);
  const selectable = (key) => {
    const entry = listbox.find(key);
    return !!entry && !listbox.disabled(entry);
  };
  function stopKey() {
    const list = listbox.entries();
    if (remembered !== null && list.some((entry) => entry.key === remembered)) {
      return remembered;
    }
    const active = remembered === null ? null : rootElement()?.ownerDocument.activeElement;
    const held = active && list.find((entry) => element("item", entry.key) === active);
    if (held) {
      if (store.get().highlighted === remembered) {
        store.set({ highlighted: held.key });
      }
      return remembered = held.key;
    }
    const enabled = list.filter((entry) => !entry.disabled);
    const selected = enabled.find(
      (entry) => selection.isSelected(entry.key, entry.value)
    );
    return (selected ?? enabled[0] ?? list[0])?.key ?? null;
  }
  function check() {
    checkQueued = false;
    const stop = stopKey();
    if (stop !== store.get().stop) {
      store.set({ stop });
    }
    if (!revealed) {
      revealed = revealSelected(stop);
    }
  }
  function revealSelected(key) {
    const el = key === null ? void 0 : listbox.element(key);
    const root = rootElement();
    if (!el?.isConnected || !root) {
      return false;
    }
    if (selection.keys().length && store.get().keepInView) {
      revealInList(el, root);
    }
    return true;
  }
  function queueCheck() {
    if (checkQueued) {
      return;
    }
    checkQueued = true;
    queueMicrotask(check);
  }
  const formElement = () => {
    const root = rootElement();
    return formInternals(root) ? root : element("form-input");
  };
  function setValue(value, { reason, event }) {
    const state = store.get();
    if (reason !== "reset" && (isDisabled(state) || state.readOnly)) {
      return false;
    }
    selection.stopRestoring();
    const done = change("value", value, { reason, event });
    if (done && reason !== "reset" && reason !== "restore") {
      dispatchChange(formElement());
    }
    return done;
  }
  function setKeys(keys, why) {
    const current = new Map(
      selection.keys().map((key, index) => [key, selection.values()[index]])
    );
    const value = keys.map(
      (key) => current.has(key) ? current.get(key) : listbox.valueOf(key)
    );
    requested = keys;
    const done = setValue(value, why);
    if (!done) {
      requested = null;
    }
    return done;
  }
  function choose(key, why) {
    const entry = listbox.find(key);
    if (!entry || listbox.disabled(entry)) {
      return;
    }
    if (selection.isSelected(key, entry.value)) {
      if (store.get().deselectable && why.reason === "item-press") {
        setValue(null, why);
      }
      return;
    }
    setValue(entry.value, why);
  }
  const keySelection = createKeySelection({
    keys: selection.keys,
    set: setKeys,
    order,
    selectable
  });
  const { toggle, replace, extend } = keySelection;
  function toggleAll(why) {
    if (store.get().multiple) {
      keySelection.toggleAll(why);
    }
  }
  function focused(key) {
    focusInside = true;
    remembered = key;
    store.set({ highlighted: key, stop: key });
  }
  function focusStop() {
    focusInside = true;
    const { stop, virtualFocus, highlighted } = store.get();
    const key = stop ?? stopKey();
    if (virtualFocus) {
      const root = rootElement();
      if (root && root.ownerDocument.activeElement !== root) {
        root.focus({ preventScroll: true });
      }
      if (key !== null && highlighted === null) {
        focused(key);
      }
      return;
    }
    const el = key === null ? void 0 : listbox.element(key);
    if (el?.isConnected) {
      el.focus({ preventScroll: true });
    }
  }
  function highlightVirtually(key, event) {
    const entry = listbox.find(key);
    if (entry && !listbox.disabled(entry)) {
      focusInside = true;
      listbox.highlight(key, { event });
    }
  }
  store.subscribe(() => {
    const { virtualFocus, highlighted, stop } = store.get();
    if (!virtualFocus || highlighted === null || highlighted === remembered) {
      return;
    }
    remembered = highlighted;
    if (stop !== highlighted) {
      store.set({ stop: highlighted });
    }
  });
  function blurred(event) {
    const target = event.target;
    const settle = () => {
      if (!target.isConnected) {
        return;
      }
      if (rootElement()?.contains(target.ownerDocument?.activeElement ?? null)) {
        return;
      }
      focusInside = false;
      store.set({ highlighted: null });
    };
    queueMicrotask(() => queueMicrotask(settle));
  }
  const keyboard = createListboxKeyboard({
    store,
    listbox,
    choose,
    toggle,
    replace,
    extend,
    toggleAll,
    anchorKey: keySelection.anchor
  });
  let previousValue = store.get().value;
  store.subscribe(() => {
    const { value } = store.get();
    if (value === previousValue) {
      return;
    }
    previousValue = value;
    const keys = selection.keys();
    const own = requested !== null && isSameKeys(requested, keys);
    requested = null;
    if (!own || !keys.length) {
      keySelection.resetAnchor();
    }
    if (!own && !focusInside) {
      remembered = null;
    }
    queueCheck();
  });
  const api = {
    id,
    getValue: () => store.get().value,
    setValue: (value, { reason = "imperative", event } = {}) => setValue(value, { reason, event }),
    clear: ({ reason = "imperative", event } = {}) => setValue(selection.empty(), { reason, event }),
    selectAll({ reason = "imperative", event } = {}) {
      if (!store.get().multiple) {
        return false;
      }
      const missing = order().filter(
        (key) => selectable(key) && !selection.isSelected(key)
      );
      return missing.length > 0 && setKeys([...selection.keys(), ...missing], { reason, event });
    },
    getHighlighted() {
      const { highlighted } = store.get();
      return highlighted === null ? null : listbox.valueOf(highlighted) ?? null;
    },
    highlight(value) {
      const key = value === null ? null : toKey(value);
      const root = rootElement();
      if (root?.contains(root.ownerDocument.activeElement)) {
        return highlightFromCode(listbox, key, store.get().highlighted);
      }
      const entry = key === null ? void 0 : highlightable(listbox, key);
      if (!entry) {
        return false;
      }
      remembered = entry.key;
      store.set({ stop: entry.key });
      return true;
    },
    focus: focusStop,
    // Internal. Used by slots and adapters.
    internal: {
      options,
      listbox,
      selection,
      icons,
      keyOf: toKey,
      claim: createClaim(),
      focused,
      focusStop,
      highlightVirtually,
      blurred,
      onKeyDown: keyboard.onKeyDown,
      press: keyboard.press,
      controlElement: rootElement,
      formElement,
      serialized: selection.keys,
      // The props an item last rendered with, read live by its registration.
      itemProps: (key) => context.props("item", key),
      // Web components read `default-value` as keys when items come later. Once
      // they arrive, a value that still names them takes their values, with no
      // change: it's still the default.
      adoptValue: (value) => store.set({ value }),
      reset() {
        if (keepsValueOnReset(options().value, options().defaultValue)) {
          return;
        }
        setValue(store.get().initial, { reason: "reset" });
      },
      // The browser restores a disabled or read-only control too, as a native one.
      restore(saved) {
        selection.restore(
          saved,
          (value) => change("value", value, { reason: "restore" })
        );
      },
      setFormDisabled(formDisabled) {
        store.set({ formDisabled });
      },
      // Picks the item a browser's autofill wrote, by its value or its label.
      autofill(text) {
        const lower = text.toLowerCase();
        const entry = listbox.entries().find(
          (entry2) => entry2.key.toLowerCase() === lower || entry2.label.toLowerCase() === lower
        );
        if (entry && !store.get().multiple) {
          setValue(entry.value, { reason: "item-press" });
        }
      }
    }
  };
  if (store.get().items) {
    check();
  }
  return api;
}
var listboxApi = listboxApiBody;
export {
  initialListboxStore,
  listboxApi,
  syncListboxStore
};
