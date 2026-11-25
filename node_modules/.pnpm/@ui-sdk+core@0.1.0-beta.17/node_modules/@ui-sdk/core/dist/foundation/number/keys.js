// src/foundation/number/keys.ts
import { isComposing } from "../kernel/events.js";
function stepFromKey(event, {
  orientation = "horizontal",
  dir = "ltr",
  arrows = "all"
} = {}) {
  if (isComposing(event)) {
    return null;
  }
  if (event.key === "Home") {
    return { bound: "min" };
  }
  if (event.key === "End") {
    return { bound: "max" };
  }
  if (event.key === "PageUp" || event.key === "PageDown") {
    return {
      direction: event.key === "PageUp" ? 1 : -1,
      size: "large"
    };
  }
  const flip = dir === "rtl" && orientation === "horizontal" ? -1 : 1;
  const vertical = arrows === "horizontal" ? 0 : event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
  const horizontal = arrows === "vertical" ? 0 : event.key === "ArrowRight" ? flip : event.key === "ArrowLeft" ? -flip : 0;
  const direction = vertical || horizontal;
  if (!direction) {
    return null;
  }
  return {
    direction,
    size: event.shiftKey ? "large" : event.altKey ? "small" : "step"
  };
}
export {
  stepFromKey
};
