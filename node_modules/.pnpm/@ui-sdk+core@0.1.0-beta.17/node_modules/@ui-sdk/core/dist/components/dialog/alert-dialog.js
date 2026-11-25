// src/components/dialog/alert-dialog.ts
import { createPopupController } from "../../foundation/popups/popup.js";
import { isControllerAttached } from "../../foundation/kernel/controller.js";
import {
  overlays as sharedOverlays
} from "../../page/overlays/overlays.js";
import { defineDialog } from "./dialog-primitive.js";
function createAlertDialogController() {
  return createPopupController();
}
function createConfirm({
  overlays = sharedOverlays
} = {}) {
  const controller = createAlertDialogController();
  let previous = Promise.resolve();
  let unanswered = 0;
  let hosted = false;
  const own = () => isControllerAttached(controller) && !hosted;
  const ask = (payload) => new Promise((resolve) => {
    let opened = false;
    const id = overlays.mount("confirm", {
      controller,
      payload,
      // Once, even when a framework runs the host's effect twice, like React's StrictMode.
      open: () => {
        if (opened) {
          return;
        }
        opened = true;
        controller.open({ payload }).then(({ returnValue }) => resolve(returnValue === "confirm"));
      },
      done: () => {
        hosted = false;
        overlays.unmount(id);
        if (!opened) {
          resolve(false);
        }
      }
    });
    hosted = true;
  });
  const answer = (payload) => own() ? controller.open({ payload }).then(({ returnValue }) => returnValue === "confirm") : ask(payload);
  const confirm2 = (payload) => {
    const asked = !unanswered && own() ? answer(payload) : previous.then(() => answer(payload));
    unanswered++;
    asked.then(() => unanswered--);
    previous = asked;
    return asked;
  };
  return Object.assign(confirm2, {
    /** The alert dialog's controller. Pass it as the `controller` option of your own alert dialog. */
    controller
  });
}
var confirm = /* @__PURE__ */ createConfirm();
var alertDialogPrimitive = /* @__PURE__ */ defineDialog(
  "alert-dialog",
  true,
  {
    onOpenChange: "callback",
    onPayloadChange: "callback",
    controller: "value"
  }
);
var alertDialog = alertDialogPrimitive;
export {
  alertDialog,
  confirm,
  createAlertDialogController,
  createConfirm
};
