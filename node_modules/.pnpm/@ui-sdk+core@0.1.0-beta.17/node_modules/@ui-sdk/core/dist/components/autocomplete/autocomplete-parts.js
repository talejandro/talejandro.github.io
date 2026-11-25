// src/components/autocomplete/autocomplete-parts.ts
import { dev } from "#dev";
import { fieldPart, optionPart } from "../../foundation/lists/autocomplete-core.js";
import { openerOf } from "../../foundation/popups/popup.js";
import { bindSheetInput } from "../../foundation/popups/presentation.js";
import { watchFieldsets } from "../../foundation/forms/form.js";
import "../../foundation/lists/listbox.js";
import {
  arrowPart,
  emptyPart,
  formAttrs,
  groupLabelPart,
  isDisabled,
  isLocked,
  optionGroupPart,
  optionSeparatorPart,
  statusPart,
  warnIfUnnamed
} from "../../foundation/lists/listbox-parts.js";
import { flagWhileBound } from "../../foundation/kernel/bound-keys.js";
import {
  inputState,
  listContentPart,
  listId,
  listPart
} from "../../foundation/lists/listbox-popup.js";
import { itemIconPart, optionIcon } from "../../foundation/lists/item-icon.js";
import {
  itemTextPart
} from "../../foundation/lists/listbox-search.js";
import { openAttrs } from "../../foundation/kernel/attrs.js";
import { selects } from "../../foundation/kernel/selects.js";
import { pressKeepsFocus } from "../../foundation/focus/press-keeps-focus.js";
var noSuggestions = [];
function contentState(state, { api }) {
  return {
    open: state.open,
    presentation: state.presentation,
    status: state.status,
    items: api.internal.listbox.visibleData()?.list ?? noSuggestions
  };
}
var field = fieldPart();
var unreadByItems = {
  open: [],
  mounted: [],
  value: [],
  query: [],
  initial: [],
  items: [],
  status: [],
  listed: [],
  labeled: [],
  inline: [],
  disabled: [],
  formDisabled: [],
  readOnly: [],
  required: [],
  name: [],
  form: [],
  mounts: [],
  settled: [],
  groupLabels: [],
  fieldName: [],
  presentation: [],
  trigger: [],
  payload: [],
  titled: [],
  described: [],
  modal: []
};
var autocompleteSlots = (slot) => ({
  label: slot({
    attrs: (state, { id }) => ({
      id: `${id}-label`,
      for: `${id}-input`,
      ...formAttrs(state)
    }),
    // A label that isn't a native one for the field, like a custom element, focuses it all the same.
    press({ api, el }) {
      if (el instanceof HTMLLabelElement && el.control) {
        return;
      }
      api.focus();
    },
    bind: (el, { store }) => flagWhileBound(store, "labeled")
  }),
  // The text field. It's the form control, so the text submits under its `name`.
  input: slot({
    ...field,
    // ArrowRight and End accept an inline completion.
    keys: (state) => [
      ...field.keys,
      "Enter",
      "Escape",
      "Tab",
      ...state.inline ? ["ArrowRight", "End"] : []
    ],
    state: inputState,
    attrs: (state, context) => ({
      ...field.attrs(state, context),
      name: state.name,
      form: state.form,
      "aria-autocomplete": state.inline ? "both" : "list",
      "aria-controls": state.mounted ? listId(state, context.id) : void 0,
      "aria-labelledby": state.labeled ? `${context.id}-label` : void 0,
      required: state.required ? "" : void 0,
      readonly: state.readOnly ? "" : void 0,
      disabled: state.disabled ? "" : void 0,
      ...openAttrs(state.open),
      ...formAttrs(state)
    }),
    on: {
      ...field.on,
      focusin(event, { api, store }) {
        if (api.internal.options().openOnFocus && !store.get().open) {
          api.internal.show({ event, by: "keyboard", reason: "trigger-focus" });
        }
      },
      focusout(event, { api, store }) {
        const next = event.relatedTarget;
        if (!store.get().open) {
          return;
        }
        if (!next && store.get().presentation === "sheet") {
          return;
        }
        if (next && (api.internal.ownsElement(next) || api.internal.contentElement()?.contains(next))) {
          return;
        }
        if (!next && !document.hasFocus()) {
          return;
        }
        api.internal.hide({ reason: "focus-out", event });
      }
    },
    // A press on the field reopens suggestions that open on focus, like after Escape closed them.
    press({ api, store }, event) {
      if (store.get().open || !api.internal.options().openOnFocus) {
        return;
      }
      api.internal.show({ event, by: openerOf(event), reason: "trigger-press" });
    },
    bind(el, context) {
      const { api, id } = context;
      const input = el;
      if (dev) {
        warnIfUnnamed(
          el,
          "The field has no accessible name. Add an AutocompleteLabel, a Field label or an aria-label.",
          { component: "autocomplete", id }
        );
      }
      const cleanups = [
        field.bind(el, context),
        api.internal.bindReset(input),
        watchFieldsets(input, api.internal.setFormDisabled),
        bindSheetInput(el, {
          store: context.store,
          presentation: api.internal.presentation,
          open: (event) => api.internal.show({ event, by: "touch", reason: "trigger-press" })
        })
      ];
      return () => cleanups.forEach((cleanup) => cleanup());
    }
  }),
  // A button that opens and closes the suggestions. Out of the tab order, since the field already does it.
  trigger: slot({
    state: inputState,
    attrs: (state, { id }) => ({
      type: "button",
      tabindex: "-1",
      "aria-expanded": String(state.open),
      "aria-controls": state.mounted ? listId(state, id) : void 0,
      disabled: isDisabled(state) ? "" : void 0,
      ...openAttrs(state.open),
      ...formAttrs(state)
    }),
    on: pressKeepsFocus,
    press({ api, store }, event) {
      api.internal.inputElement()?.focus({ preventScroll: true });
      if (store.get().open) {
        api.internal.hide({ reason: "trigger-press", event });
      } else {
        api.internal.show({ event, by: "pointer", reason: "trigger-press" });
      }
    }
  }),
  // A button that empties the field. Shown while there's text to clear.
  clear: slot({
    props: { keepMounted: "boolean" },
    present: (state, { props }) => !!props.keepMounted || state.value !== "" && !isLocked(state),
    state: (state) => ({ disabled: isLocked(state) }),
    attrs: (state) => ({
      type: "button",
      tabindex: "-1",
      disabled: isDisabled(state) ? "" : void 0,
      "data-disabled": isLocked(state) ? "" : void 0
    }),
    on: pressKeepsFocus,
    press({ api }) {
      api.clear({ reason: "clear-press" });
      api.internal.inputElement()?.focus({ preventScroll: true });
    }
  }),
  content: slot({
    ...listContentPart(),
    state: contentState
  }),
  // The full-screen element suggestions presented as a sheet sit in, and the
  // header at the top of the content that the field moves into while the
  // sheet is open. The adapters render both, inside the content's.
  viewport: slot({ present: (state) => state.presentation === "sheet" }),
  header: slot({
    present: (state) => state.presentation === "sheet" && state.open
  }),
  list: slot({
    ...listPart(),
    state: contentState
  }),
  item: slot({
    ...optionPart(),
    selects: selects({
      highlighted: ({ key }) => [key],
      listing: ({ key }) => [key],
      ...unreadByItems
    }),
    state: (state, { key, props }) => ({
      highlighted: state.highlighted === key,
      disabled: !!props.disabled
    })
  }),
  // The suggestion's text, with what the field's text matched in `<mark>`.
  "item-text": slot(
    itemTextPart()
  ),
  // An icon inside a suggestion.
  "item-icon": slot(
    itemIconPart({
      component: "autocomplete",
      ...optionIcon
    })
  ),
  group: slot(optionGroupPart()),
  "group-label": slot(groupLabelPart()),
  separator: slot(optionSeparatorPart()),
  empty: slot(emptyPart()),
  status: slot(statusPart()),
  arrow: slot(
    arrowPart()
  )
});
export {
  autocompleteSlots
};
