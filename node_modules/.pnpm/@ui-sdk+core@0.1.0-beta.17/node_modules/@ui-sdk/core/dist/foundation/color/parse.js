// src/foundation/color/parse.ts
import { namedColors } from "./names.js";
var rgb = { number: 1 / 255, percent: 1, min: 0, max: 1 };
var percentage = { number: 1, percent: 100 };
var unit = { number: 1, percent: 1 };
var alpha = { number: 1, percent: 1, min: 0, max: 1 };
var functions = {
  rgb: { space: "srgb", channels: [rgb, rgb, rgb] },
  hsl: {
    space: "hsl",
    channels: ["hue", { number: 1, percent: 100, min: 0 }, percentage]
  },
  hwb: { space: "hwb", channels: ["hue", percentage, percentage] },
  lab: {
    space: "lab",
    channels: [
      { number: 1, percent: 100, min: 0, max: 100 },
      { number: 1, percent: 125 },
      { number: 1, percent: 125 }
    ]
  },
  lch: {
    space: "lch",
    channels: [
      { number: 1, percent: 100, min: 0, max: 100 },
      { number: 1, percent: 150, min: 0 },
      "hue"
    ]
  },
  oklab: {
    space: "oklab",
    channels: [
      { number: 1, percent: 1, min: 0, max: 1 },
      { number: 1, percent: 0.4 },
      { number: 1, percent: 0.4 }
    ]
  },
  oklch: {
    space: "oklch",
    channels: [
      { number: 1, percent: 1, min: 0, max: 1 },
      { number: 1, percent: 0.4, min: 0 },
      "hue"
    ]
  }
};
var predefined = {
  srgb: "srgb",
  "srgb-linear": "srgb-linear",
  "display-p3": "display-p3",
  xyz: "xyz-d65",
  "xyz-d65": "xyz-d65",
  "xyz-d50": "xyz-d50"
};
var angles = {
  "": 1,
  deg: 1,
  grad: 0.9,
  rad: 180 / Math.PI,
  turn: 360
};
var token = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(%|deg|grad|rad|turn)?$/;
function readChannel(text, channel) {
  if (text === "none") {
    return null;
  }
  const match = token.exec(text);
  if (!match) {
    return void 0;
  }
  const [, digits, suffix = ""] = match;
  const value = Number(digits);
  if (channel === "hue") {
    return suffix in angles ? (value * angles[suffix] % 360 + 360) % 360 : void 0;
  }
  if (suffix && suffix !== "%") {
    return void 0;
  }
  const scaled = suffix ? value / 100 * channel.percent : value * channel.number;
  return Math.min(
    channel.max ?? Infinity,
    Math.max(channel.min ?? -Infinity, scaled)
  );
}
function readChannels(texts, channels, alphaText, space) {
  if (texts.length !== 3) {
    return null;
  }
  const coords = texts.map((text, index) => readChannel(text, channels[index]));
  const opacity = alphaText === void 0 ? 1 : readChannel(alphaText, alpha);
  if (coords.includes(void 0) || opacity === void 0) {
    return null;
  }
  return {
    space,
    coords,
    alpha: opacity ?? 0
  };
}
function parseHex(digits) {
  const full = digits.length < 5 ? [...digits].map((digit) => digit + digit).join("") : digits;
  const bytes = full.match(/../g).map((pair) => parseInt(pair, 16) / 255);
  return {
    space: "srgb",
    coords: [bytes[0], bytes[1], bytes[2]],
    alpha: bytes[3] ?? 1
  };
}
function parseFunction(name, body) {
  if (name === "color") {
    const [channels2, alphaText2, extra2] = body.split("/").map((part) => part.trim());
    const [spaceName, ...texts] = channels2.split(/\s+/);
    if (extra2 !== void 0 || !Object.hasOwn(predefined, spaceName)) {
      return null;
    }
    return readChannels(
      texts,
      [unit, unit, unit],
      alphaText2,
      predefined[spaceName]
    );
  }
  const legacyName = name === "rgba" || name === "hsla" ? name.slice(0, 3) : name;
  if (!Object.hasOwn(functions, legacyName)) {
    return null;
  }
  const definition = functions[legacyName];
  if (body.includes(",")) {
    if (definition.space !== "srgb" && definition.space !== "hsl") {
      return null;
    }
    const parts = body.split(",").map((part) => part.trim());
    if (parts.length > 4 || parts.includes("none")) {
      return null;
    }
    return readChannels(
      parts.slice(0, 3),
      definition.channels,
      parts[3],
      definition.space
    );
  }
  const [channels, alphaText, extra] = body.split("/").map((part) => part.trim());
  if (extra !== void 0) {
    return null;
  }
  return readChannels(
    channels.split(/\s+/),
    definition.channels,
    alphaText,
    definition.space
  );
}
function parseColor(text) {
  const color = readColor(text.trim().toLowerCase());
  return color;
}
function readColor(value) {
  if (value === "transparent") {
    return { space: "srgb", coords: [0, 0, 0], alpha: 0 };
  }
  const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(value);
  if (hex) {
    return parseHex(hex[1]);
  }
  const call = /^([a-z]+)\((.*)\)$/.exec(value);
  if (call) {
    return parseFunction(call[1], call[2].trim());
  }
  const named = /^[a-z]+$/.test(value) ? namedColors.indexOf(` ${value}:`) : -1;
  return named === -1 ? null : parseHex(
    namedColors.slice(named + value.length + 2, named + value.length + 8)
  );
}
export {
  parseColor
};
