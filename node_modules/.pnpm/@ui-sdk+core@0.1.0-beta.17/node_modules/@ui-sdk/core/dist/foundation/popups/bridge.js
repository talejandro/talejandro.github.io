// src/foundation/popups/bridge.ts
function bridgeBetween(trigger, popup, padding = 4) {
  const corners = [trigger, popup].flatMap((box) => [
    { x: box.left - padding, y: box.top - padding },
    { x: box.right + padding, y: box.top - padding },
    { x: box.right + padding, y: box.bottom + padding },
    { x: box.left - padding, y: box.bottom + padding }
  ]);
  const hull = convexHull(corners);
  return (x, y) => {
    for (let index = 0; index < hull.length; index++) {
      const from = hull[index];
      const to = hull[(index + 1) % hull.length];
      if ((to.x - from.x) * (y - from.y) - (to.y - from.y) * (x - from.x) < 0) {
        return false;
      }
    }
    return true;
  };
}
function cross(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function convexHull(points) {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const half = (list) => {
    const chain = [];
    for (const point of list) {
      while (chain.length >= 2 && cross(chain[chain.length - 2], chain[chain.length - 1], point) <= 0) {
        chain.pop();
      }
      chain.push(point);
    }
    chain.pop();
    return chain;
  };
  return [...half(sorted), ...half(sorted.reverse())];
}
export {
  bridgeBetween
};
