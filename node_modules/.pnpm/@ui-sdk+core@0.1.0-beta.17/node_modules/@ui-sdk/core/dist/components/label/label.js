// src/components/label/label.ts
import { activateControl, findControl } from "../../foundation/forms/control.js";
import { isDisabledElement } from "../../foundation/forms/form.js";
import { documentOrder } from "../../foundation/kernel/order.js";
import { definePrimitive } from "../../foundation/kernel/primitive.js";
function forTarget(el, id) {
  const root = el.getRootNode();
  return "getElementById" in root ? root.getElementById(id) : null;
}
function ownControl(el) {
  const id = el.getAttribute("for");
  const native = el instanceof HTMLLabelElement;
  const target = id ? forTarget(el, id) : native && el.control ? null : el;
  if (!target || native && el.control === target) {
    return;
  }
  return findControl(target);
}
var labelsByControl = /* @__PURE__ */ new WeakMap();
var written = /* @__PURE__ */ new WeakMap();
function writeName(control) {
  const current = control.getAttribute("aria-labelledby");
  const ours = written.get(control);
  if (current !== null && current !== ours) {
    return;
  }
  const ids = control.hasAttribute("aria-label") ? "" : (labelsByControl.get(control) ?? []).sort(documentOrder).map((label2) => label2.id).join(" ");
  if (ids) {
    written.set(control, ids);
    if (current !== ids) {
      control.setAttribute("aria-labelledby", ids);
    }
  } else if (ours !== void 0) {
    written.delete(control);
    control.removeAttribute("aria-labelledby");
  }
}
function nameControl(control, label2) {
  labelsByControl.set(control, [...labelsByControl.get(control) ?? [], label2]);
  writeName(control);
  return () => {
    labelsByControl.set(
      control,
      labelsByControl.get(control).filter((other) => other !== label2)
    );
    writeName(control);
  };
}
var trees = /* @__PURE__ */ new Map();
function watchTree(root, check) {
  let tree = trees.get(root);
  if (!tree) {
    const checks2 = /* @__PURE__ */ new Set();
    const observer2 = new MutationObserver(
      () => checks2.forEach((each) => each())
    );
    observer2.observe(root, { childList: true, subtree: true });
    trees.set(root, tree = { observer: observer2, checks: checks2 });
  }
  const { observer, checks } = tree;
  checks.add(check);
  return () => {
    checks.delete(check);
    if (checks.size) {
      return;
    }
    observer.disconnect();
    trees.delete(root);
  };
}
var naming = {
  attributeFilter: ["for", "id", "role", "type", "aria-hidden", "aria-label"]
};
function bindLabel(el) {
  let control;
  let unname;
  let unwatch;
  let active = true;
  const update = () => {
    if (!active) {
      return;
    }
    const next = ownControl(el);
    if (next === control) {
      if (control) {
        writeName(control);
      }
    } else {
      unname?.();
      control = next;
      unname = control && nameControl(control, el);
      if (control) {
        changes.disconnect();
        changes.observe(el, naming);
        changes.observe(control, naming);
      }
    }
    const looks = el.hasAttribute("for") || !(el instanceof HTMLLabelElement) || !el.control;
    if (looks && !unwatch) {
      unwatch = watchTree(el.getRootNode(), () => {
        if (!control?.isConnected) {
          update();
        }
      });
    } else if (!looks && unwatch) {
      unwatch();
      unwatch = void 0;
    }
  };
  queueMicrotask(update);
  const changes = new MutationObserver(update);
  changes.observe(el, naming);
  return () => {
    active = false;
    changes.disconnect();
    unwatch?.();
    unname?.();
  };
}
function pressesInside(event, el, control) {
  const target = event.target;
  if (control?.contains(target)) {
    return true;
  }
  const inner = target.closest?.("a[href], button, input, select, textarea");
  return !!inner && inner !== el && el.contains(inner);
}
var labelPrimitive = /* @__PURE__ */ definePrimitive({
  name: "label",
  state: (_options) => ({}),
  api: (_context) => ({}),
  slots: (slot) => ({
    root: slot({
      attrs: (_, { id }) => ({ id }),
      on: {
        // A double click would select the label's text as it activates the control.
        mousedown: (event, { el }) => {
          if (event.detail > 1 && !pressesInside(event, el, ownControl(el))) {
            event.preventDefault();
          }
        }
      },
      press({ el }, event) {
        const control = el && ownControl(el);
        if (!control || isDisabledElement(control) || event && pressesInside(event, el, control)) {
          return;
        }
        activateControl(control, event);
      },
      bind: (el) => bindLabel(el)
    })
  }),
  // Agents never list it: the control it names carries its text.
  agent: { shown: () => false }
});
var label = labelPrimitive;
export {
  label
};
