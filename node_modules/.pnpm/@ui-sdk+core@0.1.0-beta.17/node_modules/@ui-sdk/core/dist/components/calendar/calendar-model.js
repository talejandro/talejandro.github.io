// src/components/calendar/calendar-model.ts
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  daysBetween,
  endOfWeek,
  isISODate,
  monthGrid,
  startOfWeek,
  weekday
} from "../../foundation/date/plain-date.js";
function matchesDate(date, matchers) {
  if (!matchers) {
    return false;
  }
  const list = Array.isArray(matchers) ? matchers : [matchers];
  return list.some((matcher) => matchesOne(date, matcher));
}
function matchesOne(date, matcher) {
  if (typeof matcher === "string") {
    return date === matcher;
  }
  if (typeof matcher === "function") {
    return matcher(date);
  }
  if ("from" in matcher) {
    return date >= matcher.from && date <= matcher.to;
  }
  if ("weekday" in matcher) {
    return matcher.weekday.includes(weekday(date));
  }
  if ("before" in matcher) {
    return date < matcher.before;
  }
  return date > matcher.after;
}
var monthOf = (date) => date.slice(0, 7);
var addMonthsTo = (month, months) => monthOf(addMonths(`${month}-01`, months));
var isISOMonth = (value) => typeof value === "string" && /^\d{4}-\d{2}$/.test(value) && isISODate(`${value}-01`);
function selectedDates(value) {
  if (typeof value === "string") {
    return isISODate(value) ? [value] : [];
  }
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isISODate).sort();
}
function normalizeValue(mode, value) {
  const dates = selectedDates(value);
  if (mode === "multiple") {
    return [...new Set(dates)];
  }
  if (mode === "range") {
    return dates.length === 2 ? [dates[0], dates[1]] : null;
  }
  return dates[0] ?? null;
}
function isAllowedRange(start, end, rules) {
  const length = daysBetween(start, end) + 1;
  if (rules.minDays !== void 0 && length < rules.minDays) {
    return false;
  }
  if (rules.maxDays !== void 0 && length > rules.maxDays) {
    return false;
  }
  if (rules.allowUnavailable) {
    return true;
  }
  for (let date = start; date <= end; date = addDays(date, 1)) {
    if (rules.isUnavailable(date)) {
      return false;
    }
  }
  return true;
}
function rangeTo(anchor, date, rules) {
  const range = date < anchor ? [date, anchor] : [anchor, date];
  return isAllowedRange(range[0], range[1], rules) ? range : null;
}
function pressRange(anchor, date, rules) {
  if (anchor === null) {
    return { anchor: date, value: void 0 };
  }
  const value = rangeTo(anchor, date, rules);
  return value ? { anchor: null, value } : { anchor, value: void 0 };
}
function dateForKey(event, from, options) {
  const back = options.rtl ? 1 : -1;
  switch (event.key) {
    case "ArrowLeft":
      return addDays(from, back);
    case "ArrowRight":
      return addDays(from, -back);
    case "ArrowUp":
      return addDays(from, -7);
    case "ArrowDown":
      return addDays(from, 7);
    case "Home":
      return startOfWeek(from, options.weekStartsOn);
    case "End":
      return endOfWeek(from, options.weekStartsOn);
    case "PageUp":
      return event.shiftKey ? addYears(from, -1) : addMonths(from, -1);
    case "PageDown":
      return event.shiftKey ? addYears(from, 1) : addMonths(from, 1);
  }
}
function moveDate(event, from, options) {
  const to = dateForKey(event, from, options);
  return to === void 0 ? void 0 : clampDate(to, options.min, options.max);
}
function monthToShow(date, first, count, pageBy) {
  const target = monthOf(date);
  const last = addMonthsTo(first, count - 1);
  if (target >= first && target <= last) {
    return first;
  }
  const offset = monthsBetween(first, target);
  if (pageBy === "page") {
    return addMonthsTo(first, Math.floor(offset / count) * count);
  }
  return target < first ? target : addMonthsTo(target, -(count - 1));
}
function monthsBetween(from, to) {
  const [fromYear, fromMonth] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  return (toYear - fromYear) * 12 + toMonth - fromMonth;
}
function gridWeeks(month, options) {
  return monthGrid(`${month}-01`, options).map(
    (week) => week.map((date) => {
      const outside = monthOf(date) !== month;
      const hidden = outside && (!options.showOutsideDays || (date < `${month}-01` ? !options.first : !options.last));
      return { date, outside, hidden };
    })
  );
}
function visibleRange(first, count) {
  return {
    start: `${first}-01`,
    end: addDays(`${addMonthsTo(first, count)}-01`, -1)
  };
}
export {
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
};
