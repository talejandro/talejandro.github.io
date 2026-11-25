// src/foundation/popups/hover.ts
import { on } from "../kernel/events.js";
import { bridgeBetween } from "./bridge.js";
function createHoverIntent(options) {
  let openTimer;
  let closeTimer;
  let stopBridge;
  function stopWatching() {
    stopBridge?.();
    stopBridge = void 0;
  }
  function clear() {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    stopWatching();
  }
  function scheduleClose(event) {
    stopWatching();
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => options.close(event), options.closeDelay());
  }
  return {
    clear,
    // The pointer entered the trigger or the popup. Entering either keeps an
    // open popup open. From the trigger, `open` runs after `delay`, at once
    // for 0. Touch has no hover, so a tap never counts.
    enter(event, open, delay = 0) {
      if (event.pointerType === "touch") {
        return;
      }
      clearTimeout(closeTimer);
      stopWatching();
      if (!open) {
        return;
      }
      clearTimeout(openTimer);
      if (delay > 0) {
        openTimer = setTimeout(open, delay);
      } else {
        open();
      }
    },
    // The pointer left the trigger or the popup. A pending open is dropped.
    // On its way between the two, the popup stays open until the pointer
    // leaves the area that spans both.
    leave(event) {
      if (event.pointerType === "touch") {
        return;
      }
      clearTimeout(openTimer);
      if (!options.closesOnLeave()) {
        return;
      }
      const trigger = options.trigger();
      const popup = options.popup();
      if (!trigger || !popup) {
        return scheduleClose(event);
      }
      const inside = bridgeBetween(
        trigger.getBoundingClientRect(),
        popup.getBoundingClientRect()
      );
      if (!inside(event.clientX, event.clientY)) {
        return scheduleClose(event);
      }
      stopWatching();
      stopBridge = on(popup.ownerDocument, "pointermove", (move) => {
        if (!inside(move.clientX, move.clientY)) {
          scheduleClose(move);
        }
      });
    }
  };
}
export {
  createHoverIntent
};
