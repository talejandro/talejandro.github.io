// src/components/field/field-control.ts
import { formInternals } from "../../foundation/forms/form.js";
var validityKeys = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "tooLong",
  "tooShort",
  "rangeUnderflow",
  "rangeOverflow",
  "stepMismatch",
  "badInput",
  "customError"
];
var valid = { valid: true, flags: {}, message: "" };
function validates(el) {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement || !!formInternals(el) || isFormAssociated(el);
}
function isFormAssociated(el) {
  return !!el.constructor.formAssociated && "validity" in el;
}
function controlsIn(root) {
  return Array.from(root.querySelectorAll("*")).filter(
    (el) => validates(el) && el.type !== "hidden" && el.closest('[data-slot="field"]') === root
  );
}
function validityOf(el) {
  const internals = formInternals(el);
  const target = internals ?? el;
  return {
    willValidate: target.willValidate,
    validity: target.validity,
    message: target.validationMessage
  };
}
var isRequired = (el) => el.hasAttribute("required") || el.getAttribute("aria-required") === "true";
export {
  controlsIn,
  isRequired,
  valid,
  validityKeys,
  validityOf
};
