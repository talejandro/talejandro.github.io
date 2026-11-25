// src/page/observe/observe.ts
import { elementsOf, listen } from "./registry.js";
import { withSource } from "../../foundation/kernel/details.js";
function observe(listener, options = {}) {
  const { within, live } = options;
  if (!within) {
    return listen((change) => listener(change), live);
  }
  return listen((change, parts) => {
    const root = typeof within === "function" ? within() : within;
    if (root && parts.some((part) => root.contains(part.el))) {
      listener(change);
    }
  }, live);
}
function elementOf(ref) {
  const elements = elementsOf(ref);
  return elements.find(
    (el) => !elements.some((other) => other !== el && other.contains(el))
  ) ?? elements[0];
}
export {
  elementOf,
  observe,
  withSource
};
