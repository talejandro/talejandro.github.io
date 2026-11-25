// src/components/command/command-parts.ts
import { dev } from "#dev";
import { fieldPart, optionPart } from "../../foundation/lists/autocomplete-core.js";
import {
  currentPage
} from "./command-api.js";
import {
  ariaKeyshortcuts,
  formatShortcut
} from "../../foundation/platform/platform.js";
import { pressKeepsFocus } from "../../foundation/focus/press-keeps-focus.js";
import {
  emptyPart,
  groupLabelPart,
  optionGroupPart,
  optionSeparatorPart,
  statusPart,
  warnIfUnnamed
} from "../../foundation/lists/listbox-parts.js";
import { itemIconPart, optionIcon } from "../../foundation/lists/item-icon.js";
import { listName } from "../../foundation/lists/field-name.js";
import {
  itemTextPart
} from "../../foundation/lists/listbox-search.js";
import { selects } from "../../foundation/kernel/selects.js";
import { onProps } from "../../foundation/kernel/part.js";
var noCommands = [];
function itemState(state, key, props) {
  return {
    highlighted: state.highlighted === key,
    disabled: !!props.disabled,
    pending: state.pending.includes(key),
    error: state.error?.key === key ? state.error.reason : void 0
  };
}
var unreadByItems = {
  open: [],
  value: [],
  query: [],
  queries: [],
  items: [],
  status: [],
  mounts: [],
  settled: [],
  groupLabels: [],
  fieldName: []
};
var field = fieldPart();
var option = optionPart();
var commandSlots = (slot) => ({
  // The element around the field and the list.
  root: slot({
    state: (state) => ({
      page: currentPage(state),
      loading: state.status === "loading"
    }),
    attrs: (state) => ({
      "data-loading": state.status === "loading" ? "" : void 0
    }),
    bind(el, { api }) {
      api.internal.syncPlatform();
      return api.internal.bindDataShortcuts(el);
    }
  }),
  // The search field. It keeps focus while arrow keys move the highlight.
  input: slot({
    ...field,
    keys: [...field.keys, "Enter", "Escape", "Backspace"],
    state: (state) => ({ page: currentPage(state) }),
    attrs: (state, context) => ({
      ...field.attrs(state, context),
      type: "text",
      "aria-autocomplete": "list",
      "aria-controls": `${context.id}-list`
    }),
    bind(el, context) {
      if (dev) {
        warnIfUnnamed(
          el,
          "The search field has no accessible name. Add an aria-label or a label.",
          {
            component: "command",
            id: context.id
          }
        );
      }
      return field.bind(el, context);
    }
  }),
  list: slot({
    role: "listbox",
    keys: {
      none: "The search field handles them, and keeps focus while they move the highlight."
    },
    state: (state, { api }) => ({
      status: state.status,
      items: api.internal.listbox.visibleData()?.list ?? noCommands
    }),
    attrs: (state, { id }) => ({
      id: `${id}-list`,
      ...listName(state, id),
      "aria-busy": state.status === "loading" ? "true" : void 0
    }),
    on: pressKeepsFocus,
    bind(el, { api, store }) {
      let active = true;
      queueMicrotask(() => active && store.set({ settled: true }));
      api.internal.syncPlatform();
      const unloading = api.internal.loadMore.bind(el);
      return () => {
        active = false;
        unloading();
        store.set({ settled: false });
      };
    }
  }),
  item: slot({
    ...option,
    // A command without a value gets one made. `onSelect`'s Promise makes it pending.
    props: {
      value: "id",
      label: "string",
      keywords: "list",
      disabled: "boolean",
      shortcut: "string",
      page: "string",
      index: "number",
      onSelect: "action",
      // Internal: passed by renderers, from the group and page it's inside, and whether data rendered it.
      group: { kind: "string", from: "group.id" },
      inPage: { kind: "string", from: "page.value" },
      data: "boolean"
    },
    selects: selects({
      highlighted: ({ key }) => [key],
      listing: ({ key }) => [key],
      pending: ({ key }) => [key],
      ...unreadByItems
    }),
    present: (state, { props, api }) => api.internal.onCurrentPage(state, props.inPage),
    state: (state, { key, props }) => itemState(state, key, props),
    attrs: (state, context) => {
      const { key, props } = context;
      const pending = state.pending.includes(key);
      const attrs = option.attrs(state, context);
      return {
        ...attrs,
        "aria-disabled": pending ? "true" : attrs["aria-disabled"],
        "aria-busy": pending ? "true" : void 0,
        "aria-keyshortcuts": props.shortcut ? ariaKeyshortcuts(props.shortcut, state.apple) : void 0,
        "data-pending": pending ? "" : void 0
      };
    },
    bind(el, context) {
      const unregister = option.bind(el, context);
      const unbindShortcut = context.api.internal.bindItemShortcut(
        el,
        context.key,
        (listener) => onProps(context, listener)
      );
      return () => {
        unregister();
        unbindShortcut();
      };
    }
  }),
  // The command's text, with what the search matched in `<mark>`.
  "item-text": slot(
    itemTextPart()
  ),
  // An icon inside a command.
  "item-icon": slot(
    itemIconPart({
      component: "command",
      ...optionIcon
    })
  ),
  group: slot(optionGroupPart()),
  "group-label": slot(groupLabelPart()),
  separator: slot(optionSeparatorPart()),
  empty: slot(emptyPart()),
  status: slot(statusPart()),
  // A page of commands, shown while it's on top of the stack. It renders no
  // element of its own, except on web components, where it wraps its commands.
  page: slot({
    props: { value: "string" },
    present: (state, { props }) => (props.value ?? null) === currentPage(state),
    role: "none"
  }),
  // The keys of a command's shortcut, for people to see. Screen readers hear aria-keyshortcuts instead.
  shortcut: slot({
    // Inside a command, its shortcut.
    props: { shortcut: { kind: "string", from: "item" } },
    state: (state, { props }) => ({
      text: props.shortcut ? formatShortcut(props.shortcut, state.apple) : ""
    }),
    attrs: () => ({ "aria-hidden": "true", translate: "no" }),
    bind(el, { store, api, props }) {
      if (el.childNodes.length) {
        return;
      }
      const write = () => {
        const shortcut = props.shortcut ?? api.internal.shortcutOf(el);
        el.textContent = shortcut ? formatShortcut(shortcut, store.get().apple) : "";
      };
      write();
      const off = store.subscribe(write);
      return () => {
        off();
        el.textContent = "";
      };
    }
  })
});
export {
  commandSlots
};
