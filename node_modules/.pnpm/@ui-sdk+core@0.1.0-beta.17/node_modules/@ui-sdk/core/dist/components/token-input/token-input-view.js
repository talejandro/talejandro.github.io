// src/components/token-input/token-input-view.ts
import { isToken } from "./token-input-model.js";
var ANCHOR = "\u200B";
var visuallyHidden = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
var HOST = "data-token-id";
var SERVER_INDEX = "data-token-index";
var SENTINEL_ATTRIBUTE = "data-ui-sentinel";
var SENTINEL = /* @__PURE__ */ Symbol("sentinel");
function layout(value) {
  const nodes = [];
  value.forEach((segment, index) => {
    if (isToken(segment)) {
      const last3 = nodes.length - 1;
      if (typeof nodes[last3] === "string") {
        nodes[last3] += ANCHOR;
      } else {
        nodes.push(ANCHOR);
      }
      nodes.push(segment, ANCHOR);
      return;
    }
    const last2 = nodes.length - 1;
    if (index > 0 && typeof nodes[last2] === "string") {
      nodes[last2] += segment;
    } else {
      nodes.push(segment);
    }
  });
  const last = value.at(-1);
  if (isToken(last) || typeof last === "string" && last.endsWith("\n")) {
    nodes.push(SENTINEL);
  }
  return nodes;
}
var isHost = (node) => node?.nodeType === Node.ELEMENT_NODE && node.hasAttribute(HOST);
var isSentinel = (node) => node?.nodeType === Node.ELEMENT_NODE && node.hasAttribute(SENTINEL_ATTRIBUTE);
var realLength = (text) => text.replaceAll(ANCHOR, "").length;
function createTokenView(el, {
  describe,
  customContent,
  onHosts
}) {
  const doc = el.ownerDocument;
  const hosts = /* @__PURE__ */ new Map();
  let hostCount = 0;
  function hostFor(token) {
    let entry = hosts.get(token.id);
    if (!entry) {
      const host2 = doc.createElement("span");
      host2.setAttribute(HOST, token.id);
      host2.setAttribute("contenteditable", "false");
      host2.setAttribute("spellcheck", "false");
      host2.setAttribute("data-slot", "token-input-host");
      const content = doc.createElement("span");
      const label = doc.createElement("span");
      label.style.cssText = visuallyHidden;
      label.setAttribute("data-slot", "token-input-token-label");
      host2.append(content, label);
      entry = { host: host2, content, label, labelText: doc.createTextNode(""), token };
      hosts.set(token.id, entry);
    }
    entry.token = token;
    const description = ` ${describe(token)}`;
    if (entry.label.textContent !== description) {
      entry.label.textContent = description;
    }
    showLabel(entry);
    host(entry.host, token);
    return entry.host;
  }
  function showLabel({ content, labelText, token }) {
    if (customContent()) {
      return labelText.remove();
    }
    if (labelText.data !== token.label) {
      labelText.data = token.label;
    }
    if (labelText.parentNode !== content) {
      content.prepend(labelText);
    }
  }
  function host(element, token) {
    element.setAttribute("data-token-type", token.type);
    for (const status of ["pending", "unresolved"]) {
      if (token.status === status) {
        element.setAttribute(`data-${status}`, "");
      } else {
        element.removeAttribute(`data-${status}`);
      }
    }
  }
  function render(value) {
    const wanted = layout(value);
    const used = /* @__PURE__ */ new Set();
    let cursor = el.firstChild;
    for (const item of wanted) {
      if (item === SENTINEL) {
        if (isSentinel(cursor)) {
          cursor = cursor.nextSibling;
        } else {
          el.insertBefore(doc.createElement("br"), cursor).setAttribute(
            SENTINEL_ATTRIBUTE,
            ""
          );
        }
        continue;
      }
      if (typeof item === "string") {
        if (cursor?.nodeType === Node.TEXT_NODE) {
          if (cursor.data !== item) {
            ;
            cursor.data = item;
          }
          cursor = cursor.nextSibling;
        } else {
          el.insertBefore(doc.createTextNode(item), cursor);
        }
        continue;
      }
      const element = hostFor(item);
      used.add(item.id);
      if (cursor === element) {
        cursor = cursor.nextSibling;
      } else {
        el.insertBefore(element, cursor);
      }
    }
    while (cursor) {
      const next = cursor.nextSibling;
      cursor.remove();
      cursor = next;
    }
    let changed = false;
    for (const [id, entry] of hosts) {
      if (!used.has(id)) {
        entry.host.remove();
        hosts.delete(id);
        changed = true;
      }
    }
    if (changed || used.size !== hostCount) {
      hostCount = used.size;
      onHosts();
    }
  }
  function read(rendered = []) {
    const value = [];
    const walk = (parent, nested) => {
      parent.childNodes.forEach((node, index) => {
        if (node.nodeType === Node.TEXT_NODE) {
          value.push(node.data.replaceAll(ANCHOR, ""));
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        if (isHost(node)) {
          const entry = hosts.get(node.getAttribute(HOST));
          if (entry && entry.host === node && node.isConnected) {
            value.push(entry.token);
          }
          return;
        }
        if (isSentinel(node)) {
          return;
        }
        if (node.matches('[data-slot="token-input-host"]')) {
          const token = rendered[Number(node.getAttribute(SERVER_INDEX))];
          return void (token && value.push(token));
        }
        const name = node.localName;
        if (name === "br") {
          return void value.push("\n");
        }
        const block = name === "div" || name === "p";
        if (block && (index > 0 || nested)) {
          value.push("\n");
        }
        walk(node, nested || block);
      });
    };
    walk(el, false);
    return value;
  }
  function hostOf(node) {
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    const host2 = element?.closest(`[${HOST}]`);
    return host2 && el.contains(host2) ? host2 : null;
  }
  function startOf(node) {
    let total = 0;
    for (let current = node; current && current !== el; current = current.parentNode) {
      for (let sibling = current.previousSibling; sibling; sibling = sibling.previousSibling) {
        total += lengthOf(sibling);
      }
    }
    return total;
  }
  function offsetOf(node, offset, after = false) {
    const host2 = hostOf(node);
    if (host2) {
      return startOf(host2) + (after || host2 === node && offset > 0 ? 1 : 0);
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return startOf(node) + realLength(node.data.slice(0, offset));
    }
    let total = node === el ? 0 : startOf(node);
    for (let index = 0; index < offset && index < node.childNodes.length; index++) {
      total += lengthOf(node.childNodes[index]);
    }
    return total;
  }
  function lengthOf(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return realLength(node.data);
    }
    if (isHost(node)) {
      return 1;
    }
    if (isSentinel(node)) {
      return 0;
    }
    if (node.localName === "br") {
      return 1;
    }
    let total = 0;
    node.childNodes.forEach((child) => total += lengthOf(child));
    return total;
  }
  function pointAt(offset) {
    let remaining = offset;
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const data = child.data;
        const length = realLength(data);
        if (remaining <= length) {
          let index = data.startsWith(ANCHOR) && data.length > 1 ? 1 : 0;
          for (let counted = 0; counted < remaining; index++) {
            if (data[index] !== ANCHOR) {
              counted++;
            }
          }
          return [child, index];
        }
        remaining -= length;
      } else {
        remaining -= lengthOf(child);
      }
    }
    return [el, el.childNodes.length - (isSentinel(el.lastChild) ? 1 : 0)];
  }
  function selection() {
    const selected = doc.getSelection();
    if (!selected || !selected.rangeCount || !el.contains(selected.anchorNode)) {
      return null;
    }
    const range = selected.getRangeAt(0);
    const start = offsetOf(range.startContainer, range.startOffset);
    const end = offsetOf(range.endContainer, range.endOffset, !range.collapsed);
    return { start: Math.min(start, end), end: Math.max(start, end) };
  }
  function select({ start, end }) {
    const selected = doc.getSelection();
    if (!selected) {
      return;
    }
    const [startNode, startOffset] = pointAt(start);
    const [endNode, endOffset] = start === end ? [startNode, startOffset] : pointAt(end);
    const current = selected.rangeCount ? selected.getRangeAt(0) : null;
    if (current && current.startContainer === startNode && current.startOffset === startOffset && current.endContainer === endNode && current.endOffset === endOffset) {
      return;
    }
    selected.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
  }
  function rectAt(offset) {
    if (!el.isConnected) {
      return null;
    }
    const [node, index] = pointAt(offset);
    const range = doc.createRange();
    range.setStart(node, index);
    range.collapse(true);
    const rect = range.getBoundingClientRect();
    if (rect.height) {
      return { x: rect.x, y: rect.y, width: 0, height: rect.height };
    }
    if (node.nodeType === Node.TEXT_NODE && index > 0) {
      range.setStart(node, index - 1);
      range.setEnd(node, index);
      const before = range.getBoundingClientRect();
      if (before.height) {
        return { x: before.right, y: before.y, width: 0, height: before.height };
      }
    }
    const previous = node.nodeType === Node.TEXT_NODE ? node.previousSibling : node.childNodes[index - 1];
    if (isHost(previous)) {
      const box2 = previous.getBoundingClientRect();
      return { x: box2.right, y: box2.y, width: 0, height: box2.height };
    }
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      x: box.x + parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth),
      y: box.y + parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth),
      width: 0,
      height: parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2
    };
  }
  function typedBeforeBind(value) {
    const server = doc.createElement("template");
    server.innerHTML = renderStaticHtml(value, describe);
    if (!el.firstChild || el.querySelector(`[${HOST}]`) || el.innerHTML === server.innerHTML) {
      return;
    }
    return read(value.filter(isToken));
  }
  return {
    render,
    read: () => read(),
    typedBeforeBind,
    selection,
    select,
    rectAt,
    offsetAt: (node, offset) => offsetOf(node, offset),
    // Whether a DOM point is inside a token's host.
    inHost: (node) => !!hostOf(node),
    hosts: () => [...hosts].map(([id, { token, content }]) => ({
      id,
      token,
      host: content
    })),
    hostElement: (id) => hosts.get(id)?.host,
    showLabels: () => hosts.forEach(showLabel),
    destroy() {
      hosts.clear();
      onHosts();
    }
  };
}
function renderStaticHtml(value, describe) {
  const escape = (text) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
  let tokens = 0;
  return layout(value).map((item) => {
    if (item === SENTINEL) {
      return `<br ${SENTINEL_ATTRIBUTE}="">`;
    }
    if (typeof item === "string") {
      return escape(item);
    }
    return `<span contenteditable="false" spellcheck="false" data-slot="token-input-host" ${SERVER_INDEX}="${tokens++}" data-token-type="${escape(item.type)}"><span>${escape(item.label)}</span><span data-slot="token-input-token-label" style="${visuallyHidden}"> ${escape(describe(item))}</span></span>`;
  }).join("");
}
export {
  createTokenView,
  renderStaticHtml
};
