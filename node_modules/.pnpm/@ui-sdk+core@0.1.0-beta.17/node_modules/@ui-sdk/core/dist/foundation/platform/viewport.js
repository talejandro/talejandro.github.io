// src/foundation/platform/viewport.ts
import {
  followViewport,
  keyboardHeight,
  keyboardInset,
  measureViewport
} from "./keyboard.js";
var sides = ["top", "right", "bottom", "left"];
function safeAreaProbe(doc) {
  const probe = doc.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = `position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;${sides.map((side) => `padding-${side}:env(safe-area-inset-${side},0px)`).join(";")}`;
  doc.body.append(probe);
  return probe;
}
function sizeOf(view) {
  const visual = view.visualViewport;
  if (visual) {
    return measureViewport(view, visual);
  }
  return {
    width: view.innerWidth,
    layoutHeight: view.innerHeight,
    height: view.innerHeight,
    offsetTop: 0,
    scale: 1
  };
}
function safeAreaOf(view, probe) {
  const style = view.getComputedStyle(probe);
  const inset = (side) => Math.round(
    Number.parseFloat(style.getPropertyValue(`padding-${side}`)) || 0
  );
  return {
    top: inset("top"),
    right: inset("right"),
    bottom: inset("bottom"),
    left: inset("left")
  };
}
var keyboardByView = /* @__PURE__ */ new WeakMap();
function shareKeyboard(view) {
  const followers = /* @__PURE__ */ new Set();
  const keyboard = keyboardHeight(view);
  const shared = { followers, height: 0, stop: () => {
  } };
  const notify = (size, event) => {
    const height = keyboard(size, event);
    shared.height = height;
    for (const follow of followers) {
      follow(size, height, event);
    }
  };
  const measure = (event) => notify(sizeOf(view), event);
  const visual = view.visualViewport;
  const stopViewport = visual ? followViewport(view, visual, notify) : () => {
  };
  view.addEventListener("resize", measure);
  view.document.addEventListener("focusin", measure);
  view.document.addEventListener("focusout", measure);
  shared.stop = () => {
    stopViewport();
    view.removeEventListener("resize", measure);
    view.document.removeEventListener("focusin", measure);
    view.document.removeEventListener("focusout", measure);
    keyboardByView.delete(view);
  };
  shared.height = keyboard(sizeOf(view));
  keyboardByView.set(view, shared);
  return shared;
}
function followKeyboard(view, follower) {
  const shared = keyboardByView.get(view) ?? shareKeyboard(view);
  const { followers, stop } = shared;
  followers.add(follower);
  follower(sizeOf(view), shared.height);
  return () => {
    if (followers.delete(follower) && !followers.size) {
      stop();
    }
  };
}
function bindViewport(el, { onChange } = {}) {
  const doc = el.ownerDocument;
  const view = doc.defaultView;
  if (!view) {
    return () => {
    };
  }
  const probe = safeAreaProbe(doc);
  let safeArea = safeAreaOf(view, probe);
  let last = "";
  const write = (name, px) => {
    const value = `${px}px`;
    if (el.style.getPropertyValue(name) !== value) {
      el.style.setProperty(name, value);
    }
  };
  const stop = followKeyboard(view, (size, keyboard, event) => {
    if (event?.type === "resize") {
      safeArea = safeAreaOf(view, probe);
    }
    const viewport = {
      keyboard,
      keyboardInset: keyboardInset(view, size, keyboard),
      width: Math.round(size.width),
      height: Math.round(size.height),
      offsetTop: Math.round(size.offsetTop),
      offsetLeft: Math.round(view.visualViewport?.offsetLeft ?? 0),
      scale: size.scale,
      safeArea
    };
    write("--keyboard-inset", viewport.keyboardInset);
    write("--visual-viewport-width", viewport.width);
    write("--visual-viewport-height", viewport.height);
    write("--visual-viewport-top", viewport.offsetTop);
    el.toggleAttribute("data-keyboard", keyboard > 0);
    const key = JSON.stringify(viewport);
    if (key === last) {
      return;
    }
    last = key;
    onChange?.(viewport);
  });
  return () => {
    stop();
    probe.remove();
    for (const name of [
      "--keyboard-inset",
      "--visual-viewport-width",
      "--visual-viewport-height",
      "--visual-viewport-top"
    ]) {
      el.style.removeProperty(name);
    }
    el.removeAttribute("data-keyboard");
  };
}
function lengthOf(value) {
  const length = { percent: 0, px: 0 };
  for (const [, number = "0", unit] of value.replaceAll(" ", "").matchAll(/([+-]?[\d.]+(?:e[+-]?\d+)?)(%|px)?/gi)) {
    length[unit === "%" ? "percent" : "px"] += Number.parseFloat(number);
  }
  return length;
}
var cssLength = ({ percent, px }) => !percent ? `${px}px` : `calc(${percent}% ${px < 0 ? "-" : "+"} ${Math.abs(px)}px)`;
function bindAvoidKeyboard(el) {
  const view = el.ownerDocument.defaultView;
  const visual = view?.visualViewport;
  if (!view || !visual) {
    return () => {
    };
  }
  const own = el.style.translate;
  const shown = () => {
    const value = view.getComputedStyle(el).translate;
    const [x = "0px", y = "0px", z] = value === "none" ? [] : value.split(/ (?![^(]*\))/);
    return { x, y: lengthOf(y), z };
  };
  const rest = shown();
  const origin = el.ownerDocument.createElement("div");
  origin.setAttribute("aria-hidden", "true");
  origin.setAttribute("data-viewport-origin", "");
  origin.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none";
  el.ownerDocument.body.append(origin);
  const covered = () => {
    const box = el.getBoundingClientRect();
    const now = shown().y;
    const shift = now.px - rest.y.px + (now.percent - rest.y.percent) * box.height / 100 + origin.getBoundingClientRect().top;
    const bottom = Math.min(box.bottom - shift, view.innerHeight);
    const below = box.top - shift < view.innerHeight ? bottom - visual.offsetTop - visual.height : 0;
    return Math.round(Math.max(0, below));
  };
  let keyboard = 0;
  let lifted = 0;
  const update = () => {
    el.toggleAttribute("data-keyboard", keyboard > 0);
    const next = keyboard ? covered() : 0;
    if (next === lifted) {
      return;
    }
    lifted = next;
    const y = cssLength({ percent: rest.y.percent, px: rest.y.px - lifted });
    el.style.translate = lifted ? [rest.x, y, rest.z].filter(Boolean).join(" ") : own;
  };
  let frame = 0;
  const scrolled = () => {
    if (!keyboard && !lifted) {
      return;
    }
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(update);
  };
  const stop = followKeyboard(view, (_, height, event) => {
    keyboard = height;
    if (event?.type === "scroll") {
      scrolled();
    } else {
      update();
    }
  });
  view.addEventListener("scroll", scrolled, { capture: true, passive: true });
  return () => {
    view.cancelAnimationFrame(frame);
    stop();
    view.removeEventListener("scroll", scrolled, { capture: true });
    origin.remove();
    el.style.translate = own;
    el.removeAttribute("data-keyboard");
  };
}
export {
  bindAvoidKeyboard,
  bindViewport
};
