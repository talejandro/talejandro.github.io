// src/components/switch/switch.ts
import {
  switchState,
  syncToggle,
  toggleControl,
  toggleDataAttrs,
  toggleSlots,
  toggleState
} from "../../foundation/forms/toggle-control.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function createSwitchController() {
  return createController();
}
var switchDefinition = /* @__PURE__ */ definePrimitive({
  name: "switch",
  options: {
    checked: "boolean",
    defaultChecked: "boolean",
    onCheckedChange: "callback",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    value: "string",
    form: "string",
    controller: "value"
  },
  state: (options) => toggleState(options),
  controlled: ["checked"],
  sync: syncToggle,
  api: (context) => toggleControl(context, createChange(context)),
  slots: (slot) => ({
    ...toggleSlots("switch", slot, switchState),
    // The part that slides.
    thumb: slot({
      state: switchState,
      attrs: (state) => toggleDataAttrs(state)
    })
  }),
  agent: { actions: ["setChecked"] }
});
var switchPrimitive = switchDefinition;
export {
  createSwitchController,
  switchPrimitive
};
