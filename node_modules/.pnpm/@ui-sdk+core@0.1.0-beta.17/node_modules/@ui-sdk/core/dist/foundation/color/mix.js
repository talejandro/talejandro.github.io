// src/foundation/color/mix.ts
import { convertColor } from "./convert.js";
var hueIndex = {
  hsl: 0,
  hsv: 0,
  hwb: 0,
  lch: 2,
  oklch: 2
};
var normalize = (hue) => (hue % 360 + 360) % 360;
function fixHues(first, second, method) {
  const delta = second - first;
  if (method === "shorter") {
    if (delta > 180) {
      first += 360;
    } else if (delta < -180) {
      second += 360;
    }
  } else if (method === "longer") {
    if (delta > 0 && delta < 180) {
      first += 360;
    } else if (delta > -180 && delta <= 0) {
      second += 360;
    }
  } else if (method === "increasing") {
    if (delta < 0) {
      second += 360;
    }
  } else if (delta > 0) {
    first += 360;
  }
  return [first, second];
}
function mixColor(first, second, amount = 0.5, options = {}) {
  const space = options.space ?? "oklab";
  const hue = hueIndex[space];
  const weight = Math.min(1, Math.max(0, amount));
  const [a, b] = [first, second].map((color) => convertColor(color, space));
  const alpha = a.alpha + (b.alpha - a.alpha) * weight;
  const coords = a.coords.map((own, index) => {
    const other = b.coords[index];
    if (own === null && other === null) {
      return null;
    }
    const [from, to] = [own ?? other, other ?? own];
    if (index === hue) {
      const [start, end] = fixHues(
        normalize(from),
        normalize(to),
        options.hue ?? "shorter"
      );
      return normalize(start + (end - start) * weight);
    }
    const mixed2 = from * a.alpha + (to * b.alpha - from * a.alpha) * weight;
    return alpha === 0 ? from + (to - from) * weight : mixed2 / alpha;
  });
  const mixed = { space, coords, alpha };
  return mixed;
}
export {
  mixColor
};
