// src/components/color-picker/color-picker-channels.ts
import { convertColor } from "../../foundation/color/convert.js";
import { formatColor } from "../../foundation/color/format.js";
import {
  isInGamut,
  toGamut
} from "../../foundation/color/gamut.js";
import { parseColor } from "../../foundation/color/parse.js";
var hue = { index: 0, max: 360, step: 1, scale: 1, unit: "\xB0" };
var percent = (index) => ({ index, max: 100, step: 1, scale: 1, unit: "%" });
var byte = (index) => ({ index, max: 255, step: 1, scale: 255, unit: "" });
var alpha = {
  index: 3,
  max: 100,
  step: 1,
  scale: 100,
  unit: "%"
};
var channels = {
  hsv: { hue, saturation: percent(1), brightness: percent(2), alpha },
  hsl: { hue, saturation: percent(1), lightness: percent(2), alpha },
  srgb: { red: byte(0), green: byte(1), blue: byte(2), alpha },
  oklch: {
    lightness: { index: 0, max: 100, step: 0.1, scale: 100, unit: "%" },
    chroma: { index: 1, max: 0.4, step: 1e-3, scale: 1, unit: "" },
    hue: { ...hue, index: 2 },
    alpha
  }
};
var labels = {
  hue: "Hue",
  saturation: "Saturation",
  brightness: "Brightness",
  lightness: "Lightness",
  chroma: "Chroma",
  red: "Red",
  green: "Green",
  blue: "Blue",
  alpha: "Alpha"
};
var defaultAxes = {
  hsv: { x: "saturation", y: "brightness", slider: "hue" },
  hsl: { x: "saturation", y: "lightness", slider: "hue" },
  srgb: { x: "red", y: "green", slider: "blue" },
  oklch: { x: "chroma", y: "lightness", slider: "hue" }
};
var spaces = Object.keys(channels);
var spaceOf = (space) => spaces.find((name) => name === space) ?? "hsv";
function channelOf(space, channel) {
  const name = channel && channels[space][channel] ? channel : defaultAxes[space].slider;
  return { name, label: labels[name], ...channels[space][name] };
}
var black = (space) => convertColor({ space: "srgb", coords: [0, 0, 0], alpha: 1 }, space);
var inSpace = (color, space) => convertColor(space === "oklch" ? color : toGamut(color, "srgb"), space);
function colorIn(text, space) {
  const parsed = parseColor(text);
  return parsed && inSpace(parsed, space);
}
function readChannel(color, spec) {
  const coord = spec.index === 3 ? color.alpha : color.coords[spec.index];
  return Number(((coord ?? 0) * spec.scale).toFixed(4));
}
function withChannel(color, spec, value) {
  const coord = Math.min(spec.max, Math.max(0, value)) / spec.scale;
  if (spec.index === 3) {
    return { ...color, alpha: coord };
  }
  const coords = [...color.coords];
  coords[spec.index] = coord;
  return { ...color, coords };
}
function channelText(value, spec) {
  const rounded = Number(
    value.toFixed(spec.step < 1 ? String(spec.step).length - 2 : 0)
  );
  return spec.unit === "\xB0" ? `${rounded}\xB0` : `${rounded}${spec.unit}`;
}
function shown(color, gamut) {
  return gamut && !isInGamut(color, gamut) ? toGamut(color, gamut) : color;
}
var cssOf = (color) => formatColor(
  color,
  color.space === "hsv" ? "hsl" : color.space === "oklch" ? "oklch" : color.space
);
function channelGradient(color, spec, direction) {
  const count = spec.unit === "\xB0" ? 13 : spec.index === 3 ? 2 : 5;
  const stops = Array.from({ length: count }, (_, at) => {
    const stop = withChannel(color, spec, spec.max * at / (count - 1));
    return cssOf(spec.index === 3 ? stop : { ...stop, alpha: 1 });
  });
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}
function areaGradient(color, x, y, rtl) {
  const space = color.space;
  const flat = space === "hsv" || space === "hsl";
  if (!flat || x !== "saturation" || y !== "brightness" && y !== "lightness") {
    return void 0;
  }
  const hueOf = Math.round((color.coords[0] ?? 0) * 100) / 100;
  const across = rtl ? "to left" : "to right";
  if (space === "hsv") {
    return `linear-gradient(to top, #000, transparent), linear-gradient(${across}, #fff, hsl(${hueOf} 100% 50%))`;
  }
  return `linear-gradient(to top, #000, transparent, #fff), linear-gradient(${across}, hsl(${hueOf} 0% 50%), hsl(${hueOf} 100% 50%))`;
}
var hueNames = [
  [20, "pink"],
  [45, "red"],
  [70, "orange"],
  [110, "yellow"],
  [135, "lime"],
  [170, "green"],
  [215, "cyan"],
  [270, "blue"],
  [320, "purple"],
  [350, "magenta"],
  [360, "pink"]
];
function describeColor(color) {
  if (color.alpha === 0) {
    return "transparent";
  }
  const [lightness = 0, chroma = 0, angle = 0] = convertColor(
    color,
    "oklch"
  ).coords.map((n) => n ?? 0);
  const opacity = color.alpha < 1 ? `, ${Math.round(color.alpha * 100)}% opaque` : "";
  if (chroma < 0.02) {
    const gray = lightness < 0.15 ? "black" : lightness > 0.97 ? "white" : void 0;
    if (gray) {
      return gray + opacity;
    }
  }
  const tone = lightness < 0.45 ? "dark " : lightness > 0.82 ? "light " : "";
  const strength = chroma < 0.02 ? "" : chroma < 0.08 ? "grayish " : chroma > 0.2 ? "vivid " : "";
  const name = chroma < 0.02 ? "gray" : hueNames.find(([end]) => angle % 360 < end)[1];
  return `${tone}${strength}${name}${opacity}`;
}
export {
  areaGradient,
  black,
  channelGradient,
  channelOf,
  channelText,
  colorIn,
  cssOf,
  defaultAxes,
  describeColor,
  inSpace,
  readChannel,
  shown,
  spaceOf,
  withChannel
};
