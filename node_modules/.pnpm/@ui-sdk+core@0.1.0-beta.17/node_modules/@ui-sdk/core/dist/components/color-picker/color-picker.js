// src/components/color-picker/color-picker.ts
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import { colorPickerApi, initialState, syncState } from "./color-picker-api.js";
import { colorPickerSlots } from "./color-picker-parts.js";
function createColorPickerController() {
  return createController();
}
var colorPickerPrimitive = /* @__PURE__ */ definePrimitive({
  name: "color-picker",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    onValueCommit: "callback",
    space: "string",
    format: "string",
    gamut: (attribute) => attribute === "false" ? false : attribute ?? void 0,
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    controller: "value"
  },
  state: initialState,
  sync: syncState,
  commits: ["value"],
  api: colorPickerApi,
  slots: colorPickerSlots,
  agent: { actions: ["setValue"] }
});
var colorPicker = colorPickerPrimitive;
export {
  colorPicker,
  createColorPickerController
};
