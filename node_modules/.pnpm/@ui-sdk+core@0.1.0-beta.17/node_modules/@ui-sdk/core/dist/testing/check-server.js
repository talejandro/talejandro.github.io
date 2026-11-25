// src/testing/check-server.ts
import { parseMarkup } from "./markup.js";
import { slotProps, tagOf } from "./schema.js";
import { unwatched } from "../foundation/kernel/keep.js";
import { attrs, partState, present } from "../foundation/kernel/part.js";
import { schemaOf } from "../foundation/kernel/primitive.js";
var checked = 0;
var stopped = (error) => error.message?.endsWith("isn't available on a server.");
var escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var cssText = (style) => Object.entries(style).filter(
  ([, value]) => value !== void 0 && value !== null && value !== ""
).map(
  ([property, value]) => `${property.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}: ${value}`
).join("; ");
function toHtml(tag, attributes, children) {
  const { style, ...rest } = attributes;
  if (style && typeof style === "object") {
    rest.style = cssText(style);
  } else if (style !== void 0) {
    rest.style = style;
  }
  const written = Object.entries(rest).filter(([, value]) => value !== void 0 && value !== false).map(
    ([name, value]) => value === true || value === "" ? ` ${name}` : ` ${name}="${escape(String(value))}"`
  ).join("");
  return `<${tag}${written}>${children}</${tag}>`;
}
function isolated(what, read) {
  const restores = [];
  const replace = (target, name, replacement) => {
    const saved = Object.getOwnPropertyDescriptor(target, name);
    Object.defineProperty(target, name, { configurable: true, ...replacement });
    restores.push(
      () => saved ? Object.defineProperty(target, name, saved) : delete target[name]
    );
  };
  const stop = (name) => () => {
    what(`reads the clock or randomness (\`${name}\`)`);
    throw new Error(`${name} isn't available on a server.`);
  };
  const globals = [
    "document",
    "window",
    "navigator",
    "location",
    "localStorage",
    "sessionStorage",
    "matchMedia"
  ];
  for (const name of globals) {
    if (Object.getOwnPropertyDescriptor(globalThis, name)?.configurable !== false) {
      replace(globalThis, name, {
        get() {
          what(`reads \`${name}\``);
          return void 0;
        }
      });
    }
  }
  replace(Date, "now", { writable: true, value: stop("Date.now") });
  const date = new Proxy(Date, {
    apply: stop("Date()"),
    construct: (target, args, newTarget) => args.length ? Reflect.construct(target, args, newTarget) : stop("new Date()")()
  });
  replace(globalThis, "Date", { writable: true, value: date });
  if (globalThis.performance) {
    replace(performance, "now", {
      writable: true,
      value: stop("performance.now")
    });
  }
  replace(Math, "random", { writable: true, value: stop("Math.random") });
  if (globalThis.crypto) {
    for (const name of ["randomUUID", "getRandomValues"]) {
      replace(crypto, name, { writable: true, value: stop(`crypto.${name}`) });
    }
  }
  try {
    return read();
  } finally {
    restores.reverse().forEach((restore) => restore());
  }
}
function checkServer(primitive, options, markup) {
  const schema = schemaOf(primitive);
  const id = `server-${++checked}`;
  const problems = /* @__PURE__ */ new Set();
  let rendering = "";
  const watched = new Proxy({ ...options, id }, {
    get(target, key) {
      if (rendering && typeof key === "string" && key !== "id") {
        problems.add(`${rendering} reads option \`${key}\``);
      }
      return target[key];
    }
  });
  const fail = () => new Error(
    `checkServer found ${problems.size} problem${problems.size === 1 ? "" : "s"}:
- ${[...problems].join("\n- ")}`
  );
  const instance = isolated(
    (what) => problems.add(`creating it ${what}`),
    () => {
      try {
        return unwatched(() => primitive(watched));
      } catch (error) {
        throw stopped(error) ? fail() : error;
      }
    }
  );
  let count = 0;
  function render(node, around) {
    if (typeof node === "string") {
      return escape(node);
    }
    const own = schema.slots[node.tag];
    if (!own) {
      const inner2 = node.children.map((child) => render(child, around)).join("");
      return toHtml(node.tag, Object.fromEntries(node.attributes), inner2);
    }
    const slot = node.tag;
    const { props, extra, as } = slotProps(
      own,
      node.attributes,
      around,
      () => `${id}-${slot}-${count++}`
    );
    const part = instance.part(slot, props);
    rendering = `\`${slot}\`${part.key ? ` "${part.key}"` : ""}`;
    const report = (what) => problems.add(`${rendering} ${what}`);
    const view = isolated(report, () => {
      try {
        return {
          attributes: attrs(part),
          shown: present(part),
          state: partState(part)
        };
      } catch (error) {
        if (!stopped(error)) {
          report(`throws while rendering: ${error.message}`);
        }
        return { attributes: {}, shown: true, state: {} };
      }
    });
    rendering = "";
    if (!view.shown) {
      return "";
    }
    const inner = node.children.map((child) => render(child, { ...around, [slot]: props })).join("");
    return toHtml(
      as ?? tagOf(view.attributes),
      { ...Object.fromEntries(extra), ...view.attributes },
      inner
    );
  }
  const html = parseMarkup(markup).map((node) => render(node, {})).join("");
  instance.destroy();
  if (problems.size) {
    throw fail();
  }
  return html;
}
export {
  checkServer
};
