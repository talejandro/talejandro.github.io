// src/foundation/kernel/dev.ts
import { callbackName, defaultName } from "./option-names.js";
import { ariaProblems, knownRoles, unmetNeeds } from "./roles.js";
var dev = true;
var hookKey = /* @__PURE__ */ Symbol.for("ui-sdk.devtools@1");
var historyKey = /* @__PURE__ */ Symbol.for("ui-sdk.devtools.history@1");
var limit = 500;
var history = globalThis[historyKey] ??= {
  changes: [],
  warnings: [],
  layers: [],
  relays: [],
  shortcuts: void 0
};
function keep(list, item) {
  list.push(item);
  if (list.length > limit) {
    list.splice(0, list.length - limit);
  }
}
function emit(event) {
  if (!installed) {
    install();
  }
  if (event.type === "change") {
    keep(history.changes, event);
  } else if (event.type === "warn") {
    keep(history.warnings, event);
  } else if (event.type === "relay") {
    keep(history.relays ??= [], event);
  } else if (event.type === "layers") {
    history.layers = event.stack;
  }
  const hook = globalThis[hookKey];
  hook?.emit?.(event);
}
function warn(message, from, detail) {
  say(message, from, detail, true);
}
function note(message, from, detail) {
  say(message, from, detail, false);
}
function say(message, from, detail, strict) {
  const flags = globalThis;
  if (flags.__UI_SDK_DEV__ === false) {
    return;
  }
  const name = from ? `${from.component}${from.id ? `#${from.id}` : ""}: ` : "";
  emit({ type: "warn", message, component: from?.component, id: from?.id });
  if (strict && flags.__UI_SDK_STRICT__) {
    throw new Error(`[ui-sdk] ${name}${message}`, { cause: detail });
  }
  if (detail === void 0) {
    console.warn(`[ui-sdk] ${name}${message}`);
  } else {
    console.warn(`[ui-sdk] ${name}${message}`, detail);
  }
}
var needMessages = {
  focus: 'takes focus, so its slot needs `focus`: "roving", "tab-stop", "active-descendant" or "native", or `{ none: "why" }` when another element takes it',
  press: "activates, so its slot needs `press`",
  keys: 'moves with keys, so its slot needs `keys`, the keys its `on.keydown` handles, or `{ none: "why" }` when another element handles them',
  keydown: "lists `keys`, so its slot needs an `on.keydown` that handles them"
};
function checkRoles(slots, from) {
  for (const [slot, definition] of Object.entries(slots)) {
    const { role, roles } = definition;
    if (role === void 0) {
      continue;
    }
    if (typeof role === "function" && !roles?.length) {
      warn(
        `the "${slot}" part picks its role from state, so its slot lists every role it can pick in \`roles\`.`,
        from
      );
    }
    for (const each of typeof role === "string" ? [role] : roles ?? []) {
      if (!knownRoles.has(each)) {
        warn(`the "${slot}" part's role "${each}" isn't a WAI-ARIA role.`, from);
      }
      for (const need of unmetNeeds(each, definition)) {
        warn(
          `the "${slot}" part is ${/^[aeiou]/.test(each) ? "an" : "a"} ${each}, which ${needMessages[need]}.`,
          from
        );
      }
    }
  }
}
var warnedRole = /* @__PURE__ */ new WeakSet();
var warnedAria = /* @__PURE__ */ new WeakMap();
function checkRole(definition, slot, own, role, from, live) {
  if (typeof role === "string") {
    checkAria(definition, slot, role, { ...own, ...live }, from);
  }
  if (warnedRole.has(definition)) {
    return;
  }
  if (own?.role !== void 0 && definition.role !== void 0) {
    warnedRole.add(definition);
    warn(
      `the "${slot}" part declares its role, and its \`attrs\` writes one too. Leave \`role\` out of \`attrs\`.`,
      from
    );
  } else if (typeof definition.role === "function" && role !== void 0 && !definition.roles?.includes(role)) {
    warnedRole.add(definition);
    warn(
      `the "${slot}" part picked the role "${String(role)}", which its slot's \`roles\` doesn't list.`,
      from
    );
  }
}
function checkAria(definition, slot, role, written, from) {
  const { notAllowed, missing } = ariaProblems(role, written);
  if (!notAllowed.length && !missing.length) {
    return;
  }
  let warned = warnedAria.get(definition);
  if (!warned) {
    warnedAria.set(definition, warned = /* @__PURE__ */ new Set());
  }
  const a = /^[aeiou]/.test(role) ? "an" : "a";
  for (const name of notAllowed) {
    if (warned.has(name)) {
      continue;
    }
    warned.add(name);
    warn(
      `the "${slot}" part is ${a} ${role}, which doesn't take \`${name}\`, so assistive technology ignores it.`,
      from
    );
  }
  for (const name of missing) {
    if (warned.has(name)) {
      continue;
    }
    warned.add(name);
    warn(
      `the "${slot}" part is ${a} ${role}, which needs \`${name}\`, and neither its \`attrs\` nor its \`live\` writes it.`,
      from
    );
  }
}
var focusesOnItsOwn = 'button, input, select, textarea, a[href], summary, iframe, [contenteditable]:not([contenteditable="false"])';
function checkFocus(focus, slot, el, from) {
  if (typeof focus !== "string" || typeof Element === "undefined" || !(el instanceof Element)) {
    return;
  }
  setTimeout(() => {
    if (!el.isConnected || el.closest('[aria-disabled="true"], [disabled], [inert], [hidden]')) {
      return;
    }
    const tag = `<${el.localName}>`;
    if (focus === "native" && !el.matches(focusesOnItsOwn)) {
      warn(
        `the "${slot}" part's focus is "native", but a ${tag} doesn't take focus on its own. Render a native control, or use "roving" or "tab-stop" with a tabindex.`,
        from
      );
    } else if ((focus === "roving" || focus === "tab-stop") && !el.hasAttribute("tabindex") && !el.matches(focusesOnItsOwn)) {
      warn(
        `the "${slot}" part's focus is "${focus}", but its ${tag} has no tabindex, so it can't take focus.`,
        from
      );
    } else if (focus === "active-descendant" && !el.id) {
      warn(
        `the "${slot}" part's focus is "active-descendant", but it has no id for \`aria-activedescendant\` to point at.`,
        from
      );
    }
  });
}
var warnedMissing = /* @__PURE__ */ new WeakMap();
function warnMissing(slots, from) {
  const warned = warnedMissing.get(slots) ?? /* @__PURE__ */ new Set();
  warnedMissing.set(slots, warned);
  return new Proxy(slots, {
    get(target, slot) {
      if (typeof slot != "string" || slot in target) {
        return target[slot];
      }
      if (!warned.has(slot)) {
        warned.add(slot);
        warn(
          `the "${slot}" part isn't defined. A part that ships with a feature registers it with \`use\` before it renders.`,
          from
        );
      }
      return {};
    }
  });
}
var reasonEvents = {
  "trigger-press": ["MouseEvent", "KeyboardEvent", "TouchEvent"],
  "trigger-hover": ["PointerEvent"],
  "trigger-focus": ["FocusEvent"],
  "item-press": ["MouseEvent", "KeyboardEvent"],
  "close-press": ["MouseEvent", "KeyboardEvent", "SubmitEvent"],
  press: ["MouseEvent", "KeyboardEvent"],
  "list-navigation": ["KeyboardEvent"],
  "link-press": ["MouseEvent", "KeyboardEvent"],
  "item-hover": ["PointerEvent"],
  "outside-press": ["MouseEvent"],
  "escape-key": ["KeyboardEvent"],
  "focus-out": ["FocusEvent", "KeyboardEvent"],
  // Chrome's window blur is a plain Event, not the FocusEvent the type names.
  "window-blur": ["Event"],
  "submenu-switch": ["PointerEvent", "KeyboardEvent"],
  "parent-close": [],
  "trigger-release": ["PointerEvent"],
  "find-in-page": ["Event"],
  "item-removed": [],
  reset: [],
  restore: [],
  "storage-sync": ["StorageEvent"],
  swipe: ["PointerEvent", "TouchEvent"],
  scroll: ["Event"],
  "focus-in": ["FocusEvent"],
  "handle-press": ["MouseEvent", "KeyboardEvent"],
  "handle-key": ["KeyboardEvent"],
  "content-resize": [],
  back: ["Event"],
  imperative: [],
  shortcut: ["KeyboardEvent"],
  timeout: [],
  action: ["MouseEvent", "KeyboardEvent"],
  unmount: [],
  "clear-press": ["MouseEvent", "KeyboardEvent"],
  "input-change": ["Event"],
  "history-key": ["KeyboardEvent"],
  "remove-press": ["MouseEvent", "KeyboardEvent"],
  "input-commit": ["FocusEvent", "KeyboardEvent"],
  "step-key": ["KeyboardEvent"],
  "track-press": ["PointerEvent"],
  drag: ["PointerEvent"],
  "move-key": ["KeyboardEvent"],
  collapse: ["KeyboardEvent", "MouseEvent"],
  resize: [],
  "increment-press": ["PointerEvent", "MouseEvent"],
  "decrement-press": ["PointerEvent", "MouseEvent"],
  wheel: ["WheelEvent"],
  scrub: ["PointerEvent"],
  "accessibility-adjust": ["Event"],
  drop: ["DragEvent"],
  paste: ["ClipboardEvent"],
  picker: ["Event"],
  "caret-move": ["Event"],
  cut: ["ClipboardEvent"],
  undo: ["KeyboardEvent", "InputEvent"],
  redo: ["KeyboardEvent", "InputEvent"],
  "image-load": ["Event"],
  "image-error": ["Event"],
  "src-change": [],
  "toggle-press": ["MouseEvent", "KeyboardEvent"],
  "form-submit": ["SubmitEvent"],
  "page-hide": ["PageTransitionEvent"],
  "previous-press": ["MouseEvent", "KeyboardEvent"],
  "next-press": ["MouseEvent", "KeyboardEvent"],
  "first-press": ["MouseEvent", "KeyboardEvent"],
  "last-press": ["MouseEvent", "KeyboardEvent"]
};
var checked = /* @__PURE__ */ new Set();
function checkEvent(reason, event, from) {
  if (!event || typeof window === "undefined") {
    return;
  }
  const allowed = reasonEvents[reason];
  if (!allowed) {
    return;
  }
  const constructors = window;
  const matches = allowed.some((name) => {
    const constructor = constructors[name];
    return !!constructor && event instanceof constructor;
  });
  if (matches) {
    return;
  }
  const key = `${reason}:${event.constructor.name}`;
  if (checked.has(key)) {
    return;
  }
  checked.add(key);
  warn(
    `reported \`${reason}\` with a ${event.constructor.name} (\`${event.type}\`), which the vocabulary doesn't list.`,
    from
  );
}
var preventedOnce = /* @__PURE__ */ new Set();
function checkPrevented(name, prevented, details, from) {
  if (prevented || !details.event?.defaultPrevented || details.canceled) {
    return;
  }
  const key = `${from.component}:${name}`;
  if (preventedOnce.has(key)) {
    return;
  }
  preventedOnce.add(key);
  warn(
    `\`details.event.preventDefault()\` in \`${name}\` stopped the browser's default, not the change. Call \`details.cancel()\` to stop the change.`,
    from
  );
}
function distance(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(
        row[j] + 1,
        next[j - 1] + 1,
        row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    row = next;
  }
  return row[b.length];
}
var marked = /* @__PURE__ */ new WeakSet();
function checkMarks(elements, marks) {
  for (const start of elements) {
    for (let el = start; el && !marked.has(el); el = el.parentElement) {
      marked.add(el);
      for (const { name } of el.attributes) {
        const near = name.startsWith("data-agent-") && !marks.includes(name) && marks.find((mark) => distance(name, mark) <= 2);
        if (near) {
          warn(
            `${name} isn't an agent mark, so it does nothing. Did you mean ${near}?`
          );
        }
      }
    }
  }
}
function exposeShortcuts(list) {
  history.shortcuts = list;
}
var controls = /* @__PURE__ */ new WeakMap();
function checkControlled(from, keys, options) {
  const values = options;
  let control = controls.get(from);
  if (!control) {
    controls.set(from, control = { was: /* @__PURE__ */ new Map(), warned: /* @__PURE__ */ new Set() });
  }
  const { was, warned } = control;
  const once = (key, message) => {
    if (warned.has(key)) {
      return;
    }
    warned.add(key);
    warn(message, from);
  };
  for (const key of keys) {
    const fallback = defaultName(key);
    const isControlled = values[key] !== void 0;
    if (isControlled && !was.has(key) && values[fallback] !== void 0) {
      once(`${key}+`, `got \`${key}\` and \`${fallback}\`. Pass one.`);
    }
    if (was.get(key) && !isControlled) {
      once(
        key,
        `stopped controlling \`${key}\`: it was passed and is now undefined, so the component keeps its last value.`
      );
    }
    was.set(key, isControlled);
  }
}
var pending = /* @__PURE__ */ new WeakMap();
function expectControlled(instance, info, current) {
  let waiting = pending.get(instance);
  if (!waiting) {
    pending.set(instance, waiting = /* @__PURE__ */ new Map());
  }
  clearTimeout(waiting.get(info.key)?.timer);
  const before = current();
  const timer = setTimeout(() => {
    waiting.delete(info.key);
    if (!Object.is(current(), before) || Object.is(before, info.value)) {
      return;
    }
    const asked = info.key === "open" ? info.value ? "to open" : "to close" : `for \`${info.key}\` ${JSON.stringify(info.value)}`;
    const callback = callbackName(info.key, "Change");
    warn(
      `asked ${asked} (\`${info.reason}\`, \`${info.source}\`), and \`${info.key}\` stayed ${JSON.stringify(before)}. Update it in \`${callback}\`, right away even when a save or navigation follows, or call \`details.cancel()\` there to refuse.`,
      info
    );
  }, 1e3);
  waiting.set(info.key, { timer, before });
}
function heardControlled(instance, options) {
  const waiting = pending.get(instance);
  if (!waiting) {
    return;
  }
  const values = options;
  for (const [key, { timer, before }] of waiting) {
    if (!Object.is(values[key], before)) {
      clearTimeout(timer);
      waiting.delete(key);
    }
  }
}
function forgetControlled(instance) {
  pending.get(instance)?.forEach(({ timer }) => clearTimeout(timer));
  pending.delete(instance);
}
var installed = false;
function install() {
  installed = true;
  const realm = globalThis;
  realm.__UI_SDK__ ??= {
    changes: (filter = {}) => history.changes.filter(
      (change) => (!filter.component || change.component === filter.component) && (!filter.id || change.id === filter.id) && (!filter.key || change.key === filter.key)
    ),
    layers: () => history.layers,
    shortcuts: () => history.shortcuts?.() ?? [],
    warnings: () => history.warnings
  };
}
var measuring = 0;
function measured(read) {
  measuring++;
  try {
    read();
  } finally {
    measuring--;
  }
}
var isMeasuring = () => measuring > 0;
export {
  checkControlled,
  checkEvent,
  checkFocus,
  checkMarks,
  checkPrevented,
  checkRole,
  checkRoles,
  dev,
  emit,
  expectControlled,
  exposeShortcuts,
  forgetControlled,
  heardControlled,
  isMeasuring,
  measured,
  note,
  warn,
  warnMissing
};
