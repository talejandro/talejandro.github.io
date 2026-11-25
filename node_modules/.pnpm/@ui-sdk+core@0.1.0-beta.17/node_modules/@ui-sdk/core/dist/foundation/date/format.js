// src/foundation/date/format.ts
import { dateParts } from "./plain-date.js";
var gregorianMonths = /* @__PURE__ */ new Set([
  "gregory",
  "iso8601",
  "buddhist",
  "japanese",
  "roc"
]);
var formatters = /* @__PURE__ */ new Map();
function dateFormatter(locale, options = {}) {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });
    if (!gregorianMonths.has(formatter.resolvedOptions().calendar)) {
      formatter = new Intl.DateTimeFormat(locale, {
        ...options,
        calendar: "gregory",
        timeZone: "UTC"
      });
    }
    formatters.set(key, formatter);
  }
  return formatter;
}
function utc(date) {
  const parts = dateParts(date);
  if (!parts) {
    throw new RangeError(`"${date}" is not an ISO date (YYYY-MM-DD).`);
  }
  const time = /* @__PURE__ */ new Date(0);
  time.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  return time;
}
function formatDate(date, locale, options = longDate) {
  return dateFormatter(locale, options).format(utc(date));
}
function formatDateRange(start, end, locale, options = mediumDate) {
  return dateFormatter(locale, options).formatRange(utc(start), utc(end)).replace(thinSpaces, " ");
}
function formatDateToParts(date, locale, options = longDate) {
  return dateFormatter(locale, options).formatToParts(utc(date));
}
function monthNames(locale, width = "long") {
  const formatter = dateFormatter(locale, { month: width });
  return Array.from(
    { length: 12 },
    (_, index) => formatter.format(Date.UTC(2026, index, 1))
  );
}
function weekdayNames(locale, width = "short", weekStartsOn = 0) {
  const formatter = dateFormatter(locale, { weekday: width });
  return Array.from(
    { length: 7 },
    (_, index) => formatter.format(Date.UTC(2026, 0, 4 + (weekStartsOn + index) % 7))
  );
}
function todayDate(timeZone) {
  const parts = todayFormatter(timeZone).formatToParts(Date.now());
  const read = (type) => parts.find((part) => part.type === type).value;
  return `${read("year").padStart(4, "0")}-${read("month")}-${read("day")}`;
}
var todayFormatters = /* @__PURE__ */ new Map();
function todayFormatter(timeZone) {
  const key = timeZone ?? "";
  let formatter = todayFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    todayFormatters.set(key, formatter);
  }
  return formatter;
}
var longDate = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
};
var mediumDate = {
  year: "numeric",
  month: "short",
  day: "numeric"
};
var thinSpaces = /[\u2009\u202F]/g;
export {
  dateFormatter,
  formatDate,
  formatDateRange,
  formatDateToParts,
  monthNames,
  todayDate,
  weekdayNames
};
