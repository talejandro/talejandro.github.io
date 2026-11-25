// src/components/date-input/date-input-api.ts
import {
  boundsOf,
  clampDay,
  compareTo,
  dateOf,
  emptyFields,
  fieldsOf,
  hourCycleOf,
  normalizeValue,
  pageStepOf,
  segmentsOf,
  stepField,
  stepToEnd,
  typeDigit,
  typePeriod,
  typesOf,
  valueOf
} from "./date-input-model.js";
import { matchesDate } from "../calendar/calendar-model.js";
import { parseDate } from "../../foundation/date/parse.js";
import { isDisabled, watchFieldsets } from "../../foundation/forms/form.js";
import { isRTL } from "../../foundation/platform/env.js";
import { bindPageLocale, localeOf } from "../../foundation/text/locale.js";
import { elements } from "../../foundation/kernel/elements.js";
import { createChange } from "../../foundation/kernel/input-source.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
var keyOf = (value) => String(value);
var formatOf = (state) => {
  const locale = localeOf(state);
  return {
    kind: state.kind,
    granularity: state.granularity,
    hourCycle: state.hourCycle ?? hourCycleOf(locale),
    locale
  };
};
var editing = (state) => state.fieldsFor === keyOf(state.value);
var shownFields = (state) => editing(state) ? state.fields : fieldsOf(state.value, formatOf(state));
var segmentCache = /* @__PURE__ */ new WeakMap();
function segmentsFor(state) {
  let segments = segmentCache.get(state);
  if (!segments) {
    segments = segmentsOf(
      formatOf(state),
      shownFields(state),
      editing(state) ? state.buffer : null
    );
    segmentCache.set(state, segments);
  }
  return segments;
}
var segmentFor = (state, key) => segmentsFor(state).find((segment) => segment.key === key);
function isPartial(state) {
  if (state.value !== null) {
    return false;
  }
  const fields = shownFields(state);
  return typesOf(formatOf(state)).some((type) => fields[type] !== null);
}
function problemOf(state) {
  const { value, min, max } = state;
  if (value === null) {
    return void 0;
  }
  if (min !== null && compareTo(value, min) < 0) {
    return "rangeUnderflow";
  }
  if (max !== null && compareTo(value, max) > 0) {
    return "rangeOverflow";
  }
  const date = dateOf(value);
  if (date && matchesDate(date, state.unavailable)) {
    return "unavailable";
  }
}
var settings = (kind, options) => {
  const granularity = options.granularity ?? (kind === "date" ? "day" : "minute");
  const format = { kind, granularity, hourCycle: 24 };
  return {
    kind,
    granularity,
    hourCycle: options.hourCycle === 12 || options.hourCycle === 24 ? options.hourCycle : null,
    locale: options.locale ?? null,
    min: normalizeBound(options.min, format),
    max: normalizeBound(options.max, format),
    unavailable: kind === "date" ? options.unavailable ?? null : null,
    disabled: !!options.disabled,
    readOnly: !!options.readOnly,
    required: !!options.required,
    name: options.name,
    form: options.form
  };
};
function normalizeBound(bound, format) {
  if (typeof bound !== "string") {
    return null;
  }
  const dateAlone = format.kind === "date" && /^\d{4}-\d{2}-\d{2}$/.test(bound);
  return normalizeValue(bound, {
    ...format,
    granularity: dateAlone ? "day" : "second"
  });
}
var valueFor = (kind, options, value) => normalizeValue(value, {
  kind,
  granularity: options.granularity ?? (kind === "date" ? "day" : "minute"),
  hourCycle: 24
});
function initialDateInputState(kind, options) {
  return {
    ...settings(kind, options),
    value: valueFor(
      kind,
      options,
      options.value ?? options.defaultValue ?? null
    ),
    initial: valueFor(kind, options, options.defaultValue ?? null),
    fields: emptyFields(),
    fieldsFor: "",
    buffer: null,
    pageLocale: null,
    formDisabled: false
  };
}
var syncDateInputState = (kind, options) => ({
  ...settings(kind, options),
  ...options.defaultValue === void 0 ? {} : { initial: valueFor(kind, options, options.defaultValue) },
  ...options.value === void 0 ? {} : { value: valueFor(kind, options, options.value) }
});
var optionKinds = {
  value: "string",
  defaultValue: "string",
  onValueChange: "callback",
  granularity: "string",
  hourCycle: "number",
  min: "string",
  max: "string",
  unavailable: "list",
  locale: "string",
  disabled: "boolean",
  readOnly: "boolean",
  required: "boolean",
  name: "string",
  form: "string",
  controller: "value"
};
var separators = /[\s/.,:\-–]/;
function dateInputApiBody(context) {
  const { store, element } = context;
  const change = createChange(context);
  const format = () => formatOf(store.get());
  const segmentElements = () => elements(
    context,
    "segment"
  ).map(({ el, props }) => ({
    el,
    type: segmentFor(store.get(), props.segment?.key ?? "")?.type
  })).filter(
    (item) => !!item.type && item.type !== "literal"
  );
  const segmentElement = (type) => segmentElements().find((item) => item.type === type)?.el;
  let advancedTo = null;
  function edit(fields, buffer, reason, event) {
    const current = store.get().value;
    if (buffer) {
      return store.set({ fields, buffer, fieldsFor: keyOf(current) });
    }
    const next = valueOf(fields, format());
    if (next !== current) {
      change("value", next, { reason, event });
    }
    store.set({ fields, buffer, fieldsFor: keyOf(next) });
  }
  function finish(event) {
    const state = store.get();
    if (!state.buffer) {
      return;
    }
    if (!editing(state)) {
      return store.set({ buffer: null });
    }
    edit(clampDay(state.fields), null, "input-change", event);
  }
  function setValue(value, reason, event) {
    const next = value === null ? null : normalizeValue(value, format());
    if (value !== null && next === null) {
      return false;
    }
    const changed = next === store.get().value || change("value", next, { reason, event });
    store.set({ fields: emptyFields(), fieldsFor: "", buffer: null });
    return changed;
  }
  const editable = () => {
    const state = store.get();
    return !isDisabled(state) && !state.readOnly;
  };
  function moveFocus(from, offset) {
    const list = segmentElements().map(({ el }) => el);
    const target = list[list.indexOf(from) + offset];
    target?.focus({ preventScroll: true });
    return !!target;
  }
  function startOf(type, direction, fields) {
    const now = /* @__PURE__ */ new Date();
    if (type === "year") {
      return now.getFullYear();
    }
    if (type === "month") {
      return now.getMonth() + 1;
    }
    const [min, max] = boundsOf(type, fields, format().hourCycle);
    if (type === "day") {
      return Math.min(now.getDate(), max);
    }
    return direction === 1 ? min : max;
  }
  function step(type, key, event) {
    const fields = shownFields(store.get());
    const { hourCycle } = format();
    let next;
    if (key === "Home" || key === "End") {
      next = stepToEnd(fields, type, key === "Home" ? "min" : "max", hourCycle);
    } else {
      const direction = key === "ArrowUp" || key === "PageUp" ? 1 : -1;
      const size = key.startsWith("Page") ? pageStepOf(type) : 1;
      next = stepField(
        fields,
        type,
        direction * size,
        hourCycle,
        startOf(type, direction, fields)
      );
    }
    edit(next, null, "step-key", event);
  }
  function insert(type, el, text, event) {
    const { hourCycle, locale } = format();
    let target = el;
    let current = type;
    for (const char of text) {
      const state = store.get();
      const fields = shownFields(state);
      const buffer = editing(state) ? state.buffer : null;
      const advanced = advancedTo === target;
      advancedTo = null;
      if (/\d/.test(char) && current !== "dayPeriod") {
        const typed = typeDigit(fields, buffer, current, char, hourCycle);
        edit(typed.fields, typed.buffer, "input-change", event);
        if (typed.done && advance()) {
          advancedTo = target;
        } else if (typed.done) {
          break;
        }
      } else if (separators.test(char)) {
        if (advanced || buffer?.type !== current && fields[current] === null) {
          continue;
        }
        finish(event);
        if (!advance()) {
          break;
        }
      } else if (/\p{L}/u.test(char)) {
        const period = typePeriod(fields, char, locale);
        if (period && (current === "dayPeriod" || hourCycle === 12)) {
          edit(period, null, "input-change", event);
          if (current === "dayPeriod" && !advance()) {
            break;
          }
        }
      }
    }
    function advance() {
      const next = segmentElements();
      const index = next.findIndex((item) => item.el === target);
      const following = next[index + 1];
      if (!following) {
        finish(event);
        return false;
      }
      following.el.focus({ preventScroll: true });
      target = following.el;
      current = following.type;
      return true;
    }
  }
  function remove(type, el, backward, event) {
    const state = store.get();
    const fields = shownFields(state);
    const buffer = editing(state) ? state.buffer : null;
    if (backward && buffer?.type === type && buffer.text.length > 1) {
      const text = buffer.text.slice(0, -1);
      const typed = typeDigit(
        { ...fields, [type]: null },
        null,
        type,
        text,
        format().hourCycle
      );
      return edit(typed.fields, { type, text }, "input-change", event);
    }
    if (fields[type] !== null || buffer?.type === type) {
      return edit({ ...fields, [type]: null }, null, "input-change", event);
    }
    if (backward) {
      moveFocus(el, -1);
    }
  }
  function paste(event) {
    const text = event.clipboardData?.getData("text/plain")?.trim();
    event.preventDefault();
    if (!text || !editable()) {
      return;
    }
    const state = store.get();
    let value = normalizeValue(text, format());
    if (value === null && state.kind === "date") {
      const date = parseDate(text, localeOf(state));
      if (date) {
        value = normalizeValue(date, format());
      }
    }
    if (value !== null) {
      setValue(value, "paste", event);
    }
  }
  function keydown(event, type, el) {
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const { key } = event;
    if (key === "ArrowLeft" || key === "ArrowRight") {
      event.preventDefault();
      moveFocus(el, key === "ArrowRight" !== isRTL(el) ? 1 : -1);
    } else if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
      key
    )) {
      event.preventDefault();
      if (editable()) {
        step(type, key, event);
      }
    } else if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      if (editable()) {
        remove(type, el, key === "Backspace", event);
      }
    } else if (key === "Enter") {
      finish(event);
    }
  }
  function beforeinput(event, type, el) {
    if (event.isComposing && !event.cancelable) {
      return;
    }
    if (event.inputType === "insertLineBreak") {
      return finish(event);
    }
    event.preventDefault();
    if (!editable()) {
      return;
    }
    const kind = event.inputType;
    if (kind.startsWith("insert") && kind !== "insertFromPaste" && kind !== "insertFromDrop" && event.data) {
      insert(type, el, event.data, event);
    } else if (kind.startsWith("delete")) {
      remove(type, el, kind.includes("Backward"), event);
    }
  }
  function adopt(type, el, typed, event) {
    const shown = segmentFor(store.get(), type)?.text ?? "";
    if (typed === shown) {
      return;
    }
    if (!editable()) {
      return;
    }
    const text = typed.normalize("NFKC");
    const digits = text.replace(/\D/g, "");
    if (type === "dayPeriod" || digits === "") {
      const letter = text.replace(/[^\p{L}]/gu, "").slice(-1);
      if (letter) {
        return insert(type, el, letter, event ?? new Event("input"));
      }
      return edit(
        { ...shownFields(store.get()), [type]: null },
        null,
        "input-change",
        event
      );
    }
    const added = shown && text.startsWith(shown) ? digits.slice(shown.replace(/\D/g, "").length) : digits;
    insert(type, el, added || digits.slice(-1), event ?? new Event("input"));
  }
  function focusSegment(type) {
    const list = segmentElements();
    const target = type ? list.find((item) => item.type === type) : list[0];
    target?.el.focus();
  }
  function nearestSegment(event) {
    const list = segmentElements();
    if (!editable() || list.some(({ el }) => el.contains(event.target))) {
      return;
    }
    const distance = (el) => {
      const { left, right } = el.getBoundingClientRect();
      return Math.max(left - event.clientX, event.clientX - right, 0);
    };
    return list.reduce(
      (best, { el }) => !best || distance(el) < distance(best) ? el : best,
      void 0
    );
  }
  function blur(event) {
    advancedTo = null;
    finish(event);
  }
  function reset() {
    const { value, defaultValue } = context.options();
    if (keepsValueOnReset(value, defaultValue)) {
      return;
    }
    setValue(store.get().initial, "reset");
  }
  function restore(saved) {
    setValue(saved || null, "restore");
  }
  return {
    /** The value: an ISO date, date and time, or time, or `null` while empty or partly filled. */
    getValue: () => store.get().value,
    /** Sets the value. Returns false when it isn't one the input can show, or when canceled. */
    setValue: (value, { reason = "imperative", event } = {}) => setValue(value, reason, event),
    /** Empties every segment. */
    clear: ({ reason = "imperative", event } = {}) => setValue(null, reason, event),
    /** Focuses a segment, like `"month"`, or the first one. */
    focus: focusSegment,
    internal: {
      keydown,
      beforeinput,
      adopt,
      paste,
      blur,
      reset,
      restore,
      segmentElement,
      nearestSegment,
      firstSegment: () => segmentElements()[0]?.el,
      setFormDisabled: (formDisabled) => store.set({ formDisabled }),
      bindRoot(el) {
        bindPageLocale(el, (pageLocale) => store.set({ pageLocale }));
        return watchFieldsets(el, (formDisabled) => store.set({ formDisabled }));
      },
      rootElement: () => element("root")
    }
  };
}
var dateInputApi = dateInputApiBody;
export {
  dateInputApi,
  formatOf,
  initialDateInputState,
  isPartial,
  optionKinds,
  problemOf,
  segmentFor,
  segmentsFor,
  shownFields,
  syncDateInputState
};
