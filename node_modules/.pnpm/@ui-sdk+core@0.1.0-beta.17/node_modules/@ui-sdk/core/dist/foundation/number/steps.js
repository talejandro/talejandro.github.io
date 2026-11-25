// src/foundation/number/steps.ts
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function decimalsOf(value) {
  if (!Number.isFinite(value) || Number.isInteger(value)) {
    return 0;
  }
  const [mantissa, exponent] = String(value).toLowerCase().split("e");
  const decimals = (mantissa.split(".")[1] ?? "").length;
  return Math.max(0, decimals - Number(exponent ?? 0));
}
function roundTo(value, decimals) {
  return Number(value.toFixed(Math.min(decimals, 100)));
}
function stepCount(distance, step) {
  return Number((distance / step).toPrecision(15));
}
function stepBase(range) {
  return Number.isFinite(range.min) ? range.min : 0;
}
function precisionOf(range) {
  return Math.max(decimalsOf(range.step), decimalsOf(stepBase(range)));
}
function maxOnGrid(range) {
  if (!Number.isFinite(range.max) || !(range.step > 0)) {
    return range.max;
  }
  const base = stepBase(range);
  const steps = Math.floor(stepCount(range.max - base, range.step));
  return roundTo(base + steps * range.step, precisionOf(range));
}
function onGrid(value, range, round = Math.round) {
  if (!(range.step > 0)) {
    return value;
  }
  const base = stepBase(range);
  return roundTo(
    base + round(stepCount(value - base, range.step)) * range.step,
    precisionOf(range)
  );
}
function snapToStep(value, range) {
  if (!(range.step > 0)) {
    return clamp(value, range.min, range.max);
  }
  return roundTo(
    clamp(onGrid(value, range), range.min, maxOnGrid(range)),
    precisionOf(range)
  );
}
function stepValue(value, steps, range) {
  if (!(range.step > 0)) {
    return clamp(value + steps, range.min, range.max);
  }
  const base = stepBase(range);
  const position = stepCount(value - base, range.step);
  const onGrid2 = Number.isInteger(position);
  const from = onGrid2 ? position : steps > 0 ? Math.floor(position) : Math.ceil(position);
  const next = base + (from + steps) * range.step;
  return roundTo(clamp(next, range.min, maxOnGrid(range)), precisionOf(range));
}
function wrap(value, min, max) {
  const span = max - min;
  if (!(span > 0)) {
    return min;
  }
  return ((value - min) % span + span) % span + min;
}
function stepOnGrid(value, move, range) {
  if (move.size === "large") {
    return snapToStep(
      clamp(
        value + move.direction * (range.largeStep ?? range.step * 10),
        range.min,
        range.max
      ),
      range
    );
  }
  if (move.size === "small" && range.smallStep) {
    return stepValue(value, move.direction, { ...range, step: range.smallStep });
  }
  return stepValue(value, move.direction, range);
}
function stepBy(value, move, range, { snap = true } = {}) {
  if ("bound" in move) {
    return move.bound === "min" ? range.min : maxOnGrid(range);
  }
  const next = stepOnGrid(value, move, range);
  if (!snap || !range.snap) {
    return next;
  }
  const { points, threshold } = range.snap;
  const direction = move.direction;
  let stop;
  for (const point of points) {
    const ahead = (point - value) * direction > 0;
    const reached = (next + direction * threshold - point) * direction >= 0;
    if (ahead && reached && (stop === void 0 || (point - stop) * direction < 0)) {
      stop = point;
    }
  }
  return stop === void 0 ? next : clamp(stop, range.min, range.max);
}
function scrubTo(value, range, {
  snap = true,
  ease
} = {}) {
  let nearest;
  const threshold = range.snap?.threshold ?? 0;
  if (snap && range.snap) {
    for (const point2 of range.snap.points) {
      if (Math.abs(point2 - value) <= threshold && (nearest === void 0 || Math.abs(point2 - value) < Math.abs(nearest - value))) {
        nearest = point2;
      }
    }
  }
  if (nearest === void 0) {
    return { value: snapToStep(value, range), point: void 0 };
  }
  const point = clamp(nearest, range.min, range.max);
  if (!ease || !(threshold > 0)) {
    return { value: point, point };
  }
  const closeness = 1 - Math.abs(point - value) / threshold;
  const pull = ease === true ? closeness : ease(closeness);
  return {
    value: clamp(value + (point - value) * pull, range.min, range.max),
    point
  };
}
export {
  clamp,
  decimalsOf,
  maxOnGrid,
  onGrid,
  roundTo,
  scrubTo,
  snapToStep,
  stepBy,
  stepOnGrid,
  stepValue,
  wrap
};
