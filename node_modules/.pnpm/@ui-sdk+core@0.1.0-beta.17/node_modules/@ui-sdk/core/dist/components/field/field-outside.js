// src/components/field/field-outside.ts
import { dev, warn } from "#dev";
import { checkName } from "#name-check";
var fieldOutsideState = {
  disabled: false,
  required: false,
  focused: false,
  invalid: false,
  valid: false,
  message: ""
};
var fieldOutsideAttrs = (slot) => ({
  "data-slot": `field-${slot}`
});
var fieldOutsideErrorShown = (props) => props.match === true;
var labelWait = 1e3;
var checked = /* @__PURE__ */ new WeakSet();
var labels = (el) => el instanceof HTMLLabelElement ? !!el.control || el.htmlFor !== "" : false;
var quote = (el) => {
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.length > 40 ? `${text.slice(0, 40)}\u2026` : text;
};
function watchLabel(el, fix) {
  const observer = new MutationObserver(() => {
    if (labels(el)) {
      done();
    }
  });
  observer.observe(el, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["for"]
  });
  let timer;
  const done = () => {
    observer.disconnect();
    clearTimeout(timer);
  };
  let waits = 0;
  const wait = () => {
    timer = setTimeout(() => {
      if (labels(el)) {
        return done();
      }
      if (!el.isConnected) {
        return ++waits < 10 ? wait() : done();
      }
      done();
      warn(
        `A FieldLabel outside a Field labels nothing ("${quote(el)}"). ${fix}`,
        { component: "field" }
      );
    }, labelWait);
  };
  wait();
}
function checkFieldOutside(el, slot, fix = "Put the control inside it, or point its `for` at the control.") {
  if (!dev || !el || checked.has(el) || typeof MutationObserver === "undefined") {
    return;
  }
  checked.add(el);
  if (slot === "control") {
    return checkName(el, "A FieldControl outside a Field", {
      component: "field"
    });
  }
  if (slot === "label" && !labels(el)) {
    watchLabel(el, fix);
  }
}
export {
  checkFieldOutside,
  fieldOutsideAttrs,
  fieldOutsideErrorShown,
  fieldOutsideState
};
