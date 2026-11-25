// src/testing/check-pattern.ts
import { createContext, stopped } from "./pattern-context.js";
import {
  accordion,
  checkbox,
  disclosure,
  slider,
  switchPattern
} from "./pattern-controls.js";
import {
  listbox,
  menubar,
  radioGroup,
  tabs,
  toolbar,
  tree
} from "./pattern-lists.js";
import { alertdialog, combobox, dialog, menu } from "./pattern-popups.js";
var checks = {
  listbox,
  menu,
  menubar,
  tabs,
  "radio-group": radioGroup,
  toolbar,
  tree,
  dialog,
  alertdialog,
  disclosure,
  accordion,
  combobox,
  slider,
  switch: switchPattern,
  checkbox
};
async function checkPattern(root, pattern) {
  const check = checks[pattern];
  if (!check) {
    throw new Error(
      `checkPattern doesn't support "${pattern}" yet. It supports ${Object.keys(checks).join(", ")}.`
    );
  }
  const context = createContext(root);
  context.checkReferences();
  try {
    await check(context);
  } catch (error) {
    if (error !== stopped) {
      throw error;
    }
  }
  const problems = [...context.problems];
  if (!problems.length) {
    return;
  }
  const count = `${problems.length} problem${problems.length === 1 ? "" : "s"}`;
  throw new Error(
    `checkPattern found ${count} with the ${pattern} pattern:
${problems.map((problem) => `- ${problem}`).join("\n")}`
  );
}
export {
  checkPattern
};
