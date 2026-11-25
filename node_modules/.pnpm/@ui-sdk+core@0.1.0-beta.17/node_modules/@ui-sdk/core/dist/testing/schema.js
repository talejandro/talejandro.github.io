// src/testing/schema.ts
var kindOf = (spec) => typeof spec === "function" ? "value" : typeof spec === "object" ? spec.kind : spec;
function fromOf(spec, key) {
  if (typeof spec !== "object") {
    return void 0;
  }
  const [slot, prop = key] = spec.from.split(".");
  return { slot, prop };
}
function parseProp(spec, attribute) {
  if (typeof spec === "function") {
    return spec(attribute);
  }
  const kind = kindOf(spec);
  if (kind === "boolean") {
    return attribute !== "false";
  }
  if (kind === "number") {
    return Number(attribute);
  }
  if (kind === "list") {
    return attribute ? attribute.split(",").map((item) => item.trim()) : [];
  }
  if (kind === "value") {
    try {
      return JSON.parse(attribute);
    } catch {
      return attribute;
    }
  }
  return attribute;
}
var camel = (name) => name.replace(/-(\w)/g, (_, char) => char.toUpperCase());
function slotProps(own, attributes, around, makeId) {
  const props = {};
  const extra = [];
  let as;
  for (const [name, value] of attributes) {
    const key = camel(name);
    if (name === "as") {
      as = value;
    } else if (key in own) {
      props[key] = parseProp(own[key], value);
    } else {
      extra.push([name, value]);
    }
  }
  for (const key in own) {
    const from = fromOf(own[key], key);
    if (from) {
      props[key] ??= around[from.slot]?.[from.prop];
    }
    if (kindOf(own[key]) === "id") {
      props[key] ??= makeId();
    }
  }
  return { props, extra, as };
}
function tagOf(rendered) {
  if (rendered.type === "button" || rendered.type === "submit") {
    return "button";
  }
  if (rendered.href !== void 0) {
    return "a";
  }
  if (rendered.for !== void 0) {
    return "label";
  }
  if (typeof rendered.type === "string") {
    return "input";
  }
  return "div";
}
export {
  camel,
  fromOf,
  kindOf,
  slotProps,
  tagOf
};
