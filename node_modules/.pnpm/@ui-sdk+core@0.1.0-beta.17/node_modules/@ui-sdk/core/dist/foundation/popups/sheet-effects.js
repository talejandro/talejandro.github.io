// src/foundation/popups/sheet-effects.ts
import { dimAmount, expandAmount, progressAmount } from "../motion/curves.js";
import { ahead } from "../platform/style.js";
var sampleStep = 1e3 / 60;
var variables = [
  "--drawer-progress",
  "--drawer-dim",
  "--drawer-expand",
  "--drawer-stack"
];
var registered = /* @__PURE__ */ new WeakSet();
function registerVariables(doc) {
  const css = doc.defaultView?.CSS;
  if (registered.has(doc) || !css?.registerProperty) {
    return;
  }
  registered.add(doc);
  for (const name of variables) {
    try {
      css.registerProperty({
        name,
        syntax: "<number>",
        inherits: false,
        initialValue: "0"
      });
    } catch {
    }
  }
}
function prepareVariables() {
  if (typeof document !== "undefined" && !registered.has(document)) {
    ahead(() => registerVariables(document));
  }
}
var supportsLinear = () => typeof CSS !== "undefined" && CSS.supports("animation-timing-function", "linear(0, 1)");
var round = (value) => Math.round(value * 1e4) / 1e4;
function createSheetEffects(targets) {
  registerVariables(targets.sheet.ownerDocument);
  let snapExtents = [1];
  let undimmedIndex = -1;
  let running = [];
  const seeking = /* @__PURE__ */ new Map();
  const values = { dim: 0, progress: 0, expand: 0 };
  let dimHold;
  function configure(next) {
    snapExtents = next.snapExtents.length ? next.snapExtents : [1];
    undimmedIndex = next.undimmedIndex;
  }
  function compute(extent, into = values) {
    into.dim = round(dimAmount(extent, snapExtents, undimmedIndex));
    into.progress = round(progressAmount(extent, snapExtents));
    into.expand = round(expandAmount(extent, snapExtents));
    return into;
  }
  let destroyed = false;
  function apply(extent, { rest = false } = {}) {
    if (destroyed) {
      return;
    }
    stopRunning();
    compute(extent);
    writeDim(values.dim);
    writeVariables(targets.sheet, values);
    writeStack(values.progress);
    for (const outlet of targets.outlets()) {
      writeVariables(outlet.el, values);
      if (outlet.keyframes) {
        seekOutlet(outlet, values.expand, rest);
      }
    }
    if (rest) {
      targets.themeColor?.(values.dim);
    }
  }
  function writeDim(dim) {
    const backdrop = targets.backdrop();
    if (backdrop) {
      backdrop.style.opacity = String(dim);
    }
    const hold = holdDim();
    if (hold) {
      hold.currentTime = dim * 1e3;
    }
  }
  function holdDim() {
    if (!targets.dimmed || dimHold) {
      return dimHold;
    }
    dimHold = targets.dimmed.animate(
      { opacity: [0, 1] },
      { ...backdropDim, duration: 1e3, fill: "both" }
    );
    dimHold.pause();
    dimHold.currentTime = 0;
    return dimHold;
  }
  function writeStack(progress) {
    const ancestors = targets.ancestors();
    for (let depth = 0; depth < ancestors.length; depth++) {
      ancestors[depth].style.setProperty(
        "--drawer-stack",
        String(depth + progress)
      );
    }
  }
  function writeVariables(el, { dim, progress, expand }) {
    el.style.setProperty("--drawer-progress", String(progress));
    el.style.setProperty("--drawer-dim", String(dim));
    el.style.setProperty("--drawer-expand", String(expand));
  }
  function seekOutlet(outlet, amount, rest) {
    let animation = seeking.get(outlet.el);
    if (!animation) {
      animation = outlet.el.animate(asKeyframes(outlet.keyframes), {
        duration: 1e3,
        fill: "both"
      });
      animation.pause();
      seeking.set(outlet.el, animation);
    }
    animation.currentTime = amount * 1e3;
    if (!rest) {
      return;
    }
    animation.commitStyles?.();
    animation.cancel();
    seeking.delete(outlet.el);
  }
  function play(motion) {
    if (destroyed) {
      return;
    }
    stopRunning();
    stopSeeking();
    if (!supportsLinear()) {
      return apply(
        motion.type === "settle" ? motion.extentAt(motion.duration) : 0,
        { rest: true }
      );
    }
    const samples = sampleCurves(motion);
    holdDim();
    const timing = motion.type === "settle" ? { duration: Math.max(1, motion.duration), fill: "both" } : { timeline: motion.timeline, fill: "both" };
    const animate = (el, keyframes, curve, pseudo) => {
      const animation = el.animate(keyframes, {
        ...timing,
        ...pseudo,
        easing: easing(curve)
      });
      if (motion.type === "settle") {
        animation.startTime = motion.startTime;
      }
      running.push(animation);
    };
    const backdrop = targets.backdrop();
    if (backdrop) {
      animate(backdrop, { opacity: [0, 1] }, samples.dim);
    }
    if (targets.dimmed) {
      animate(targets.dimmed, { opacity: [0, 1] }, samples.dim, backdropDim);
    }
    animateVariables(targets.sheet, samples, animate);
    targets.ancestors().forEach(
      (el, depth) => animate(el, { "--drawer-stack": [depth, depth + 1] }, samples.progress)
    );
    for (const outlet of targets.outlets()) {
      animateVariables(outlet.el, samples, animate);
      if (outlet.keyframes) {
        animate(outlet.el, asKeyframes(outlet.keyframes), samples.expand);
      }
    }
    if (motion.type !== "settle") {
      return;
    }
    const end = motion.extentAt(motion.duration);
    writeRest(end);
    const batch = running;
    if (batch[0]) {
      batch[0].onfinish = () => running === batch && stopRunning();
    }
  }
  function animateVariables(el, samples, animate) {
    animate(el, { "--drawer-progress": [0, 1] }, samples.progress);
    animate(el, { "--drawer-dim": [0, 1] }, samples.dim);
    animate(el, { "--drawer-expand": [0, 1] }, samples.expand);
  }
  function writeRest(extent) {
    const end = compute(extent, { dim: 0, progress: 0, expand: 0 });
    writeDim(end.dim);
    writeVariables(targets.sheet, end);
    writeStack(end.progress);
    for (const outlet of targets.outlets()) {
      writeVariables(outlet.el, end);
      if (!outlet.keyframes) {
        continue;
      }
      for (const [property, frames] of Object.entries(outlet.keyframes)) {
        const value = frames[end.expand >= 0.5 ? frames.length - 1 : 0];
        outlet.el.style.setProperty(cssName(property), String(value));
      }
    }
    targets.themeColor?.(end.dim);
  }
  function sampleCurves(motion) {
    const curves = {
      dim: [],
      progress: [],
      expand: []
    };
    const point = { dim: 0, progress: 0, expand: 0 };
    const count = motion.type === "settle" ? Math.max(2, Math.ceil(motion.duration / sampleStep) + 1) : 61;
    for (let index = 0; index < count; index++) {
      const at = index / (count - 1);
      const extent = motion.type === "settle" ? motion.extentAt(Math.min(motion.duration, index * sampleStep)) : motion.extentAt(at);
      compute(extent, point);
      curves.dim.push(point.dim);
      curves.progress.push(point.progress);
      curves.expand.push(point.expand);
    }
    return curves;
  }
  function sync(startTime) {
    for (const animation of running) {
      animation.startTime = startTime;
    }
  }
  function stopRunning() {
    if (!running.length) {
      return;
    }
    for (const animation of running) {
      animation.cancel();
    }
    running = [];
  }
  function stopSeeking() {
    for (const animation of seeking.values()) {
      animation.cancel();
    }
    seeking.clear();
  }
  function destroy() {
    destroyed = true;
    stopRunning();
    stopSeeking();
    targets.backdrop()?.style.removeProperty("opacity");
    dimHold?.cancel();
    for (const name of variables.slice(0, 3)) {
      targets.sheet.style.removeProperty(name);
    }
    for (const outlet of targets.outlets()) {
      for (const name of variables.slice(0, 3)) {
        outlet.el.style.removeProperty(name);
      }
      for (const property of Object.keys(outlet.keyframes ?? {})) {
        outlet.el.style.removeProperty(cssName(property));
      }
    }
  }
  return {
    configure,
    compute,
    apply,
    play,
    sync,
    follow: play,
    stop: stopRunning,
    destroy
  };
}
var backdropDim = { pseudoElement: "::backdrop" };
function easing(curve) {
  return `linear(${curve.map(round).join(", ")})`;
}
var asKeyframes = (keyframes) => keyframes;
function cssName(property) {
  return property.startsWith("--") ? property : property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
export {
  createSheetEffects,
  prepareVariables,
  supportsLinear
};
