// src/foundation/popups/dismissal.ts
import {
  isDismissal
} from "../kernel/details.js";
function createDismissal(options, rules = {}) {
  const dismissible = () => options().dismissible !== false;
  const attempt = (reason, event) => options().onDismissAttempt?.({
    reason,
    event
  });
  return {
    allows(reason, event) {
      const refused = rules.refusal?.(reason) ?? (isDismissal(reason) && !dismissible() ? "attempt" : void 0);
      if (!refused) {
        return true;
      }
      if (refused === "attempt" && reason !== "focus-out" && reason !== "window-blur") {
        attempt(reason, event);
        rules.refused?.(reason);
      }
      return false;
    },
    sheet: {
      dismissible,
      onDismissAttempt: (event) => attempt("swipe", event)
    }
  };
}
export {
  createDismissal
};
