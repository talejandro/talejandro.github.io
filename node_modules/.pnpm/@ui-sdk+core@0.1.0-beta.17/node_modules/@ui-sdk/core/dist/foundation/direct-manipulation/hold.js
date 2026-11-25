// src/foundation/direct-manipulation/hold.ts
import { swallowNextClick } from "../drag-and-drop/pointer.js";
import { on } from "../kernel/events.js";
function bindHold(el, options = {}) {
  const doc = el.ownerDocument;
  const view = doc.defaultView ?? window;
  const { delay = 500, tolerance = 10, keys = [" ", "Enter"] } = options;
  let press;
  el.style.setProperty("--hold-delay", `${delay}ms`);
  el.style.setProperty("-webkit-touch-callout", "none");
  function start(details, extra, listen) {
    if (press || options.disabled?.() || options.onPress?.(details) === false) {
      return false;
    }
    let count = 0;
    const tick = () => {
      const current = press;
      if (!current || options.disabled?.()) {
        return;
      }
      current.held = true;
      el.setAttribute("data-held", "");
      const repeats = options.onHold?.({ ...details, count: ++count }) !== false;
      if (repeats && options.repeat && press === current) {
        current.timer = view.setTimeout(tick, options.repeat);
      }
    };
    const listeners2 = listen();
    press = {
      input: details.input,
      ...extra,
      held: false,
      timer: view.setTimeout(tick, delay),
      unlisten: () => listeners2.forEach((remove) => remove())
    };
    el.setAttribute("data-holding", "");
    return true;
  }
  function stop() {
    const current = press;
    press = void 0;
    if (!current) {
      return;
    }
    view.clearTimeout(current.timer);
    current.unlisten();
    el.removeAttribute("data-holding");
    el.removeAttribute("data-held");
    return current;
  }
  function end(event, canceled) {
    const current = stop();
    if (!current) {
      return;
    }
    const { input, pointerId, key, held } = current;
    if (pointerId !== void 0 && (held || canceled) && event.type !== "pointercancel") {
      const released = event.type === "pointerup";
      swallowNextClick(doc, !released, released ? void 0 : pointerId);
    }
    if (key !== void 0 && canceled && doc.activeElement === el) {
      swallowKey(key);
    }
    options.onEnd?.({ event, input, held, canceled });
    if (key !== void 0 && !held && !canceled) {
      el.click();
    }
  }
  function swallowKey(key) {
    const listeners2 = [
      on(el, "keydown", (down) => down.key === key && down.preventDefault()),
      on(el, "keyup", (up) => {
        if (up.key !== key) {
          return;
        }
        up.preventDefault();
        listeners2.forEach((remove) => remove());
      }),
      on(el, "blur", () => listeners2.forEach((remove) => remove()))
    ];
  }
  const cancels = () => [
    on(
      doc,
      "keydown",
      (event) => {
        if (event.key !== "Escape") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        end(event, true);
      },
      { capture: true }
    ),
    on(el, "blur", (blur) => end(blur, true)),
    on(view, "blur", (blur) => end(blur, true))
  ];
  const onPointerDown = (event) => {
    const secondary = !event.isPrimary && event.pointerType !== "mouse";
    if (event.button !== 0 || secondary || event.defaultPrevented) {
      return;
    }
    const input = event.pointerType || "mouse";
    const ours = (move) => move.pointerId === event.pointerId;
    start({ event, input }, { pointerId: event.pointerId }, () => [
      on(doc, "pointermove", (move) => {
        if (!ours(move)) {
          return;
        }
        if (move.pointerType === "mouse" && move.buttons === 0) {
          return end(move, false);
        }
        const distance = Math.hypot(
          move.clientX - event.clientX,
          move.clientY - event.clientY
        );
        if (!press?.held && distance > tolerance) {
          end(move, true);
        }
      }),
      on(doc, "pointerup", (up) => ours(up) && end(up, false)),
      on(doc, "pointercancel", (cancel) => ours(cancel) && end(cancel, true)),
      on(
        doc,
        "contextmenu",
        (menu) => input !== "mouse" && menu.preventDefault()
      ),
      ...cancels()
    ]);
  };
  const onKeyDown = (event) => {
    if (event.target !== el || !keys.includes(event.key)) {
      return;
    }
    if (press?.input === "keyboard") {
      return event.preventDefault();
    }
    if (event.repeat || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const started = start(
      { event, input: "keyboard" },
      { key: event.key },
      () => [
        on(el, "keyup", (up) => {
          if (up.key !== event.key) {
            return;
          }
          up.preventDefault();
          end(up, false);
        }),
        ...cancels()
      ]
    );
    if (started) {
      event.preventDefault();
    }
  };
  const listeners = [
    on(el, "pointerdown", onPointerDown),
    on(el, "keydown", onKeyDown)
  ];
  return () => {
    stop();
    listeners.forEach((remove) => remove());
    el.style.removeProperty("--hold-delay");
    el.style.removeProperty("-webkit-touch-callout");
  };
}
export {
  bindHold
};
