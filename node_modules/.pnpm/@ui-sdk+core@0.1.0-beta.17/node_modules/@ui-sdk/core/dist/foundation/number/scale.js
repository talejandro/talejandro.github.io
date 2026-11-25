// src/foundation/number/scale.ts
import { clamp } from "./steps.js";
var scales = {
  linear: {
    to: (value) => value,
    from: (position) => position
  },
  log: { to: Math.log, from: Math.exp }
};
function fractionOf(value, range, scale = "linear") {
  const { to } = typeof scale === "string" ? scales[scale] : scale;
  const low = to(range.min);
  const span = to(range.max) - low;
  const fraction = (to(clamp(value, range.min, range.max)) - low) / span;
  return Number.isFinite(fraction) ? clamp(fraction, 0, 1) : 0;
}
function valueAt(fraction, range, scale = "linear") {
  const { to, from } = typeof scale === "string" ? scales[scale] : scale;
  const low = to(range.min);
  const value = from(low + clamp(fraction, 0, 1) * (to(range.max) - low));
  return clamp(value, range.min, range.max);
}
export {
  fractionOf,
  valueAt
};
