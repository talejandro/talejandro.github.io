// src/components/token-input/token-input.ts
import { createController } from "../../foundation/kernel/controller.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
import {
  fromText
} from "./token-input-model.js";
import { tokenInputSlots } from "./token-input-parts.js";
import {
  initialTokenInputState,
  syncTokenInputState,
  tokenInputApi
} from "./token-input-api.js";
import { defaultCodec, fromText as fromText2, toLabel, toText } from "./token-input-model.js";
function createTokenInputController() {
  return createController();
}
var valueAttribute = (attribute) => attribute === null ? void 0 : fromText(attribute);
var tokenInputPrimitive = /* @__PURE__ */ definePrimitive({
  name: "token-input",
  options: {
    value: valueAttribute,
    defaultValue: "value",
    onValueChange: "callback",
    onSubmit: "callback",
    submitShortcut: "string",
    tokenDeletion: "string",
    copy: "string",
    codec: "value",
    getTokenDescription: "value",
    history: "value",
    disabled: "boolean",
    readOnly: "boolean",
    required: "boolean",
    name: "string",
    form: "string",
    controller: "value"
  },
  state: initialTokenInputState,
  live: ["selected"],
  sync: syncTokenInputState,
  api: tokenInputApi,
  slots: (slot) => tokenInputSlots(slot),
  agent: { actions: ["setValue", "insert", "removeToken", "clear"] }
});
var tokenInput = tokenInputPrimitive;
export {
  createTokenInputController,
  defaultCodec,
  fromText2 as fromText,
  toLabel,
  toText,
  tokenInput
};
