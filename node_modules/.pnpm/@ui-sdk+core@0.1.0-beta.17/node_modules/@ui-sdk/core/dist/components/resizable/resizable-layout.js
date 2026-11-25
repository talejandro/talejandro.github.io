// src/components/resizable/resizable-layout.ts
import { clamp } from "../../foundation/number/steps.js";
var epsilon = 1e-6;
var sameSize = (a, b) => Math.abs(a - b) < epsilon;
function sameLayout(a, b) {
  return a.length === b.length && a.every((size, index) => sameSize(size, b[index]));
}
var sum = (sizes) => sizes.reduce((total, size) => total + size, 0);
var isAbsolute = (size) => typeof size === "string" && /(px|rem)\s*$/.test(size);
function toPercent(size, space, remSize = 16) {
  if (size === void 0) {
    return void 0;
  }
  const value = typeof size === "number" ? size : parseFloat(size);
  if (Number.isNaN(value)) {
    return void 0;
  }
  if (!isAbsolute(size)) {
    return value;
  }
  if (space <= 0) {
    return void 0;
  }
  return (size.trim().endsWith("rem") ? value * remSize : value) / space * 100;
}
var toCSS = (size) => isAbsolute(size) ? String(size).trim() : `${parseFloat(String(size))}%`;
function constraintsOf(sizes, space, remSize) {
  const min = clamp(toPercent(sizes.minSize, space, remSize) ?? 0, 0, 100);
  const max = clamp(toPercent(sizes.maxSize, space, remSize) ?? 100, min, 100);
  const initial = toPercent(sizes.defaultSize, space, remSize);
  return {
    min,
    max,
    collapsible: !!sizes.collapsible,
    collapsed: clamp(
      toPercent(sizes.collapsedSize, space, remSize) ?? 0,
      0,
      min
    ),
    initial: initial === void 0 ? void 0 : clamp(initial, 0, 100)
  };
}
var lowest = (panel) => panel.collapsible ? panel.collapsed : panel.min;
var isCollapsed = (panel, size) => panel.collapsible && size <= panel.collapsed + epsilon && panel.collapsed < panel.min;
function allowed(panel, size) {
  if (size >= panel.min - epsilon && size <= panel.max + epsilon) {
    return true;
  }
  return panel.collapsible && sameSize(size, panel.collapsed);
}
function settle(panel, target, current, threshold = 0.5) {
  if (target >= panel.min - epsilon) {
    return clamp(target, panel.min, panel.max);
  }
  if (!panel.collapsible) {
    return panel.min;
  }
  const span = panel.min - panel.collapsed;
  if (current <= panel.collapsed + epsilon) {
    return target > panel.collapsed + span * (1 - threshold) + epsilon ? panel.min : panel.collapsed;
  }
  return target < panel.collapsed + span * threshold - epsilon ? panel.collapsed : panel.min;
}
function resizeAt(layout, panels, handle, delta, threshold = 0.5, locked = []) {
  if (Math.abs(delta) < epsilon || handle < 0 || handle >= layout.length - 1) {
    return layout;
  }
  const forward = delta > 0;
  const pivot = forward ? handle : handle + 1;
  const shrinking = shrinkable(layout.length, handle, forward, locked);
  const start = layout[pivot];
  const room = panels[pivot].max - start;
  const capacity = sum(
    shrinking.map((index) => Math.max(0, layout[index] - lowest(panels[index])))
  );
  const asked = Math.min(Math.abs(delta), room, capacity);
  const wanted = settle(panels[pivot], start + asked, start, threshold) - start;
  if (wanted <= epsilon) {
    return layout;
  }
  const next = layout.slice();
  let given = 0;
  for (const index of shrinking) {
    const remaining = wanted - given;
    if (remaining <= epsilon) {
      break;
    }
    const size = layout[index];
    const panel = panels[index];
    let settled = Math.min(
      size,
      settle(panel, size - remaining, size, threshold)
    );
    if (given + size - settled > room + epsilon) {
      settled = Math.min(size, Math.max(panel.min, size - remaining));
    }
    next[index] = settled;
    given += size - settled;
  }
  if (given <= epsilon || !allowed(panels[pivot], start + given)) {
    return layout;
  }
  next[pivot] = start + given;
  return next;
}
function shrinkable(count, handle, forward, locked) {
  const indices = [];
  if (forward) {
    for (let index = handle + 1; index < count && (index === handle + 1 || !locked[index - 1]); index++) {
      indices.push(index);
    }
  } else {
    for (let index = handle; index >= 0 && (index === handle || !locked[index]); index--) {
      indices.push(index);
    }
  }
  return indices;
}
var homeDelta = (layout, panels, handle) => lowest(panels[handle]) - layout[handle];
var endDelta = (layout, panels, handle) => panels[handle].max - layout[handle];
function handleBounds(layout, panels, handle, locked = []) {
  return {
    min: resizeAt(
      layout,
      panels,
      handle,
      homeDelta(layout, panels, handle),
      1,
      locked
    )[handle],
    max: resizeAt(
      layout,
      panels,
      handle,
      endDelta(layout, panels, handle),
      1,
      locked
    )[handle]
  };
}
function allHandleBounds(layout, panels, locked = []) {
  const handles = layout.slice(1).map((_, handle) => handle);
  if (!panels.every(
    (panel, index) => !panel.collapsible && allowed(panel, layout[index])
  )) {
    return handles.map((handle) => handleBounds(layout, panels, handle, locked));
  }
  const spare = [];
  for (let index = layout.length - 1; index >= 0; index--) {
    spare[index] = Math.max(0, layout[index] - panels[index].min) + (locked[index] ? 0 : spare[index + 1] ?? 0);
  }
  return handles.map((handle) => {
    const size = layout[handle];
    const shrink = Math.min(
      size - panels[handle].min,
      panels[handle + 1].max - layout[handle + 1]
    );
    const grow = Math.min(panels[handle].max - size, spare[handle + 1]);
    return { min: size - Math.max(0, shrink), max: size + Math.max(0, grow) };
  });
}
function fitLayout(layout, panels) {
  const total = sum(layout);
  const scale = total > epsilon && !sameSize(total, 100) ? 100 / total : 1;
  const next = layout.map(
    (size, index) => settle(panels[index], size * scale, size * scale)
  );
  let left = 100 - sum(next);
  for (let index = 0; index < next.length && Math.abs(left) > epsilon; index++) {
    const panel = panels[index];
    if (isCollapsed(panel, next[index])) {
      continue;
    }
    const change = left > 0 ? Math.min(left, panel.max - next[index]) : Math.max(left, panel.min - next[index]);
    next[index] += change;
    left -= change;
  }
  if (Math.abs(left) > epsilon && next.length) {
    next[next.length - 1] += left;
  }
  return next;
}
function initialLayout(panels) {
  const given = panels.filter((panel) => panel.initial !== void 0);
  const left = Math.max(0, 100 - sum(given.map((panel) => panel.initial)));
  const share = panels.length > given.length ? left / (panels.length - given.length) : 0;
  return fitLayout(
    panels.map((panel) => panel.initial ?? share),
    panels
  );
}
function carryLayout(previous, ids, panels) {
  const kept = new Map(
    previous.ids.map((id, index) => [id, previous.layout[index]])
  );
  if (!ids.some((id) => kept.has(id))) {
    return initialLayout(panels);
  }
  const fresh = ids.map(
    (id, index) => kept.has(id) ? void 0 : panels[index].initial ?? 100 / ids.length
  );
  const keptTotal = sum(ids.map((id) => kept.get(id) ?? 0));
  const room = Math.max(0, 100 - sum(fresh.map((size) => size ?? 0)));
  return fitLayout(
    ids.map(
      (id, index) => fresh[index] ?? (kept.get(id) ?? 0) / (keptTotal || 1) * room
    ),
    panels
  );
}
function resizePanel(layout, panels, index, target, threshold = 0.5, locked = []) {
  const delta = target - layout[index];
  const candidates = [];
  if (index < layout.length - 1 && !locked[index]) {
    candidates.push(resizeAt(layout, panels, index, delta, threshold, locked));
  }
  if (index > 0 && !locked[index - 1]) {
    candidates.push(
      resizeAt(layout, panels, index - 1, -delta, threshold, locked)
    );
  }
  let best = layout;
  for (const candidate of candidates) {
    if (Math.abs(candidate[index] - target) < Math.abs(best[index] - target) - epsilon) {
      best = candidate;
    }
  }
  return best;
}
function toggleTarget(panels, handle) {
  if (panels[handle]?.collapsible) {
    return handle;
  }
  if (panels[handle + 1]?.collapsible) {
    return handle + 1;
  }
  return null;
}
function keyDelta(key, {
  vertical,
  rtl,
  step,
  largeStep,
  shiftKey
}) {
  const size = shiftKey ? largeStep : step;
  const [back, forward] = vertical ? ["ArrowUp", "ArrowDown"] : rtl ? ["ArrowRight", "ArrowLeft"] : ["ArrowLeft", "ArrowRight"];
  if (key === forward) {
    return size;
  }
  if (key === back) {
    return -size;
  }
  return null;
}
export {
  allHandleBounds,
  carryLayout,
  constraintsOf,
  endDelta,
  fitLayout,
  handleBounds,
  homeDelta,
  initialLayout,
  isAbsolute,
  isCollapsed,
  keyDelta,
  resizeAt,
  resizePanel,
  sameLayout,
  sameSize,
  settle,
  toCSS,
  toPercent,
  toggleTarget
};
