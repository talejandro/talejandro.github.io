// src/foundation/direct-manipulation/repeat.ts
import { on } from "../kernel/events.js";
import { bindHold } from "./hold.js";
function bindRepeatPresses(el, options, onRefuse) {
  const { delay = 400, repeat = 60, keys = [" ", "Enter"] } = options;
  let bound = true;
  let count = 0;
  let stopped = false;
  let inside = true;
  let unfollow;
  function step(event, input) {
    if (stopped) {
      return false;
    }
    count += 1;
    stopped = options.onStep?.({ event, input, count }) === false;
    return !stopped;
  }
  function follow(down) {
    const bounds = el.getBoundingClientRect();
    unfollow = on(el.ownerDocument, "pointermove", (move) => {
      if (move.pointerId !== down.pointerId) {
        return;
      }
      inside = move.clientX >= bounds.left && move.clientX <= bounds.right && move.clientY >= bounds.top && move.clientY <= bounds.bottom;
    });
  }
  function reset() {
    unfollow?.();
    unfollow = void 0;
    inside = true;
  }
  const unbindHold = bindHold(el, {
    delay,
    repeat,
    keys,
    tolerance: Infinity,
    disabled: options.disabled,
    onPress: (press) => {
      if (options.onPress?.(press) === false) {
        onRefuse?.(press);
        return false;
      }
      count = 0;
      stopped = false;
      if (press.input === "touch" || press.input === "pen") {
        follow(press.event);
        return;
      }
      let blur;
      const unlistenBlur = on(el, "blur", (event) => blur = event);
      step(press.event, press.input);
      unlistenBlur();
      if (!bound) {
        return false;
      }
      if (blur) {
        onRefuse?.(press);
        options.onEnd?.({ event: blur, input: press.input, count });
        return false;
      }
      if (press.input === "mouse") {
        follow(press.event);
      }
    },
    onHold: ({ event, input }) => !inside || step(event, input),
    onEnd: ({ event, input, held, canceled }) => {
      const tapped = (input === "touch" || input === "pen") && !held && !canceled && inside && !options.disabled?.();
      reset();
      if (tapped) {
        step(event, input);
      }
      options.onEnd?.({ event, input, count });
    }
  });
  return () => {
    bound = false;
    unbindHold();
    reset();
  };
}
function bindRepeat(el, options = {}) {
  let afterKey = false;
  let refusedKey;
  function ignoreKeyClicks({ event }) {
    refusedKey?.();
    const { key } = event;
    const view = el.ownerDocument.defaultView ?? window;
    const listeners = [
      on(el.ownerDocument, "keyup", (up) => {
        if (up.key === key) {
          view.setTimeout(() => refusedKey?.());
        }
      }),
      on(el, "blur", () => refusedKey?.())
    ];
    refusedKey = () => {
      listeners.forEach((remove) => remove());
      refusedKey = void 0;
    };
  }
  const unbindPresses = bindRepeatPresses(
    el,
    {
      ...options,
      onEnd: (details) => {
        if (details.input === "keyboard") {
          afterKey = true;
          queueMicrotask(() => afterKey = false);
        }
        options.onEnd?.(details);
      }
    },
    (press) => press.input === "keyboard" && ignoreKeyClicks(press)
  );
  const unlistenClick = on(el, "click", (event) => {
    if (event.detail !== 0 || event.defaultPrevented || afterKey || refusedKey || options.disabled?.()) {
      return;
    }
    options.onStep?.({ event, input: "click", count: 1 });
    options.onEnd?.({ event, input: "click", count: 1 });
  });
  return () => {
    unbindPresses();
    unlistenClick();
    refusedKey?.();
  };
}
export {
  bindRepeat,
  bindRepeatPresses
};
