// src/foundation/platform/sides.ts
function physicalSide(side, rtl = false) {
  if (side === "start") {
    return rtl ? "right" : "left";
  }
  if (side === "end") {
    return rtl ? "left" : "right";
  }
  return side;
}
var opposite = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
export {
  opposite,
  physicalSide
};
