// src/components/toast/toast.ts
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { toastSlots } from "./toast-parts.js";
import {
  hasToasts,
  initialToastState,
  syncToastState,
  toastRegionApi
} from "./toast-api.js";
import {
  createToaster,
  toast
} from "./toaster.js";
function shortcutAttribute(attribute) {
  if (attribute === null) {
    return void 0;
  }
  return attribute === "none" || attribute === "" ? null : attribute;
}
var toastRegionPrimitive = /* @__PURE__ */ definePrimitive({
  name: "toast",
  options: {
    toaster: "value",
    side: "string",
    align: "string",
    maxVisible: "number",
    expanded: "boolean",
    shortcut: shortcutAttribute,
    pendingAnnouncement: "string",
    // Internal: passed by renderers.
    placed: "boolean",
    label: "string"
  },
  state: initialToastState,
  sync: syncToastState,
  controlled: [],
  // Arrow functions, so TypeScript infers the slot names before it checks the api and the parts.
  api: (context) => toastRegionApi(context),
  slots: (slot) => toastSlots(slot),
  agent: { actions: ["pause"], shown: (state) => hasToasts(state.items) }
});
var toastRegion = toastRegionPrimitive;
export {
  createToaster,
  toast,
  toastRegion
};
