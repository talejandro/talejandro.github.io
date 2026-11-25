// src/components/slider/slider-values.ts
import { stepFromKey } from "../../foundation/number/keys.js";
import {
  clamp,
  maxOnGrid,
  snapToStep,
  stepOnGrid
} from "../../foundation/number/steps.js";
function thumbBounds(values, index, range) {
  return boundsBetween(
    index > 0 ? values[index - 1] : void 0,
    values[index + 1],
    range
  );
}
function boundsBetween(before, after, range) {
  const gap = range.minStepsBetweenThumbs * range.step;
  const end = maxOnGrid(range);
  const lower = clamp(
    before === void 0 ? range.min : before + gap,
    range.min,
    end
  );
  const upper = clamp(after === void 0 ? end : after - gap, lower, end);
  return { lower, upper };
}
function moveThumb(values, index, target, range) {
  const { lower, upper } = thumbBounds(values, index, range);
  const next = clamp(snapToStep(target, range), lower, upper);
  if (next === values[index]) {
    return values;
  }
  const result = values.slice();
  result[index] = next;
  return result;
}
function normalizeValues(values, range) {
  return values.map((value) => clamp(value, range.min, range.max)).sort((a, b) => a - b);
}
function keyTarget(key, {
  shiftKey = false,
  rtl = false,
  orientation = "horizontal"
} = {}, value, bounds, range) {
  const move = stepFromKey(
    { key, shiftKey },
    { orientation, dir: rtl ? "rtl" : "ltr" }
  );
  if (!move) {
    return null;
  }
  if ("bound" in move) {
    return move.bound === "min" ? bounds.lower : bounds.upper;
  }
  return stepOnGrid(value, move, range);
}
function thumbForPress(values, pressed) {
  let nearest = 0;
  for (let index = 1; index < values.length; index++) {
    if (Math.abs(values[index] - pressed) < Math.abs(values[nearest] - pressed)) {
      nearest = index;
    }
  }
  const stack = stackAt(values, nearest);
  if (stack.length === 1) {
    return { index: nearest, stack };
  }
  if (pressed < values[nearest]) {
    return { index: stack[0], stack };
  }
  if (pressed > values[nearest]) {
    return { index: stack[stack.length - 1], stack };
  }
  return { index: null, stack };
}
function stackAt(values, index) {
  const stack = [];
  for (let other = 0; other < values.length; other++) {
    if (values[other] === values[index]) {
      stack.push(other);
    }
  }
  return stack;
}
function thumbForDirection(stack, direction) {
  return direction < 0 ? stack[0] : stack[stack.length - 1];
}
function percentOf(value, range) {
  if (!(range.max > range.min)) {
    return 0;
  }
  return roundPercent(
    (clamp(value, range.min, range.max) - range.min) / (range.max - range.min) * 100
  );
}
function roundPercent(percent) {
  return Math.round(percent * 1e4) / 1e4;
}
function fractionAlong(point, box, { rtl = false, vertical = false } = {}) {
  const fraction = vertical ? (box.top + box.height - point.y) / box.height : rtl ? (box.left + box.width - point.x) / box.width : (point.x - box.left) / box.width;
  return Number.isFinite(fraction) ? clamp(fraction, 0, 1) : 0;
}
function valueAt(fraction, range) {
  return range.min + clamp(fraction, 0, 1) * (range.max - range.min);
}
export {
  boundsBetween,
  fractionAlong,
  keyTarget,
  moveThumb,
  normalizeValues,
  percentOf,
  stackAt,
  thumbBounds,
  thumbForDirection,
  thumbForPress,
  valueAt
};
