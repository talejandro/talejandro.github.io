// src/components/date-picker/date-picker-api.ts
import {
  blockedDate,
  calendarSettings,
  calendarApi,
  calendarState,
  calendarSync,
  isPickable,
  localeOf,
  preferredDate,
  rangeRules
} from "../calendar/calendar-api.js";
import {
  isAllowedRange,
  normalizeValue,
  selectedDates
} from "../calendar/calendar-model.js";
import { formatDate } from "../../foundation/date/format.js";
import { parseDate } from "../../foundation/date/parse.js";
import {
  clampDate,
  isISODate
} from "../../foundation/date/plain-date.js";
import { formInternals } from "../../foundation/forms/form.js";
import { initialApple } from "../../foundation/platform/platform.js";
import { deriveOpen } from "../../foundation/popups/popup.js";
import {
  createPopup,
  popupState
} from "../../foundation/popups/create-popup.js";
import { datePickerPreset } from "../../foundation/popups/popup-presets.js";
import { elements } from "../../foundation/kernel/elements.js";
import { keepsValueOnReset } from "../../foundation/forms/value.js";
var valueKey = (value) => JSON.stringify(value ?? null);
var shortDate = (date, locale) => formatDate(date, locale, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).replace(/[‎‏]/g, "");
function dateAt(state, index) {
  if (state.mode !== "range") {
    return index ? null : state.value;
  }
  if (state.anchor !== null) {
    return index ? null : state.anchor;
  }
  return state.value?.[index] ?? null;
}
function textOf(state, index) {
  const draft = state.draftFor === valueKey(state.value) ? state.drafts[index] : null;
  if (draft !== null) {
    return draft;
  }
  const date = dateAt(state, index);
  return date ? shortDate(date, localeOf(state)) : "";
}
var invalidAt = (state, index) => state.draftFor === valueKey(state.value) && state.invalid[index];
var settings = (options) => ({
  closeOnSelect: options.closeOnSelect ?? true,
  name: options.name,
  startName: options.startName,
  endName: options.endName,
  form: options.form,
  required: !!options.required
});
function nameAt(state, index) {
  if (state.mode !== "range") {
    return index ? void 0 : state.name;
  }
  return (index ? state.endName : state.startName) ?? state.name;
}
function submitted(state) {
  const start = dateAt(state, 0);
  if (state.mode !== "range") {
    return start ?? "";
  }
  const data = new FormData();
  const value = state.value;
  for (const index of [0, 1]) {
    const name = nameAt(state, index);
    if (name) {
      data.append(name, value?.[index] ?? "");
    }
  }
  return data;
}
function datePickerApiBody(context) {
  const { store, element } = context;
  deriveOpen(
    context,
    ["focused"],
    (open) => open ? { focused: null } : void 0
  );
  const calendar = calendarApi(context, {
    picked(event) {
      if (store.get().closeOnSelect) {
        control.hide({ reason: "item-press", event });
      }
    }
  });
  const { setValue, setMonth, reveal } = calendar.internal;
  function showValue() {
    const [first] = selectedDates(store.get().value);
    if (first) {
      reveal(first, "imperative");
    }
  }
  let awaited = false;
  let last = store.get().value;
  let opened = store.get().open;
  const firstMonth = store.get().month;
  store.subscribe(() => {
    const state = store.get();
    if (state.open !== opened) {
      opened = state.open;
      const [date] = selectedDates(state.value);
      if (opened && date) {
        reveal(clampDate(date, state.min, state.max), "imperative");
      } else if (opened && state.month !== firstMonth) {
        setMonth(firstMonth, "imperative");
      }
    }
    if (state.value === last) {
      return;
    }
    last = state.value;
    if (awaited) {
      awaited = false;
      showValue();
    }
  });
  const triggerElement = () => element("trigger") ?? element("input", "start") ?? element("input");
  const inputElement = () => element("input", "start") ?? element("input");
  const invalidInput = () => {
    const state = store.get();
    return elements(context, "input").find(
      ({ props }) => invalidAt(state, props.end ? 1 : 0)
    )?.el;
  };
  const kit = createPopup(context, {
    preset: datePickerPreset,
    rules: () => ({
      trigger: triggerElement,
      // Pressing the trigger toggles the popup, and pressing an input leaves it to focus.
      contains: (target) => elements(context, "trigger").some(({ el }) => el.contains(target)),
      onOpenChange(open) {
        if (open) {
          store.set({ focused: null });
        }
      }
    })
  });
  const { control, popup } = kit.internal;
  const presentation = kit.internal.presentation;
  const contentProps = () => kit.internal.contentProps();
  function clearDrafts() {
    store.set({ drafts: [null, null], invalid: [false, false] });
  }
  function setText(index, text) {
    const state = store.get();
    const key = valueKey(state.value);
    const fresh = state.draftFor === key;
    const drafts = fresh ? [...state.drafts] : [null, null];
    drafts[index] = text;
    store.set({
      drafts,
      draftFor: key,
      invalid: fresh ? state.invalid : [false, false]
    });
  }
  function markInvalid(index) {
    const invalid = [...store.get().invalid];
    invalid[index] = true;
    store.set({ invalid });
  }
  function read(text) {
    const state = store.get();
    if (text.trim() === "") {
      return null;
    }
    return parseDate(text, localeOf(state), {
      referenceDate: state.today ?? void 0
    });
  }
  function commit(index, event) {
    const state = store.get();
    if (state.draftFor !== valueKey(state.value)) {
      return;
    }
    const text = state.drafts[index];
    if (text === null) {
      return;
    }
    const parsed = read(text);
    if (parsed === void 0 || parsed !== null && blockedDate(state, parsed)) {
      return markInvalid(index);
    }
    if (state.mode !== "range") {
      setValue(parsed, "input-commit", event);
      clearDrafts();
      if (parsed) {
        reveal(parsed, "input-commit", event);
      }
      return;
    }
    const ends = [0, 1].map((at) => {
      if (at === index) {
        return parsed;
      }
      const draft = state.drafts[at];
      return draft === null ? dateAt(state, at) : read(draft);
    });
    const [start, end] = ends;
    if (start && end) {
      if (start > end || !isAllowedRange(start, end, rangeRules(state))) {
        return markInvalid(index);
      }
      setValue([start, end], "input-commit", event);
      store.set({ anchor: null, hover: null });
      clearDrafts();
      if (parsed) {
        reveal(parsed, "input-commit", event);
      }
      return;
    }
    if (start === null && end === null) {
      setValue(null, "input-commit", event);
      store.set({ anchor: null, hover: null });
      clearDrafts();
      return;
    }
    setValue(null, "input-commit", event);
    const drafts = ends.map(
      (date, at) => date ? shortDate(date, localeOf(state)) : date === null ? "" : state.drafts[at]
    );
    const invalid = [false, false];
    invalid[1 - index] = state.invalid[1 - index];
    store.set({
      anchor: start ?? null,
      hover: start ?? null,
      drafts,
      draftFor: valueKey(store.get().value),
      invalid
    });
    if (parsed) {
      reveal(parsed, "input-commit", event);
    }
  }
  function pickValue(value, reason, event) {
    const state = store.get();
    if (!isPickable(state, value)) {
      return false;
    }
    const normalized = normalizeValue(state.mode, value);
    store.set({ anchor: null, hover: null });
    clearDrafts();
    const changed = setValue(normalized, reason, event);
    const first = Array.isArray(normalized) ? normalized[0] : normalized;
    if (first && isISODate(first) && reason === "preset-press") {
      reveal(first, reason, event);
    }
    return changed;
  }
  function reset() {
    const { value, defaultValue } = context.options();
    if (keepsValueOnReset(value, defaultValue)) {
      return;
    }
    store.set({ anchor: null, hover: null });
    clearDrafts();
    setValue(store.get().initial, "reset");
  }
  function restore(saved) {
    try {
      setValue(
        normalizeValue(store.get().mode, JSON.parse(saved)),
        "restore"
      );
    } catch {
    }
  }
  const api = {
    isOpen: kit.isOpen,
    setOpen: kit.setOpen,
    open: kit.open,
    close: kit.close,
    toggle: kit.toggle,
    getValue: () => store.get().value,
    setValue: (value, {
      reason = "imperative",
      event
    } = {}) => {
      if (!isPickable(store.get(), value)) {
        return false;
      }
      store.set({ anchor: null, hover: null });
      const before = store.get().value;
      const result = setValue(value, reason, event);
      const held = store.get().value;
      const asked = normalizeValue(store.get().mode, value);
      if (held !== before || valueKey(held) === valueKey(asked)) {
        showValue();
      } else if (result && context.options().value !== void 0) {
        awaited = true;
      }
      return result;
    },
    clear: ({
      reason = "imperative",
      event
    } = {}) => pickValue(null, reason, event),
    getMonth: calendar.getMonth,
    setMonth: (month, {
      reason = "imperative",
      event
    } = {}) => setMonth(month, reason, event),
    previous: (options) => calendar.previous(options),
    next: (options) => calendar.next(options),
    focus: calendar.focus,
    internal: {
      ...calendar.internal,
      show: control.show,
      hide: control.hide,
      popup,
      presentation,
      commit,
      setText,
      pickValue,
      reset,
      restore,
      submitted: () => submitted(store.get()),
      setFormDisabled: (formDisabled) => store.set({ formDisabled }),
      // The input whose text isn't a date, else the start's.
      focusInput: () => (invalidInput() ?? inputElement())?.focus(),
      invalidInput,
      // A form-associated root, like a custom element's, reports the inputs' problems itself.
      rootValidates: () => !!formInternals(element("root")),
      contentProps,
      // The popup lines up with the start input, or the trigger without one.
      anchorElement: () => inputElement() ?? element("trigger"),
      // Focus goes to the calendar's tab stop: the selected date, else today, else the first that can be picked.
      initialFocus() {
        const state = store.get();
        const content = popup.element();
        return element("day", state.focused ?? preferredDate(state)) ?? content;
      },
      inputKeydown(event, index) {
        if (event.key === "Enter") {
          commit(index, event);
        } else if (event.key === "ArrowDown" && event.altKey && !store.get().open) {
          event.preventDefault();
          control.show({ event, by: "keyboard" });
        }
      }
    }
  };
  return api;
}
var datePickerApi = datePickerApiBody;
var initialDatePickerState = (options) => {
  const calendar = calendarState(options);
  return {
    ...calendar,
    ...settings(options),
    ...popupState(options),
    presentation: "popover",
    apple: initialApple(),
    drafts: [null, null],
    draftFor: "",
    invalid: [false, false],
    initial: normalizeValue(
      calendar.mode,
      options.defaultValue ?? null
    ),
    hinted: false
  };
};
var syncDatePickerState = (options) => ({
  ...calendarSync(options),
  ...settings(options),
  ...options.defaultValue === void 0 ? {} : {
    initial: normalizeValue(
      calendarSettings(options).mode,
      options.defaultValue
    )
  },
  ...options.open === void 0 ? {} : { open: options.open }
});
export {
  dateAt,
  datePickerApi,
  initialDatePickerState,
  invalidAt,
  nameAt,
  syncDatePickerState,
  textOf,
  valueKey
};
