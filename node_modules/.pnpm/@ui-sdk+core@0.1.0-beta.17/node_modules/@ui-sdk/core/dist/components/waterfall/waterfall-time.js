// src/components/waterfall/waterfall-time.ts
import { formatNumber } from "../../foundation/number/format.js";
import { clamp } from "../../foundation/number/steps.js";
function spanRange(items) {
  let start = Infinity;
  let end = -Infinity;
  const visit = (list) => {
    for (const item of list) {
      start = Math.min(start, item.start);
      end = Math.max(end, item.start + Math.max(0, item.duration));
      if (item.children) {
        visit(item.children);
      }
    }
  };
  visit(items);
  return Number.isFinite(start) ? [start, end] : [0, 0];
}
var round = (percent) => Math.round(percent * 1e4) / 1e4;
function percentAt(time, [start, end]) {
  return end > start ? round((clamp(time, start, end) - start) / (end - start) * 100) : 0;
}
function spanPlacement(span, range) {
  const start = percentAt(span.start, range);
  const end = percentAt(span.start + Math.max(0, span.duration), range);
  return { start, size: round(end - start) };
}
function tickStep(span, max) {
  const rough = span / (max + 1);
  const power = 10 ** Math.floor(Math.log10(rough));
  for (const factor of [1, 2, 5, 10]) {
    if (factor * power >= rough) {
      return factor * power;
    }
  }
  return 10 * power;
}
function tickTimes([start, end], max) {
  if (!(end > start) || max < 1) {
    return [start];
  }
  const step = tickStep(end - start, max);
  const times = [];
  for (let time = Math.ceil(start / step) * step; time <= end - step + step * 1e-9 && times.length < max; time += step) {
    times.push(Number(time.toFixed(Math.max(0, -Math.floor(Math.log10(step))))));
  }
  const first = Math.ceil(start / step) * step;
  return times.length === 0 && first <= end ? [first] : times;
}
var stepDigits = (step) => Math.min(6, Math.max(0, Math.ceil(-Math.log10(step) - 1e-9)));
function formatTime(time, locale, format, scale = time, step) {
  if (format) {
    return formatNumber(time, locale, format);
  }
  const size = Math.abs(scale);
  const unit = size < 1e3 ? {
    unit: "millisecond",
    ms: 1,
    digits: Math.abs(time) < 10 ? 1 : 0
  } : size < 6e4 ? { unit: "second", ms: 1e3, digits: 2 } : { unit: "minute", ms: 6e4, digits: 1 };
  return formatNumber(time / unit.ms, locale, {
    style: "unit",
    unit: unit.unit,
    unitDisplay: "short",
    maximumFractionDigits: Math.max(
      unit.digits,
      step !== void 0 && step > 0 ? stepDigits(step / unit.ms) : 0
    )
  });
}
function waterfallTicks(range, max, locale, format) {
  const scale = Math.max(Math.abs(range[0]), Math.abs(range[1]));
  const step = tickStep(range[1] - range[0], max);
  return tickTimes(range, max).map((time) => ({
    time,
    label: formatTime(time, locale, format, scale, step),
    position: percentAt(time, range)
  }));
}
export {
  formatTime,
  percentAt,
  spanPlacement,
  spanRange,
  tickTimes,
  waterfallTicks
};
