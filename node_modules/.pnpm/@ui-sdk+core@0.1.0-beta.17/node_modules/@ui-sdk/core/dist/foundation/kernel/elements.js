// src/foundation/kernel/elements.ts
import { inDocumentOrder } from "./order.js";
function elements(context, slot) {
  const bound = [...context.parts()].filter(
    (part) => part.slot === slot && !!part.el?.isConnected
  );
  return inDocumentOrder(bound).map(({ el, key, props }) => ({
    el,
    key,
    props
  }));
}
export {
  elements
};
