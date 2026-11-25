// src/foundation/motion/handoff.ts
function handoff(input) {
  if (!input.towardMore) {
    return input.scrollAtStart ? "sheet" : "scroll";
  }
  return !input.atLargest && input.expandOnScroll ? "sheet" : "scroll";
}
export {
  handoff
};
