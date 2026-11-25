// src/foundation/lists/listbox-parts.ts
import { warn } from "#dev";
import "./async-options.js";
import { keyWhileBound } from "../kernel/bound-keys.js";
import { isBrowser } from "../platform/env.js";
import { animateIn } from "../motion/presence.js";
import {
  bindInternals,
  bindValueInput,
  hiddenInputStyle,
  isDisabled,
  labelsOf,
  nameFromLabels,
  valueMissingMessage
} from "../forms/form.js";
import "./listbox.js";
import { idPart, openAttrs } from "../kernel/attrs.js";
import "./listbox-value.js";
var noItems = [];
var listStepKeys = [
  "ArrowDown",
  "ArrowUp",
  "PageDown",
  "PageUp",
  "ctrl+n",
  "ctrl+p"
];
var isLocked = (state) => isDisabled(state) || state.readOnly;
var formAttrs = (state) => ({
  "data-disabled": isDisabled(state) ? "" : void 0,
  "data-readonly": state.readOnly ? "" : void 0,
  "data-required": state.required ? "" : void 0
});
function stashContent(el, shown, subscribe) {
  const stash = el.ownerDocument.createDocumentFragment();
  const write = () => {
    if (shown() && stash.childNodes.length) {
      el.append(stash);
    } else if (!shown() && el.childNodes.length) {
      stash.append(...Array.from(el.childNodes));
    }
  };
  write();
  const unsubscribe = subscribe(write);
  return () => {
    unsubscribe();
    if (stash.childNodes.length) {
      el.append(stash);
    }
  };
}
function warnIfUnnamed(el, message, from, named = () => false) {
  if (!isBrowser) {
    return;
  }
  setTimeout(() => {
    if (!el.isConnected || named() || el.getAttribute("aria-labelledby") || el.getAttribute("aria-label") || labelsOf(el).length) {
      return;
    }
    warn(message, from);
  }, 300);
}
function positionAttrs(index, listbox) {
  if (index === void 0) {
    return {};
  }
  return {
    "aria-posinset": String(index + 1),
    "aria-setsize": String(listbox.entries().length)
  };
}
function registerItem(el, {
  api,
  key,
  props
}) {
  return api.internal.listbox.register(key, el, () => {
    const latest = api.internal.itemProps(key) ?? props;
    return {
      value: latest.value,
      label: latest.label,
      keywords: latest.keywords,
      disabled: latest.disabled,
      group: latest.group,
      index: latest.index
    };
  });
}
function bindItem(el, { api, key, props }) {
  const unregister = registerItem(el, { api, key, props });
  if (api.internal.selection.isSelected(key, props.value)) {
    api.internal.selection.queueLabels();
  }
  return unregister;
}
function optionGroupPart() {
  return {
    // Its id is made for it, and names the group its items and label are in.
    props: { id: "id" },
    role: "group",
    attrs: (state, { id, key, api }) => ({
      "aria-labelledby": groupLabelledBy(state, id, key),
      hidden: api.internal.listbox.groupMatches(key) ? void 0 : ""
    })
  };
}
var groupLabelledBy = (state, id, group) => state.groupLabels.includes(group) ? `${id}-group-${idPart(group)}` : void 0;
function optionSeparatorPart() {
  return {
    role: "none",
    attrs: (state, { api }) => ({
      "aria-hidden": "true",
      hidden: api.internal.filterQuery() && !state.items ? "" : void 0
    })
  };
}
function emptyPart() {
  const isEmpty = (state, api) => api.internal.isEmpty(state);
  return {
    // Internal: passed by renderers.
    props: { stash: "boolean" },
    state: (state, { api }) => ({
      loading: state.status === "loading",
      empty: isEmpty(state, api),
      query: state.query
    }),
    role: "status",
    attrs: (state, { api }) => ({
      "aria-live": "polite",
      "aria-atomic": "true",
      "data-empty": isEmpty(state, api) ? "" : void 0,
      "data-loading": state.status === "loading" ? "" : void 0
    }),
    bind(el, { api, store, props }) {
      if (props.stash) {
        return stashContent(
          el,
          () => isEmpty(store.get(), api),
          store.subscribe
        );
      }
    }
  };
}
function statusPart() {
  return {
    state: (state, { api }) => ({
      status: state.status,
      loading: state.status === "loading",
      count: api.internal.itemCount()
    }),
    role: "status",
    attrs: (state) => ({
      "aria-live": "polite",
      "aria-atomic": "true",
      "data-loading": state.status === "loading" ? "" : void 0
    })
  };
}
function rootPart({
  focusOnSelfClick
}) {
  return {
    attrs: (state) => ({ ...formAttrs(state), ...openAttrs(state.open) }),
    bind: (el, context) => bindFormRoot(el, context, { focusOnSelfClick })
  };
}
function bindFormRoot(el, { api, store }, { focusOnSelfClick }) {
  const { selection } = api.internal;
  const unbind = bindInternals(el, {
    value: () => {
      const keys = selection.keys();
      return store.get().multiple ? keys : keys[0] ?? null;
    },
    name: () => store.get().name,
    state: () => JSON.stringify(selection.keys()),
    restore: api.internal.restore,
    valueMissing: () => store.get().required && selection.keys().length === 0,
    message: () => valueMissingMessage("select"),
    anchor: api.internal.controlElement,
    focus: api.focus,
    reset: api.internal.reset,
    disabled: api.internal.setFormDisabled,
    subscribe: store.subscribe
  });
  let unname = () => {
  };
  queueMicrotask(() => {
    const control = api.internal.controlElement();
    if (control) {
      unname = nameFromLabels(el, control);
    }
  });
  const onClick = (event) => {
    if (event.target === el) {
      api.focus();
    }
  };
  if (focusOnSelfClick) {
    el.addEventListener("click", onClick);
  }
  return () => {
    unbind();
    unname();
    el.removeEventListener("click", onClick);
  };
}
function hiddenInputPart(slot) {
  return {
    attrs: (state, { id, api }) => {
      const keys = api.internal.selection.keysOf(state.value);
      return {
        id: `${id}-${slot}`,
        name: state.multiple ? void 0 : state.name,
        value: state.multiple ? keys.join(",") : keys[0] ?? "",
        form: state.form,
        autocomplete: state.autoComplete,
        required: state.required ? "" : void 0,
        disabled: state.disabled ? "" : void 0,
        "aria-hidden": "true",
        tabindex: "-1",
        style: hiddenInputStyle
      };
    },
    bind: (el, { api, store }) => bindValueInput(el, {
      value: () => {
        const keys = api.internal.selection.keys();
        return store.get().multiple ? keys.join(",") : keys[0] ?? "";
      },
      subscribe: store.subscribe,
      focus: api.focus,
      autofill: api.internal.autofill,
      reset: api.internal.reset,
      disabled: api.internal.setFormDisabled
    })
  };
}
function valueInputPart() {
  return {
    props: { value: "string" },
    attrs: (state, { props }) => ({
      type: "hidden",
      name: state.name,
      value: props.value,
      form: state.form,
      disabled: isDisabled(state) ? "" : void 0
    })
  };
}
function itemIndicatorPart() {
  return {
    // Its id is made for it, and its item is the one it's inside, which every
    // renderer fills in, so `item` is set by the time it's read.
    props: {
      item: { kind: "string", from: "item.value", required: true },
      keepMounted: "boolean",
      id: "id"
    },
    present: (state, { props, api }) => !!props.keepMounted || api.internal.selection.isSelected(props.item),
    state: (state, { props, api }) => ({
      selected: api.internal.selection.isSelected(props.item)
    }),
    attrs: (state, { props, api }) => ({
      "aria-hidden": "true",
      "data-selected": api.internal.selection.isSelected(props.item) ? "" : void 0
    }),
    bind: (el, { api, props }) => api.internal.selection.isSelected(props.item) ? animateIn(el) : void 0
  };
}
function groupLabelPart() {
  return {
    // Its group is the one it's inside, which every renderer fills in. The
    // group's id keys it too, so labels of two groups are two parts.
    props: {
      id: { kind: "string", from: "group.id", required: true },
      group: { kind: "string", from: "group.id", required: true }
    },
    attrs: (state, { id, props }) => ({
      id: `${id}-group-${idPart(props.group)}`
    }),
    bind: (el, { store, props }) => keyWhileBound(store, "groupLabels", props.group)
  };
}
function arrowPart() {
  return {
    state: (state) => ({ open: state.open }),
    attrs: (state) => ({ "aria-hidden": "true", ...openAttrs(state.open) }),
    // An arrow that binds after its list was placed points at the trigger at once.
    bind(_, { api }) {
      api.internal.popup.checkPlacement();
    }
  };
}
export {
  arrowPart,
  bindFormRoot,
  bindItem,
  emptyPart,
  formAttrs,
  groupLabelPart,
  groupLabelledBy,
  hiddenInputPart,
  isDisabled,
  isLocked,
  itemIndicatorPart,
  listStepKeys,
  noItems,
  optionGroupPart,
  optionSeparatorPart,
  positionAttrs,
  registerItem,
  rootPart,
  stashContent,
  statusPart,
  valueInputPart,
  warnIfUnnamed
};
