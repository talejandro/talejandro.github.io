// src/testing/pattern-context.ts
import {
  accessibleName,
  byId,
  danglingReferences,
  describe,
  ids,
  isGone,
  isUndisplayed,
  isUnreachable,
  roleOf,
  withRole
} from "./aria.js";
import { keys, settle } from "./input.js";
var stopped = new Error("checkPattern stopped pressing keys.");
var defaultOrientation = {
  listbox: "vertical",
  menu: "vertical",
  menubar: "horizontal",
  scrollbar: "vertical",
  slider: "horizontal",
  tablist: "horizontal",
  toolbar: "horizontal",
  tree: "vertical"
};
var widgetRoles = /* @__PURE__ */ new Set([
  "button",
  "checkbox",
  "combobox",
  "gridcell",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "slider",
  "switch",
  "tab",
  "textbox",
  "treeitem"
]);
function createContext(root) {
  const doc = root.ownerDocument;
  const problems = /* @__PURE__ */ new Set();
  const watched = /* @__PURE__ */ new Set([root]);
  const problem = (el, rule) => {
    problems.add(`${describe(el)}: ${rule}`);
  };
  function checkReferences() {
    for (const scope of watched) {
      for (const { el, attribute, id } of danglingReferences(scope)) {
        problem(
          el,
          `${attribute} points at "${id}", which isn't in the page; every id reference names a real element (ARIA).`
        );
      }
    }
  }
  async function press(key) {
    const before = doc.activeElement;
    await keys(doc, [key]);
    const after = doc.activeElement;
    if (!after || after === doc.body || after === doc.documentElement) {
      problem(
        before,
        `after ${key}, focus fell to the body; a key never loses focus (APG: keyboard interface).`
      );
      throw stopped;
    }
    if (isUnreachable(after)) {
      problem(
        after,
        `after ${key}, focus is inside aria-hidden or inert content, where a screen reader can't follow it.`
      );
    }
    checkReferences();
  }
  async function focus(el) {
    ;
    el.focus();
    await settle();
    const active = doc.activeElement;
    if (active && active !== doc.body) {
      return;
    }
    problem(el, "can't take focus.");
    throw stopped;
  }
  return {
    root,
    doc,
    problems,
    problem,
    press,
    focus,
    checkReferences,
    /** Checks id references in a popup that renders outside the root too. */
    watch: (el) => watched.add(el)
  };
}
function findWidget(context, roles) {
  const { root } = context;
  if (roles.includes(roleOf(root))) {
    return root;
  }
  const inside = withRole(root, roles)[0];
  if (inside) {
    return inside;
  }
  for (const el of [root, ...root.querySelectorAll("[aria-controls]")]) {
    for (const id of ids(el, "aria-controls")) {
      const popup = byId(el, id);
      if (popup && roles.includes(roleOf(popup))) {
        return popup;
      }
    }
  }
}
function requireName(context, el, source) {
  if (!accessibleName(el)) {
    context.problem(
      el,
      `has no accessible name; give it aria-label or aria-labelledby (APG ${source}).`
    );
  }
}
function orientationOf(context, el) {
  const fallback = defaultOrientation[roleOf(el)];
  const aria = el.getAttribute("aria-orientation");
  const laidOut = el.getAttribute("data-orientation");
  const read = aria === "horizontal" || aria === "vertical" ? aria : fallback ?? "vertical";
  if (laidOut && fallback && laidOut !== read) {
    context.problem(
      el,
      `is ${laidOut} (data-orientation) but tells assistive technology it's ${read}; set aria-orientation="${laidOut}" (ARIA: aria-orientation).`
    );
  }
  return read;
}
function arrowsFor(orientation, rtl) {
  if (orientation === "vertical") {
    return { next: "ArrowDown", previous: "ArrowUp" };
  }
  return rtl ? { next: "ArrowLeft", previous: "ArrowRight" } : { next: "ArrowRight", previous: "ArrowLeft" };
}
function checkOwned(context, container, allowed, source) {
  for (const el of container.querySelectorAll("*")) {
    const role = roleOf(el);
    if (!widgetRoles.has(role) || allowed.includes(role) || isGone(el) || isUnreachable(el)) {
      continue;
    }
    context.problem(
      el,
      `is a ${role} inside a ${roleOf(container)}, which owns only ${allowed.join(" and ")} elements (APG ${source}).`
    );
  }
}
function triggerOf(popup) {
  if (!popup.id) {
    return void 0;
  }
  return [
    ...popup.getRootNode().querySelectorAll("[aria-controls]")
  ].find(
    (el) => !popup.contains(el) && ids(el, "aria-controls").includes(popup.id)
  );
}
function popupOf(el, roles) {
  return ids(el, "aria-controls").map((id) => byId(el, id)).find((popup) => !!popup && roles.includes(roleOf(popup)));
}
function isShown(el) {
  return !!el && !isGone(el) && !isUndisplayed(el);
}
export {
  arrowsFor,
  checkOwned,
  createContext,
  findWidget,
  isShown,
  orientationOf,
  popupOf,
  requireName,
  stopped,
  triggerOf
};
