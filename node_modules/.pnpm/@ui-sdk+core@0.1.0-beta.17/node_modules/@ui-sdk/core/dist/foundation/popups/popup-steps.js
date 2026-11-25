// src/foundation/popups/popup-steps.ts
import { popupResult } from "../kernel/action.js";
import { changeSource } from "../kernel/input-source.js";
import {
  createPopupLayer
} from "./popup.js";
function unopened(reason, event) {
  return popupResult(
    Promise.resolve({
      reason,
      source: changeSource(reason, event)
    })
  );
}
function createOpenSteps(config) {
  const { popup, store, rules = {} } = config;
  const imperative = "imperative";
  const triggerPress = "trigger-press";
  let pending;
  let requested;
  let openAnchor;
  popup.observe((open) => {
    const closed = open ? void 0 : requested ?? { reason: imperative, source: "programmatic" };
    requested = void 0;
    if (!closed) {
      return;
    }
    pending?.resolve(closed);
    pending = void 0;
    return closed;
  });
  config.onDestroy(() => {
    pending?.resolve({ reason: "unmount", source: "programmatic" });
    pending = void 0;
  });
  function result(signal) {
    if (!pending) {
      let resolve;
      const promise = popupResult(
        new Promise((done) => resolve = done)
      );
      pending = { promise, resolve };
    }
    if (signal && !signal.aborted) {
      const abort = () => popup.requestClose("imperative");
      signal.addEventListener("abort", abort, { once: true });
      pending.promise.then(() => signal.removeEventListener("abort", abort));
    }
    return pending.promise;
  }
  function show(request = {}, openReason) {
    return attempt(request, openReason).result;
  }
  function attempt(request, openReason) {
    const { event, signal } = request;
    if (signal?.aborted) {
      return { opened: false, result: unopened(imperative) };
    }
    const payloadReason = request.reason ?? (event ? triggerPress : imperative);
    const reason = openReason ?? payloadReason;
    const settled = { ...request, reason, payloadReason };
    let opened = false;
    const open = (by = request.by ?? "imperative") => {
      openAnchor = request.anchor;
      const restorePayload = config.payload?.opening(
        request.trigger,
        request.payload,
        {
          reason: payloadReason,
          event
        }
      );
      popup.opening(by, event);
      opened = config.change(true, { reason, event });
      if (!opened) {
        restorePayload?.();
      }
      return opened;
    };
    if (store.get().open) {
      if (popup.opener() === "hover" && request.by !== "hover") {
        popup.opening(request.by ?? "imperative", event);
      }
      if (request.trigger === void 0 && config.payload?.reopening(request, { reason: payloadReason }) && request.anchor) {
        openAnchor = request.anchor;
      }
      rules.reopen?.(settled, open);
      return { opened, result: result(signal) };
    }
    if (rules.open) {
      rules.open(settled, open);
    } else {
      open();
    }
    return {
      opened,
      result: opened ? result(signal) : unopened(reason, event)
    };
  }
  function hide(request = {}) {
    if (!store.get().open) {
      return false;
    }
    const { event, returnValue } = request;
    const reason = request.reason ?? imperative;
    if (config.dismissal && !config.dismissal.allows(reason, event)) {
      return false;
    }
    let closed = false;
    const close = () => {
      requested = { reason, source: changeSource(reason, event), returnValue };
      popup.returnFocus(request.focus ?? config.returnFocus ?? true);
      const changed = config.change(false, {
        reason,
        event,
        ...returnValue !== void 0 && { returnValue }
      });
      if (!changed) {
        popup.returnFocus(true);
        requested = void 0;
      }
      closed = changed;
      return changed;
    };
    if (rules.close) {
      rules.close({ ...request, reason }, close);
    } else {
      close();
    }
    return closed;
  }
  function takeOver({
    trigger,
    payload,
    anchor,
    reason,
    event
  }) {
    openAnchor = anchor;
    config.payload?.handOver(trigger, payload, { reason, event });
  }
  const showFor = (reason, event) => attempt(
    { reason: imperative, event },
    reason
  ).opened;
  return {
    // The controller's methods. Components add `focus` and `getPayload` themselves, so lists don't expose a payload.
    api: {
      isOpen: () => store.get().open,
      setOpen: (open, { reason, event } = {}) => open ? showFor(reason, event) : hide({ reason, event }),
      // An app's event is no trigger's, so the reason stays "imperative" unless it names one.
      open: (options = {}) => show({ ...options, reason: options.reason ?? imperative }),
      close: ({
        reason,
        event,
        returnValue
      } = {}) => hide({ reason, event, returnValue }),
      toggle: ({ reason, event } = {}) => store.get().open ? hide({ reason, event }) : showFor(reason, event)
    },
    show,
    attempt,
    hide,
    takeOver,
    // The next close, for an `open()` that opened the popup its own way.
    result,
    // A controller's or a take-over's anchor. The component falls back to its own.
    anchor: () => openAnchor
  };
}
function createSteppedPopup(layer, steps) {
  const popup = createPopupLayer(layer);
  return {
    popup,
    steps: createOpenSteps({ ...steps, popup, store: layer.store })
  };
}
export {
  createOpenSteps,
  createSteppedPopup,
  unopened
};
