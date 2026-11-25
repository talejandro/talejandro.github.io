// src/foundation/motion/snap-points.ts
function snapPointId(point) {
  return String(point);
}
function snapPointExtent(point, context) {
  if (typeof point === "number") {
    return point <= 1 ? point * context.container : point;
  }
  if (point === "content") {
    return context.content;
  }
  const amount = parseFloat(point);
  if (point.endsWith("rem")) {
    return amount * context.rootFontSize;
  }
  if (point.endsWith("%")) {
    return amount / 100 * context.container;
  }
  if (point.endsWith("px")) {
    return amount;
  }
  return NaN;
}
function resolveSnapPoints(points, context) {
  const measured = points.map((value, index) => ({
    value,
    index,
    extent: Math.min(snapPointExtent(value, context), context.content)
  })).filter((point) => point.extent > 0).sort((a, b) => a.extent - b.extent || a.index - b.index);
  const resolved = [];
  for (const point of measured) {
    const id = snapPointId(point.value);
    const previous = resolved[resolved.length - 1];
    if (previous && point.extent - previous.extent < 1) {
      previous.ids.push(id);
      if (point.index > previous.index) {
        Object.assign(previous, { id, value: point.value, index: point.index });
      }
      previous.extent = Math.max(previous.extent, point.extent);
      continue;
    }
    resolved.push({
      id,
      value: point.value,
      extent: Math.round(point.extent * 100) / 100,
      ids: [id],
      index: point.index
    });
  }
  return resolved.map(({ index, ...point }) => point);
}
function findSnapIndex(resolved, point) {
  if (point === null || point === void 0) {
    return -1;
  }
  const id = String(point);
  return resolved.findIndex((entry) => entry.ids.includes(id));
}
function isAtOrBelow(resolved, point, limit) {
  const below = findSnapIndex(resolved, limit);
  const index = findSnapIndex(resolved, point);
  return below >= 0 && index >= 0 && index <= below;
}
export {
  findSnapIndex,
  isAtOrBelow,
  resolveSnapPoints
};
