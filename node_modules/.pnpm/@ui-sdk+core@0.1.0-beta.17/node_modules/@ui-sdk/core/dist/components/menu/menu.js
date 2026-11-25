// src/components/menu/menu.ts
import { initialApple } from "../../foundation/platform/platform.js";
import {
  createPopupController
} from "../../foundation/popups/popup.js";
import { pointerModalAttribute } from "../../foundation/popups/modal-attribute.js";
import "../../foundation/platform/position.js";
import "../../foundation/popups/presentation.js";
import "../../foundation/lists/item-icon.js";
import "../../foundation/lists/listbox.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import "../../foundation/popups/dismissal.js";
import {
  menuApi
} from "./menu-api.js";
import {
  menuSlots
} from "./menu-parts.js";
function createMenuController() {
  return createPopupController();
}
var menuPrimitive = /* @__PURE__ */ definePrimitive({
  name: "menu",
  options: {
    container: "value",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
    onOpenChangeComplete: "callback",
    onPayloadChange: "callback",
    onAction: "action",
    pendingAnnouncement: "string",
    onCheckedChange: "callback",
    onValueChange: "callback",
    items: "value",
    itemShortcuts: "boolean",
    loop: "boolean",
    delay: "number",
    presentation: "string",
    controller: "value",
    modal: pointerModalAttribute,
    dismissible: "boolean",
    onDismissAttempt: "callback",
    // Internal: passed by renderers.
    parent: "value",
    menubar: "value"
  },
  state: (options) => ({
    open: options.defaultOpen ?? false,
    mounted: options.open ?? options.defaultOpen ?? false,
    highlighted: null,
    values: {},
    presentation: "popover",
    openChild: null,
    apple: initialApple(),
    trigger: null,
    payload: void 0,
    barStop: null,
    barDisabled: !options.parent && !!options.menubar?.()?.internal.disabled(),
    groupLabels: [],
    triggers: [],
    triggerElements: {},
    shortcutItems: void 0,
    pending: [],
    error: null
  }),
  live: ["highlighted", "shortcutItems"],
  sync: (options) => ({
    shortcutItems: options.itemShortcuts === false ? void 0 : options.items,
    ...options.open === void 0 ? {} : { open: options.open }
  }),
  api: (context) => {
    const api = menuApi(context);
    const parent = context.options().parent;
    parent?.internal.children.add(api);
    context.onDestroy(() => parent?.internal.children.delete(api));
    return api;
  },
  // Checked items keep their state in one record, `values`, so every slot
  // says which of its entries it reads: a toggle reaches the item and its
  // indicator, not every part (`packages/core/test/selects.test.ts`).
  slots: menuSlots,
  agent: { actions: ["setOpen"] }
});
var menu = menuPrimitive;
export {
  createMenuController,
  menu
};
