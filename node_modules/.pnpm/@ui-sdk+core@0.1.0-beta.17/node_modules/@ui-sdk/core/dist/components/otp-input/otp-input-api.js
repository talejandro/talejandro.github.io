// src/components/otp-input/otp-input-api.ts
import { isRTL } from "../../foundation/platform/env.js";
import { isDisabled, watchFieldsets } from "../../foundation/forms/form.js";
import { afterReset, keepsValueOnReset } from "../../foundation/forms/value.js";
import {
  fitsPattern,
  focusSelection,
  insertCode,
  isValidCode,
  keySelection,
  pastedCode,
  pressSelection,
  slotSelection
} from "./otp-input-model.js";
import "../../foundation/kernel/details.js";
import { isComposing, on } from "../../foundation/kernel/events.js";
import {
  createChange,
  createCommit
} from "../../foundation/kernel/input-source.js";
import { elements } from "../../foundation/kernel/elements.js";
var finiteLength = (maxLength) => maxLength !== void 0 && Number.isInteger(maxLength) && maxLength > 0 ? maxLength : 6;
function settings(options) {
  return {
    maxLength: finiteLength(options.maxLength),
    pattern: options.pattern ?? "digits",
    inputMode: options.inputMode,
    textAlign: options.textAlign ?? "start",
    autoComplete: options.autoComplete ?? "one-time-code",
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form
  };
}
function cleanCode(value, pattern, maxLength) {
  return Array.from(value).filter((char) => fitsPattern(char, pattern)).join("").slice(0, maxLength);
}
var badges = "[data-lastpass-icon-root], com-1password-button, [data-dashlanecreated]";
var badgeSpace = 40;
var hiddenSelection = /* @__PURE__ */ new WeakSet();
function hideNativeHighlights(root) {
  if (!(root instanceof Document || root instanceof ShadowRoot) || hiddenSelection.has(root)) {
    return;
  }
  if (typeof CSSStyleSheet === "undefined" || !("adoptedStyleSheets" in root)) {
    return;
  }
  hiddenSelection.add(root);
  const input = '[data-slot="otp-input-control"]';
  const transparent = "background:transparent!important;color:transparent!important;-webkit-text-fill-color:transparent!important;box-shadow:none!important";
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(
    [
      `${input}::selection{${transparent}}`,
      `${input}:autofill{${transparent}}`
    ].join("\n")
  );
  try {
    sheet.insertRule(`${input}:-webkit-autofill{${transparent}}`);
  } catch {
  }
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
}
function otpInputApiBody(context) {
  const { store, options, element } = context;
  const change = createChange(context);
  const commit = createCommit(context);
  const input = () => element("control");
  const isControlled = () => options().value !== void 0;
  let inserting;
  let writing = false;
  let awaitingOwner = false;
  let afterDelete = false;
  let pointerType = "";
  function complete(value, reason, event) {
    if (value.length !== store.get().maxLength || reason === "reset" || reason === "restore") {
      return;
    }
    commit("value", value, { reason, event });
  }
  function write(value, reason, event) {
    const { pattern, maxLength } = store.get();
    const code = cleanCode(value, pattern, maxLength);
    const previous = store.get().value;
    if (!change("value", code, { reason, event })) {
      return false;
    }
    if (!isControlled()) {
      store.set({ value: code });
    }
    syncElement();
    checkLength();
    if (code !== previous) {
      complete(code, reason, event);
    }
    return true;
  }
  function checkLength() {
    const el = input();
    if (el) {
      store.set({ tooShort: el.validity.tooShort });
    }
  }
  function syncElement() {
    const el = input();
    const { value, maxLength } = store.get();
    if (!el || el.value === value || awaitingOwner) {
      return;
    }
    writing = true;
    el.value = value;
    writing = false;
    store.set({ tooShort: false });
    if (isFocused(el)) {
      select(el, focusSelection(value.length, maxLength));
    }
  }
  function select(el, selection, direction) {
    el.setSelectionRange(selection.start, selection.end, direction);
    store.set({ selection: { start: selection.start, end: selection.end } });
  }
  function syncSelection(el) {
    if (!isFocused(el)) {
      return;
    }
    const current = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
    const deleted = afterDelete && current.start === current.end;
    const next = deleted ? null : slotSelection(
      current,
      store.get().selection,
      el.value.length,
      store.get().maxLength
    );
    if (next) {
      select(el, next, next.direction);
    } else {
      store.set({ selection: current });
    }
  }
  function typed(el, event) {
    if (writing) {
      return;
    }
    afterDelete = !!event.inputType?.startsWith("delete");
    const { pattern, maxLength, value: previous } = store.get();
    let next = el.value;
    if (next !== previous && !isValidCode(next, pattern, maxLength)) {
      if (event.isComposing) {
        return;
      }
      const cleaned = pastedCode(next, pattern);
      next = cleaned && cleaned.length <= maxLength ? cleaned : previous;
      restore(el, next);
    }
    if (next !== previous) {
      const { reason, event: cause } = inserting ?? {
        reason: reasonOf(event),
        event
      };
      if (change("value", next, { reason, event: cause })) {
        if (!isControlled()) {
          store.set({ value: next });
        } else {
          awaitingOwner = true;
          queueMicrotask(() => {
            awaitingOwner = false;
            syncElement();
          });
        }
        complete(next, reason, cause);
      } else {
        restore(el, previous);
      }
    }
    checkLength();
    syncSelection(el);
  }
  function restore(el, value) {
    const inserted = el.value.length - value.length;
    const caret = Math.max(
      0,
      (el.selectionStart ?? el.value.length) - Math.max(0, inserted)
    );
    writing = true;
    el.value = value;
    writing = false;
    el.setSelectionRange(caret, caret);
  }
  function insert(el, value, reason, event) {
    inserting = { reason, event };
    try {
      el.setSelectionRange(0, el.value.length);
      const inserted = el.ownerDocument.execCommand?.(
        "insertText",
        false,
        value
      );
      if (!inserted || el.value !== value) {
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } finally {
      inserting = void 0;
    }
  }
  function insertMany(el, text, reason, event) {
    const { pattern, maxLength, value } = store.get();
    const code = pastedCode(text, pattern);
    if (!code) {
      return;
    }
    const selection = {
      start: el.selectionStart ?? value.length,
      end: el.selectionEnd ?? value.length
    };
    const next = insertCode(value, selection, code, maxLength);
    if (next !== value) {
      insert(el, next, reason, event);
    }
  }
  const editable = () => !isDisabled(store.get()) && !store.get().readOnly;
  function slotAt(el, event) {
    const hit = el.ownerDocument.elementsFromPoint?.(event.clientX, event.clientY) ?? [];
    return elements(context, "slot").find(
      (entry) => hit.includes(entry.el)
    );
  }
  function pressSlot(el, event) {
    afterDelete = false;
    const slot = slotAt(el, event);
    if (!slot || isDisabled(store.get())) {
      return;
    }
    if (event.type === "mousedown") {
      event.preventDefault();
      el.focus();
    }
    select(
      el,
      pressSelection(
        slot.props?.index ?? 0,
        el.value.length,
        store.get().maxLength
      )
    );
  }
  function checkBadge(el) {
    const root = element("root");
    if (!root || !el.ownerDocument.querySelector(badges)) {
      return;
    }
    const view = el.ownerDocument.defaultView;
    const room = !view || root.getBoundingClientRect().right + badgeSpace <= view.innerWidth;
    store.set({ pushBadge: room });
  }
  function bind(el) {
    const { value, pattern, maxLength } = store.get();
    const restored = !isControlled() && el.value && el.value !== value && isValidCode(el.value, pattern, maxLength);
    if (restored) {
      write(el.value, "restore");
    } else {
      syncElement();
    }
    hideNativeHighlights(el.getRootNode());
    const doc = el.ownerDocument;
    const cleanups = [
      store.subscribe(syncElement),
      // Typing that fits is left to the browser, so the undo history stays its
      // own. Anything else, like several characters at once or a full-width
      // digit, goes through `insertMany`, which cleans it up or drops it.
      on(el, "beforeinput", (event) => {
        const type = event.inputType;
        if (inserting || !type.startsWith("insert")) {
          return;
        }
        if (type === "insertCompositionText" || type === "insertFromPaste") {
          return;
        }
        const text = event.data ?? event.dataTransfer?.getData("text/plain") ?? "";
        if (text.length <= 1 && fitsPattern(text, store.get().pattern)) {
          return;
        }
        event.preventDefault();
        insertMany(el, text, "input-change", event);
      }),
      on(el, "paste", (event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (!editable() || !text) {
          return;
        }
        event.preventDefault();
        insertMany(el, text, "paste", event);
      }),
      on(el, "input", (event) => typed(el, event)),
      // Browsers differ on whether an `input` follows the end of a composition.
      on(el, "compositionend", (event) => typed(el, event)),
      on(el, "focus", () => {
        store.set({ focused: true });
        select(el, focusSelection(el.value.length, store.get().maxLength));
        requestAnimationFrame(() => checkBadge(el));
      }),
      on(el, "blur", () => store.set({ focused: false })),
      // Arrow keys, Home and End move a slot at a time, here rather than after
      // the browser moves the caret, whose `selectionchange` comes too late for
      // a key typed right after. With a modifier, they extend the selection natively.
      on(el, "keydown", (event) => {
        if (event.key !== "Backspace" && event.key !== "Delete") {
          afterDelete = false;
        }
        if (isComposing(event)) {
          return;
        }
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        const { selection, maxLength: maxLength2 } = store.get();
        const next = keySelection(
          event.key,
          selection,
          el.value.length,
          maxLength2,
          isRTL(el)
        );
        if (!next) {
          return;
        }
        event.preventDefault();
        select(el, next);
      }),
      on(el, "pointerdown", (event) => pointerType = event.pointerType),
      on(el, "mousedown", (event) => {
        if (pointerType === "mouse" && event.button === 0) {
          pressSlot(el, event);
        }
      }),
      on(el, "click", (event) => {
        if (pointerType !== "mouse") {
          pressSlot(el, event);
        }
      }),
      on(el, "select", () => syncSelection(el)),
      // Selection changes fire on the input in newer engines, and on the document in all.
      on(el, "selectionchange", () => syncSelection(el)),
      on(doc, "selectionchange", () => syncSelection(el)),
      on(
        doc,
        "reset",
        (event) => {
          if (event.target !== el.form || keepsValueOnReset(options().value, options().defaultValue)) {
            return;
          }
          afterReset(event, () => write(store.get().initial, "reset"));
        },
        { capture: true }
      ),
      watchFieldsets(el, (disabled) => store.set({ formDisabled: disabled }))
    ];
    if (isFocused(el)) {
      store.set({ focused: true });
    }
    return () => cleanups.forEach((cleanup) => cleanup());
  }
  return {
    /** The code. */
    getValue: () => store.get().value,
    /** Sets the code, as typing it would. Characters that don't fit the pattern are dropped. */
    setValue: (value, { reason = "imperative", event } = {}) => write(value, reason, event),
    /** Empties the code. */
    clear: ({ reason = "imperative", event } = {}) => write("", reason, event),
    /** Moves focus to the input. */
    focus: () => input()?.focus(),
    internal: {
      bind
    }
  };
}
var otpInputApi = otpInputApiBody;
function isFocused(el) {
  const root = el.getRootNode();
  return root.activeElement === el;
}
function reasonOf(event) {
  const type = event.inputType;
  if (type === "historyUndo") {
    return "undo";
  }
  if (type === "historyRedo") {
    return "redo";
  }
  return "input-change";
}
export {
  badgeSpace,
  cleanCode,
  isDisabled,
  otpInputApi,
  settings
};
