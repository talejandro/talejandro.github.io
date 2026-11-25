// src/components/autocomplete/autocomplete.ts
import "../../foundation/lists/async-options.js";
import { autocompleteSlots } from "./autocomplete-parts.js";
import {
  autocompleteApi,
  initialAutocompleteState,
  syncAutocompleteState
} from "./autocomplete-api.js";
import "../../foundation/popups/popup.js";
import { pointerModalAttribute } from "../../foundation/popups/modal-attribute.js";
import "../../foundation/platform/position.js";
import "../../foundation/lists/autocomplete-core.js";
import {
  filterAttribute
} from "../../foundation/lists/listbox.js";
import "../../foundation/lists/item-icon.js";
import "../../foundation/lists/listbox-search.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import "../../foundation/popups/dismissal.js";
function createAutocompleteController() {
  return createController();
}
var autocompletePrimitive = /* @__PURE__ */ definePrimitive({
  name: "autocomplete",
  options: {
    container: "value",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
    onOpenChangeComplete: "callback",
    onSubmit: "callback",
    items: "value",
    emptyItems: "value",
    filter: filterAttribute(["contains", "startsWith", "fuzzy"], "contains"),
    inlineComplete: "boolean",
    autoHighlight: "boolean",
    openOnFocus: "boolean",
    submitOnSelect: "boolean",
    status: "string",
    onHighlight: "callback",
    onLoadMore: "callback",
    announcement: "value",
    loop: "boolean",
    modal: pointerModalAttribute,
    presentation: "string",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    controller: "value",
    dismissible: "boolean",
    onDismissAttempt: "callback"
  },
  state: initialAutocompleteState,
  live: ["highlighted"],
  controlled: ["open", "value"],
  sync: syncAutocompleteState,
  api: autocompleteApi,
  slots: (slot) => autocompleteSlots(slot),
  agent: { actions: ["setOpen", "setValue", "clear"] }
});
var autocomplete = autocompletePrimitive;
export {
  autocomplete,
  createAutocompleteController
};
