// src/foundation/number/format.ts
import { decimalsOf } from "./steps.js";
var formatters = /* @__PURE__ */ new Map();
function numberFormatter(locale, options = {}) {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatters.set(key, formatter);
  }
  return formatter;
}
var defaultDecimals = /* @__PURE__ */ new WeakMap();
function intlDecimals(format) {
  const formatter = numberFormatter(void 0, format);
  let decimals = defaultDecimals.get(formatter);
  if (decimals === void 0) {
    decimals = formatter.resolvedOptions().maximumFractionDigits ?? 0;
    defaultDecimals.set(formatter, decimals);
  }
  return decimals;
}
function displayOptions(format, step) {
  const options = { ...format };
  if (options.maximumFractionDigits === void 0 && options.maximumSignificantDigits === void 0) {
    const decimals = decimalsOf(step) + (options.style === "percent" ? -2 : 0);
    options.maximumFractionDigits = Math.max(
      options.minimumFractionDigits ?? 0,
      decimals,
      intlDecimals(format)
    );
  }
  return options;
}
function formatNumber(value, locale, format) {
  if (value === null || !Number.isFinite(value)) {
    return "";
  }
  if (typeof format === "function") {
    return format(value);
  }
  const formatter = numberFormatter(locale, format);
  const text = formatter.format(value);
  if (value < 0 && !formatter.formatToParts(value).some((part) => part.type === "integer")) {
    const parts = formatter.formatToParts(-3);
    const sign = parts.findIndex((part) => part.type === "minusSign");
    return `${parts.slice(0, sign + 1).map((part) => part.value).join("")}${text}`;
  }
  return text;
}
function formatNumberRange(start, end, locale, format) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "";
  }
  if (typeof format === "function") {
    return `${format(start)} \u2013 ${format(end)}`;
  }
  const formatter = numberFormatter(locale, format);
  if (start < 0 && end < 0) {
    return `${formatter.format(start)} \u2013 ${formatter.format(end)}`;
  }
  return formatter.formatRange ? formatter.formatRange(start, end) : `${formatter.format(start)}\u2013${formatter.format(end)}`;
}
function formatNumberToParts(value, locale, format) {
  if (value === null || !Number.isFinite(value)) {
    return [];
  }
  if (typeof format === "function") {
    return [
      { type: "literal", value: format(value) }
    ];
  }
  return numberFormatter(locale, format).formatToParts(value);
}
export {
  displayOptions,
  formatNumber,
  formatNumberRange,
  formatNumberToParts,
  numberFormatter
};
