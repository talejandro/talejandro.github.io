// src/foundation/color/compare.ts
import { convertColor } from "./convert.js";
function colorDistance(first, second) {
  const [l1, a1, b1] = convertColor(first, "oklab").coords;
  const [l2, a2, b2] = convertColor(second, "oklab").coords;
  return Math.hypot(
    (l1 ?? 0) - (l2 ?? 0),
    (a1 ?? 0) - (a2 ?? 0),
    (b1 ?? 0) - (b2 ?? 0)
  );
}
var luminance = (color) => Math.max(0, convertColor(color, "xyz-d65").coords[1] ?? 0);
function contrastRatio(first, second) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a
  );
  return (lighter + 0.05) / (darker + 0.05);
}
export {
  colorDistance,
  contrastRatio
};
