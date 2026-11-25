// src/components/combobox/combobox-chips.ts
function chipsThatFit({
  available,
  gap,
  widths,
  overflow,
  reserve
}) {
  const fit = (count, used2, extra) => (count ? used2 + gap : 0) + extra + reserve <= available;
  const unknown = widths.indexOf(void 0);
  const measured = unknown === -1 ? widths.length : unknown;
  let used = 0;
  let fits = 0;
  for (let index = 0; index < measured; index++) {
    used += (index ? gap : 0) + widths[index];
    if (fits === index && fit(index + 1, used, overflow + gap)) {
      fits = index + 1;
    }
  }
  if (unknown === -1) {
    return fit(widths.length, used, 0) ? widths.length : fits;
  }
  return fits === measured ? measured + 1 : fits;
}
function bindChipsOverflow(container, {
  chips,
  overflow,
  input,
  report,
  subscribe
}) {
  if (typeof ResizeObserver === "undefined") {
    return () => {
    };
  }
  const widths = /* @__PURE__ */ new WeakMap();
  const observed = /* @__PURE__ */ new Set();
  let available = 0;
  let frame = 0;
  const schedule = () => {
    if (!frame) {
      frame = requestAnimationFrame(decide);
    }
  };
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.borderBoxSize?.[0];
      if (entry.target === container) {
        available = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        continue;
      }
      const width = box?.inlineSize ?? entry.contentRect.width;
      if (width > 0) {
        widths.set(entry.target, width);
      }
    }
    schedule();
  });
  function observe() {
    const current = /* @__PURE__ */ new Set([container, overflow, ...chips()]);
    for (const el of current) {
      if (!observed.has(el)) {
        observer.observe(el, { box: "border-box" });
      }
    }
    for (const el of observed) {
      if (!current.has(el)) {
        observer.unobserve(el);
      }
    }
    observed.clear();
    for (const el of current) {
      observed.add(el);
    }
  }
  function decide() {
    frame = 0;
    const list = chips();
    const style = getComputedStyle(container);
    const field = input();
    const visible = chipsThatFit({
      available,
      gap: parseFloat(style.columnGap) || 0,
      widths: list.map((el) => widths.get(el)),
      overflow: widths.get(overflow) ?? 0,
      reserve: field ? parseFloat(getComputedStyle(field).minWidth) || 0 : 0
    });
    report(visible >= list.length ? null : visible);
  }
  observe();
  let seen = chips();
  const unsubscribe = subscribe(() => {
    const next = chips();
    if (next.length === seen.length && next.every((el, index) => el === seen[index])) {
      return;
    }
    seen = next;
    observe();
    schedule();
  });
  return () => {
    unsubscribe();
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
}
export {
  bindChipsOverflow,
  chipsThatFit
};
