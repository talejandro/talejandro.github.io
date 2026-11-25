// src/components/token-input/token-input-model.ts
var TOKEN_CHAR = "\uFFFC";
var lastId = 0;
var nextId = () => `t${++lastId}`;
var reserveId = (id) => {
  if (/^t\d{1,15}$/.test(id)) {
    lastId = Math.max(lastId, Number(id.slice(1)));
  }
};
var isToken = (segment) => typeof segment === "object" && segment !== null;
function normalizeValue(value) {
  for (const segment of value) {
    if (isToken(segment) && segment.id) {
      reserveId(segment.id);
    }
  }
  const ids = /* @__PURE__ */ new Set();
  const result = [];
  for (const segment of value) {
    if (isToken(segment)) {
      const token = segment.id && !ids.has(segment.id) ? segment : { ...segment, id: nextId() };
      ids.add(token.id);
      result.push(token);
      continue;
    }
    if (!segment) {
      continue;
    }
    const last = result.length - 1;
    if (typeof result[last] === "string") {
      result[last] += segment;
    } else {
      result.push(segment);
    }
  }
  return result;
}
function valueLength(value) {
  let length = 0;
  for (const segment of value) {
    length += isToken(segment) ? 1 : segment.length;
  }
  return length;
}
function offsetText(value) {
  return value.map((segment) => isToken(segment) ? TOKEN_CHAR : segment).join("");
}
function sliceValue(value, start, end = Infinity) {
  const result = [];
  let at = 0;
  for (const segment of value) {
    const length = isToken(segment) ? 1 : segment.length;
    const from = Math.max(start - at, 0);
    const to = Math.min(end - at, length);
    if (from < to) {
      result.push(isToken(segment) ? segment : segment.slice(from, to));
    }
    at += length;
    if (at >= end) {
      break;
    }
  }
  return result;
}
function replaceRange(value, range, content) {
  return normalizeValue([
    ...sliceValue(value, 0, range.start),
    ...content,
    ...sliceValue(value, range.end)
  ]);
}
function tokenAt(value, offset) {
  const segment = sliceValue(value, offset, offset + 1)[0];
  return isToken(segment) ? segment : void 0;
}
function offsetOfToken(value, id) {
  let at = 0;
  for (const segment of value) {
    if (isToken(segment) && segment.id === id) {
      return at;
    }
    at += isToken(segment) ? 1 : segment.length;
  }
  return -1;
}
var tokensOf = (value) => value.filter(isToken);
function removedTokens(before, after) {
  const kept = new Set(tokensOf(after).map((token) => token.id));
  return tokensOf(before).filter((token) => !kept.has(token.id));
}
function sameValue(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((segment, index) => {
    const other = b[index];
    if (!isToken(segment) || !isToken(other)) {
      return segment === other;
    }
    return segment.id === other.id && segment.type === other.type && segment.value === other.value && segment.label === other.label && segment.status === other.status && segment.data === other.data;
  });
}
function wordBoundary(value, offset, direction) {
  const text = offsetText(value);
  let at = offset;
  const charAt = (index) => text[direction < 0 ? index - 1 : index];
  const inside = (index) => direction < 0 ? index > 0 : index < text.length;
  if (charAt(at) === TOKEN_CHAR) {
    return at + direction;
  }
  while (inside(at) && /\s/.test(charAt(at)) && charAt(at) !== "\n") {
    at += direction;
  }
  if (charAt(at) === TOKEN_CHAR && at !== offset) {
    return at;
  }
  while (inside(at) && !/\s/.test(charAt(at)) && charAt(at) !== TOKEN_CHAR) {
    at += direction;
  }
  return at === offset && inside(at) ? at + direction : at;
}
function lineBoundary(value, offset, direction) {
  const text = offsetText(value);
  if (direction < 0) {
    const start = text.lastIndexOf("\n", offset - 1) + 1;
    return start === offset && offset > 0 ? offset - 1 : start;
  }
  const end = text.indexOf("\n", offset);
  return end === -1 ? text.length : end === offset ? offset + 1 : end;
}
var escapeIn = (text, special) => text.replace(special, (char) => `\\${char}`);
var unescape = (text) => text.replace(/\\([\s\S])/g, "$1");
var linkPattern = /\[@((?:\\[\s\S]|[^\\\]])*)\]\(([\w-]+):((?:\\[\s\S]|[^\\()])*)\)/y;
function trailingSlashes(text) {
  let end = text.length;
  while (end > 0 && text[end - 1] === "\\") {
    end--;
  }
  return text.slice(end);
}
var defaultCodec = {
  format: (token) => `[@${escapeIn(token.label, /[\\[\]]/g)}](${token.type}:${escapeIn(token.value, /[\\()]/g)})`,
  // Backslashes before `[@` double, plus one more when the bracket is literal.
  // A run of backslashes at the end of text before a token doubles too.
  escape(text, next) {
    const parts = text.split("[@");
    const last = parts.pop();
    return parts.map((part) => `${part}${trailingSlashes(part)}\\[@`).join("") + last + (next ? trailingSlashes(last) : "");
  },
  parse(text) {
    const value = [];
    let plain = "";
    let index = 0;
    while (index < text.length) {
      const bracket = text.indexOf("[@", index);
      if (bracket === -1) {
        break;
      }
      let slashes = 0;
      while (bracket - slashes - 1 >= index && text[bracket - slashes - 1] === "\\") {
        slashes++;
      }
      plain += text.slice(index, bracket - slashes) + "\\".repeat(Math.floor(slashes / 2));
      if (slashes % 2) {
        plain += "[@";
        index = bracket + 2;
        continue;
      }
      linkPattern.lastIndex = bracket;
      const link = linkPattern.exec(text);
      if (!link) {
        plain += "[@";
        index = bracket + 2;
        continue;
      }
      value.push(plain, {
        type: link[2],
        value: unescape(link[3]),
        label: unescape(link[1])
      });
      plain = "";
      index = linkPattern.lastIndex;
    }
    value.push(plain + text.slice(index));
    return normalizeValue(value);
  }
};
function toText(value, codec = defaultCodec) {
  return value.map((segment, index) => {
    if (isToken(segment)) {
      return codec.format(segment);
    }
    const next = value[index + 1];
    return codec.escape ? codec.escape(segment, isToken(next) ? next : void 0) : segment;
  }).join("");
}
function toLabel(value) {
  return value.map((segment) => isToken(segment) ? segment.label : segment).join("");
}
function fromText(text, codec = defaultCodec) {
  return codec.parse(text);
}
export {
  defaultCodec,
  fromText,
  isToken,
  lineBoundary,
  normalizeValue,
  offsetOfToken,
  offsetText,
  removedTokens,
  replaceRange,
  sameValue,
  sliceValue,
  toLabel,
  toText,
  tokenAt,
  tokensOf,
  valueLength,
  wordBoundary
};
