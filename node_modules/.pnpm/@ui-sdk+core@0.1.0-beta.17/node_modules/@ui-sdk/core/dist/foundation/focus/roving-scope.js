// src/foundation/focus/roving-scope.ts
import { select } from "../kernel/selects.js";
import { subscribeSkipping } from "../kernel/store.js";
var memberDisabled = (item) => !!item.props.disabled?.();
var memberFocusable = (item) => item.props.focusable?.() ?? true;
function queued(run) {
  let waiting = false;
  return () => {
    if (waiting) {
      return;
    }
    waiting = true;
    queueMicrotask(() => {
      waiting = false;
      run();
    });
  };
}
var stopOnly = { stop: true };
function followStop(store, key, listener) {
  const cleanups = [
    subscribeSkipping(store, stopOnly, listener),
    select(store, "stop", key, listener),
    select(store, "stop", null, listener)
  ];
  return () => cleanups.forEach((cleanup) => cleanup());
}
export {
  followStop,
  memberDisabled,
  memberFocusable,
  queued
};
