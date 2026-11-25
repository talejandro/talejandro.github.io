// src/components/tree/tree.ts
import { isDisabled, watchFormDisabled } from "../../foundation/forms/form.js";
import { hiddenAttrs } from "../../foundation/motion/panel.js";
import { checkedAttrs, idPart, openAttrs } from "../../foundation/kernel/attrs.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { live } from "../../foundation/kernel/live.js";
import { selects } from "../../foundation/kernel/selects.js";
import { treeApi } from "./tree-api.js";
import {
  toggleTreeChecked,
  treeCheckedStates
} from "../../foundation/lists/tree-checked.js";
import {
  createTreeCollection,
  treeDataNodes,
  treeFromPaths,
  visibleTreeRows
} from "../../foundation/lists/tree-collection.js";
function createTreeController() {
  return createController();
}
function itemState(state, key, props, api) {
  const branch = api.internal.isBranch(key, props);
  return {
    expanded: branch && state.expanded.includes(key),
    selected: state.selected.includes(key),
    checked: state.checks[key] ?? false,
    disabled: api.internal.isDisabled(state, key, props),
    branch,
    level: api.internal.level(key, props),
    current: state.current === key,
    loading: state.loading.includes(key),
    failed: state.failed.includes(key),
    pending: state.pending.includes(key)
  };
}
var flag = (on) => on ? "" : void 0;
var ownEvent = (el, event) => !el || !(event?.target instanceof Element) || event.target.closest('[role="treeitem"]') === el;
function itemDataAttrs(item) {
  return {
    "data-level": String(item.level),
    "data-branch": flag(item.branch),
    "data-expanded": flag(item.expanded),
    "data-selected": flag(item.selected),
    "data-disabled": flag(item.disabled),
    "data-current": flag(item.current),
    "data-loading": flag(item.loading),
    "data-failed": flag(item.failed),
    "data-pending": flag(item.pending)
  };
}
var itemOf = (props) => props.value;
var byItem = ({ props }) => [itemOf(props)];
var itemReads = {
  selected: ({ key }) => [key],
  expanded: ({ key }) => [key],
  checks: ({ key }) => [key],
  current: ({ key }) => [key],
  loading: ({ key }) => [key],
  failed: ({ key }) => [key],
  pending: ({ key }) => [key],
  value: [],
  checked: [],
  exiting: [],
  version: []
};
var partReads = {
  selected: byItem,
  expanded: byItem,
  checks: byItem,
  current: byItem,
  loading: byItem,
  failed: byItem,
  pending: byItem,
  value: [],
  checked: [],
  exiting: [],
  active: [],
  version: [],
  siblings: []
};
var keepsMounted = (state, props) => props.keepMounted ?? state.keepMounted;
var findable = (state, props) => props.hiddenUntilFound ?? state.hiddenUntilFound;
var treePrimitive = /* @__PURE__ */ definePrimitive({
  name: "tree",
  // `onAction`'s Promise makes its item pending.
  options: {
    items: "value",
    paths: "value",
    mode: "string",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    activation: "string",
    expanded: "list",
    defaultExpanded: "list",
    onExpandedChange: "callback",
    expandOnPress: "boolean",
    checkable: "boolean",
    checked: "list",
    defaultChecked: "list",
    onCheckedChange: "callback",
    checkStrategy: "string",
    onAction: "action",
    pendingAnnouncement: "string",
    loadChildren: "value",
    current: "string",
    onHighlight: "callback",
    disabled: "boolean",
    focusableWhenDisabled: "boolean",
    keepMounted: "boolean",
    hiddenUntilFound: "boolean",
    announcement: "value",
    controller: "value"
  },
  controlled: ["value", "expanded", "checked"],
  state: (options) => ({
    value: options.defaultValue ?? (options.mode === "multiple" ? [] : null),
    selected: [],
    expanded: options.defaultExpanded ?? [],
    checked: options.defaultChecked ?? [],
    checks: {},
    mode: "single",
    checkable: false,
    checkStrategy: "leaf",
    activation: "manual",
    expandOnPress: true,
    disabled: false,
    formDisabled: false,
    focusableWhenDisabled: true,
    keepMounted: false,
    hiddenUntilFound: false,
    current: null,
    items: void 0,
    paths: void 0,
    active: null,
    exiting: [],
    loading: [],
    failed: [],
    pending: [],
    version: 0,
    siblings: {}
  }),
  live: ["version", "siblings"],
  sync: (options) => ({
    mode: options.mode ?? "single",
    checkable: options.checkable ?? false,
    checkStrategy: options.checkStrategy ?? "leaf",
    activation: options.activation ?? "manual",
    expandOnPress: options.expandOnPress ?? true,
    disabled: options.disabled ?? false,
    focusableWhenDisabled: options.focusableWhenDisabled ?? true,
    keepMounted: options.keepMounted ?? false,
    hiddenUntilFound: options.hiddenUntilFound ?? false,
    current: options.current ?? null,
    items: options.items,
    paths: options.paths,
    ...options.value === void 0 ? {} : { value: options.value },
    ...options.expanded === void 0 ? {} : { expanded: options.expanded },
    ...options.checked === void 0 ? {} : { checked: options.checked }
  }),
  api: treeApi,
  slots: (slot) => ({
    root: slot({
      role: "tree",
      keys: { none: "Focus stays on an item, whose keydown handles them." },
      state: (state) => ({
        mode: state.mode,
        checkable: state.checkable,
        disabled: isDisabled(state)
      }),
      attrs: (state) => ({
        "aria-multiselectable": state.mode === "multiple" ? "true" : void 0,
        "aria-disabled": isDisabled(state) ? "true" : void 0,
        "data-disabled": flag(isDisabled(state))
      }),
      bind(el, { api, store }) {
        const cleanups = [
          watchFormDisabled(el, store),
          api.internal.bindRoot(el)
        ];
        return () => cleanups.forEach((cleanup) => cleanup?.());
      }
    }),
    item: slot({
      role: "treeitem",
      focus: "roving",
      keys: (state) => [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "*",
        "Enter",
        ...state.checkable || state.mode !== "none" ? [" "] : [],
        "typeahead",
        ...state.mode === "multiple" ? ["mod+a"] : []
      ],
      // Its parent is the item it's inside.
      props: {
        value: "string",
        parent: { kind: "string", from: "item.value" },
        branch: "boolean",
        disabled: "boolean",
        label: "string"
      },
      selects: selects({
        ...itemReads,
        active: ({ key }) => [key, null],
        siblings: ({ props }) => [props.parent ?? ""]
      }),
      state: (state, { key, props, api }) => itemState(state, key, props, api),
      attrs: (state, part) => {
        const { id, key, props, api } = part;
        const item = itemState(state, key, props, api);
        const position = api.internal.dataPosition(key);
        return {
          id: `${id}-item-${idPart(key)}`,
          tabindex: api.internal.tabIndex(state, part),
          "aria-labelledby": `${id}-label-${idPart(key)}`,
          "aria-level": String(item.level),
          "aria-posinset": position && String(position.index),
          "aria-setsize": position && String(position.size),
          "aria-expanded": item.branch ? String(item.expanded) : void 0,
          "aria-selected": state.mode === "none" ? void 0 : String(item.selected),
          "aria-checked": state.checkable ? item.checked === "indeterminate" ? "mixed" : String(item.checked) : void 0,
          "aria-disabled": item.disabled ? "true" : void 0,
          "aria-current": item.current ? "page" : void 0,
          "aria-busy": item.loading || item.pending ? "true" : void 0,
          ...itemDataAttrs(item),
          ...state.checkable ? checkedAttrs(item.checked) : {},
          style: `--tree-level:${item.level}`
        };
      },
      // Composed items learn their place among their siblings once they're in the page.
      live: live((state, { key, props, api }) => {
        if (api.internal.dataPosition(key)) {
          return {};
        }
        const position = api.internal.composedPosition(
          state.siblings,
          key,
          props
        );
        return position ? {
          "aria-posinset": String(position.index),
          "aria-setsize": String(position.size)
        } : {};
      }),
      press: ({ api, key, el }, event) => ownEvent(el, event) && api.internal.press(key, el, event),
      on: {
        keydown: (event, { api, el, key }) => ownEvent(el, event) && api.internal.keydown(event, el, key)
      },
      bind: (el, part) => part.api.internal.bindItem(el, part)
    }),
    // The item's text, which names it. A link here is the item's link.
    label: slot({
      props: { value: { kind: "string", from: "item" } },
      selects: selects(partReads),
      state: (state, { props, api }) => itemState(state, itemOf(props), void 0, api),
      // The item's data attributes too, so a row styles from its label, apart from the items nested in it.
      attrs: (state, { id, props, api }) => ({
        id: `${id}-label-${idPart(itemOf(props))}`,
        ...itemDataAttrs(itemState(state, itemOf(props), void 0, api))
      }),
      // A link inside an item leaves the tab order to the item.
      bind: (el) => {
        if (el.matches("a[href]") && !el.hasAttribute("tabindex")) {
          el.tabIndex = -1;
        }
      }
    }),
    // The arrow that expands and collapses a branch. Alt or Option expands everything in it.
    indicator: slot({
      props: { value: { kind: "string", from: "item" } },
      selects: selects(partReads),
      state: (state, { props, api }) => itemState(state, itemOf(props), void 0, api),
      attrs: (state, { props, api }) => ({
        "aria-hidden": "true",
        ...itemDataAttrs(itemState(state, itemOf(props), void 0, api))
      }),
      press: ({ api, props }, event) => api.internal.pressIndicator(itemOf(props), event)
    }),
    // The item's checkbox. Hidden from screen readers, which hear the item's `aria-checked`.
    checkbox: slot({
      props: { value: { kind: "string", from: "item" } },
      selects: selects(partReads),
      state: (state, { props, api }) => itemState(state, itemOf(props), void 0, api),
      attrs: (state, { props, api }) => {
        const item = itemState(state, itemOf(props), void 0, api);
        return {
          "aria-hidden": "true",
          ...checkedAttrs(item.checked),
          "data-disabled": flag(item.disabled)
        };
      },
      press: ({ api, props }, event) => api.internal.pressCheckbox(itemOf(props), event)
    }),
    // A branch's children. A collapsed group stays in the page while it animates out.
    group: slot({
      role: "group",
      props: {
        value: { kind: "string", from: "item" },
        keepMounted: "boolean",
        hiddenUntilFound: "boolean"
      },
      selects: selects({ ...partReads, exiting: byItem }),
      present: (state, { props }) => state.expanded.includes(itemOf(props)) || state.exiting.includes(itemOf(props)) || keepsMounted(state, props) || findable(state, props),
      state: (state, { props, api }) => ({
        expanded: state.expanded.includes(itemOf(props)),
        level: api.internal.level(itemOf(props)) + 1
      }),
      attrs: (state, { id, props }) => {
        const open = state.expanded.includes(itemOf(props));
        return {
          id: `${id}-group-${idPart(itemOf(props))}`,
          ...hiddenAttrs(
            open || state.exiting.includes(itemOf(props)),
            findable(state, props)
          ),
          ...openAttrs(open)
        };
      },
      bind: (el, part) => part.api.internal.bindGroup(
        el,
        itemOf(part.props),
        () => findable(part.store.get(), part.props),
        part
      )
    })
  }),
  agent: {
    actions: [
      "setExpanded",
      "expand",
      "collapse",
      "expandAll",
      "collapseAll",
      "setValue",
      "setChecked"
    ],
    closed: true,
    items: (api) => api.internal.items()
  }
});
var tree = treePrimitive;
export {
  createTreeCollection,
  createTreeController,
  toggleTreeChecked,
  tree,
  treeCheckedStates,
  treeDataNodes,
  treeFromPaths,
  visibleTreeRows
};
