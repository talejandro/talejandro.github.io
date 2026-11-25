// src/foundation/kernel/roles.ts
var roles = [
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "blockquote",
  "button",
  "caption",
  "cell",
  "checkbox",
  "code",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "deletion",
  "dialog",
  "document",
  "emphasis",
  "feed",
  "figure",
  "form",
  "generic",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "insertion",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "marquee",
  "math",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "meter",
  "navigation",
  "none",
  "note",
  "option",
  "paragraph",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "strong",
  "subscript",
  "superscript",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "time",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem"
];
var focusableRoles = [
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
  "searchbox",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
  "treeitem"
];
var pressableRoles = [
  "button",
  "checkbox",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "switch",
  "tab",
  "treeitem"
];
var keyedRoles = [
  "combobox",
  "grid",
  "listbox",
  "menu",
  "menubar",
  "radiogroup",
  "slider",
  "spinbutton",
  "tablist",
  "toolbar",
  "tree",
  "treegrid"
];
var ariaSupport = {
  "aria-activedescendant": [
    "application",
    "combobox",
    "grid",
    "group",
    "listbox",
    "menu",
    "menubar",
    "radiogroup",
    "row",
    "searchbox",
    "spinbutton",
    "tablist",
    "textbox",
    "toolbar",
    "tree",
    "treegrid"
  ],
  "aria-autocomplete": ["combobox", "searchbox", "textbox"],
  "aria-checked": [
    "checkbox",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "switch",
    "treeitem"
  ],
  "aria-colcount": ["grid", "table", "treegrid"],
  "aria-colindex": ["cell", "columnheader", "gridcell", "row", "rowheader"],
  "aria-colspan": ["cell", "columnheader", "gridcell", "rowheader"],
  "aria-expanded": [
    "application",
    "button",
    "checkbox",
    "columnheader",
    "combobox",
    "gridcell",
    "link",
    "listbox",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "row",
    "rowheader",
    "switch",
    "tab",
    "treeitem"
  ],
  "aria-level": ["heading", "listitem", "row", "treeitem"],
  "aria-modal": ["alertdialog", "dialog"],
  "aria-multiline": ["searchbox", "textbox"],
  "aria-multiselectable": ["grid", "listbox", "tablist", "tree", "treegrid"],
  "aria-orientation": [
    "listbox",
    "menu",
    "menubar",
    "radiogroup",
    "scrollbar",
    "separator",
    "slider",
    "tablist",
    "toolbar",
    "tree",
    "treegrid"
  ],
  "aria-placeholder": ["searchbox", "textbox"],
  "aria-posinset": [
    "article",
    "listitem",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "row",
    "tab",
    "treeitem"
  ],
  "aria-pressed": ["button"],
  "aria-readonly": [
    "checkbox",
    "columnheader",
    "combobox",
    "grid",
    "gridcell",
    "listbox",
    "menuitemcheckbox",
    "menuitemradio",
    "radiogroup",
    "rowheader",
    "searchbox",
    "slider",
    "spinbutton",
    "switch",
    "textbox"
  ],
  "aria-required": [
    "checkbox",
    "columnheader",
    "combobox",
    "gridcell",
    "listbox",
    "radiogroup",
    "rowheader",
    "searchbox",
    "spinbutton",
    "switch",
    "textbox",
    "tree",
    "treegrid"
  ],
  "aria-rowcount": ["grid", "table", "treegrid"],
  "aria-rowindex": ["cell", "columnheader", "gridcell", "row", "rowheader"],
  "aria-rowspan": ["cell", "columnheader", "gridcell", "rowheader"],
  "aria-selected": [
    "columnheader",
    "gridcell",
    "option",
    "row",
    "rowheader",
    "tab",
    "treeitem"
  ],
  "aria-setsize": [
    "article",
    "listitem",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "row",
    "tab",
    "treeitem"
  ],
  "aria-sort": ["columnheader", "rowheader"],
  "aria-valuemax": [
    "meter",
    "progressbar",
    "scrollbar",
    "separator",
    "slider",
    "spinbutton"
  ],
  "aria-valuemin": [
    "meter",
    "progressbar",
    "scrollbar",
    "separator",
    "slider",
    "spinbutton"
  ],
  "aria-valuenow": [
    "meter",
    "progressbar",
    "scrollbar",
    "separator",
    "slider",
    "spinbutton"
  ],
  "aria-valuetext": [
    "meter",
    "progressbar",
    "scrollbar",
    "separator",
    "slider",
    "spinbutton"
  ]
};
var namelessRoles = [
  "caption",
  "code",
  "deletion",
  "emphasis",
  "generic",
  "insertion",
  "none",
  "paragraph",
  "presentation",
  "strong",
  "subscript",
  "superscript"
];
var requiredStates = {
  checkbox: ["aria-checked"],
  combobox: ["aria-expanded"],
  menuitemcheckbox: ["aria-checked"],
  menuitemradio: ["aria-checked"],
  meter: ["aria-valuenow"],
  option: ["aria-selected"],
  radio: ["aria-checked"],
  slider: ["aria-valuenow"],
  switch: ["aria-checked"],
  tab: ["aria-selected"]
};
var focusable = new Set(focusableRoles);
var pressable = new Set(pressableRoles);
var keyed = new Set(keyedRoles);
function unmetNeeds(role, slot) {
  const unmet = [];
  if (focusable.has(role) && !slot.focus) {
    unmet.push("focus");
  }
  if (pressable.has(role) && !slot.press) {
    unmet.push("press");
  }
  if (keyed.has(role) && !slot.keys) {
    unmet.push("keys");
  }
  if ((Array.isArray(slot.keys) || typeof slot.keys === "function") && !slot.on?.keydown) {
    unmet.push("keydown");
  }
  return unmet;
}
var knownRoles = new Set(roles);
var naming = ["aria-label", "aria-labelledby"];
var nativeStates = {
  checkbox: ["aria-checked"],
  number: ["aria-valuenow"],
  radio: ["aria-checked"],
  range: ["aria-valuenow"]
};
function ariaProblems(role, attrs) {
  const notAllowed = [];
  for (const [name, value] of Object.entries(attrs)) {
    if (value === void 0) {
      continue;
    }
    const supported = ariaSupport[name];
    if (supported && !supported.includes(role)) {
      notAllowed.push(name);
    }
    if (naming.includes(name) && namelessRoles.includes(role)) {
      notAllowed.push(name);
    }
  }
  const required = requiredStates[role] ?? [];
  const native = nativeStates[attrs.type] ?? [];
  return {
    notAllowed,
    missing: required.filter(
      (name) => attrs[name] === void 0 && !native.includes(name)
    )
  };
}
export {
  ariaProblems,
  knownRoles,
  unmetNeeds
};
