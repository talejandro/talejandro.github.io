// src/foundation/color/gamut.ts
import { colorDistance } from "./compare.js";
import { convertColor } from "./convert.js";
var spaceOf = (gamut) => gamut === "p3" ? "display-p3" : "srgb";
var tolerance = 75e-6;
var justNoticeable = 0.02;
var clip = (color) => ({
  ...color,
  coords: color.coords.map(
    (value) => Math.min(1, Math.max(0, value ?? 0))
  )
});
function isInGamut(color, gamut = "srgb") {
  return convertColor(color, spaceOf(gamut)).coords.every(
    (value) => (value ?? 0) >= -tolerance && (value ?? 0) <= 1 + tolerance
  );
}
function toGamut(color, gamut = "srgb") {
  const mapped = convertColor(mapToGamut(color, gamut), color.space);
  return mapped;
}
function mapToGamut(color, gamut) {
  const space = spaceOf(gamut);
  const origin = convertColor(color, "oklch");
  const [lightness, chroma, hue] = origin.coords;
  if ((lightness ?? 0) >= 1) {
    return { space, coords: [1, 1, 1], alpha: color.alpha };
  }
  if ((lightness ?? 0) <= 0) {
    return { space, coords: [0, 0, 0], alpha: color.alpha };
  }
  if (isInGamut(origin, gamut)) {
    return color;
  }
  const withChroma = (value) => ({ ...origin, coords: [lightness, value, hue] });
  let clipped = clip(convertColor(origin, space));
  if (colorDistance(clipped, origin) < justNoticeable) {
    return clipped;
  }
  let min = 0;
  let max = chroma ?? 0;
  let minInGamut = true;
  while (max - min > 1e-4) {
    const middle = (min + max) / 2;
    const current = withChroma(middle);
    if (minInGamut && isInGamut(current, gamut)) {
      min = middle;
      continue;
    }
    clipped = clip(convertColor(current, space));
    const distance = colorDistance(clipped, current);
    if (distance >= justNoticeable) {
      max = middle;
    } else if (justNoticeable - distance < 1e-4) {
      return clipped;
    } else {
      minInGamut = false;
      min = middle;
    }
  }
  return clipped;
}
export {
  isInGamut,
  toGamut
};
