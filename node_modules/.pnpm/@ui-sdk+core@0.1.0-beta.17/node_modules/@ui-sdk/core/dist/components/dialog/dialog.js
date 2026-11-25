// src/components/dialog/dialog.ts
import {
  createPopupController
} from "../../foundation/popups/popup.js";
import { modalAttribute } from "../../foundation/popups/modal-attribute.js";
import { dialogPreset } from "../../foundation/popups/popup-presets.js";
import { popupViewport } from "../../foundation/popups/popup-slots.js";
import { defineDialog } from "./dialog-primitive.js";
import {
  alertDialog,
  confirm,
  createAlertDialogController,
  createConfirm
} from "./alert-dialog.js";
function createDialogController() {
  return createPopupController();
}
var presentable = {
  rules() {
    let sheet;
    return {
      preset: dialogPreset,
      bind: () => ({ onSheet: (next) => sheet = next }),
      onRefuse: () => sheet?.nudge()
    };
  },
  slots: (slot) => ({
    viewport: popupViewport(slot)
  })
};
var dialogPrimitive = /* @__PURE__ */ defineDialog(
  "dialog",
  false,
  {
    onOpenChange: "callback",
    onPayloadChange: "callback",
    modal: modalAttribute,
    closeOnOutsidePress: "boolean",
    presentation: "string",
    controller: "value"
  },
  presentable
);
var dialog = dialogPrimitive;
export {
  alertDialog,
  confirm,
  createAlertDialogController,
  createConfirm,
  createDialogController,
  dialog,
  dialogPreset
};
