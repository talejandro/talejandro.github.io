// src/foundation/popups/popup-hover-presets.ts
import {
  focusOpening,
  hoverOpening,
  placement,
  styleReset,
  warmGroup
} from "./popup-features.js";
import { createPopupPayload } from "./popup-payload.js";
var tooltipPreset = {
  payload: createPopupPayload,
  behavior: "tooltip",
  role: "tooltip",
  side: "top",
  delay: 600,
  closeDelay: 0,
  focusDelay: 0,
  placement,
  hover: hoverOpening,
  focus: focusOpening,
  group: warmGroup,
  resetStyles: styleReset
};
var hoverCardPreset = {
  payload: createPopupPayload,
  behavior: "hoverCard",
  delay: 600,
  closeDelay: 300,
  placement,
  hover: hoverOpening,
  focus: focusOpening,
  resetStyles: styleReset
};
export {
  hoverCardPreset,
  tooltipPreset
};
