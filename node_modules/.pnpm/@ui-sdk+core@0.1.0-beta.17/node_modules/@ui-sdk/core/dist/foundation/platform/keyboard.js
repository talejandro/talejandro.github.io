// src/foundation/platform/keyboard.ts
var keyboardless = /* @__PURE__ */ new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit"
]);
function isField(target) {
  let el = target;
  while (el?.shadowRoot?.activeElement) {
    el = el.shadowRoot.activeElement;
  }
  if (!el?.tagName) {
    return false;
  }
  if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "IFRAME") {
    return true;
  }
  return el.tagName === "INPUT" && !keyboardless.has(el.type);
}
function keyboardHeight(view) {
  let before = { width: 0, height: 0 };
  return (size, event) => {
    const now = {
      width: size.width * size.scale,
      height: size.height * size.scale
    };
    const moving = event?.type === "focusout" && isField(event.relatedTarget);
    if (!isField(view.document.activeElement) && !moving) {
      if (!event?.type.startsWith("focus")) {
        before = now;
      }
      return 0;
    }
    if (Math.abs(now.width - before.width) > 1) {
      before = { width: now.width, height: size.layoutHeight * size.scale };
    }
    return Math.max(0, Math.round((before.height - now.height) / size.scale));
  };
}
var pageZoom = /* @__PURE__ */ new WeakMap();
function keyboardInset(view, size, keyboard) {
  const covered = Math.max(0, size.layoutHeight - size.offsetTop - size.height);
  if (Math.abs(size.height - size.layoutHeight) <= 1) {
    pageZoom.set(view, size.scale);
  }
  if (keyboard > 0) {
    return Math.round(Math.min(keyboard, covered));
  }
  return size.scale > (pageZoom.get(view) ?? 1) + 0.01 ? 0 : Math.round(covered);
}
function trackKeyboard(el, onChange) {
  const view = el.ownerDocument.defaultView;
  const viewport = view?.visualViewport;
  if (!view || !viewport) {
    return () => {
    };
  }
  let current = null;
  const apply = (size) => {
    const inset = keyboardInset(view, size, 0);
    const changed = current !== null && inset !== current;
    current = inset;
    if (changed) {
      onChange?.before();
    }
    el.style.setProperty("--keyboard-inset", `${inset}px`);
    el.style.setProperty(
      "--visual-viewport-height",
      `${Math.round(size.height)}px`
    );
    if (inset > 0) {
      el.setAttribute("data-keyboard", "");
    } else {
      el.removeAttribute("data-keyboard");
    }
    if (changed) {
      onChange?.after();
    }
  };
  const measured = early.get(view);
  apply(
    measured && measured.layoutHeight - measured.offsetTop - measured.height <= 1 ? measured : measureViewport(view, viewport)
  );
  const stop = followViewport(view, viewport, apply);
  return () => {
    stop();
    el.style.removeProperty("--keyboard-inset");
    el.style.removeProperty("--visual-viewport-height");
    el.removeAttribute("data-keyboard");
  };
}
function measureViewport(view, viewport) {
  return {
    width: viewport.width,
    layoutHeight: view.innerHeight,
    height: viewport.height,
    offsetTop: viewport.offsetTop,
    scale: viewport.scale
  };
}
var followersByViewport = /* @__PURE__ */ new WeakMap();
function shareViewport(view, viewport) {
  const followers = /* @__PURE__ */ new Set();
  const measure = (event) => {
    const size = measureViewport(view, viewport);
    for (const follow of followers) {
      follow(size, event);
    }
  };
  viewport.addEventListener("resize", measure);
  viewport.addEventListener("scroll", measure);
  const stop = () => {
    viewport.removeEventListener("resize", measure);
    viewport.removeEventListener("scroll", measure);
    followersByViewport.delete(viewport);
  };
  const shared = { followers, stop };
  followersByViewport.set(viewport, shared);
  return shared;
}
function followViewport(view, viewport, follower) {
  const { followers, stop } = followersByViewport.get(viewport) ?? shareViewport(view, viewport);
  followers.add(follower);
  return () => {
    if (followers.delete(follower) && !followers.size) {
      stop();
    }
  };
}
var early = /* @__PURE__ */ new WeakMap();
function measureViewportEarly(view) {
  const viewport = view?.visualViewport;
  if (!view || !viewport || early.has(view)) {
    return;
  }
  early.set(view, measureViewport(view, viewport));
  setTimeout(() => early.delete(view));
}
export {
  followViewport,
  keyboardHeight,
  keyboardInset,
  measureViewport,
  measureViewportEarly,
  trackKeyboard
};
