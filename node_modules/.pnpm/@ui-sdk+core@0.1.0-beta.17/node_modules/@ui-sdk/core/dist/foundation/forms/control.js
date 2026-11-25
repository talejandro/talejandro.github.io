// src/foundation/forms/control.ts
var controlSelector = '[data-slot="slider"],[data-slot="color-picker"],[data-slot="date-input"],[data-slot="time-input"],input:not([type="hidden"]):not([aria-hidden="true"]),select,textarea,[data-slot="checkbox-group"],[role="checkbox"],[role="switch"],[role="radiogroup"],[role="radio"],[role="combobox"],[role="slider"],[role="spinbutton"],[role="textbox"],[role="listbox"],[data-slot="file-input-trigger"]';
var isSingleSlider = (el) => el.matches('[data-slot="slider"]') && !el.querySelector('[data-slot="slider-thumb"][data-index="1"]');
var isControl = (el) => el.matches(controlSelector) && !isSingleSlider(el);
function findControl(root, accepts = () => true) {
  if (isControl(root)) {
    return root;
  }
  for (const el of Array.from(
    root.querySelectorAll(controlSelector)
  )) {
    if (accepts(el) && !isSingleSlider(el)) {
      return el;
    }
  }
}
function activateControl(control, event) {
  const role = control.getAttribute("role");
  const checkable = role === "checkbox" || role === "switch" || role === "radio" || control instanceof HTMLInputElement && (control.type === "checkbox" || control.type === "radio");
  const plainButton = control instanceof HTMLButtonElement && !role;
  if (checkable || plainButton || role === "radiogroup") {
    control.click();
  } else if (role === "group") {
    ;
    (control.querySelector("input:not([type='hidden'])") ?? control.querySelector('[tabindex="0"]'))?.focus();
  } else {
    control.focus();
  }
  event?.preventDefault();
}
export {
  activateControl,
  findControl
};
