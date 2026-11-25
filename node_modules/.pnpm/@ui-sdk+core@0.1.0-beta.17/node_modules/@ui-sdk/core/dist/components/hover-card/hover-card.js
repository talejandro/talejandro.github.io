// src/components/hover-card/hover-card.ts
import { createPopupController } from "../../foundation/popups/popup.js";
import "../../foundation/platform/position.js";
import {
  createPopup,
  popupState
} from "../../foundation/popups/create-popup.js";
import { hoverCardPreset } from "../../foundation/popups/popup-hover-presets.js";
import {
  popupArrow,
  popupContent,
  popupTrigger
} from "../../foundation/popups/popup-slots.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function createHoverCardController() {
  return createPopupController();
}
function hoverCardApiBody(context) {
  return createPopup(context, { preset: hoverCardPreset });
}
var hoverCardApi = hoverCardApiBody;
var hoverCardPrimitive = /* @__PURE__ */ definePrimitive({
  name: "hover-card",
  options: {
    container: "value",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
    onOpenChangeComplete: "callback",
    onPayloadChange: "callback",
    delay: "number",
    closeDelay: "number",
    disabled: "boolean",
    controller: "value"
  },
  state: (options) => popupState(options),
  sync: (options) => options.open === void 0 ? {} : { open: options.open },
  api: hoverCardApi,
  slots: (slot) => {
    const trigger = popupTrigger(slot);
    const content = popupContent(slot);
    return {
      // A link, usually. Pressing it follows the link, so only hover and focus open the card.
      trigger: slot({
        ...trigger,
        props: { id: "id", payload: "value" },
        state: (state, { key }) => ({
          open: state.open && (state.trigger === null || state.trigger === key)
        })
      }),
      content: slot({
        ...content,
        props: {
          side: "string",
          align: "string",
          sideOffset: "number",
          alignOffset: "number",
          collisionPadding: "number",
          container: "value",
          arrowPadding: "number",
          anchor: "string",
          keepMounted: "boolean"
        },
        state: (state) => ({ open: state.open, payload: state.payload })
      }),
      arrow: popupArrow(slot)
    };
  },
  agent: { actions: ["setOpen"] }
});
var hoverCard = hoverCardPrimitive;
export {
  createHoverCardController,
  hoverCard,
  hoverCardPreset
};
