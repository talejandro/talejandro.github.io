// src/components/listbox/listbox-root.ts
import "../../foundation/lists/item-icon.js";
import "../../foundation/lists/listbox.js";
import { listboxSlots } from "./listbox-root-parts.js";
import {
  initialListboxStore,
  listboxApi,
  syncListboxStore
} from "./listbox-root-api.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function createListboxController() {
  return createController();
}
var listboxPrimitive = /* @__PURE__ */ definePrimitive({
  name: "listbox",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    multiple: "boolean",
    activation: "string",
    deselectable: "boolean",
    orientation: "string",
    loop: "boolean",
    virtualFocus: "boolean",
    keepInView: "boolean",
    items: "value",
    itemToValue: "value",
    isItemEqualToValue: "value",
    onHighlight: "callback",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    controller: "value"
  },
  state: initialListboxStore,
  live: ["highlighted"],
  sync: syncListboxStore,
  api: listboxApi,
  // An arrow function, so TypeScript infers the slot names before it checks the parts.
  slots: (slot) => listboxSlots(slot),
  agent: { actions: ["setValue", "clear", "selectAll"], closed: true }
});
var listbox = listboxPrimitive;
export {
  createListboxController,
  listbox
};
