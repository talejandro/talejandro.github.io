// src/foundation/motion/sector.ts
function sectorOf(dx, dy, count, options = {}) {
  if (count < 1 || Math.hypot(dx, dy) < (options.deadZone ?? 18)) {
    return -1;
  }
  const turn = (Math.atan2(dx, -dy) / (2 * Math.PI) - (options.start ?? 0) + 2) % 1;
  return Math.round(turn * count) % count;
}
export {
  sectorOf
};
