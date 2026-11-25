// src/testing/input.ts
import { dragThreshold } from "../foundation/drag-and-drop/pointer.js";
import { trustSent } from "../foundation/kernel/trusted.js";
import { isRtl } from "./aria.js";
var sent = /* @__PURE__ */ new WeakSet();
trustSent(sent);
function markTrusted(event) {
  sent.add(event);
  return event;
}
var focusable = "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]:not([contenteditable=false])";
async function settle() {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve();
  }
  await new Promise((resolve) => setTimeout(resolve));
  const frame = () => new Promise(
    (resolve) => typeof requestAnimationFrame === "function" ? requestAnimationFrame(resolve) : setTimeout(resolve, 16)
  );
  await frame();
  await frame();
}
function parseKey(name) {
  const parts = name.split("+");
  const key = parts.pop();
  const held = new Set(parts.map((part) => part.toLowerCase()));
  return {
    key: key === "Space" ? " " : key,
    shiftKey: held.has("shift"),
    altKey: held.has("alt"),
    ctrlKey: held.has("control") || held.has("ctrl"),
    metaKey: held.has("meta") || held.has("cmd")
  };
}
var codeOf = (key) => key === " " ? "Space" : /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : /^\d$/.test(key) ? `Digit${key}` : key;
function isEditable(el) {
  if (!el) {
    return false;
  }
  if (el instanceof HTMLTextAreaElement) {
    return !el.readOnly && !el.matches(":disabled");
  }
  if (el instanceof HTMLInputElement) {
    return !el.readOnly && !el.matches(":disabled") && !/^(button|checkbox|radio|submit|reset|range|color|file|image)$/.test(
      el.type
    );
  }
  return el.isContentEditable;
}
var isHidden = (el) => !!el.closest("[hidden], [inert]");
function tabOrder(doc) {
  const stops = [...doc.querySelectorAll(focusable)].filter(
    (el) => el.tabIndex >= 0 && !el.matches(":disabled") && !isHidden(el)
  );
  const positive = stops.filter((el) => el.tabIndex > 0).sort((a, b) => a.tabIndex - b.tabIndex);
  return [...positive, ...stops.filter((el) => el.tabIndex === 0)];
}
function moveTab(doc, backward, scope) {
  const stops = tabOrder(doc);
  const active = doc.activeElement;
  if (scope && !(active && scope.contains(active))) {
    const inside = stops.filter((el) => scope.contains(el));
    return (backward ? inside.at(-1) : inside[0])?.focus();
  }
  const index = active ? stops.indexOf(active) : -1;
  const next = backward ? index < 0 ? stops.at(-1) : stops[index - 1] : stops[index + 1];
  if (next) {
    next.focus();
  } else {
    active?.blur();
  }
}
var keyClick = (el) => el.dispatchEvent(
  markTrusted(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: 0
    })
  )
);
function keyEvent(type2, init) {
  return markTrusted(
    new KeyboardEvent(type2, {
      ...init,
      code: codeOf(init.key),
      bubbles: true,
      cancelable: true,
      composed: true
    })
  );
}
function insert(el, data) {
  const before = markTrusted(
    new InputEvent("beforeinput", {
      data,
      inputType: "insertText",
      bubbles: true,
      cancelable: true
    })
  );
  if (!el.dispatchEvent(before)) {
    return;
  }
  if ("setRangeText" in el) {
    const start = el.selectionStart ?? el.value.length;
    el.setRangeText(data, start, el.selectionEnd ?? start, "end");
  } else {
    el.textContent = (el.textContent ?? "") + data;
  }
  el.dispatchEvent(
    markTrusted(
      new InputEvent("input", { data, inputType: "insertText", bubbles: true })
    )
  );
}
var activates = (el, key) => !!el && (key === "Enter" ? el instanceof HTMLButtonElement || el instanceof HTMLAnchorElement : key === " " && (el instanceof HTMLButtonElement || el instanceof HTMLInputElement && /^(checkbox|radio)$/.test(el.type)));
var rendered = (el) => {
  for (let at = el; at; at = at.parentElement) {
    if (getComputedStyle(at).display === "none") {
      return false;
    }
  }
  return getComputedStyle(el).visibility !== "hidden" && !isHidden(el);
};
function changed(el) {
  el.dispatchEvent(
    markTrusted(new Event("input", { bubbles: true, composed: true }))
  );
  el.dispatchEvent(markTrusted(new Event("change", { bubbles: true })));
}
function nativeKey(el, key) {
  const inline = isRtl(el) ? ["ArrowLeft", "ArrowRight"] : ["ArrowRight", "ArrowLeft"];
  if (el.type === "radio" && el.name) {
    const by = [inline[0], "ArrowDown"].includes(key) ? 1 : [inline[1], "ArrowUp"].includes(key) ? -1 : 0;
    const group = [
      ...el.getRootNode().querySelectorAll("input[type=radio]")
    ].filter(
      (radio) => radio === el || radio.name === el.name && radio.form === el.form && !radio.matches(":disabled") && rendered(radio)
    );
    const next = group.at((group.indexOf(el) + by) % group.length);
    if (by && next && next !== el) {
      next.focus();
      keyClick(next);
    }
  } else if (el.type === "range") {
    const min = Number.parseFloat(el.min) || 0;
    const max = el.max === "" ? 100 : Number.parseFloat(el.max);
    const any = el.step.toLowerCase() === "any";
    const step = any ? (max - min) / 100 : Number.parseFloat(el.step) || 1;
    const value = Number.parseFloat(el.value);
    const page = Math.max(step, (max - min) / 10);
    const top = any ? max : min + Math.floor((max - min) / step) * step;
    const next = [inline[0], "ArrowUp"].includes(key) ? value + step : [inline[1], "ArrowDown"].includes(key) ? value - step : {
      PageUp: value + page,
      PageDown: value - page,
      Home: min,
      End: max
    }[key];
    if (next === void 0) {
      return;
    }
    const snapped = any ? next : min + Math.round((next - min) / step) * step;
    el.value = String(
      Number.parseFloat(Math.min(top, Math.max(min, snapped)).toPrecision(12))
    );
    if (Number.parseFloat(el.value) !== value) {
      changed(el);
    }
  }
}
async function keys(doc, names, scope) {
  for (const name of names) {
    const init = parseKey(name);
    const target = doc.activeElement ?? doc.body;
    const proceeds = target.dispatchEvent(keyEvent("keydown", init));
    if (proceeds && init.key === "Tab") {
      moveTab(doc, init.shiftKey, scope);
    }
    const printable = init.key.length === 1 && !init.ctrlKey && !init.metaKey;
    if (proceeds && printable && isEditable(target)) {
      insert(target, init.key);
    }
    if (proceeds && target instanceof HTMLInputElement) {
      nativeKey(target, init.key);
    }
    if (proceeds && init.key === "Enter" && activates(target, "Enter")) {
      keyClick(target);
    }
    const up = doc.activeElement ?? doc.body;
    up.dispatchEvent(keyEvent("keyup", init));
    if (proceeds && init.key === " " && activates(target, " ")) {
      keyClick(target);
    }
    await settle();
  }
}
var type = (doc, text) => keys(
  doc,
  [...text].map((char) => char === " " ? "Space" : char)
);
function center(el) {
  const box = el.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}
