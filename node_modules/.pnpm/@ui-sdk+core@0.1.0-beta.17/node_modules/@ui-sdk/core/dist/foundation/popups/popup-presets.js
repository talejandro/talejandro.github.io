// src/foundation/popups/popup-presets.ts
import { createDismissal } from "./dismissal.js";
import {
  hoverOpening,
  placement,
  pressOpening,
  styleReset,
  triggerName
} from "./popup-features.js";
import { createPopupPayload } from "./popup-payload.js";
import { createPresentation } from "./presentation.js";
function sheetPresentation(core, dismissal) {
  const dialog = core.preset.behavior === "dialog";
  if (dialog) {
    core.store.set({ presentation: "dialog" });
  }
  return createPresentation(
    core.store,
    () => core.popup,
    () => core.rules?.presentation ? core.rules.presentation() : core.options().presentation,
    dialog ? "dialog" : "popover",
    dismissal
  );
}
var popoverPreset = {
  payload: createPopupPayload,
  behavior: "popover",
  role: "dialog",
  dismissal: createDismissal,
  modal: false,
  placement,
  presentation: sheetPresentation,
  press: pressOpening,
  hover: hoverOpening,
  resetStyles: styleReset
};
var dialogPreset = {
  payload: createPopupPayload,
  behavior: "dialog",
  role: "dialog",
  dismissal: createDismissal,
  modal: true,
  presentation: sheetPresentation,
  press: pressOpening,
  triggerName,
  resetStyles: styleReset
};
var alertDialogPreset = {
  payload: createPopupPayload,
  behavior: "dialog",
  role: "alertdialog",
  dismissal: createDismissal,
  press: pressOpening,
  triggerName,
  resetStyles: styleReset
};
var drawerPreset = {
  payload: createPopupPayload,
  behavior: "dialog",
  role: "dialog",
  dismissal: createDismissal,
  press: pressOpening,
  triggerName,
  resetStyles: styleReset
};
var menuPreset = {
  payload: createPopupPayload,
  behavior: "menu",
  role: "menu",
  dismissal: createDismissal,
  placement,
  presentation: sheetPresentation
};
var selectPreset = {
  behavior: "select",
  modal: "pointer",
  dismissal: createDismissal,
  placement,
  presentation: sheetPresentation
};
var comboboxPreset = {
  behavior: "combobox",
  modal: false,
  dismissal: createDismissal,
  placement,
  presentation: sheetPresentation
};
var datePickerPreset = {
  behavior: "popover",
  dismissal: createDismissal,
  placement,
  presentation: sheetPresentation
};
var triggerMenuPreset = {
  behavior: "combobox",
  dismissal: createDismissal,
  placement
};
export {
  alertDialogPreset,
  comboboxPreset,
  datePickerPreset,
  dialogPreset,
  drawerPreset,
  menuPreset,
  popoverPreset,
  selectPreset,
  triggerMenuPreset
};
