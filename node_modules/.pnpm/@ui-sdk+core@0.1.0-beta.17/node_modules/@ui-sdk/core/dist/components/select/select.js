// src/components/select/select.ts
import "../../foundation/lists/async-options.js";
import "../../foundation/popups/popup.js";
import { pointerModalAttribute } from "../../foundation/popups/modal-attribute.js";
import "../../foundation/platform/position.js";
import {
  filterAttribute
} from "../../foundation/lists/listbox.js";
import "../../foundation/lists/item-icon.js";
import "../../foundation/lists/listbox-search.js";
import "../../foundation/lists/listbox-select-all.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  selectSlots
} from "./select-parts.js";
import { initialSelectState, selectApi, syncSelectState } from "./select-api.js";
import "../../foundation/popups/dismissal.js";
function createSelectController() {
  return createController();
}
var selectPrimitive = /* @__PURE__ */ definePrimitive({
  name: "select",
  options: {
    container: "value",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
    onOpenChangeComplete: "callback",
    multiple: "boolean",
    items: "value",
    emptyItems: "value",
    query: "string",
    defaultQuery: "string",
    onQueryChange: "callback",
    filter: filterAttribute(["contains", "startsWith"], "contains"),
    status: "string",
    onLoadMore: "callback",
    announcement: "value",
    placeholder: "string",
    itemToValue: "value",
    itemToLabel: "value",
    isItemEqualToValue: "value",
    onHighlight: "callback",
    loop: "boolean",
    virtualFocus: "boolean",
    modal: pointerModalAttribute,
    presentation: "string",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    autoComplete: "string",
    controller: "value",
    dismissible: "boolean",
    onDismissAttempt: "callback"
  },
  state: initialSelectState,
  live: ["highlighted", "labels"],
  controlled: ["open", "value", "query"],
  sync: syncSelectState,
  api: selectApi,
  // An arrow function, so TypeScript infers the slot names before it checks the parts.
  slots: (slot) => selectSlots(slot),
  agent: {
    actions: ["setOpen", "setValue", "clear", "setQuery"],
    closed: true
  }
});
var select = selectPrimitive;
export {
  createSelectController,
  select
};
