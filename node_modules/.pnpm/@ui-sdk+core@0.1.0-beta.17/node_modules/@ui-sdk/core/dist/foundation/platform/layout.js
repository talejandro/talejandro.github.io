// src/foundation/platform/layout.ts
var isTransformed = (style) => style.transform !== "none" || style.translate !== "none" || style.scale !== "none" || style.rotate !== "none";
function movesRects(node, parent) {
  for (let el = node; el && el !== parent; ) {
    const scrolled = el !== node && (el.scrollLeft || el.scrollTop);
    if (scrolled || isTransformed(getComputedStyle(el))) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}
function offsetIn(node, parent) {
  const offset = {
    x: node.offsetLeft + parent.clientLeft,
    y: node.offsetTop + parent.clientTop
  };
  if (parent === node.ownerDocument.body || movesRects(node, parent)) {
    return offset;
  }
  const rect = node.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const size = layoutSize(parent);
  const x = (rect.left - parentRect.left) * size.width / parentRect.width + parent.scrollLeft;
  const y = (rect.top - parentRect.top) * size.height / parentRect.height + parent.scrollTop;
  return {
    x: Math.abs(x - offset.x) < 1 ? x : offset.x,
    y: Math.abs(y - offset.y) < 1 ? y : offset.y
  };
}
function layoutOrigin(el) {
  let x = 0;
  let y = 0;
  for (let node = el; node; node = node.offsetParent) {
    const parent = node.offsetParent;
    if (!parent) {
      x += node.offsetLeft;
      y += node.offsetTop;
      continue;
    }
    const offset = offsetIn(node, parent);
    x += offset.x;
    y += offset.y;
  }
  return { x, y };
}
function layoutSize(el) {
  const style = getComputedStyle(el);
  const total = (...names) => names.reduce(
    (sum, name) => sum + (parseFloat(style.getPropertyValue(name)) || 0),
    0
  );
  const contentBox = style.boxSizing !== "border-box";
  const width = parseFloat(style.width) + (contentBox ? total(
    "padding-left",
    "padding-right",
    "border-left-width",
    "border-right-width"
  ) : 0);
  const height = parseFloat(style.height) + (contentBox ? total(
    "padding-top",
    "padding-bottom",
    "border-top-width",
    "border-bottom-width"
  ) : 0);
  return {
    width: Number.isFinite(width) ? width : el.offsetWidth,
    height: Number.isFinite(height) ? height : el.offsetHeight
  };
}
function layoutBox(el, container) {
  const at = layoutOrigin(el);
  const origin = layoutOrigin(container);
  const left = at.x - origin.x - container.clientLeft;
  const top = at.y - origin.y - container.clientTop;
  const { width, height } = layoutSize(el);
  const area = { width: container.scrollWidth, height: container.scrollHeight };
  return {
    left,
    top,
    width,
    height,
    right: area.width - (left + width),
    bottom: area.height - (top + height)
  };
}
export {
  layoutBox,
  layoutOrigin,
  layoutSize
};
