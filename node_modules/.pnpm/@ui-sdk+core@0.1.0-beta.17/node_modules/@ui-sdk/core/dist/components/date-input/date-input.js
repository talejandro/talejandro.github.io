// src/components/date-input/date-input.ts
import {
  dateInputApi,
  initialDateInputState,
  optionKinds,
  syncDateInputState
} from "./date-input-api.js";
import { dateInputSlots } from "./date-input-parts.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function createDateInputController() {
  return createController();
}
var dateInputPrimitive = /* @__PURE__ */ definePrimitive({
  name: "date-input",
  options: optionKinds,
  state: (options) => initialDateInputState("date", options),
  sync: (options) => syncDateInputState("date", options),
  api: dateInputApi,
  slots: (slot) => dateInputSlots(slot),
  agent: { actions: ["setValue", "clear"] }
});
var dateInput = dateInputPrimitive;
export {
  createDateInputController,
  dateInput
};
