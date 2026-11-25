// src/components/command/command.ts
import "../../foundation/lists/async-options.js";
import { commandSlots } from "./command-parts.js";
import {
  commandApi,
  initialCommandState,
  syncCommandState
} from "./command-api.js";
import "../../foundation/lists/autocomplete-core.js";
import {
  filterAttribute
} from "../../foundation/lists/listbox.js";
import "../../foundation/lists/item-icon.js";
import "../../foundation/lists/listbox-search.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function createCommandController() {
  return createController();
}
var commandPrimitive = /* @__PURE__ */ definePrimitive({
  name: "command",
  // `onAction`'s Promise makes the command pending.
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    query: "string",
    defaultQuery: "string",
    onQueryChange: "callback",
    pages: "list",
    defaultPages: "list",
    onPagesChange: "callback",
    onAction: "action",
    pendingAnnouncement: "string",
    items: "value",
    emptyItems: "value",
    filter: filterAttribute(["contains", "startsWith", "fuzzy"], "fuzzy"),
    autoHighlight: "boolean",
    loop: "boolean",
    status: "string",
    onLoadMore: "callback",
    announcement: "value",
    controller: "value"
  },
  state: initialCommandState,
  live: ["value", "highlighted"],
  controlled: ["value", "query", "pages"],
  sync: syncCommandState,
  api: commandApi,
  slots: (slot) => commandSlots(slot),
  agent: { actions: ["run", "setValue", "setQuery", "setPages"] }
});
var command = commandPrimitive;
export {
  command,
  createCommandController
};
