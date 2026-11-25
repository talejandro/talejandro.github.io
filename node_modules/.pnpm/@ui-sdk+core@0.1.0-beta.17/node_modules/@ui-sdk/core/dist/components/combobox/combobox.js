// src/components/combobox/combobox.ts
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
  comboboxSlots
} from "./combobox-parts.js";
import {
  comboboxApi,
  initialComboboxState,
  syncComboboxState
} from "./combobox-api.js";
import "../../foundation/popups/dismissal.js";
function createComboboxController() {
  return createController();
}
var comboboxPrimitive = /* @__PURE__ */ definePrimitive({
  name: "combobox",
  options: {
    container: "value",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    query: "string",
    defaultQuery: "string",
    onQueryChange: "callback",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
    onOpenChangeComplete: "callback",
    multiple: "boolean",
    maxSelected: "number",
    pendingAnnouncement: "string",
    items: "value",
    emptyItems: "value",
    filter: filterAttribute(["contains", "startsWith"], "contains"),
    itemToValue: "value",
    itemToLabel: "value",
    isItemEqualToValue: "value",
    autoHighlight: (attribute) => attribute === null ? void 0 : attribute === "always" || attribute === "selected" ? attribute : attribute !== "false",
    keepQuery: "boolean",
    allowCustomValue: "boolean",
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
  state: initialComboboxState,
  live: ["highlighted", "labels"],
  controlled: ["open", "value", "query"],
  sync: syncComboboxState,
  api: comboboxApi,
  // An arrow function, so TypeScript infers the slot names before it checks the parts.
  slots: (slot) => comboboxSlots(slot),
  agent: {
    actions: ["setOpen", "setValue", "clear", "setQuery"],
    closed: true
  }
});
var combobox = comboboxPrimitive;
export {
  combobox,
  createComboboxController
};
