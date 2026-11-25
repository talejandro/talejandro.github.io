// src/components/date-picker/date-picker.ts
import "../../foundation/date/plain-date.js";
import "../../foundation/platform/position.js";
import "../../foundation/popups/popup.js";
import "../../foundation/popups/dismissal.js";
import "../../foundation/popups/presentation.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  datePickerApi,
  initialDatePickerState,
  syncDatePickerState
} from "./date-picker-api.js";
import { datePickerSlots } from "./date-picker-parts.js";
function createDatePickerController() {
  return createController();
}
var datePickerPrimitive = /* @__PURE__ */ definePrimitive({
  name: "date-picker",
  options: {
    month: "string",
    defaultMonth: "string",
    min: "string",
    max: "string",
    unavailable: "list",
    disabled: "boolean",
    readOnly: "boolean",
    months: "number",
    pageBy: "string",
    locale: "string",
    weekStartsOn: "number",
    weekdayFormat: "string",
    monthFormat: "string",
    fixedWeeks: "boolean",
    showOutsideDays: "boolean",
    today: "string",
    timeZone: "string",
    minDays: "number",
    maxDays: "number",
    allowUnavailable: "boolean",
    container: "value",
    mode: "string",
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    onMonthChange: "callback",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
    onOpenChangeComplete: "callback",
    closeOnSelect: "boolean",
    presentation: "string",
    name: "string",
    startName: "string",
    endName: "string",
    form: "string",
    required: "boolean",
    controller: "value",
    dismissible: "boolean",
    onDismissAttempt: "callback"
  },
  state: initialDatePickerState,
  controlled: ["value", "month", "open"],
  sync: syncDatePickerState,
  api: datePickerApi,
  // An arrow function, so TypeScript infers the slot names before it checks the parts.
  slots: (slot) => datePickerSlots(slot),
  agent: {
    actions: ["setOpen", "setValue", "clear", "setMonth", "previous", "next"],
    // Its value is a date, not an item, so a step never opens the calendar to look for one.
    items: () => []
  }
});
var datePicker = datePickerPrimitive;
export {
  createDatePickerController,
  datePicker
};
