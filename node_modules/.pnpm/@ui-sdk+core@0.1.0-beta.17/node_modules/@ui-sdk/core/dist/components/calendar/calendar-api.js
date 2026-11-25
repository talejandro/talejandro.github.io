// src/components/calendar/calendar-api.ts
import {
  addMonthsTo,
  gridWeeks,
  isAllowedRange,
  isISOMonth,
  matchesDate,
  monthOf,
  monthToShow,
  moveDate,
  normalizeValue,
  pressRange,
  rangeTo,
  selectedDates,
  visibleRange
} from "./calendar-model.js";
import {
  addDays,
  clampDate,
  isISODate
} from "../../foundation/date/plain-date.js";
import { firstDayOfWeek } from "../../foundation/date/week.js";
import {
  dateFormatter,
  formatDate,
  formatDateRange,
  monthNames,
  todayDate,
  weekdayNames
} from "../../foundation/date/format.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import { createFocusRecovery } from "../../foundation/focus/focus-recovery.js";
import { isDisabled } from "../../foundation/forms/form.js";
import { bindPageLocale, localeOf } from "../../foundation/text/locale.js";
import { createChange, dispatch } from "../../foundation/kernel/input-source.js";
import { selects } from "../../foundation/kernel/selects.js";
var dateOrNull = (value) => isISODate(value) ? value : null;
var calendarSettings = (options) => ({
  mode: options.mode ?? "single",
  min: dateOrNull(options.min),
  max: dateOrNull(options.max),
  unavailable: options.unavailable ?? null,
  disabled: !!options.disabled,
  readOnly: !!options.readOnly,
  deselectable: !!options.deselectable,
  months: Number.isFinite(options.months) ? Math.max(1, Math.floor(options.months)) : 1,
  pageBy: options.pageBy ?? "month",
  locale: options.locale ?? null,
  weekStartsOn: options.weekStartsOn === void 0 ? null : (options.weekStartsOn % 7 + 7) % 7,
  weekdayFormat: options.weekdayFormat ?? "short",
  monthFormat: options.monthFormat ?? "long",
  fixedWeeks: options.fixedWeeks ?? false,
  showOutsideDays: options.showOutsideDays ?? true,
  minDays: options.minDays,
  maxDays: options.maxDays,
  allowUnavailable: options.allowUnavailable ?? false
});
var weekStartOf = (state) => state.weekStartsOn ?? firstDayOfWeek(localeOf(state));
var unavailableDate = (state, date) => matchesDate(date, state.unavailable);
var outOfBounds = (state, date) => state.min !== null && date < state.min || state.max !== null && date > state.max;
var blockedDate = (state, date) => outOfBounds(state, date) || unavailableDate(state, date);
var sameDates = (a, b) => String(a) === String(b);
var gridMonth = (state, offset) => addMonthsTo(state.month, offset ?? 0);
var isOutside = (state, props) => monthOf(props.value) !== gridMonth(state, props.offset);
var rangeRules = (state) => ({
  minDays: state.minDays,
  maxDays: state.maxDays,
  allowUnavailable: state.allowUnavailable,
  isUnavailable: (date) => unavailableDate(state, date)
});
function isPickable(state, value) {
  if (isDisabled(state) || state.readOnly) {
    return false;
  }
  const dates = selectedDates(normalizeValue(state.mode, value));
  if ([value].flat().some((date) => date != null && !dates.includes(date)) || dates.some((date) => blockedDate(state, date))) {
    return false;
  }
  return state.mode !== "range" || !dates.length || isAllowedRange(dates[0], dates[1], rangeRules(state));
}
var refusedEnd = (state, date) => state.mode === "range" && state.anchor !== null && date !== state.anchor && rangeTo(state.anchor, date, rangeRules(state)) === null;
function initialMonth(options, value) {
  if (isISOMonth(options.month)) {
    return options.month;
  }
  if (isISOMonth(options.defaultMonth)) {
    return options.defaultMonth;
  }
  const [selected] = selectedDates(value);
  if (selected) {
    return monthOf(selected);
  }
  const today = dateOrNull(options.today) ?? todayDate(options.timeZone);
  return monthOf(
    clampDate(today, dateOrNull(options.min), dateOrNull(options.max))
  );
}
function shownRange(state) {
  if (state.mode !== "range") {
    return null;
  }
  if (state.anchor !== null) {
    const preview = state.hover === null ? null : rangeTo(state.anchor, state.hover, rangeRules(state));
    return preview ?? [state.anchor, state.anchor];
  }
  return state.value;
}
var preferredFor;
function preferredDate(state) {
  if (preferredFor?.state === state) {
    return preferredFor.date;
  }
  const { start, end } = visibleRange(state.month, state.months);
  const shows = (date2) => date2 >= start && date2 <= end && !blockedDate(state, date2);
  let date = selectedDates(state.value).find(shows) ?? (state.today !== null && shows(state.today) ? state.today : void 0);
  if (date === void 0) {
    const first = clampDate(start, state.min, state.max);
    date = first;
    for (let day = first; day <= end; day = addDays(day, 1)) {
      if (!blockedDate(state, day)) {
        date = day;
        break;
      }
    }
  }
  preferredFor = { state, date };
  return date;
}
function headingLabel(state) {
  const locale = localeOf(state);
  const options = { month: state.monthFormat, year: "numeric" };
  const first = `${state.month}-01`;
  if (state.months === 1) {
    return formatDate(first, locale, options);
  }
  return formatDateRange(
    first,
    `${addMonthsTo(state.month, state.months - 1)}-01`,
    locale,
    options
  );
}
var selectCache = /* @__PURE__ */ new Map();
function selectState(state, kind) {
  const locale = localeOf(state);
  const key = `${kind}|${state.month}|${locale}|${state.monthFormat}|${state.min}|${state.max}|${isDisabled(state)}`;
  let cached = selectCache.get(key);
  if (!cached) {
    if (selectCache.size > 50) {
      selectCache.clear();
    }
    selectCache.set(key, cached = buildSelectState(state, kind, locale));
  }
  return cached;
}
function buildSelectState(state, kind, locale) {
  const year = Number(state.month.slice(0, 4));
  const first = state.min && monthOf(state.min);
  const last = state.max && monthOf(state.max);
  const months = kind === "month";
  const from = months ? 1 : Math.min(year, first ? Number(first.slice(0, 4)) : year - 10);
  const to = months ? 12 : Math.max(year, last ? Number(last.slice(0, 4)) : year + 10);
  const names = monthNames(locale, state.monthFormat);
  const format = dateFormatter(locale, { year: "numeric" });
  const select = {
    value: months ? Number(state.month.slice(5, 7)) : year,
    options: Array.from({ length: to - from + 1 }, (_, index) => {
      const value = from + index;
      const month = `${year}-${String(value).padStart(2, "0")}`;
      return {
        value,
        // `setUTCFullYear` keeps years below 100 as they are, which `Date.UTC` doesn't.
        label: months ? names[index] : format.format((/* @__PURE__ */ new Date(0)).setUTCFullYear(value, 0, 1)),
        disabled: months && (!!first && month < first || !!last && month > last)
      };
    }),
    disabled: isDisabled(state)
  };
  return select;
}
function selectedMonth(state, kind, picked) {
  const [year, month] = state.month.split("-");
  const target = kind === "month" ? `${year}-${String(picked).padStart(2, "0")}` : `${String(picked).padStart(4, "0")}-${month}`;
  if (state.min !== null && target < monthOf(state.min)) {
    return monthOf(state.min);
  }
  if (state.max !== null && target > monthOf(state.max)) {
    return monthOf(state.max);
  }
  return target;
}
function stepTarget(state, direction) {
  const by = state.pageBy === "page" ? state.months : 1;
  const month = addMonthsTo(state.month, direction * by);
  const disabled = isDisabled(state) || (direction < 0 ? state.min !== null && monthOf(state.min) >= state.month : state.max !== null && monthOf(state.max) <= addMonthsTo(state.month, state.months - 1));
  return { month, disabled };
}
var grids = /* @__PURE__ */ new Map();
function gridState(state, offset) {
  const month = gridMonth(state, offset);
  const weekStartsOn = weekStartOf(state);
  const locale = localeOf(state);
  const first = offset === 0;
  const last = offset === state.months - 1;
  const key = `${month}|${locale}|${state.monthFormat}|${weekStartsOn}|${state.fixedWeeks}|${state.showOutsideDays}|${first}|${last}`;
  let grid = grids.get(key);
  if (!grid) {
    if (grids.size > 50) {
      grids.clear();
    }
    grid = {
      month,
      label: formatDate(`${month}-01`, locale, {
        month: state.monthFormat,
        year: "numeric"
      }),
      weekdays: Array.from(
        { length: 7 },
        (_, index) => (weekStartsOn + index) % 7
      ),
      weeks: gridWeeks(month, {
        weekStartsOn,
        fixedWeeks: state.fixedWeeks,
        showOutsideDays: state.showOutsideDays,
        first,
        last
      })
    };
    grids.set(key, grid);
  }
  return grid;
}
function dayState(state, props) {
  const date = props.value;
  const range = shownRange(state);
  const selected = range ? date >= range[0] && date <= range[1] : state.mode === "multiple" ? state.value.includes(date) : state.value === date;
  return {
    date,
    label: dateFormatter(localeOf(state), { day: "numeric" }).format(
      Date.UTC(2e3, 0, Number(date.slice(8)))
    ),
    selected,
    today: state.today === date,
    outside: isOutside(state, props),
    disabled: isDisabled(state) || blockedDate(state, date) || refusedEnd(state, date),
    unavailable: unavailableDate(state, date),
    rangeStart: !!range && range[0] === date,
    rangeEnd: !!range && range[1] === date,
    inRange: selected && !!range
  };
}
function calendarApi(shared, hooks = {}) {
  const context = shared;
  const { store, options, element } = context;
  const change = createChange(context);
  const roving = createRovingFocus(context, {
    slot: "day",
    key: "focused",
    // Unavailable dates stay focusable, as the date picker pattern asks; they just can't be picked.
    disabled: (day) => blockedDate(store.get(), day.key),
    // Days of the months around a grid show it, but focus moves through each
    // grid's own. Days past min and max can't take focus at all.
    focusable: (day) => !isDisabled(store.get()) && !isOutside(store.get(), day.props) && !outOfBounds(store.get(), day.key),
    preferred: (day) => day.key === preferredDate(store.get()),
    claims: (state, day) => !isOutside(state, day.props) && day.key === preferredDate(state),
    move: (event, { from, rtl }) => {
      if (event.ctrlKey || event.metaKey) {
        return;
      }
      const state = store.get();
      const to = moveDate(event, from.key, {
        rtl,
        weekStartsOn: weekStartOf(state),
        min: state.min,
        max: state.max
      });
      return to === void 0 || moveFocus(to, "list-navigation", event) ? to : from.key;
    }
  });
  const recovery = createFocusRecovery({
    fallback: (lost) => element("day", lost.key)
  });
  let approved = null;
  let pointer;
  let refused = null;
  function moveFocus(date, reason, event) {
    if (date === store.get().focused) {
      return true;
    }
    if (dispatch(context, "onFocusedChange", date, { reason, event })) {
      return false;
    }
    approved = date;
    return true;
  }
  function focusLanded(date, event) {
    const from = store.get().focused;
    const press = pointer;
    pointer = void 0;
    if (date === approved) {
      approved = null;
    } else if (date !== from && from !== null && dispatch(
      context,
      "onFocusedChange",
      date,
      press ? { reason: "item-press", event: press } : { reason: "focus-in", event }
    )) {
      event.stopImmediatePropagation();
      if (press) {
        refused = date;
      }
      roving.focus(from);
    }
  }
  function setAnchor(anchor, hover, reason, event) {
    if (anchor !== store.get().anchor && dispatch(context, "onAnchorChange", anchor, { reason, event })) {
      return false;
    }
    store.set({ anchor, hover });
    return true;
  }
  function setMonth(month, reason, event) {
    if (!isISOMonth(month)) {
      return false;
    }
    return change("month", month, { reason, event });
  }
  function setValue(value, reason, event) {
    const state = store.get();
    return change("value", normalizeValue(state.mode, value), { reason, event });
  }
  function reveal(date, reason, event) {
    const state = store.get();
    const first = monthToShow(date, state.month, state.months, state.pageBy);
    if (first !== state.month) {
      setMonth(first, reason, event);
    }
  }
  function step(direction, reason, event) {
    const target = stepTarget(store.get(), direction);
    return !target.disabled && setMonth(target.month, reason, event);
  }
  function pick(date, event) {
    const state = store.get();
    if (isDisabled(state) || state.readOnly || blockedDate(state, date)) {
      return;
    }
    if (state.mode === "multiple") {
      const value = state.value;
      setValue(
        value.includes(date) ? value.filter((selected) => selected !== date) : [...value, date],
        "item-press",
        event
      );
    } else if (state.mode === "range") {
      const pressed = pressRange(state.anchor, date, rangeRules(state));
      if (!setAnchor(
        pressed.anchor,
        pressed.anchor === null ? null : date,
        "item-press",
        event
      )) {
        return;
      }
      if (pressed.value && (setValue(pressed.value, "item-press", event) || sameDates(store.get().value, pressed.value))) {
        hooks.picked?.(event);
      }
    } else if (state.deselectable && state.value === date) {
      setValue(null, "item-press", event);
    } else if (setValue(date, "item-press", event) || store.get().value === date) {
      hooks.picked?.(event);
    }
  }
  const api = {
    getValue: () => store.get().value,
    setValue: (value, {
      reason = "imperative",
      event
    } = {}) => isPickable(store.get(), value) && setValue(value, reason, event),
    getMonth: () => store.get().month,
    setMonth: (month, {
      reason = "imperative",
      event
    } = {}) => setMonth(month, reason, event),
    previous: ({
      reason = "imperative",
      event
    } = {}) => step(-1, reason, event),
    next: ({
      reason = "imperative",
      event
    } = {}) => step(1, reason, event),
    focus(date) {
      if (date === void 0) {
        return roving.focus(store.get().focused ?? void 0);
      }
      if (!isISODate(date)) {
        return;
      }
      const state = store.get();
      const target = clampDate(date, state.min, state.max);
      if (!moveFocus(target, "imperative")) {
        return;
      }
      reveal(target, "imperative");
      roving.focus(target);
    },
    internal: {
      roving,
      recovery,
      focusLanded,
      setValue,
      setMonth,
      reveal,
      // A press on a day, or Enter or Space on one. A day of another month turns the months to it.
      press(props, event, el) {
        const state = store.get();
        if (isDisabled(state)) {
          return;
        }
        if (el && !isOutside(state, props) && !outOfBounds(state, props.value) && el.ownerDocument.activeElement !== el && // Only the refused press's own click counts clicks; a script's click() on that day still focuses it.
        (refused !== props.value || !event?.detail)) {
          el.focus({ preventScroll: true });
        }
        pointer = void 0;
        refused = null;
        pick(props.value, event);
        if (isOutside(store.get(), props) && !outOfBounds(state, props.value) && moveFocus(props.value, "item-press", event)) {
          reveal(props.value, "item-press", event);
          roving.focus(props.value);
        }
      },
      step: (direction, event) => step(direction, direction < 0 ? "previous-press" : "next-press", event),
      select(kind, value, event) {
        if (Number.isInteger(value)) {
          setMonth(
            selectedMonth(store.get(), kind, value),
            "select-change",
            event
          );
        }
      },
      keydown(event, el, props) {
        if (event.defaultPrevented) {
          return;
        }
        const state = store.get();
        if ((event.key === "Enter" || event.key === " ") && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          pick(props.value, event);
          return;
        }
        if (event.key === "Escape" && state.anchor !== null && setAnchor(null, null, "escape-key", event)) {
          event.preventDefault();
          return;
        }
        const moved = roving.keydown(event, el);
        if (!moved || moved.key === moved.from) {
          return;
        }
        reveal(moved.key, "list-navigation", event);
        if (store.get().anchor !== null) {
          store.set({ hover: moved.key });
        }
      },
      pointerdown(event) {
        pointer = event;
        refused = null;
      },
      // A press on a day past min or max changes nothing, so the focused day
      // keeps focus. That cell has no tabindex, and the page would blur it.
      mousedown(event, props) {
        if (outOfBounds(store.get(), props.value)) {
          event.preventDefault();
        }
      },
      hover(date) {
        if (store.get().anchor !== null) {
          store.set({ hover: date });
        }
      },
      bindRoot(el) {
        bindPageLocale(el, (pageLocale) => store.set({ pageLocale }));
        if (options().today === void 0) {
          store.set({ today: todayDate(options().timeZone) });
        }
      }
    }
  };
  return api;
}
function calendarState(options) {
  const mode = options.mode ?? "single";
  const value = normalizeValue(
    mode,
    options.value ?? options.defaultValue ?? null
  );
  const state = {
    ...calendarSettings(options),
    value,
    month: initialMonth(options, value),
    focused: null,
    anchor: null,
    hover: null,
    today: dateOrNull(options.today),
    pageLocale: null,
    formDisabled: false
  };
  return state;
}
var calendarSync = (options) => ({
  ...calendarSettings(options),
  ...options.value === void 0 ? {} : { value: normalizeValue(options.mode ?? "single", options.value) },
  ...isISOMonth(options.month) ? { month: options.month } : {},
  ...options.today === void 0 ? {} : { today: dateOrNull(options.today) }
});
function selectSlot(slot, kind) {
  return slot({
    state: (state) => selectState(state, kind),
    attrs: (state) => ({
      value: String(selectState(state, kind).value),
      "aria-label": kind === "month" ? "Month" : "Year",
      disabled: isDisabled(state) ? "" : void 0,
      "data-disabled": isDisabled(state) ? "" : void 0
    }),
    on: {
      change: (event, { api, el }) => el && api.internal.select(
        kind,
        Number(el.value),
        event
      )
    },
    // The selected option is written here, after the framework renders the options.
    bind(el, { store }) {
      const select = el;
      const write = () => {
        const value = String(selectState(store.get(), kind).value);
        if (select.value !== value) {
          select.value = value;
        }
      };
      write();
      return store.subscribe(write);
    }
  });
}
function calendarSlots(slot) {
  return {
    heading: slot({
      state: (state) => ({ month: state.month, label: headingLabel(state) }),
      // Screen readers hear the month change after Previous, Next or a key turns it.
      attrs: (state, { id }) => ({
        id: `${id}-heading`,
        "aria-live": "polite"
      })
    }),
    previous: slot({
      state: (state) => stepTarget(state, -1),
      attrs: (state) => {
        const { disabled } = stepTarget(state, -1);
        return {
          type: "button",
          "aria-label": "Previous month",
          "aria-disabled": disabled ? "true" : void 0,
          "data-disabled": disabled ? "" : void 0
        };
      },
      press: ({ api }, event) => api.internal.step(-1, event)
    }),
    next: slot({
      state: (state) => stepTarget(state, 1),
      attrs: (state) => {
        const { disabled } = stepTarget(state, 1);
        return {
          type: "button",
          "aria-label": "Next month",
          "aria-disabled": disabled ? "true" : void 0,
          "data-disabled": disabled ? "" : void 0
        };
      },
      press: ({ api }, event) => api.internal.step(1, event)
    }),
    "month-select": selectSlot(slot, "month"),
    "year-select": selectSlot(slot, "year"),
    grid: slot({
      role: "grid",
      keys: { none: "Focus stays on a day, whose keydown handles them." },
      props: { offset: "number" },
      state: (state, { props }) => gridState(state, props.offset ?? 0),
      attrs: (state, { props }) => {
        const month = gridMonth(state, props.offset);
        return {
          "aria-label": formatDate(`${month}-01`, localeOf(state), {
            month: "long",
            year: "numeric"
          }),
          "aria-multiselectable": state.mode === "single" ? void 0 : "true",
          "aria-readonly": state.readOnly ? "true" : void 0,
          "aria-disabled": isDisabled(state) ? "true" : void 0,
          "data-disabled": isDisabled(state) ? "" : void 0
        };
      }
    }),
    weekdays: slot({ role: "row" }),
    weekday: slot({
      role: "columnheader",
      props: { index: "number" },
      state: (state, { props }) => {
        const weekStartsOn = weekStartOf(state);
        const locale = localeOf(state);
        return {
          weekday: (weekStartsOn + props.index) % 7,
          label: weekdayNames(locale, state.weekdayFormat, weekStartsOn)[props.index],
          name: weekdayNames(locale, "long", weekStartsOn)[props.index]
        };
      },
      attrs: (state, { props }) => ({
        "aria-label": weekdayNames(localeOf(state), "long", weekStartOf(state))[props.index]
      })
    }),
    week: slot({ role: "row" }),
    day: slot({
      role: "gridcell",
      focus: (state, { props }) => dayState(state, props).outside ? {
        none: "Days of the months around show here, but focus moves through each grid's own."
      } : "roving",
      props: { value: "string", offset: { kind: "number", from: "grid" } },
      // A key press moves the stop between two days; only they render again.
      selects: selects({
        focused: ({ key }) => [key, null]
      }),
      state: (state, { props }) => dayState(state, props),
      attrs: (state, part) => {
        const { props, api } = part;
        const day = dayState(state, props);
        const range = shownRange(state);
        return {
          tabindex: isDisabled(state) || day.outside || outOfBounds(state, props.value) ? void 0 : api.internal.roving.tabIndex(state, part),
          "aria-label": formatDate(props.value, localeOf(state)),
          "aria-selected": day.outside ? void 0 : String(day.selected),
          "aria-disabled": day.disabled ? "true" : void 0,
          "aria-current": day.today ? "date" : void 0,
          "data-value": props.value,
          "data-selected": day.selected ? "" : void 0,
          "data-today": day.today ? "" : void 0,
          "data-outside": day.outside ? "" : void 0,
          "data-disabled": day.disabled ? "" : void 0,
          "data-unavailable": day.unavailable ? "" : void 0,
          "data-range-start": day.rangeStart ? "" : void 0,
          "data-range-end": day.rangeEnd ? "" : void 0,
          "data-range-middle": day.inRange && !day.rangeStart && !day.rangeEnd ? "" : void 0,
          "data-preview": range && state.anchor !== null && day.inRange ? "" : void 0
        };
      },
      press: ({ api, props, el }, event) => api.internal.press(props, event, el),
      on: {
        keydown: (event, { api, el, props }) => api.internal.keydown(event, el, props),
        pointerdown: (event, { api }) => api.internal.pointerdown(event),
        mousedown: (event, { api, props }) => api.internal.mousedown(event, props),
        pointerenter: (_event, { api, props }) => api.internal.hover(props.value)
      },
      bind: (el, part) => {
        const landed = (event) => part.api.internal.focusLanded(part.props.value, event);
        el.addEventListener("focus", landed);
        const cleanups = [
          part.api.internal.roving.bind(el, part),
          part.api.internal.recovery.bind(el, part),
          () => el.removeEventListener("focus", landed)
        ];
        return () => cleanups.forEach((cleanup) => cleanup());
      }
    })
  };
}
export {
  blockedDate,
  calendarApi,
  calendarSettings,
  calendarSlots,
  calendarState,
  calendarSync,
  isDisabled,
  isPickable,
  localeOf,
  preferredDate,
  rangeRules
};
