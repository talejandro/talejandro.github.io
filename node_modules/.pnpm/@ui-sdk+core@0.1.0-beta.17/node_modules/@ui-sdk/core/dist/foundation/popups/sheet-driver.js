// src/foundation/popups/sheet-driver.ts
import { setStyle } from "../platform/style.js";
var openHold = 1e3;
function afterFirstFrame(view, start) {
  view.requestAnimationFrame(() => view.requestAnimationFrame(start));
}
var toolbarBleed = 120;
function closedExtentFor(side) {
  return side === "bottom" ? -toolbarBleed : -32;
}
function sampleTranslate(motion, translate) {
  const frames = [];
  for (let elapsed = 0; elapsed < motion.duration; elapsed += 1e3 / 60) {
    frames.push(translate(motion.extentAt(elapsed)));
  }
  frames.push(translate(motion.extentAt(motion.duration)));
  return frames;
}
var reducedSettle = 200;
var reducedFade = 150;
function setStyles(el, styles) {
  const restores = Object.entries(styles).map(
    ([name, value]) => setStyle(el, name, value)
  );
  return () => restores.forEach((restore) => restore());
}
export {
  afterFirstFrame,
  closedExtentFor,
  openHold,
  reducedFade,
  reducedSettle,
  sampleTranslate,
  setStyles,
  toolbarBleed
};
