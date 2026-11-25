// src/components/accordion/accordion.ts
import { isDisabled, watchFormDisabled } from "../../foundation/forms/form.js";
import { warn } from "#dev";
import {
  bindPanel,
  bindTriggerElement,
  createPendingReason,
  focusPressedTrigger,
  hiddenAttrs,
  openAttrs,
  triggerKeydown
} from "../../foundation/disclosure/disclosure.js";
import { stateAndRenders } from "../../foundation/motion/panel.js";
import { idPart } from "../../foundation/kernel/attrs.js";
import { createController } from "../../foundation/kernel/controller.js";
import { deriveFromOptions } from "../../foundation/kernel/derive.js";
import {
  createDetails
} from "../../foundation/kernel/details.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { selects } from "../../foundation/kernel/selects.js";
import { live } from "../../foundation/kernel/live.js";
import {
  changeSource,
  createChange
} from "../../foundation/kernel/input-source.js";
import { elements } from "../../foundation/kernel/elements.js";
function createAccordionController() {
  return createController();
}
function nextValue(value, key, open, multiple) {
  if (!open) {
    return value.filter((item) => item !== key);
  }
  if (value.includes(key)) {
    return value;
  }
  return multiple ? [...value, key] : [key];
}
function locked(state, key) {
  return !state.multiple && !state.collapsible && state.value.includes(key);
}
function accordionApiBody(context) {
  const { id, store, options, element, props } = context;
  const change = createChange(context);
  const panels = /* @__PURE__ */ new Set();
  const items = /* @__PURE__ */ new Set();
  const itemElements = /* @__PURE__ */ new Set();
  const opened = /* @__PURE__ */ new Map();
  const reason = createPendingReason("imperative");
  const isOpen = (key) => store.get().value.includes(key);
  const itemProps = (key) => props("item", key);
  const itemDisabled = (key) => isDisabled(store.get()) || !!itemProps(key)?.disabled;
  function setValue(value, { reason: why = "imperative", event } = {}) {
    const state = store.get();
    const next = state.multiple ? value : value.slice(0, 1);
    for (const key of /* @__PURE__ */ new Set([...state.value, ...next])) {
      const open = next.includes(key);
      if (open === state.value.includes(key)) {
        continue;
      }
      const onOpenChange = itemProps(key)?.onOpenChange;
      if (!onOpenChange) {
        continue;
      }
      const details = createDetails(
        { reason: why, event },
        changeSource(why, event)
      );
      onOpenChange(open, details);
      if (details.canceled) {
        return false;
      }
    }
    reason.set(why);
    const changed = change("value", next, { reason: why, event });
    if (!changed) {
      reason.take();
    }
    return changed;
  }
  function setOpen(key, open, cause = {}) {
    const state = store.get();
    if (isOpen(key) === open) {
      return false;
    }
    if (!open && locked(state, key)) {
      return false;
    }
    return setValue(nextValue(state.value, key, open, state.multiple), cause);
  }
  function exitingAfter(from, value, exiting) {
    const closed = from.filter(
      (key) => !value.includes(key) && panels.has(key) && !exiting.includes(key)
    );
    return [...exiting.filter((key) => !value.includes(key)), ...closed];
  }
  deriveFromOptions(
    context,
    ["exiting"],
    (synced, state) => "value" in synced && synced.value !== state.value ? {
      exiting: exitingAfter(
        state.value,
        synced.value,
        state.exiting
      )
    } : void 0
  );
  let previous = store.get().value;
  store.subscribe(() => {
    const { value, exiting } = store.get();
    if (value === previous) {
      return;
    }
    const from = previous;
    const why = reason.take();
    for (const key of value) {
      if (!from.includes(key)) {
        opened.set(key, why);
      }
    }
    for (const key of from) {
      if (!value.includes(key)) {
        opened.delete(key);
      }
    }
    previous = value;
    store.set({ exiting: exitingAfter(from, value, exiting) });
  });
  function syncItems() {
    itemsChanged = false;
    const inPage = elements(context, "item").map((entry) => entry.key).filter((key) => items.has(key));
    store.set({
      items: [...inPage, ...[...items].filter((key) => !inPage.includes(key))]
    });
  }
  let syncQueued = false;
  let itemsChanged = false;
  function queueSync(items2 = false) {
    itemsChanged ||= items2;
    if (syncQueued) {
      return;
    }
    syncQueued = true;
    queueMicrotask(() => {
      syncQueued = false;
      store.set({ panels: [...panels] });
      if (itemsChanged) {
        syncItems();
      }
    });
  }
  const api = {
    id,
    options,
    getValue: () => store.get().value,
    setValue,
    isOpen,
    open: (value, cause) => setOpen(value, true, cause),
    close: (value, cause) => setOpen(value, false, cause),
    toggle: (value, cause) => setOpen(value, !isOpen(value), cause),
    openAll(cause) {
      if (!store.get().multiple) {
        warn("openAll() needs an accordion with `multiple`.", {
          component: "accordion",
          id
        });
        return false;
      }
      if (itemsChanged) {
        syncItems();
      }
      const enabled = store.get().items.filter((key) => !itemDisabled(key));
      return setValue([.../* @__PURE__ */ new Set([...store.get().value, ...enabled])], cause);
    },
    closeAll(cause) {
      const state = store.get();
      return setValue(
        state.value.filter((key) => locked(state, key) || itemDisabled(key)),
        cause
      );
    },
    focus(value) {
      const trigger = value === void 0 ? elements(context, "trigger")[0]?.el : element("trigger", value);
      trigger?.focus();
    },
    internal: {
      itemDisabled,
      syncItems,
      triggerElement: (value) => element("trigger", value),
      // An open panel animates in only when it opened after mount. Find in
      // page shows its match at once.
      opening: (key) => {
        const why = opened.get(key);
        if (why === void 0) {
          return "mount";
        }
        return why === "find-in-page" ? "instant" : "animate";
      },
      settled(key, open) {
        opened.delete(key);
        itemProps(key)?.onOpenChangeComplete?.(open);
      },
      registerItem(key, el) {
        items.add(key);
        itemElements.add(el);
        queueSync(true);
        return () => {
          items.delete(key);
          itemElements.delete(el);
          queueSync(true);
        };
      },
      // Whether a change in the page happened inside an item, like its panel
      // mounting, which leaves the items' order as it was.
      insideItem(node, root) {
        for (; node && node !== root; node = node.parentNode) {
          if (itemElements.has(node)) {
            return true;
          }
        }
        return false;
      },
      registerPanel(key) {
        panels.add(key);
        queueSync();
        return () => {
          panels.delete(key);
          queueSync();
          const { exiting } = store.get();
          if (exiting.includes(key)) {
            store.set({ exiting: exiting.filter((value) => value !== key) });
          }
        };
      },
      finishExit(key) {
        store.set({
          exiting: store.get().exiting.filter((value) => value !== key)
        });
      }
    }
  };
  return api;
}
var accordionApi = accordionApiBody;
var disabledOf = (state, key, api, own) => !!own || isDisabled(state) || api.internal.itemDisabled(key);
var keepsMounted = (state, props) => props.keepMounted ?? state.keepMounted;
var findable = (state, props) => props.hiddenUntilFound ?? state.hiddenUntilFound;
var itemState = (state, key, api, own) => ({
  open: state.value.includes(key),
  disabled: disabledOf(state, key, api, own),
  index: state.items.indexOf(key)
});
var accordionPrimitive = /* @__PURE__ */ definePrimitive({
  name: "accordion",
  options: {
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    multiple: "boolean",
    collapsible: "boolean",
    disabled: "boolean",
    keepMounted: "boolean",
    hiddenUntilFound: "boolean",
    controller: "value"
  },
  state: (options) => ({
    value: options.defaultValue ?? [],
    multiple: false,
    collapsible: true,
    disabled: false,
    formDisabled: false,
    keepMounted: false,
    hiddenUntilFound: false,
    exiting: [],
    panels: [],
    items: []
  }),
  live: ["panels", "items"],
  sync: (options) => ({
    multiple: options.multiple ?? false,
    collapsible: options.collapsible ?? true,
    disabled: options.disabled ?? false,
    keepMounted: options.keepMounted ?? false,
    hiddenUntilFound: options.hiddenUntilFound ?? false,
    ...options.value === void 0 ? {} : { value: options.value }
  }),
  api: accordionApi,
  slots: (slot) => ({
    root: slot({
      state: (state) => ({
        value: state.value,
        disabled: isDisabled(state),
        multiple: state.multiple
      }),
      attrs: (state) => ({
        "data-disabled": isDisabled(state) ? "" : void 0
      }),
      bind(el, { api, store }) {
        const unwatch = watchFormDisabled(el, store);
        if (typeof MutationObserver === "undefined") {
          return unwatch;
        }
        const observer = new MutationObserver((records) => {
          if (records.some(
            (record) => !api.internal.insideItem(record.target, el)
          )) {
            api.internal.syncItems();
          }
        });
        observer.observe(el, { childList: true, subtree: true });
        return () => {
          observer.disconnect();
          unwatch();
        };
      }
    }),
    // Parts of an item read the open items, the exiting panels and the panels
    // in the page only for their own item, so an open reaches that item's parts.
    item: slot({
      props: {
        value: "id",
        disabled: "boolean",
        onOpenChange: "callback",
        onOpenChangeComplete: "callback"
      },
      selects: selects({ value: ({ key }) => [key], exiting: [], panels: [] }),
      state: (state, { key, props, api }) => itemState(state, key, api, props.disabled),
      attrs: (state, { key, props, api }) => ({
        ...openAttrs(state.value.includes(key)),
        "data-disabled": disabledOf(state, key, api, props.disabled) ? "" : void 0
      }),
      live: live((state, { key }) => {
        const index = state.items.indexOf(key);
        return { "data-index": index === -1 ? void 0 : String(index) };
      }),
      bind: (el, { api, key }) => api.internal.registerItem(key, el)
    }),
    header: slot({
      props: { value: { kind: "string", from: "item" } },
      selects: selects({ value: ({ key }) => [key], exiting: [], panels: [] }),
      state: (state, { key, api }) => itemState(state, key, api),
      attrs: (state, { key, api }) => ({
        ...openAttrs(state.value.includes(key)),
        "data-disabled": disabledOf(state, key, api) ? "" : void 0
      })
    }),
    trigger: slot({
      props: { value: { kind: "string", from: "item" }, disabled: "boolean" },
      selects: selects({
        value: ({ key }) => [key],
        exiting: [],
        panels: ({ key }) => [key]
      }),
      state: (state, { key, props, api }) => itemState(state, key, api, props.disabled),
      attrs: (state, { id, key, props, api }) => {
        const open = state.value.includes(key);
        const disabled = disabledOf(state, key, api, props.disabled);
        return {
          id: `${id}-trigger-${idPart(key)}`,
          type: "button",
          "aria-expanded": String(open),
          // Also when the open item can't close, as the APG asks.
          "aria-disabled": disabled || locked(state, key) ? "true" : void 0,
          ...openAttrs(open),
          "data-disabled": disabled ? "" : void 0
        };
      },
      // Only panels in the page can be pointed at.
      live: live((state, { id, key }) => ({
        "aria-controls": state.panels.includes(key) ? `${id}-panel-${idPart(key)}` : void 0
      })),
      press({ api, el, key, props, store }, event) {
        if (disabledOf(store.get(), key, api, props.disabled)) {
          event?.preventDefault();
          return;
        }
        focusPressedTrigger(el);
        api.toggle(key, { reason: "trigger-press", event });
      },
      on: { keydown: (event, { el }) => triggerKeydown(event, el) },
      bind: (el) => bindTriggerElement(el)
    }),
    panel: slot({
      role: "region",
      props: {
        value: { kind: "string", from: "item" },
        keepMounted: "boolean",
        hiddenUntilFound: "boolean"
      },
      selects: selects({
        value: ({ key }) => [key],
        exiting: ({ key }) => [key],
        panels: []
      }),
      present: (state, { key, props }) => state.value.includes(key) || state.exiting.includes(key) || keepsMounted(state, props) || findable(state, props),
      state: (state, { key, api }) => itemState(state, key, api),
      attrs: (state, { id, key, props, api }) => {
        const open = state.value.includes(key);
        return {
          id: `${id}-panel-${idPart(key)}`,
          "aria-labelledby": `${id}-trigger-${idPart(key)}`,
          ...hiddenAttrs(
            open || state.exiting.includes(key),
            findable(state, props)
          ),
          ...openAttrs(open),
          "data-disabled": disabledOf(state, key, api) ? "" : void 0
        };
      },
      bind(el, part) {
        const { api, key, store } = part;
        const unregister = api.internal.registerPanel(key);
        const unbind = bindPanel(el, {
          size(el2, height, width) {
            el2.style.setProperty("--accordion-panel-height", height);
            el2.style.setProperty("--accordion-panel-width", width);
          },
          isOpen: () => api.isOpen(key),
          isExiting: () => store.get().exiting.includes(key),
          isFindable: () => findable(store.get(), part.props),
          opening: () => api.internal.opening(key),
          reveal: (event) => api.open(key, { reason: "find-in-page", event }),
          trigger: () => api.internal.triggerElement(key),
          subscribe: stateAndRenders(store, part),
          settled: (open) => api.internal.settled(key, open),
          exited: () => api.internal.finishExit(key)
        });
        return () => {
          unbind();
          unregister();
        };
      }
    })
  }),
  agent: {
    actions: ["setValue", "open", "close", "toggle", "openAll", "closeAll"],
    closed: true,
    reveals: true
  }
});
var accordion = accordionPrimitive;
export {
  accordion,
  createAccordionController
};
