// src/components/carousel/carousel-dom.ts
import { layoutOrigin, layoutSize } from "../../foundation/platform/layout.js";
var px = (value) => parseFloat(value) || 0;
function readCarouselLayout(viewport, slides, axis) {
  const { vertical, rtl } = axis;
  const style = getComputedStyle(viewport);
  const size = vertical ? viewport.clientHeight : viewport.clientWidth;
  const origin = layoutOrigin(viewport);
  return {
    slides: slides.map(({ el, key }) => {
      const at = layoutOrigin(el);
      const box = layoutSize(el);
      const left = at.x - origin.x - viewport.clientLeft;
      const top = at.y - origin.y - viewport.clientTop;
      if (vertical) {
        return { key, box: { start: top, size: box.height } };
      }
      return {
        key,
        box: { start: rtl ? size - left - box.width : left, size: box.width }
      };
    }),
    viewportSize: size,
    maxScroll: Math.max(
      0,
      (vertical ? viewport.scrollHeight : viewport.scrollWidth) - size
    ),
    paddingStart: px(
      vertical ? style.scrollPaddingTop : rtl ? style.scrollPaddingRight : style.scrollPaddingLeft
    ),
    paddingEnd: px(
      vertical ? style.scrollPaddingBottom : rtl ? style.scrollPaddingLeft : style.scrollPaddingRight
    )
  };
}
function writeSlideOrder(slides, first) {
  slides.forEach(({ el }, index) => {
    const order = (index - first + slides.length) % slides.length;
    if (order) {
      el.style.order = String(order);
    } else {
      el.style.removeProperty("order");
    }
  });
}
function clearSlideOrder(slides) {
  for (const { el } of slides) {
    el.style.removeProperty("order");
  }
}
function writeSnapAreas(slides, pages, vertical) {
  const [marginProperty, crossProperty] = vertical ? snapMargins : [snapMargins[1], snapMargins[0]];
  const leaders = new Map(pages.map((page) => [page.leader, page.margin]));
  slides.forEach(({ el }, index) => {
    el.style.removeProperty(crossProperty);
    const margin = leaders.get(index);
    if (margin === void 0) {
      el.style.setProperty("scroll-snap-align", "none");
      el.style.removeProperty(marginProperty);
      return;
    }
    el.style.setProperty("scroll-snap-align", "start");
    el.style.setProperty(marginProperty, `${Math.round(margin * 100) / 100}px`);
  });
}
var snapMargins = [
  "scroll-margin-block-start",
  "scroll-margin-inline-start"
];
function clearSnapAreas(slides, align) {
  for (const { el } of slides) {
    el.style.setProperty("scroll-snap-align", align);
    for (const property of snapMargins) {
      el.style.removeProperty(property);
    }
  }
}
var ownLabels = /* @__PURE__ */ new WeakMap();
function labelSlide(el, key, store) {
  const own = ownLabels.get(el);
  const authored = el.hasAttribute("aria-labelledby") || el.hasAttribute("aria-label") && el.getAttribute("aria-label") !== own;
  if (authored) {
    return () => {
    };
  }
  let labelled;
  const label = () => {
    const { order } = store.get();
    if (order === labelled) {
      return;
    }
    labelled = order;
    const index = order.indexOf(key);
    if (index < 0) {
      return;
    }
    const text = `${index + 1} of ${order.length}`;
    ownLabels.set(el, text);
    if (el.getAttribute("aria-label") !== text) {
      el.setAttribute("aria-label", text);
    }
  };
  label();
  return store.subscribe(label);
}
export {
  clearSlideOrder,
  clearSnapAreas,
  labelSlide,
  readCarouselLayout,
  writeSlideOrder,
  writeSnapAreas
};
