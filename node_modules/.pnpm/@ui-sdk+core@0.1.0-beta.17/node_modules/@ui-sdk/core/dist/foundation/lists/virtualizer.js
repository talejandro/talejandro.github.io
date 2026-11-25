// src/foundation/lists/virtualizer.ts
var loading;
var load = () => loading ??= import("./findable-rows.js");
function createVirtualizer(options) {
  const keyOf = (index) => options.key?.(index) ?? String(index);
  const sizes = /* @__PURE__ */ new Map();
  const listeners = /* @__PURE__ */ new Set();
  let scroller;
  let offset = 0;
  let viewport = 0;
  let starts = [];
  let dirty = true;
  let snapshot = [];
  let total = 0;
  let endedAt = -1;
  const measured = /* @__PURE__ */ new Map();
  let resizes;
  const elements = /* @__PURE__ */ new Map();
  const slots = /* @__PURE__ */ new Map();
  let tokens = 0;
  let foundIndex = -1;
  let find;
  let windowFrom = -1;
  let windowTo = -1;
  const margin = () => options.scrollMargin ?? 0;
  const sizeOf = (index) => sizes.get(keyOf(index)) ?? options.estimate(index);
  function layout() {
    if (!dirty && starts.length === options.count()) {
      return;
    }
    dirty = false;
    const count = options.count();
    starts = new Array(count);
    let at = 0;
    for (let i = 0; i < count; i++) {
      starts[i] = at;
      at += sizeOf(i);
    }
    total = at;
  }
  function rowAt(at) {
    let low = 0;
    let high = starts.length - 1;
    while (low < high) {
      const middle = low + high >> 1;
      if (starts[middle] + sizeOf(middle) <= at) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    return Math.max(0, low);
  }
  function compute() {
    layout();
    const count = starts.length;
    const overscan = options.overscan ?? 4;
    const indexes = /* @__PURE__ */ new Set();
    if (count) {
      const from = rowAt(Math.max(0, offset - margin()));
      let to = from;
      const end = offset - margin() + viewport;
      while (to < count - 1 && starts[to] + sizeOf(to) < end) {
        to++;
      }
      windowFrom = Math.max(0, from - overscan);
      windowTo = Math.min(count - 1, to + overscan);
      for (let i = windowFrom; i <= windowTo; i++) {
        indexes.add(i);
      }
      for (const index of options.keep?.() ?? []) {
        if (index >= 0 && index < count) {
          indexes.add(index);
        }
      }
      if (options.onEnd && to >= count - 1 - (options.endThreshold ?? 10) && endedAt !== count) {
        endedAt = count;
        queueMicrotask(() => options.onEnd?.());
      }
    }
    const next = [...indexes].sort((a, b) => a - b).map((index) => ({
      index,
      key: keyOf(index),
      start: starts[index],
      size: sizeOf(index),
      ...index === foundIndex && { found: true }
    }));
    const same = next.length === snapshot.length && next.every(
      (item, i) => item.key === snapshot[i].key && item.start === snapshot[i].start && item.size === snapshot[i].size && item.index === snapshot[i].index && item.found === snapshot[i].found
    );
    if (same) {
      return false;
    }
    snapshot = next;
    return true;
  }
  function update() {
    if (!compute()) {
      return;
    }
    if (foundIndex !== -1 && !snapshot.some((item) => item.index === foundIndex)) {
      foundIndex = -1;
    }
    releaseSlots();
    find?.sync();
    for (const listener of [...listeners]) {
      listener();
    }
  }
  function setFound(index) {
    if (foundIndex === index) {
      return;
    }
    foundIndex = index;
    if (compute()) {
      for (const listener of [...listeners]) {
        listener();
      }
    }
  }
  const piecesOf = (index) => {
    const text = options.findable?.(index) ?? "";
    return typeof text === "string" ? [text] : [...text];
  };
  function adopt(index) {
    if (find) {
      return find.adopt(index);
    }
    const own = slots.get(index);
    if (!own || index >= options.count()) {
      return;
    }
    const plain = piecesOf(index);
    own.forEach((slot, part) => {
      if (slot && slot.el.textContent !== plain[part]) {
        slot.el.textContent = plain[part] ?? "";
      }
    });
  }
  function releaseSlots() {
    if (!slots.size) {
      return;
    }
    const shown = new Set(snapshot.map((item) => item.index));
    for (const [index, own] of slots) {
      if (shown.has(index)) {
        continue;
      }
      slots.delete(index);
      own.forEach((slot, part) => slot && find?.restore(index, part, slot.el));
    }
  }
  const host = {
    count: () => options.count(),
    pieces: piecesOf,
    horizontal: () => !!options.horizontal,
    scroller: () => scroller,
    items: () => snapshot,
    range: () => [windowFrom, windowTo],
    elements,
    slots,
    place(index) {
      layout();
      return { start: starts[index] + margin() - offset, size: sizeOf(index) };
    },
    reveal(index) {
      foundIndex = index;
      api.scrollToIndex(index, { align: "center", behavior: "instant" });
      if (!snapshot.some((item) => item.found)) {
        foundIndex = -1;
        setFound(index);
      }
    }
  };
  function record(el) {
    const index = measured.get(el);
    if (index === void 0) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const size = options.horizontal ? rect.width : rect.height;
    const key = keyOf(index);
    if (!size || sizes.get(key) === size) {
      return;
    }
    layout();
    const above = !!scroller && (starts[index] ?? 0) + margin() < offset;
    const change = size - sizeOf(index);
    sizes.set(key, size);
    dirty = true;
    if (above && scroller) {
      if (options.horizontal) {
        scroller.scrollLeft += change;
      } else {
        scroller.scrollTop += change;
      }
      read();
    }
    update();
  }
  function read() {
    if (!scroller) {
      return;
    }
    offset = options.horizontal ? scroller.scrollLeft : scroller.scrollTop;
    viewport = options.horizontal ? scroller.clientWidth : scroller.clientHeight;
  }
  const api = {
    /** The rows to render now, in order. Same array until something changes. */
    items() {
      compute();
      return snapshot;
    },
    /** The height, or width when horizontal, of every row together, for the box the rows sit in. */
    size() {
      layout();
      return total;
    },
    /** Calls `listener` whenever `items()` changes, until the returned function runs. */
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    /**
     * Reads the scroller on every scroll and resize, until the returned
     * function runs. With `findable`, also adds the layers that keep rows
     * that aren't rendered findable.
     */
    connect(el, connectOptions = {}) {
      scroller = el;
      let connected = true;
      if (connectOptions.findable && options.findable) {
        void load().then(({ attachFindable }) => {
          if (!connected || find) {
            return;
          }
          find = attachFindable(host, el);
          for (const index of slots.keys()) {
            adopt(index);
          }
        });
      }
      const done = () => {
        if (foundIndex === -1) {
          return;
        }
        find?.release();
        setFound(-1);
      };
      el.addEventListener("pointerdown", done);
      el.addEventListener("keydown", done);
      const onScroll = () => {
        read();
        update();
      };
      el.addEventListener("scroll", onScroll, { passive: true });
      const view = el.ownerDocument.defaultView;
      const box = view?.ResizeObserver ? new view.ResizeObserver(onScroll) : void 0;
      box?.observe(el);
      onScroll();
      return () => {
        el.removeEventListener("scroll", onScroll);
        el.removeEventListener("pointerdown", done);
        el.removeEventListener("keydown", done);
        box?.disconnect();
        connected = false;
        find?.detach();
        find = void 0;
        if (scroller === el) {
          scroller = void 0;
        }
      };
    },
    /**
     * Measures a rendered row, now and whenever it resizes, until the returned
     * function runs. Call it from the row's ref. Fixed-size rows can skip it.
     */
    measure(index, el) {
      if (!el) {
        return () => {
        };
      }
      const first = !measured.has(el);
      const before = measured.get(el);
      if (before !== void 0 && before !== index && elements.get(before) === el) {
        elements.delete(before);
      }
      measured.set(el, index);
      elements.set(index, el);
      if (first) {
        const view = el.ownerDocument.defaultView;
        if (!resizes && view?.ResizeObserver) {
          resizes = new view.ResizeObserver((entries) => {
            for (const entry of entries) {
              record(entry.target);
            }
          });
        }
        resizes?.observe(el);
      }
      record(el);
      return () => {
        const shown = measured.get(el);
        measured.delete(el);
        if (shown !== void 0 && elements.get(shown) === el) {
          elements.delete(shown);
        }
        resizes?.unobserve(el);
      };
    },
    /** Scrolls so a row shows, measuring as it goes. */
    scrollToIndex(index, {
      align = "auto",
      behavior
    } = {}) {
      layout();
      if (!scroller || index < 0 || index >= starts.length) {
        return;
      }
      read();
      const start = starts[index] + margin();
      const size = sizeOf(index);
      let to = offset;
      if (align === "start") {
        to = start - margin();
      } else if (align === "end") {
        to = start + size - viewport;
      } else if (align === "center") {
        to = start + size / 2 - (viewport + margin()) / 2;
      } else if (start < offset + margin()) {
        to = start - margin();
      } else if (start + size > offset + viewport) {
        to = start + size - viewport;
      }
      if (to === offset) {
        return;
      }
      scroller.scrollTo({
        [options.horizontal ? "left" : "top"]: Math.max(0, to),
        behavior
      });
      read();
      update();
    },
    /** Reads the list again, like after its rows change without a scroll. Find in page sees the new text. */
    refresh() {
      dirty = true;
      read();
      update();
      if (find) {
        find.refresh();
      } else {
        for (const index of slots.keys()) {
          adopt(index);
        }
      }
    },
    /**
     * Renders a piece of a row's `findable` text into `el`, from the row's
     * ref, until the returned function runs. Render `el` empty: it holds the
     * very text find in page searches, so the browser highlights the match in
     * the row itself. `part` picks the piece when `findable` returns several.
     */
    findableText(index, el, part = 0) {
      if (!el) {
        return () => {
        };
      }
      const own = slots.get(index) ?? [];
      const token = ++tokens;
      own[part] = { el, token };
      slots.set(index, own);
      adopt(index);
      return () => {
        queueMicrotask(() => {
          const list = slots.get(index);
          if (list?.[part]?.token !== token) {
            return;
          }
          list[part] = void 0;
          if (!list.some(Boolean)) {
            slots.delete(index);
          }
          find?.restore(index, part, el);
        });
      };
    },
    /** Forgets every measured size, like after a change that resizes every row. */
    reset() {
      sizes.clear();
      api.refresh();
    }
  };
  return api;
}
export {
  createVirtualizer
};
