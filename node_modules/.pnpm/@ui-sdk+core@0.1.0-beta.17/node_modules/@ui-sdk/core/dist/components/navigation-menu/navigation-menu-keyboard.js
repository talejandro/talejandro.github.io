// src/components/navigation-menu/navigation-menu-keyboard.ts
function listKey(key, orientation, rtl) {
  const inlineEnd = rtl ? "ArrowLeft" : "ArrowRight";
  const inlineStart = rtl ? "ArrowRight" : "ArrowLeft";
  const [next, previous, enter] = orientation === "vertical" ? ["ArrowDown", "ArrowUp", inlineEnd] : [inlineEnd, inlineStart, "ArrowDown"];
  if (key === next) {
    return 1;
  }
  if (key === previous) {
    return -1;
  }
  if (key === "Home") {
    return "first";
  }
  if (key === "End") {
    return "last";
  }
  if (key === enter) {
    return "enter";
  }
}
function panelKey(key, rtl) {
  if (key === "ArrowDown" || key === (rtl ? "ArrowLeft" : "ArrowRight")) {
    return 1;
  }
  if (key === "ArrowUp" || key === (rtl ? "ArrowRight" : "ArrowLeft")) {
    return -1;
  }
  if (key === "Home") {
    return "first";
  }
  if (key === "End") {
    return "last";
  }
}
function isModified(event) {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}
function stepIndex(index, step, count) {
  if (step === "first") {
    return 0;
  }
  if (step === "last") {
    return count - 1;
  }
  return Math.max(0, Math.min(count - 1, index + step));
}
function motionOf(key, state) {
  if (state.forward === null) {
    return;
  }
  if (key === state.value) {
    return state.forward ? "from-end" : "from-start";
  }
  if (key === state.previous) {
    return state.forward ? "to-start" : "to-end";
  }
}
function opensElsewhere(event) {
  if (!("button" in event)) {
    return false;
  }
  const press = event;
  return press.metaKey || press.ctrlKey || press.shiftKey || press.altKey || press.button === 1;
}
export {
  isModified,
  listKey,
  motionOf,
  opensElsewhere,
  panelKey,
  stepIndex
};
