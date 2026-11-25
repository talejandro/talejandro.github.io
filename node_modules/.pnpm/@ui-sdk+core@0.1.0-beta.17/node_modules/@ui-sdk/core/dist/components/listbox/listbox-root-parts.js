// src/components/listbox/listbox-root-parts.ts
import { dev } from "#dev";
import { itemIconPart, optionIcon } from "../../foundation/lists/item-icon.js";
import {
  bindFormRoot,
  formAttrs,
  groupLabelledBy,
  groupLabelPart,
  hiddenInputPart,
  isDisabled,
  itemIndicatorPart,
  noItems,
  positionAttrs,
  registerItem,
  valueInputPart,
  warnIfUnnamed
} from "../../foundation/lists/listbox-parts.js";
import { idPart } from "../../foundation/kernel/attrs.js";
import { selects } from "../../foundation/kernel/selects.js";
import { live } from "../../foundation/kernel/live.js";
import { holdFocus } from "../../foundation/focus/press-keeps-focus.js";
function rootState(state, api) {
  return {
    multiple: state.multiple,
    orientation: state.orientation,
    disabled: isDisabled(state),
    readOnly: state.readOnly,
    required: state.required,
    items: api.internal.listbox.visibleData()?.list ?? noItems
  };
}
function valueOfItem(key, props, api) {
  const { listbox } = api.internal;
  return listbox.dataItems() ? listbox.valueOf(key) ?? props.value : props.value;
}
function itemState(state, key, props, api) {
  return {
    highlighted: state.highlighted === key,
    selected: api.internal.selection.isSelected(
      key,
      valueOfItem(key, props, api)
    ),
    disabled: !!props.disabled || isDisabled(state)
  };
}
function isStop(state, key, props, api) {
  if (state.stop !== null) {
    return state.stop === key;
  }
  const eligible = api.internal.selection.keys().length ? api.internal.selection.isSelected(key, valueOfItem(key, props, api)) : !props.disabled;
  return api.internal.claim(key, eligible);
}
var listboxSlots = (slot) => ({
  // The listbox itself. It takes focus only to hand it to the option that
  // holds the tab stop, unless `virtualFocus` keeps focus here.
  root: slot({
    role: "listbox",
    keys: (state) => [
      ...state.orientation === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"],
      "Home",
      "End",
      "PageUp",
      "PageDown",
      "Enter",
      " ",
      "typeahead",
      ...state.multiple ? ["mod+a"] : []
    ],
    state: (state, { api }) => rootState(state, api),
    attrs: (state, { id }) => {
      const disabled = isDisabled(state);
      return {
        id: `${id}-listbox`,
        // Never a tab stop of its own, even disabled, when browsers make scrolling containers one.
        tabindex: state.virtualFocus && !disabled ? "0" : "-1",
        "aria-multiselectable": state.multiple ? "true" : void 0,
        "aria-orientation": state.orientation,
        "aria-disabled": disabled ? "true" : void 0,
        "aria-readonly": state.readOnly ? "true" : void 0,
        "aria-required": state.required ? "true" : void 0,
        "data-orientation": state.orientation,
        ...formAttrs(state)
      };
    },
    live: live((state, { id }) => ({
      "aria-activedescendant": state.virtualFocus && state.highlighted !== null ? `${id}-option-${idPart(state.highlighted)}` : void 0
    })),
    on: {
      keydown: (event, { api, el }) => el && api.internal.onKeyDown(event, el),
      focusin(event, { api, el }) {
        if (event.target === el) {
          api.internal.focusStop();
        }
      },
      focusout(event, { api, el }) {
        if (!el?.contains(event.relatedTarget)) {
          api.internal.blurred(event);
        }
      }
    },
    bind(el, context) {
      const { id } = context;
      const unbind = bindFormRoot(el, context, { focusOnSelfClick: false });
      if (dev) {
        warnIfUnnamed(
          el,
          "The listbox has no accessible name. Add a Field label, an aria-label or aria-labelledby.",
          {
            component: "listbox",
            id
          }
        );
      }
      return unbind;
    }
  }),
  item: slot({
    role: "option",
    focus: (state) => state.virtualFocus ? "active-descendant" : "roving",
    props: {
      value: "key",
      label: "string",
      disabled: "boolean",
      index: "number",
      // Internal: passed by renderers, from the group it's inside.
      group: { kind: "string", from: "group.id" }
    },
    // Without a stop yet, the first eligible item claims it, so every item hears that change.
    selects: selects({
      highlighted: ({ key }) => [key],
      stop: ({ key }) => [key, null]
    }),
    state: (state, { key, props, api }) => itemState(state, key, props, api),
    attrs: (state, { id, key, props, api }) => {
      const { selected, disabled } = itemState(state, key, props, api);
      return {
        id: `${id}-option-${idPart(key)}`,
        // With `virtualFocus`, -1 keeps an option that's a link out of the tab order.
        tabindex: state.virtualFocus ? "-1" : isDisabled(state) ? void 0 : isStop(state, key, props, api) ? "0" : "-1",
        "aria-selected": String(selected),
        "aria-disabled": disabled ? "true" : void 0,
        ...positionAttrs(props.index, api.internal.listbox),
        "data-selected": selected ? "" : void 0,
        "data-disabled": disabled ? "" : void 0
      };
    },
    live: live((state, { key }) => ({
      "data-highlighted": state.highlighted === key ? "" : void 0
    })),
    on: {
      focusin: (event, { api, key }) => api.internal.focused(key),
      pointermove(event, { api, key, store }) {
        const { virtualFocus, highlighted } = store.get();
        if (virtualFocus && event.pointerType !== "touch" && highlighted !== null && highlighted !== key) {
          api.internal.highlightVirtually(key, event);
        }
      },
      // With `virtualFocus`, a press keeps focus on the list.
      pointerdown: (event, context) => context.store.get().virtualFocus && holdFocus(event, context),
      // Shift with a press selects a range, not the page's text.
      mousedown(event, context) {
        const { shiftKey } = event;
        const { multiple, virtualFocus } = context.store.get();
        if (virtualFocus) {
          holdFocus(event, context);
        } else if (shiftKey && multiple) {
          event.preventDefault();
        }
      }
    },
    press({ api, key, store }, event) {
      if (store.get().virtualFocus) {
        api.internal.focusStop();
        api.internal.highlightVirtually(key, event);
      }
      api.internal.press(key, event);
    },
    bind: (el, context) => registerItem(el, context)
  }),
  "item-indicator": slot(
    itemIndicatorPart()
  ),
  // An icon inside an item. Screen readers and typeahead skip it.
  "item-icon": slot(
    itemIconPart({
      component: "listbox",
      ...optionIcon
    })
  ),
  // A group of items, named by its label. Nothing filters a listbox, so it never hides.
  group: slot({
    role: "group",
    // Its id is made for it, and names the group its items and label are in.
    props: { id: "id" },
    attrs: (state, { id, key }) => ({
      "aria-labelledby": groupLabelledBy(state, id, key)
    })
  }),
  "group-label": slot(groupLabelPart()),
  // A listbox may only hold options and groups, so separators are hidden from assistive technology.
  separator: slot({
    role: "none",
    attrs: () => ({ "aria-hidden": "true" })
  }),
  "form-input": slot(hiddenInputPart("form-input")),
  "value-input": slot(valueInputPart())
});
export {
  listboxSlots
};
