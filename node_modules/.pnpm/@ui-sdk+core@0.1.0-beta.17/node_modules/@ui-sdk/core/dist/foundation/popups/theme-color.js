// src/foundation/popups/theme-color.ts
function channels(color) {
  const match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(color);
  return match ? [match[1], match[2], match[3]].map(Number) : null;
}
function dimThemeColor(doc, alpha) {
  const metas = Array.from(
    doc.querySelectorAll('meta[name="theme-color"]')
  );
  const originals = metas.map((meta) => meta.content);
  const bases = originals.map((color) => channels(resolveColor(doc, color)));
  let written = -1;
  function write(dim) {
    const shade = Math.round(dim * alpha * 100) / 100;
    if (shade === written) {
      return;
    }
    written = shade;
    metas.forEach((meta, index) => {
      const base = bases[index];
      if (!base) {
        return;
      }
      meta.content = shade ? `rgb(${base.map((channel) => Math.round(channel * (1 - shade))).join(" ")})` : originals[index];
    });
  }
  function restore() {
    metas.forEach((meta, index) => meta.content = originals[index]);
    written = -1;
  }
  return { write, restore };
}
function resolveColor(doc, color) {
  const probe = doc.createElement("span");
  probe.style.color = color;
  probe.style.display = "none";
  doc.body.append(probe);
  const resolved = doc.defaultView?.getComputedStyle(probe).color ?? color;
  probe.remove();
  return resolved;
}
export {
  dimThemeColor
};
