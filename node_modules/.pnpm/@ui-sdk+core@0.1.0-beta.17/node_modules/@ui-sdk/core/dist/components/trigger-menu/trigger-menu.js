// src/components/trigger-menu/trigger-menu.ts
import "../../foundation/lists/async-options.js";
import "../../foundation/popups/popup.js";
import "../../foundation/platform/position.js";
import "../../foundation/lists/item-icon.js";
import "../../foundation/lists/listbox.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { triggerMenuSlots } from "./trigger-menu-parts.js";
import {
  initialTriggerMenuState,
  syncTriggerMenuState,
  triggerMenuApi
} from "./trigger-menu-api.js";
import "../../foundation/popups/dismissal.js";
import { textFieldAdapter } from "../../foundation/text/caret.js";
function createTriggerMenuController() {
  return createController();
}
var triggerMenuPrimitive = /* @__PURE__ */ definePrimitive({
  name: "trigger-menu",
  // `onSelect`'s Promise makes the token it inserts pending.
  options: {
    container: "value",
    triggers: "value",
    editor: "value",
    open: "boolean",
    onOpenChange: "callback",
    onOpenChangeComplete: "callback",
    onQueryChange: "callback",
    onSelect: "action",
    pendingAnnouncement: "string",
    status: "string",
    autoHighlight: "boolean",
    loop: "boolean",
    shortcut: "string",
    controller: "value",
    dismissible: "boolean",
    onDismissAttempt: "callback"
  },
  state: initialTriggerMenuState,
  live: ["highlighted", "navigated"],
  controlled: ["open"],
  sync: syncTriggerMenuState,
  api: triggerMenuApi,
  slots: (slot) => triggerMenuSlots(slot),
  agent: { actions: ["setOpen", "insert"] }
});
var triggerMenu = triggerMenuPrimitive;
export {
  createTriggerMenuController,
  textFieldAdapter,
  triggerMenu
};
