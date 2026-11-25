// src/foundation/gauge/gauge.ts
import { css } from "../kernel/inline-style.js";
import { localeOf } from "../text/locale.js";
import { formatNumber } from "../../foundation/number/format.js";
import { clamp } from "../../foundation/number/steps.js";
function gaugeSettings(options) {
  const min = finite(options.min, 0);
  return {
    min,
    max: Math.max(min, finite(options.max, 100)),
    format: options.format,
    locale: options.locale,
    getValueLabel: options.getValueLabel
  };
}
function finite(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function percentBetween(value, min, max) {
  if (max <= min) {
    return value >= max ? 100 : 0;
  }
  return (clamp(value, min, max) - min) / (max - min) * 100;
}
function formatGaugeValue(value, settings) {
  if (value === null) {
    return "";
  }
  const { format, min, max } = settings;
  const locale = localeOf(settings);
  if (typeof format === "function") {
    return format(value);
  }
  if (format && format.style !== "percent") {
    return formatNumber(value, locale, format);
  }
  return formatNumber(
    percentBetween(value, min, max) / 100,
    locale,
    format ?? { style: "percent" }
  );
}
function gaugeValueText(value, settings) {
  const formatted = formatGaugeValue(value, settings);
  if (!settings.getValueLabel) {
    return formatted || void 0;
  }
  const percent = value === null ? null : percentBetween(value, settings.min, settings.max);
  return settings.getValueLabel(value, {
    formatted,
    percent,
    min: settings.min,
    max: settings.max
  });
}
function gaugeAria(value, settings) {
  return {
    "aria-valuemin": String(settings.min),
    "aria-valuemax": String(settings.max),
    "aria-valuenow": value === null ? void 0 : String(clamp(value, settings.min, settings.max)),
    "aria-valuetext": gaugeValueText(value, settings)
  };
}
function indicatorStyle(percent) {
  return percent === null ? void 0 : css({ "inset-inline-start": 0, width: `${roundPercent(percent)}%` });
}
function roundPercent(percent) {
  return Math.round(percent * 1e4) / 1e4;
}
var labelId = (id) => `${id}-label`;
var labelledBy = (state, id) => state.labels || !state.bound ? labelId(id) : void 0;
function gaugeApi(store) {
  return {
    internal: {
      label: () => {
        store.set({ labels: store.get().labels + 1 });
        let bound = true;
        return () => {
          if (!bound) {
            return;
          }
          bound = false;
          store.set({ labels: store.get().labels - 1 });
        };
      }
    }
  };
}
export {
  finite,
  formatGaugeValue,
  gaugeApi,
  gaugeAria,
  gaugeSettings,
  indicatorStyle,
  labelId,
  labelledBy,
  percentBetween,
  roundPercent
};
