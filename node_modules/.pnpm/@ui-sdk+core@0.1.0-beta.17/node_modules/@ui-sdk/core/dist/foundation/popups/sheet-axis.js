// src/foundation/popups/sheet-axis.ts
import { isRTL } from "../platform/env.js";
import { physicalSide } from "../platform/sides.js";
function resolveSide(side, el) {
  return physicalSide(
    side,
    side === "start" || side === "end" ? isRTL(el) : false
  );
}
var isVertical = (side) => side === "bottom" || side === "top";
var towardEdge = (side) => side === "bottom" || side === "right" ? 1 : -1;
function axisPoint(side, clientX, clientY, into) {
  const vertical = isVertical(side);
  into.y = (vertical ? clientY : clientX) * towardEdge(side);
  into.x = vertical ? clientX : clientY;
  return into;
}
function translateValue(side, offset) {
  const value = `${Math.round(offset * towardEdge(side) * 100) / 100}px`;
  return isVertical(side) ? `0 ${value}` : `${value} 0`;
}
function sizeAlong(el, side) {
  return isVertical(side) ? el.offsetHeight : el.offsetWidth;
}
function scrollContext(target, sheet, side) {
  const area = scrollAreaAt(target, sheet, side);
  if (!area) {
    return null;
  }
  const { start, end } = scrollEdges(area, side);
  return { atStart: start, atEnd: end, area };
}
function scrollAreaAt(target, sheet, side) {
  const view = sheet.ownerDocument.defaultView;
  if (!view || !(target instanceof Element) || !sheet.contains(target)) {
    return null;
  }
  const vertical = isVertical(side);
  for (let node = target; node && node !== sheet.parentElement; node = node.parentElement) {
    const scrollable = vertical ? node.scrollHeight > node.clientHeight + 1 : node.scrollWidth > node.clientWidth + 1;
    if (!scrollable || !(node instanceof HTMLElement)) {
      continue;
    }
    const overflow = vertical ? view.getComputedStyle(node).overflowY : view.getComputedStyle(node).overflowX;
    if (/auto|scroll/.test(overflow)) {
      return node;
    }
  }
  return null;
}
function forwardScroll(area, side) {
  if (isVertical(side)) {
    const max2 = area.scrollHeight - area.clientHeight;
    return {
      position: side === "bottom" ? area.scrollTop : max2 - area.scrollTop,
      max: max2
    };
  }
  const max = area.scrollWidth - area.clientWidth;
  const left = Math.abs(area.scrollLeft);
  const fromLeft = isRTL(area) ? max - left : left;
  return { position: side === "right" ? fromLeft : max - fromLeft, max };
}
function scrollEdges(area, side) {
  const { position, max } = forwardScroll(area, side);
  return { start: position <= 0.5, end: position >= max - 1 };
}
function scrollForward(area, side, delta) {
  if (isVertical(side)) {
    area.scrollTop += side === "bottom" ? delta : -delta;
  } else {
    const physical = side === "right" ? delta : -delta;
    area.scrollLeft += isRTL(area) ? -physical : physical;
  }
}
export {
  axisPoint,
  isVertical,
  resolveSide,
  scrollAreaAt,
  scrollContext,
  scrollForward,
  sizeAlong,
  translateValue
};
