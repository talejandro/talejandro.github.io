// src/foundation/color/format.ts
import { convertColor } from "./convert.js";
var syntaxes = {
  srgb: { name: "rgb", scale: 255, ranges: [255, 255, 255] },
  hsl: { name: "hsl", scale: 1, ranges: [360, 100, 100], percent: true },
  hwb: { name: "hwb", scale: 1, ranges: [360, 100, 100], percent: true },
  lab: { name: "lab", scale: 1, ranges: [100, 125, 125] },
  lch: { name: "lch", scale: 1, ranges: [100, 150, 360] },
  oklab: { name: "oklab", scale: 1, ranges: [1, 0.4, 0.4] },
  oklch: { name: "oklch", scale: 1, ranges: [1, 0.4, 360] },
  "srgb-linear": { name: "color(srgb-linear", scale: 1, ranges: [1, 1, 1] },
  "display-p3": { name: "color(display-p3", scale: 1, ranges: [1, 1, 1] },
  "xyz-d65": { name: "color(xyz-d65", scale: 1, ranges: [1, 1, 1] },
  "xyz-d50": { name: "color(xyz-d50", scale: 1, ranges: [1, 1, 1] }
};
var srgbBound = /* @__PURE__ */ new Set(["hex", "srgb", "hsl", "hwb"]);
var clamp = (value, max) => Math.min(max, Math.max(0, value));
function writeNumber(value, range, precision) {
  const digits = range < 1 ? 1 : Math.floor(Math.log10(range)) + 1;
  const text = value.toFixed(Math.max(0, precision - digits));
  const trimmed = text.includes(".") ? text.replace(/\.?0+$/, "") : text;
  return trimmed === "-0" ? "0" : trimmed;
}
var clampChannel = (value, max) => value === null ? null : clamp(value, max);
function fit(color, format) {
  const space = format === "hex" ? "srgb" : format;
  const bound = srgbBound.has(format);
  if (color.space === space) {
    if (!bound) {
      return color;
    }
    const [first, second, third] = color.coords;
    const max = space === "srgb" ? 1 : 100;
    const coords = [
      space === "srgb" ? clampChannel(first, 1) : first,
      clampChannel(second, max),
      clampChannel(third, max)
    ];
    return { ...color, coords };
  }
  let source = color;
  if (bound) {
    const srgb = convertColor(color, "srgb");
    source = {
      ...srgb,
      coords: srgb.coords.map(
        (value) => clamp(value ?? 0, 1)
      )
    };
  }
  const converted = convertColor(source, space);
  return {
    ...converted,
    coords: converted.coords.map((value) => value ?? 0)
  };
}
function writeHex({ coords, alpha }) {
  const bytes = [
    ...coords.map((value) => value ?? 0),
    ...alpha < 1 ? [alpha] : []
  ];
  return `#${bytes.map(
    (value) => Math.round(value * 255).toString(16).padStart(2, "0")
  ).join("")}`;
}
function formatColor(color, format, options = {}) {
  const target = format ?? (color.space === "hsv" ? "hsl" : color.space);
  const { precision = 5 } = options;
  const fitted = fit(color, target);
  if (target === "hex") {
    return writeHex(fitted);
  }
  const { name, scale, ranges, percent } = syntaxes[target];
  const channels = fitted.coords.map((value, index) => {
    if (value === null) {
      return "none";
    }
    const text = writeNumber(value * scale, ranges[index], precision);
    return percent && index > 0 ? `${text}%` : text;
  });
  const alpha = fitted.alpha < 1 ? ` / ${writeNumber(fitted.alpha, 1, precision)}` : "";
  return `${name}${name.startsWith("color(") ? " " : "("}${channels.join(" ")}${alpha})`;
}
export {
  formatColor
};
