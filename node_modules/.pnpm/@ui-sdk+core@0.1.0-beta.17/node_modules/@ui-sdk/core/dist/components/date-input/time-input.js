// src/components/date-input/time-input.ts
import {
  dateInputApi,
  initialDateInputState,
  optionKinds,
  syncDateInputState
} from "./date-input-api.js";
import { dateInputSlots } from "./date-input-parts.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function createTimeInputController() {
  return createController();
}
var { unavailable: _, ...timeOptionKinds } = optionKinds;
var timeInputPrimitive = /* @__PURE__ */ definePrimitive({
  name: "time-input",
  options: timeOptionKinds,
  state: (options) => initialDateInputState("time", options),
  sync: (options) => syncDateInputState("time", options),
  api: dateInputApi,
  slots: (slot) => dateInputSlots(slot),
  agent: { actions: ["setValue", "clear"] }
});
var timeInput = timeInputPrimitive;
export {
  createTimeInputController,
  timeInput
};
