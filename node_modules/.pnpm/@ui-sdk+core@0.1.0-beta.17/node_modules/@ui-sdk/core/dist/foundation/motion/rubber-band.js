// src/foundation/motion/rubber-band.ts
var iosRubberBandCoefficient = 0.55;
function rubberBand(overshoot, dimension, coefficient = iosRubberBandCoefficient) {
  if (overshoot <= 0) {
    return 0;
  }
  return (1 - 1 / (overshoot * coefficient / dimension + 1)) * dimension;
}
function rubberBandInverse(shown, dimension, coefficient = iosRubberBandCoefficient) {
  if (shown <= 0) {
    return 0;
  }
  const ratio = Math.min(shown / dimension, 0.999999);
  return (1 / (1 - ratio) - 1) * dimension / coefficient;
}
function rubberBandSlope(overshoot, dimension, coefficient = iosRubberBandCoefficient) {
  if (overshoot <= 0) {
    return 1;
  }
  const base = overshoot * coefficient / dimension + 1;
  return coefficient / (base * base);
}
export {
  rubberBand,
  rubberBandInverse,
  rubberBandSlope
};
