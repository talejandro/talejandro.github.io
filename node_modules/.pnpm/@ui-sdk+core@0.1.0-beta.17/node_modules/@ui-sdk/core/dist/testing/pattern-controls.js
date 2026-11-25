// src/testing/pattern-controls.ts
import {
  accessibleName,
  byId,
  checkedOf,
  hasBoolean,
  ids,
  isGone,
  isReadOnly,
  isRtl,
  roleOf,
  withRole
} from "./aria.js";
import {
  orientationOf,
  requireName
} from "./pattern-context.js";
import { isDisabledElement } from "../foundation/forms/form.js";
var controls = (context, roles) => [context.root, ...withRole(context.root, roles)].filter(
  (el) => roles.includes(roleOf(el)) && !isGone(el)
);
async function checkToggles(context, el, key, state, { name, source, cycle = 2 }) {
  await context.focus(el);
  const before = state();
  await context.press(key);
  if (isReadOnly(el)) {
    if (state() !== before) {
      context.problem(
        el,
        `${key} changed ${name} from "${before}", but aria-readonly="true" says it can't change (ARIA: aria-readonly).`
      );
    }
    return;
  }
  if (state() === before) {
    context.problem(
      el,
      `${key} should change ${name} from "${before}" (APG ${source}).`
    );
    return;
  }
  for (let press = 1; press < cycle && state() !== before; press++) {
    await context.press(key);
  }
  if (state() !== before && before !== "mixed") {
    context.problem(
      el,
      `${key} again should change ${name} back to "${before}" (APG ${source}).`
    );
  }
}
async function disclosure(context) {
  const buttons = [
    context.root,
    ...context.root.querySelectorAll("[aria-expanded]")
  ].filter((el) => el.hasAttribute("aria-expanded") && !isGone(el));
  if (!buttons.length) {
    context.problem(
      context.root,
      "has no button with aria-expanded, so it isn't a disclosure (APG disclosure)."
    );
    return;
  }
  for (const button2 of buttons) {
    if (roleOf(button2) !== "button") {
      context.problem(
        button2,
        "shows and hides content, so it's a button (APG disclosure)."
      );
    }
    requireName(context, button2, "disclosure");
    if (!hasBoolean(button2, "aria-expanded")) {
      context.problem(
        button2,
        `has aria-expanded "${button2.getAttribute("aria-expanded")}"; it's "true" or "false" (APG disclosure).`
      );
    }
  }
  const button = buttons.find((el) => !isDisabledElement(el));
  if (!button) {
    return;
  }
  const expanded = () => button.getAttribute("aria-expanded") ?? "";
  for (const key of ["Enter", "Space"]) {
    await checkToggles(context, button, key, expanded, {
      name: "aria-expanded",
      source: "disclosure"
    });
  }
}
async function accordion(context) {
  const buttons = withRole(context.root, ["button"]).filter(
    (el) => el.hasAttribute("aria-expanded")
  );
  if (!buttons.length) {
    context.problem(
      context.root,
      "has no header button with aria-expanded, so it isn't an accordion (APG accordion)."
    );
    return;
  }
  for (const button2 of buttons) {
    requireName(context, button2, "accordion");
    const heading = button2.closest("h1, h2, h3, h4, h5, h6, [role=heading]");
    if (!heading || !context.root.contains(heading)) {
      context.problem(
        button2,
        "sits in no heading; each header button is wrapped in an element with role heading (APG accordion)."
      );
    } else if (heading.getAttribute("role") === "heading" && !heading.hasAttribute("aria-level")) {
      context.problem(
        heading,
        "is a heading without aria-level (APG accordion)."
      );
    }
    if (!hasBoolean(button2, "aria-expanded")) {
      context.problem(
        button2,
        `has aria-expanded "${button2.getAttribute("aria-expanded")}"; it's "true" or "false" (APG accordion).`
      );
    }
    if (button2.getAttribute("aria-expanded") !== "true") {
      continue;
    }
    const panel = ids(button2, "aria-controls").map((id) => byId(button2, id))[0];
    if (!panel) {
      context.problem(
        button2,
        "is expanded but names no panel with aria-controls (APG accordion)."
      );
    } else if (roleOf(panel) === "region" && !ids(panel, "aria-labelledby").length) {
      context.problem(
        panel,
        "is a region without aria-labelledby; it's labelled by its header button (APG accordion)."
      );
    }
  }
  const button = buttons.find(
    (el) => el.getAttribute("aria-expanded") === "false" && !isDisabledElement(el)
  ) ?? buttons.find((el) => !isDisabledElement(el));
  if (!button) {
    return;
  }
  for (const key of ["Enter", "Space"]) {
    await checkAccordionKey(context, buttons, button, key);
  }
}
async function checkAccordionKey(context, buttons, button, key) {
  const before = buttons.map((el) => el.getAttribute("aria-expanded"));
  await context.focus(button);
  await context.press(key);
  if (button.getAttribute("aria-expanded") === before[buttons.indexOf(button)]) {
    context.problem(
      button,
      `${key} should toggle its panel, aria-expanded (APG accordion).`
    );
  }
  for (const [index, el] of buttons.entries()) {
    if (el.getAttribute("aria-expanded") === before[index] || isDisabledElement(el)) {
      continue;
    }
    await context.focus(el);
    await context.press("Enter");
  }
}
async function switchPattern(context) {
  const switches = controls(context, ["switch"]);
  if (!switches.length) {
    context.problem(
      context.root,
      "has no element with role switch, so it isn't a switch (APG switch)."
    );
    return;
  }
  for (const control of switches) {
    requireName(context, control, "switch");
    if (!["true", "false"].includes(checkedOf(control))) {
      context.problem(
        control,
        `has no aria-checked; a switch is on, "true", or off, "false" (APG switch).`
      );
    }
  }
  for (const control of switches.filter((el) => !isDisabledElement(el))) {
    await checkToggles(context, control, "Space", () => checkedOf(control), {
      name: "aria-checked",
      source: "switch"
    });
  }
}
async function checkbox(context) {
  const boxes = controls(context, ["checkbox"]);
  if (!boxes.length) {
    context.problem(
      context.root,
      "has no element with role checkbox, so it isn't a checkbox (APG checkbox)."
    );
    return;
  }
  for (const box of boxes) {
    requireName(context, box, "checkbox");
    if (!["true", "false", "mixed"].includes(checkedOf(box))) {
      context.problem(
        box,
        `has no aria-checked; a checkbox is "true", "false" or "mixed" (APG checkbox).`
      );
    }
  }
  for (const box of boxes.filter((el) => !isDisabledElement(el))) {
    await checkToggles(context, box, "Space", () => checkedOf(box), {
      name: "aria-checked",
      source: "checkbox",
      cycle: 3
    });
  }
}
async function slider(context) {
  const sliders = controls(context, ["slider"]);
  if (!sliders.length) {
    context.problem(
      context.root,
      "has no element with role slider, so it isn't a slider (APG slider)."
    );
    return;
  }
  for (const thumb of sliders) {
    if (!accessibleName(thumb)) {
      context.problem(
        thumb,
        "has no accessible name; each slider thumb has its own aria-label or aria-labelledby (APG slider)."
      );
    }
    if (!(thumb instanceof HTMLInputElement) && !thumb.hasAttribute("aria-valuenow")) {
      context.problem(
        thumb,
        "has no aria-valuenow, the value a screen reader reads (APG slider)."
      );
    }
    orientationOf(context, thumb);
  }
  for (const thumb of sliders.filter((el) => !isDisabledElement(el))) {
    await checkSliderKeys(context, thumb);
  }
}
async function checkSliderKeys(context, thumb) {
  const input = thumb instanceof HTMLInputElement ? thumb : void 0;
  const value = () => Number(thumb.getAttribute("aria-valuenow") ?? input?.value);
  const min = () => Number(thumb.getAttribute("aria-valuemin") ?? (input?.min || 0));
  const max = () => Number(thumb.getAttribute("aria-valuemax") ?? (input?.max || 100));
  const vertical = orientationOf(context, thumb) === "vertical";
  const [increase, decrease] = vertical ? ["ArrowUp", "ArrowDown"] : isRtl(thumb) ? ["ArrowLeft", "ArrowRight"] : ["ArrowRight", "ArrowLeft"];
  const expectChange = async (key, up) => {
    const before = value();
    await context.press(key);
    const after = value();
    if (up ? after > before : after < before) {
      return;
    }
    context.problem(
      thumb,
      `${key} should ${up ? "raise" : "lower"} the value from ${before}, but it's ${after} (APG slider).`
    );
  };
  await context.focus(thumb);
  const start = value();
  if (isReadOnly(thumb)) {
    const key = start >= max() ? decrease : increase;
    await context.press(key);
    if (value() !== start) {
      context.problem(
        thumb,
        `${key} changed the value from ${start} to ${value()}, but aria-readonly="true" says it can't change (ARIA: aria-readonly).`
      );
    }
    return;
  }
  const pairs = vertical ? [[increase, decrease]] : [
    ["ArrowUp", "ArrowDown"],
    [increase, decrease]
  ];
  for (const [up, down] of pairs) {
    const atMax = value() >= max();
    await expectChange(atMax ? down : up, !atMax);
    await expectChange(atMax ? up : down, atMax);
  }
  await context.press("End");
  if (value() !== max()) {
    context.problem(
      thumb,
      `End should set the value to its maximum, ${max()}, but it's ${value()} (APG slider).`
    );
  }
  await context.press("Home");
  if (value() !== min()) {
    context.problem(
      thumb,
      `Home should set the value to its minimum, ${min()}, but it's ${value()} (APG slider).`
    );
  }
  if (max() - start < start - min()) {
    await context.press("End");
  }
  await pressToward(
    context,
    value,
    start,
    value() < start ? "PageUp" : "PageDown"
  );
  await pressToward(
    context,
    value,
    start,
    value() < start ? increase : decrease
  );
}
async function pressToward(context, value, target, key) {
  const below = value() < target;
  const distance = Math.abs(target - value());
  let presses = 1;
  for (let press = 0; press < presses && value() !== target; press++) {
    const before = value();
    await context.press(key);
    const moved = below ? value() - before : before - value();
    if (moved <= 0) {
      return;
    }
    if (!press) {
      presses = Math.floor(distance / moved + 1e-9);
    }
  }
}
export {
  accordion,
  checkbox,
  disclosure,
  slider,
  switchPattern
};
