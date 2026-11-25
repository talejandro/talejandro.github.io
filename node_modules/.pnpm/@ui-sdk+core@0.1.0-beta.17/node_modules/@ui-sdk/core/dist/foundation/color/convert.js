// src/foundation/color/convert.ts
var linearSrgbToXyz = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270]
];
var xyzToLinearSrgb = [
  [12831 / 3959, -329 / 214, -1974 / 3959],
  [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
  [705 / 12673, -2585 / 12673, 705 / 667]
];
var linearP3ToXyz = [
  [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
  [35783 / 156275, 247089 / 357200, 198249 / 2500400],
  [0, 32229 / 714400, 5220557 / 5000800]
];
var xyzToLinearP3 = [
  [446124 / 178915, -333277 / 357830, -72051 / 178915],
  [-14852 / 17905, 63121 / 35810, 423 / 17905],
  [11844 / 330415, -50337 / 660830, 316169 / 330415]
];
var d65ToD50 = [
  [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
  [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
  [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371]
];
var d50ToD65 = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124]
];
var xyzToLms = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
];
var lmsToOklab = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.42859224204858, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757548750474]
];
var oklabToLms = [
  [1, 0.3963377773761749, 0.2158037573099136],
  [1, -0.1055613458156586, -0.0638541728258133],
  [1, -0.0894841775298119, -1.2914855480194092]
];
var lmsToXyz = [
  [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
  [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
  [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
];
var d50White = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
var kappa = 24389 / 27;
var epsilon = 216 / 24389;
var achromatic = { lch: 15e-4, oklch: 4e-6, rgb: 1e-7 };
var multiply = (matrix, [a, b, c]) => [
  matrix[0][0] * a + matrix[0][1] * b + matrix[0][2] * c,
  matrix[1][0] * a + matrix[1][1] * b + matrix[1][2] * c,
  matrix[2][0] * a + matrix[2][1] * b + matrix[2][2] * c
];
var toLinear = (value) => {
  const size = Math.abs(value);
  return size <= 0.04045 ? value / 12.92 : Math.sign(value) * ((size + 0.055) / 1.055) ** 2.4;
};
var fromLinear = (value) => {
  const size = Math.abs(value);
  return size > 31308e-7 ? Math.sign(value) * (1.055 * size ** (1 / 2.4) - 0.055) : 12.92 * value;
};
var normalizeHue = (hue) => (hue % 360 + 360) % 360;
function rgbHue([red, green, blue], max, delta) {
  if (delta < achromatic.rgb) {
    return Number.NaN;
  }
  if (max === red) {
    return 60 * ((green - blue) / delta + (green < blue ? 6 : 0));
  }
  if (max === green) {
    return 60 * ((blue - red) / delta + 2);
  }
  return 60 * ((red - green) / delta + 4);
}
function srgbToHsl(rgb) {
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const lightness = (max + min) / 2;
  let hue = rgbHue(rgb, max, max - min);
  let saturation = Number.isNaN(hue) || lightness === 0 || lightness === 1 ? 0 : (max - lightness) / Math.min(lightness, 1 - lightness);
  if (saturation < 0) {
    hue += 180;
    saturation = -saturation;
  }
  return [normalizeHue(hue), saturation * 100, lightness * 100];
}
function hslToSrgb([hue, saturation, lightness]) {
  const s = saturation / 100;
  const l = lightness / 100;
  const channel = (n) => {
    const k = (n + hue / 30) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)];
}
function srgbToHsv(rgb) {
  const max = Math.max(...rgb);
  const delta = max - Math.min(...rgb);
  const hue = rgbHue(rgb, max, delta);
  return [
    normalizeHue(hue),
    Number.isNaN(hue) || max === 0 ? 0 : delta / max * 100,
    max * 100
  ];
}
function hsvToSrgb([hue, saturation, value]) {
  const s = saturation / 100;
  const v = value / 100;
  const channel = (n) => {
    const k = (n + hue / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [channel(5), channel(3), channel(1)];
}
function hsvToHwb([hue, saturation, value]) {
  return [hue, (100 - saturation) * (value / 100), 100 - value];
}
function hwbToHsv([hue, whiteness, blackness]) {
  const total = whiteness + blackness;
  if (total >= 100) {
    return [hue, 0, whiteness / total * 100];
  }
  const value = 100 - blackness;
  return [
    hue,
    value === 0 ? 0 : (1 - whiteness / value) * 100,
    value
  ];
}
function xyzToLab(xyz) {
  const [x, y, z] = xyz.map((value, index) => {
    const scaled = value / d50White[index];
    return scaled > epsilon ? Math.cbrt(scaled) : (kappa * scaled + 16) / 116;
  });
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
function labToXyz([lightness, a, b]) {
  const y = (lightness + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;
  return [
    (x ** 3 > epsilon ? x ** 3 : (116 * x - 16) / kappa) * d50White[0],
    (lightness > kappa * epsilon ? y ** 3 : lightness / kappa) * d50White[1],
    (z ** 3 > epsilon ? z ** 3 : (116 * z - 16) / kappa) * d50White[2]
  ];
}
var toPolar = (threshold) => ([lightness, a, b]) => {
  const chroma = Math.hypot(a, b);
  const hue = chroma < threshold ? Number.NaN : normalizeHue(Math.atan2(b, a) * 180 / Math.PI);
  return [lightness, chroma, hue];
};
function fromPolar([lightness, chroma, hue]) {
  const angle = (Number.isNaN(hue) ? 0 : hue) * Math.PI / 180;
  return [
    lightness,
    chroma * Math.cos(angle),
    chroma * Math.sin(angle)
  ];
}
var spaces = {
  "xyz-d50": {
    base: "xyz-d65",
    toBase: (xyz) => multiply(d50ToD65, xyz),
    fromBase: (xyz) => multiply(d65ToD50, xyz)
  },
  "srgb-linear": {
    base: "xyz-d65",
    toBase: (rgb) => multiply(linearSrgbToXyz, rgb),
    fromBase: (xyz) => multiply(xyzToLinearSrgb, xyz)
  },
  srgb: {
    base: "srgb-linear",
    toBase: (rgb) => rgb.map(toLinear),
    fromBase: (rgb) => rgb.map(fromLinear)
  },
  "display-p3": {
    base: "xyz-d65",
    toBase: (rgb) => multiply(linearP3ToXyz, rgb.map(toLinear)),
    fromBase: (xyz) => multiply(xyzToLinearP3, xyz).map(fromLinear)
  },
  hsl: { base: "srgb", toBase: hslToSrgb, fromBase: srgbToHsl },
  hsv: { base: "srgb", toBase: hsvToSrgb, fromBase: srgbToHsv },
  hwb: { base: "hsv", toBase: hwbToHsv, fromBase: hsvToHwb },
  lab: { base: "xyz-d50", toBase: labToXyz, fromBase: xyzToLab },
  lch: { base: "lab", toBase: fromPolar, fromBase: toPolar(achromatic.lch) },
  oklab: {
    base: "xyz-d65",
    toBase: (lab) => multiply(
      lmsToXyz,
      multiply(oklabToLms, lab).map((value) => value ** 3)
    ),
    fromBase: (xyz) => multiply(lmsToOklab, multiply(xyzToLms, xyz).map(Math.cbrt))
  },
  oklch: {
    base: "oklab",
    toBase: fromPolar,
    fromBase: toPolar(achromatic.oklch)
  }
};
function lineage(space) {
  const path = [space];
  while (path[path.length - 1] !== "xyz-d65") {
    path.push(spaces[path[path.length - 1]].base);
  }
  return path;
}
function convertColor(color, space) {
  if (color.space === space) {
    return color;
  }
  const from = lineage(color.space);
  const to = lineage(space);
  const meeting = from.find((step) => to.includes(step));
  let coords = color.coords.map((value) => value ?? 0);
  for (const step of from.slice(0, from.indexOf(meeting))) {
    coords = spaces[step].toBase(coords);
  }
  for (const step of to.slice(0, to.indexOf(meeting)).reverse()) {
    coords = spaces[step].fromBase(coords);
  }
  const converted = {
    space,
    coords: coords.map(
      (value) => Number.isNaN(value) ? null : value
    ),
    alpha: color.alpha
  };
  return converted;
}
export {
  convertColor
};
