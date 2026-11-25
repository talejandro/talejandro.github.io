// src/foundation/popups/popup-payload.ts
function createPopupPayload(store, change) {
  return {
    // Call before an open fires `onOpenChange`, so it reads the new payload.
    // Returns what puts the trigger and payload back, for an open that was canceled.
    opening(trigger, payload, details) {
      const previous = {
        trigger: store.get().trigger,
        payload: store.get().payload
      };
      if (trigger !== void 0) {
        store.set({ trigger });
      }
      change(payload, details);
      return () => store.set(previous);
    },
    // Another trigger takes the open popup over, with its own payload.
    handOver(trigger, payload, details) {
      store.set({ trigger });
      change(payload, details);
    },
    // A controller opens the popup while it's open. A payload it passes
    // replaces the current one, like a handover, and the trigger key stays, as
    // when a controller opens it closed. Without a payload nothing changes.
    // Returns whether the payload changed, so the caller can move its anchor too.
    reopening(openOptions, details) {
      return "payload" in openOptions && change(openOptions.payload, details);
    }
  };
}
export {
  createPopupPayload
};