function pointer(type2, at, pressed) {
  const init = {
    bubbles: !type2.endsWith("enter") && !type2.endsWith("leave"),
    cancelable: true,
    composed: true,
    clientX: at.x,
    clientY: at.y,
    button: type2.endsWith("move") ? -1 : 0,
    buttons: pressed ? 1 : 0,
    detail: type2 === "click" ? 1 : 0
  };
  if (!type2.startsWith("pointer")) {
    return markTrusted(new MouseEvent(type2, init));
  }
  return markTrusted(
    new PointerEvent(type2, {
      ...init,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      width: 1,
      height: 1,
      pressure: pressed ? 0.5 : 0
    })
  );
}
function focusTarget(el) {
  const target = el.closest(focusable);
  return target && !target.matches(":disabled") ? target : void 0;
}
async function click(el) {
  const at = center(el);
  const disabled = !!el.closest("button, input, select, textarea")?.matches(":disabled");
  const down = el.dispatchEvent(pointer("pointerdown", at, true));
  if (!disabled && el.dispatchEvent(pointer("mousedown", at, true)) && down) {
    focusTarget(el)?.focus();
  }
  el.dispatchEvent(pointer("pointerup", at, false));
  if (!disabled) {
    el.dispatchEvent(pointer("mouseup", at, false));
    el.dispatchEvent(pointer("click", at, false));
  }
  await settle();
}
async function hover(el) {
  const at = center(el);
  for (const type2 of [
    "pointerover",
    "pointerenter",
    "mouseover",
    "mouseenter",
    "pointermove",
    "mousemove"
  ]) {
    el.dispatchEvent(pointer(type2, at, false));
  }
  await settle();
}
async function drag(el, target) {
  const from = center(el);
  const to = "to" in target ? center(target.to) : { x: from.x + target.by.x, y: from.y + target.by.y };
  el.dispatchEvent(pointer("pointerdown", from, true));
  el.dispatchEvent(pointer("mousedown", from, true));
  await settle();
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(2, Math.ceil(distance / dragThreshold));
  for (let step = 1; step <= steps; step++) {
    const at = {
      x: from.x + (to.x - from.x) * step / steps,
      y: from.y + (to.y - from.y) * step / steps
    };
    el.dispatchEvent(pointer("pointermove", at, true));
    el.dispatchEvent(pointer("mousemove", at, true));
  }
  await settle();
  el.dispatchEvent(pointer("pointerup", to, false));
  el.dispatchEvent(pointer("mouseup", to, false));
  await settle();
}
export {
  click,
  drag,
  hover,
  keys,
  settle,
  type
};
