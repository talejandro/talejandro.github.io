// src/foundation/kernel/action.ts
import { note } from "#dev";
import { withSource } from "./details.js";
var DEFAULT_PENDING_ANNOUNCEMENT = "Loading";
var PENDING_ANNOUNCE_DELAY = 1e3;
var popupResults = /* @__PURE__ */ new WeakSet();
var popupResult = (promise) => (popupResults.add(promise), promise);
var isPromise = (value) => !!value && typeof value.then === "function" && !popupResults.has(value);
var canceledAction = /* @__PURE__ */ Symbol("canceled action");
function runAction(action, source, handlers) {
  const failed = (error) => {
    note(
      "an action failed. The error is in its part's `error` state.",
      void 0,
      error
    );
    handlers.failed(error);
  };
  const done = () => withSource(source, handlers.done);
  let result;
  try {
    result = action({ source });
  } catch (error) {
    return failed(error);
  }
  if (result === canceledAction) {
    return;
  }
  if (!isPromise(result)) {
    return done();
  }
  handlers.pending(true);
  result.then(
    () => {
      handlers.pending(false);
      done();
    },
    (error) => {
      handlers.pending(false);
      failed(error);
    }
  );
}
function announcePending(context, isPending) {
  const say = () => {
    const text = context.options().pendingAnnouncement ?? DEFAULT_PENDING_ANNOUNCEMENT;
    import("../platform/announce.js").then(
      ({ announce }) => wasPending && announce(text),
      () => {
      }
    );
  };
  let timer;
  let wasPending = false;
  const unsubscribe = context.store.subscribe(() => {
    const pending = isPending();
    if (pending === wasPending) {
      return;
    }
    wasPending = pending;
    clearTimeout(timer);
    if (pending) {
      timer = setTimeout(say, PENDING_ANNOUNCE_DELAY);
    }
  });
  context.onDestroy(() => {
    wasPending = false;
    clearTimeout(timer);
    unsubscribe();
  });
}
export {
  announcePending,
  canceledAction,
  isPromise,
  popupResult,
  runAction
};
