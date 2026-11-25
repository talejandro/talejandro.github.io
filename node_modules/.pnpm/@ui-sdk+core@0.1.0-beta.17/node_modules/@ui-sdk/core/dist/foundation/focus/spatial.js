// src/foundation/focus/spatial.ts
var arrows = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0]
};
function nearestInDirection(from, candidates, direction) {
  const [dx, dy] = direction;
  const cx = (from.left + from.right) / 2;
  const cy = (from.top + from.bottom) / 2;
  let best;
  for (const { key, rect } of candidates) {
    const x = (rect.left + rect.right) / 2 - cx;
    const y = (rect.top + rect.bottom) / 2 - cy;
    const ahead = x * dx + y * dy;
    if (ahead <= 0) {
      continue;
    }
    const aside = Math.abs(dx ? y : x);
    const cone = aside <= ahead;
    const score = ahead + aside * 2;
    if (!best || cone && !best.cone || cone === best.cone && score < best.score) {
      best = { key, score, cone };
    }
  }
  return best?.key;
}
function spatialMove(options = {}) {
  const rectOf = options.rect ?? ((el) => el.getBoundingClientRect());
  return (event, { from, items }) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return void 0;
    }
    if (event.key === "Home") {
      return items[0]?.key;
    }
    if (event.key === "End") {
      return items[items.length - 1]?.key;
    }
    const direction = arrows[event.key];
    if (!direction) {
      return void 0;
    }
    const candidates = items.filter((item) => item.key !== from.key).map((item) => ({ key: item.key, rect: rectOf(item.el, item.key) }));
    return nearestInDirection(rectOf(from.el, from.key), candidates, direction);
  };
}
export {
  nearestInDirection,
  spatialMove
};
