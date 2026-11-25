// src/components/dialog/dialog-primitive.ts
import { initialApple } from "../../foundation/platform/platform.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  dialogApi
} from "./dialog-api.js";
import { dialogSlots } from "./dialog-parts.js";
function defineDialog(name, alert, options, extension) {
  return definePrimitive({
    name,
    // Spread from the shared and own schemas, which TypeScript can't check
    // against `Options` while it's generic. Each half `satisfies` its type.
    options: {
      container: "value",
      open: "boolean",
      defaultOpen: "boolean",
      onOpenChangeComplete: "callback",
      dismissible: "boolean",
      onDismissAttempt: "callback",
      persistentElements: "list",
      pendingAnnouncement: "string",
      ...options
    },
    state: (options2) => ({
      open: options2.defaultOpen ?? false,
      mounted: options2.open ?? options2.defaultOpen ?? false,
      // Unknown until the parts bind: the server names an open dialog by its title.
      titled: null,
      described: false,
      trigger: null,
      payload: void 0,
      modal: true,
      nested: false,
      stack: 0,
      pending: null,
      errors: {},
      apple: initialApple(),
      presentation: "dialog"
    }),
    sync: (options2) => ({
      ...options2.open !== void 0 && { open: options2.open },
      // An alert dialog is always modal.
      modal: alert ? true : options2.modal ?? true
    }),
    api: (context) => dialogApi(
      context,
      alert,
      extension?.rules(context.store, context.options)
    ),
    // Without an extension there are no extra parts, and spreading undefined adds none.
    slots: (slot) => ({
      ...dialogSlots(slot, { name }),
      ...extension?.slots(slot)
    }),
    agent: { actions: ["setOpen"] }
  });
}
export {
  defineDialog
};
