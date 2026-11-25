// src/testing/aria.ts
import {
  accessibleName,
  namedByContent,
  roleOf
} from "../foundation/text/accessible-name.js";
var focusable = "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]:not([contenteditable=false])";
var referenceAttributes = [
  "aria-controls",
  "aria-labelledby",
  "aria-describedby",
  "aria-activedescendant",
  "aria-owns"
];
var isGone = (el) => !el.isConnected || !!el.closest("[hidden], [inert]");
var isUnreachable = (el) => !!el.closest('[aria-hidden="true"], [inert]');
var renderedParent = (el) => el.assignedSlot ?? el.parentElement ?? (el.parentNode?.host || null);
function isUndisplayed(el, known = /* @__PURE__ */ new Map()) {
  if (!el) {
    return false;
  }
  let hidden = known.get(el);
  if (hidden === void 0) {
    known.set(
      el,
      hidden = getComputedStyle(el).display === "none" || isUndisplayed(renderedParent(el), known)
    );
  }
  return hidden;
}
function withRole(scope, roles, { displayed = true } = {}) {
  const known = /* @__PURE__ */ new Map();
  return [...scope.querySelectorAll("*")].filter(
    (el) => roles.includes(roleOf(el)) && !isGone(el) && !isUnreachable(el) && (!displayed || !isUndisplayed(el, known))
  );
}
var hasBoolean = (el, attribute) => ["true", "false"].includes(el.getAttribute(attribute) ?? "");
var checkedOf = (el) => el instanceof HTMLInputElement && !el.hasAttribute("aria-checked") ? String(el.checked) : el.getAttribute("aria-checked") ?? "";
var isReadOnly = (el) => el.getAttribute("aria-readonly") === "true";
function isTabStop(el, known) {
  if (!el.matches(focusable) || isGone(el)) {
    return false;
  }
  if (el.tabIndex < 0 || el.matches(":disabled")) {
    return false;
  }
  if (el instanceof HTMLInputElement && el.type === "hidden") {
    return false;
  }
  if (isUndisplayed(el, known)) {
    return false;
  }
  if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
    const group = [
      ...el.ownerDocument.querySelectorAll(
        "input[type=radio]"
      )
    ].filter(
      (radio) => radio.name === el.name && radio.form === el.form && !isUndisplayed(radio, known)
    );
    return el === (group.find((radio) => radio.checked) ?? group[0]);
  }
  return true;
}
function tabStops(scope) {
  const known = /* @__PURE__ */ new Map();
  return [scope, ...scope.querySelectorAll(focusable)].filter(
    (el) => isTabStop(el, known)
  );
}
function focusables(scope) {
  const known = /* @__PURE__ */ new Map();
  return [...scope.querySelectorAll(focusable)].filter(
    (el) => !isGone(el) && !el.matches(":disabled") && !(el instanceof HTMLInputElement && el.type === "hidden") && !isUndisplayed(el, known)
  );
}
var ids = (el, attribute) => (el.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean);
var textOf = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
function byId(el, id) {
  const root = el.getRootNode();
  return root instanceof Document || root instanceof ShadowRoot ? root.getElementById(id) : null;
}
function danglingReferences(scope) {
  const dangling = [];
  for (const el of [scope, ...scope.querySelectorAll("*")].filter(
    (el2) => !isGone(el2)
  )) {
    for (const attribute of referenceAttributes) {
      if (attribute === "aria-controls" && el.getAttribute("aria-expanded") === "false") {
        continue;
      }
      for (const id of ids(el, attribute)) {
        if (!byId(el, id)) {
          dangling.push({ el, attribute, id });
        }
      }
    }
  }
  return dangling;
}
function isRtl(el) {
  const dir = el.closest("[dir]")?.getAttribute("dir")?.toLowerCase();
  if (dir === "rtl" || dir === "ltr") {
    return dir === "rtl";
  }
  return getComputedStyle(el).direction === "rtl";
}
function describe(el) {
  if (!el) {
    return "nothing";
  }
  if (el === el.ownerDocument.body) {
    return "body";
  }
  const role = el.getAttribute("role");
  const selector = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${role ? `[role=${role}]` : ""}`;
  if (el.id || el.children.length && !namedByContent.has(roleOf(el))) {
    return selector;
  }
  const text = textOf(el).slice(0, 24);
  return text ? `${selector} "${text}"` : selector;
}
export {
  accessibleName,
  byId,
  checkedOf,
  danglingReferences,
  describe,
  focusables,
  hasBoolean,
  ids,
  isGone,
  isReadOnly,
  isRtl,
  isUndisplayed,
  isUnreachable,
  roleOf,
  tabStops,
  withRole
};
