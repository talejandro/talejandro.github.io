// src/components/calendar/calendar.ts
import { watchFormDisabled } from "../../foundation/forms/form.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  calendarApi,
  calendarSlots,
  calendarState,
  calendarSync,
  isDisabled
} from "./calendar-api.js";
function createCalendarController() {
  return createController();
}
var calendarPrimitiveApi = (context) => calendarApi(context);
var calendarPrimitive = /* @__PURE__ */ definePrimitive({
  name: "calendar",
  options: {
    mode: "string",
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    onMonthChange: "callback",
    month: "string",
    defaultMonth: "string",
    min: "string",
    max: "string",
    unavailable: "list",
    disabled: "boolean",
    readOnly: "boolean",
    deselectable: "boolean",
    onFocusedChange: "callback",
    onAnchorChange: "callback",
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
    controller: "value"
  },
  state: calendarState,
  controlled: ["value", "month"],
  sync: calendarSync,
  api: calendarPrimitiveApi,
  slots: (slot) => ({
    root: slot({
      state: (state) => ({
        value: state.value,
        month: state.month,
        mode: state.mode,
        disabled: isDisabled(state),
        readOnly: state.readOnly,
        focused: state.focused,
        anchor: state.anchor
      }),
      attrs: (state) => ({
        "data-mode": state.mode,
        "data-disabled": isDisabled(state) ? "" : void 0,
        "data-readonly": state.readOnly ? "" : void 0
      }),
      bind(el, { api, store }) {
        const cleanups = [
          watchFormDisabled(el, store),
          api.internal.bindRoot(el)
        ];
        return () => cleanups.forEach((cleanup) => cleanup?.());
      }
    }),
    ...calendarSlots(slot)
  }),
  agent: { actions: ["setValue", "setMonth", "previous", "next"] }
});
var calendar = calendarPrimitive;
export {
  calendar,
  createCalendarController
};
