// src/testing/pattern-popups.ts
import { describe, ids, isRtl, roleOf, tabStops, withRole } from "./aria.js";
import {
  checkNavigation,
  checkTabStop,
  checkTypeahead,
  currentItem,
  expectStep,
  returnTo
} from "./composite.js";
import {
  arrowsFor,
  checkOwned,
  findWidget,
  isShown,
  orientationOf,
  popupOf,
  requireName,
  triggerOf
} from "./pattern-context.js";
import { menuItemRoles, ownItems } from "./pattern-lists.js";
import { isDisabledElement } from "../foundation/forms/form.js";
async function reopen(context, trigger, key, roles, source) {
  if (context.doc.activeElement !== trigger) {
    return void 0;
  }
  await context.press(key);
  const popup = popupOf(trigger, roles);
  if (!popup || !isShown(popup)) {
    context.problem(
      trigger,
      `${key} should open its ${roles[0]} (APG ${source}).`
    );
    return void 0;
  }
  context.watch(popup);
  if (!popup.contains(context.doc.activeElement)) {
    context.problem(
      popup,
      `opened with ${key}, but focus stayed on ${describe(context.doc.activeElement)}; it moves into the ${roles[0]} (APG ${source}).`
    );
  }
  return popup;
}
async function checkEscape(context, popup, trigger, source) {
  await context.press("Escape");
  const now = popup.id && context.doc.getElementById(popup.id) || popup;
  if (isShown(now)) {
    context.problem(popup, `Escape should close it (APG ${source}).`);
    return false;
  }
  const active = context.doc.activeElement;
  if (trigger && active !== trigger) {
    context.problem(
      trigger,
      `focus should return here when Escape closes ${describe(popup)}, but went to ${describe(active)} (APG ${source}).`
    );
  }
  return true;
}
async function menu(context) {
  const popup = findWidget(context, ["menu"]);
  if (!popup || !isShown(popup)) {
    context.problem(
      context.root,
      "has no open menu; open it before checking the menu pattern."
    );
    return;
  }
  context.watch(popup);
  const trigger = triggerOf(popup);
  if (trigger) {
    context.watch(trigger);
    if (!["menu", "true"].includes(trigger.getAttribute("aria-haspopup") ?? "")) {
      context.problem(
        trigger,
        `opens a menu, so it has aria-haspopup="menu" or "true" (APG menu button).`
      );
    }
    if (trigger.getAttribute("aria-expanded") !== "true") {
      context.problem(
        trigger,
        `has aria-expanded="true" while its menu is open (APG menu button).`
      );
    }
  }
  checkOwned(context, popup, menuItemRoles, "menu");
  const items = ownItems(popup);
  if (!items.length) {
    context.problem(
      popup,
      "owns no menuitem; a menu's items have role menuitem (APG menu)."
    );
  }
  for (const item of items) {
    const role = roleOf(item);
    const states = role === "menuitemcheckbox" ? ["true", "false", "mixed"] : ["true", "false"];
    if (role !== "menuitem" && !states.includes(item.getAttribute("aria-checked") ?? "")) {
      context.problem(
        item,
        `has no aria-checked; a ${role} says whether it's checked (APG menu).`
      );
    }
  }
  const composite = {
    container: popup,
    items: () => ownItems(popup),
    noun: "item",
    source: "menu"
  };
  checkTabStop(context, composite, false);
  const active = context.doc.activeElement;
  if (!popup.contains(active) && !active?.hasAttribute("aria-activedescendant")) {
    context.problem(
      popup,
      `is open, but focus is on ${describe(active)}; opening a menu moves focus into it (APG menu button).`
    );
    return;
  }
  if (!items.length) {
    return;
  }
  const arrows = arrowsFor(orientationOf(context, popup), isRtl(popup));
  const start = currentItem(context, composite) ?? await expectStep(context, composite, arrows.next, true, void 0);
  await checkNavigation(context, composite, {
    next: [arrows.next],
    previous: [arrows.previous],
    homeEnd: true
  });
  await checkTypeahead(context, composite, arrows);
  await returnTo(context, composite, start, arrows);
  if (!await checkEscape(context, popup, trigger, "menu button") || !trigger) {
    return;
  }
  if (trigger.getAttribute("aria-expanded") === "true") {
    context.problem(
      trigger,
      `still has aria-expanded="true" after its menu closed (APG menu button).`
    );
  }
  const reopened = await reopen(
    context,
    trigger,
    "Enter",
    ["menu"],
    "menu button"
  );
  if (reopened) {
    await checkEnterActivates(context, reopened, trigger);
  }
}
async function checkEnterActivates(context, popup, trigger) {
  const composite = {
    container: popup,
    items: () => ownItems(popup),
    noun: "item",
    source: "menu"
  };
  const item = composite.items().find(
    (el) => roleOf(el) === "menuitem" && !el.hasAttribute("aria-haspopup") && !isDisabledElement(el)
  );
  if (!item) {
    return;
  }
  await returnTo(context, composite, item, {
    next: "ArrowDown",
    previous: "ArrowUp"
  });
  if (currentItem(context, composite) !== item) {
    return;
  }
  await context.press("Enter");
  if (isShown(popup)) {
    context.problem(
      item,
      "Enter should activate the item and close the menu (APG menu)."
    );
    return;
  }
  if (context.doc.activeElement !== trigger) {
    context.problem(
      trigger,
      `focus should return here when an item's Enter closes the menu, but went to ${describe(context.doc.activeElement)} (APG menu button).`
    );
  } else {
    await reopen(context, trigger, "Enter", ["menu"], "menu button");
  }
}
function isInert(el) {
  for (let node = el; node; node = node.parentElement) {
    if (node.inert === true || node.hasAttribute("inert")) {
      return true;
    }
  }
  return false;
}
var isPage = (el) => !el.matches("script, style, template") && (isInert(el) || !!el.textContent?.trim() || tabStops(el).length > 0);
function isPageInert(popup) {
  const trigger = triggerOf(popup);
  if (trigger) {
    return isInert(trigger);
  }
  for (let node = popup; node.parentElement; node = node.parentElement) {
    const page = [...node.parentElement.children].filter(
      (el) => el !== node && isPage(el)
    );
    if (page.length) {
      return page.every((el) => isInert(el));
    }
  }
  return false;
}
async function modal(context, role) {
  const source = role === "dialog" ? "dialog (modal)" : "alert dialog";
  const popup = findWidget(context, [role]);
  if (!popup || !isShown(popup)) {
    context.problem(
      context.root,
      `has no open ${role}; open it before checking the ${source} pattern.`
    );
    return;
  }
  context.watch(popup);
  requireName(context, popup, source);
  if (role === "alertdialog" && !ids(popup, "aria-describedby").length) {
    context.problem(
      popup,
      "has no aria-describedby; an alert dialog points it at its message (APG alert dialog)."
    );
  }
  const inside = () => popup.contains(context.doc.activeElement);
  if (!inside()) {
    context.problem(
      popup,
      `is open, but focus is on ${describe(context.doc.activeElement)}; opening a dialog moves focus into it (APG ${source}).`
    );
    return;
  }
  const first = context.doc.activeElement;
  const pageInert = isPageInert(popup);
  const stops = tabStops(popup).length;
  let trapped = true;
  for (const key of ["Tab", "Shift+Tab"]) {
    const from = context.doc.activeElement;
    let moved = false;
    for (let press = 0; press <= stops && trapped; press++) {
      await context.press(key);
      if (!inside()) {
        trapped = false;
      }
      if (context.doc.activeElement !== from) {
        moved = true;
      }
    }
    if (trapped && !moved && stops > 1) {
      context.problem(
        popup,
        `${key} keeps focus on ${describe(from)}; it moves through the dialog's ${stops} tab stops, wrapping at the ends (APG ${source}).`
      );
    }
  }
  const modal2 = pageInert || popup.getAttribute("aria-modal") === "true";
  if (modal2 && !trapped) {
    context.problem(
      popup,
      `is modal, but Tab moved focus out of it, to ${describe(context.doc.activeElement)}; it wraps inside (APG ${source}).`
    );
  }
  if (modal2 && popup.getAttribute("aria-modal") !== "true" && !(popup instanceof HTMLDialogElement)) {
    context.problem(
      popup,
      `is modal but has no aria-modal="true", which tells screen readers the page behind it is inert (APG ${source}).`
    );
  }
  if (!inside()) {
    first?.focus();
  }
  const trigger = triggerOf(popup);
  if (await checkEscape(context, popup, trigger, source) && trigger) {
    await reopen(context, trigger, "Enter", [role], source);
  }
}
var dialog = (context) => modal(context, "dialog");
var alertdialog = (context) => modal(context, "alertdialog");
async function combobox(context) {
  const box = findWidget(context, ["combobox"]);
  if (!box) {
    context.problem(
      context.root,
      "has no element with role combobox, so it isn't a combobox."
    );
    return;
  }
  requireName(context, box, "combobox");
  const expanded = () => box.getAttribute("aria-expanded") === "true";
  if (!["true", "false"].includes(box.getAttribute("aria-expanded") ?? "")) {
    context.problem(
      box,
      `has no aria-expanded; a combobox says whether its popup is open, "true" or "false" (APG combobox).`
    );
  }
  if (!tabStops(box).includes(box)) {
    context.problem(
      box,
      "isn't a tab stop; a combobox takes Tab (APG combobox)."
    );
  }
  const wasOpen = expanded();
  await context.focus(box);
  if (!expanded()) {
    await context.press("ArrowDown");
  }
  if (!expanded()) {
    context.problem(
      box,
      'ArrowDown should open its popup, with aria-expanded="true" (APG combobox).'
    );
    return;
  }
  const popup = popupOf(box, ["listbox", "grid", "tree", "dialog"]);
  if (!popup || !isShown(popup)) {
    context.problem(
      box,
      "is expanded, but its aria-controls names no open listbox, grid, tree or dialog (APG combobox)."
    );
    return;
  }
  context.watch(popup);
  const kind = roleOf(popup);
  if (kind !== "listbox" && box.getAttribute("aria-haspopup") !== kind) {
    context.problem(
      box,
      `controls a ${kind}, so it has aria-haspopup="${kind}"; only a listbox popup goes without it (APG combobox).`
    );
  }
  if (kind === "listbox") {
    await checkActiveOption(context, box, popup);
  }
  await context.press("Escape");
  if (expanded()) {
    context.problem(box, "Escape should close its popup (APG combobox).");
  }
  if (context.doc.activeElement !== box) {
    context.problem(
      box,
      `focus stays here when Escape closes the popup, but went to ${describe(context.doc.activeElement)} (APG combobox).`
    );
  }
  if (wasOpen && !expanded()) {
    await context.press("ArrowDown");
  }
}
async function checkActiveOption(context, box, popup) {
  const composite = {
    container: popup,
    items: () => withRole(popup, ["option"]),
    noun: "option",
    source: "combobox"
  };
  if (!composite.items().length) {
    return;
  }
  const stays = (key) => {
    if (context.doc.activeElement !== box) {
      context.problem(
        box,
        `${key} moved DOM focus to ${describe(context.doc.activeElement)}; it stays on the combobox, with aria-activedescendant naming the option (APG combobox).`
      );
    }
    return context.doc.activeElement === box;
  };
  if (!currentItem(context, composite)) {
    await context.press("ArrowDown");
    if (!stays("ArrowDown")) {
      return;
    }
  }
  if (!currentItem(context, composite)) {
    context.problem(
      box,
      "ArrowDown should make an option active, with aria-activedescendant (APG combobox)."
    );
    return;
  }
  await expectStep(context, composite, "ArrowDown", true, void 0);
  if (!stays("ArrowDown")) {
    return;
  }
  await expectStep(context, composite, "ArrowUp", false, void 0);
  stays("ArrowUp");
}
export {
  alertdialog,
  combobox,
  dialog,
  menu
};
