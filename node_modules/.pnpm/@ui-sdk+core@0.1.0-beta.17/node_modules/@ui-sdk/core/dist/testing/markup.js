// src/testing/markup.ts
var entities = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'"
};
var decode = (text) => text.replace(
  /&(amp|lt|gt|quot|apos|#39);/g,
  (_, name) => entities[name]
);
var voids = /* @__PURE__ */ new Set([
  "area",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr"
]);
function parseMarkup(markup) {
  const root = { tag: "", attributes: [], children: [] };
  const open = [root];
  const token = /<\/([\w-]+)\s*>|<([\w-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/g;
  for (const [, close, tag, attributes, selfClosing, text] of markup.matchAll(
    token
  )) {
    const parent = open.at(-1);
    if (text !== void 0) {
      if (text.trim()) {
        parent.children.push(decode(text));
      }
      continue;
    }
    if (close) {
      if (open.length > 1 && open.at(-1).tag === close.toLowerCase()) {
        open.pop();
      }
      continue;
    }
    const node = {
      tag: tag.toLowerCase(),
      attributes: [],
      children: []
    };
    for (const [, name, quoted, single, bare] of attributes.matchAll(
      /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
    )) {
      node.attributes.push([name, decode(quoted ?? single ?? bare ?? "")]);
    }
    parent.children.push(node);
    if (!selfClosing && !voids.has(node.tag)) {
      open.push(node);
    }
  }
  return root.children;
}
export {
  parseMarkup
};
