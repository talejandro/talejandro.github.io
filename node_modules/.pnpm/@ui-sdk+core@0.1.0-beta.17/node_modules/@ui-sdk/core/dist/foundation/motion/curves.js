// src/foundation/motion/curves.ts
var clamp01 = (value) => Math.max(0, Math.min(1, value));
function dimAmount(extent, snapExtents, largestUndimmedIndex = -1) {
  const lower = largestUndimmedIndex < 0 ? 0 : snapExtents[largestUndimmedIndex];
  const upper = largestUndimmedIndex < 0 ? snapExtents[0] : snapExtents[largestUndimmedIndex + 1];
  if (upper === void 0 || upper <= lower) {
    return extent > lower ? 1 : 0;
  }
  return clamp01((extent - lower) / (upper - lower));
}
function expandAmount(extent, snapExtents) {
  const largest = snapExtents[snapExtents.length - 1];
  const lower = snapExtents.length > 1 ? snapExtents[snapExtents.length - 2] : 0;
  if (largest <= lower) {
    return extent >= largest ? 1 : 0;
  }
  return clamp01((extent - lower) / (largest - lower));
}
function progressAmount(extent, snapExtents) {
  const largest = snapExtents[snapExtents.length - 1];
  return largest > 0 ? clamp01(extent / largest) : 0;
}
export {
  dimAmount,
  expandAmount,
  progressAmount
};
