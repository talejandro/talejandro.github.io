// src/components/carousel/carousel-indicators.ts
import { dev } from "#dev";
import { checkName } from "#name-check";
import { opensElsewhere } from "../../foundation/platform/button.js";
import { createRovingFocus } from "../../foundation/focus/roving-focus.js";
import { moveIndex, radioStep } from "../../foundation/focus/collection.js";
import { elements } from "../../foundation/kernel/elements.js";
function carouselIndicators(context, go) {
  const { id, store, element } = context;
  function indicatorPage(state, key, props) {
    if (props?.page !== void 0) {
      return props.page;
    }
    return state.indicators.indexOf(key) + 1;
  }
  const roving = createRovingFocus(
    context,
    {
      slot: "indicator",
      key: "stop",
      remember: false,
      focusable: (item) => !element("indicator", item.key)?.hidden,
      preferred: (item) => indicatorPage(store.get(), item.key, item.props) === store.get().page,
      claims(state, item) {
        const page = indicatorPage(state, item.key, item.props);
        return page === 0 || page === state.page;
      },
      move(event, { from, items, rtl }) {
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          return;
        }
        const step = event.key === "Home" ? "first" : event.key === "End" ? "last" : radioStep(event.key, rtl);
        if (step !== void 0) {
          return items[moveIndex(items.indexOf(from), step, items.length, true)].key;
        }
      },
      // Indicators without a `page` take theirs from their order.
      onItemsChange() {
        store.set({
          indicators: elements(context, "indicator").map((entry) => entry.key)
        });
        roving.check();
      }
    }
  );
  return {
    indicatorPage,
    roving,
    bindIndicator(el, part) {
      if (dev) {
        queueMicrotask(
          () => el.isConnected && checkName(el, "CarouselIndicator", { component: "carousel", id })
        );
      }
      return roving.bind(el, part);
    },
    pressIndicator(el, key, props, event) {
      if (opensElsewhere(event, el)) {
        return;
      }
      const page = indicatorPage(store.get(), key, props);
      if (el && document.activeElement !== el) {
        el.focus({ preventScroll: true });
      }
      if (page > 0) {
        go(page, "item-press", event);
      }
    },
    onIndicatorKeyDown(event) {
      const moved = roving.keydown(event, event.target);
      if (!moved || moved.key === moved.from) {
        return;
      }
      const next = element("indicator", moved.key);
      if (next?.matches("a[href]")) {
        return next.click();
      }
      const page = indicatorPage(
        store.get(),
        moved.key,
        context.props("indicator", moved.key)
      );
      if (page > 0) {
        go(page, "list-navigation", event);
      }
    }
  };
}
export {
  carouselIndicators
};
