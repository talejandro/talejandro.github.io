// src/foundation/forms/files.ts
function parseAccept(accept) {
  if (!accept) {
    return [];
  }
  const list = typeof accept === "string" ? accept.split(",") : accept;
  return list.map((token) => token.trim().toLowerCase()).filter(Boolean);
}
var isExtension = (token) => token.startsWith(".");
var isAny = (token) => token === "*" || token === "*/*";
var essence = (type) => type.split(";")[0].trim().toLowerCase();
function matchesType(type, token) {
  if (isAny(token)) {
    return true;
  }
  if (!type) {
    return false;
  }
  if (token.endsWith("/*")) {
    return type.startsWith(token.slice(0, -1));
  }
  return type === token;
}
function acceptsFile(file, tokens) {
  if (!tokens.length) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = essence(file.type);
  return tokens.some(
    (token) => isExtension(token) ? name.endsWith(token) : matchesType(type, token)
  );
}
var extensionTypes = {
  ".pdf": ["application/pdf"],
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".gif": ["image/gif"],
  ".webp": ["image/webp"],
  ".svg": ["image/svg+xml"],
  ".txt": ["text/plain"],
  ".md": ["text/markdown", "text/x-markdown"],
  ".csv": ["text/csv", "application/vnd.ms-excel"],
  ".json": ["application/json"],
  ".zip": ["application/zip", "application/x-zip-compressed"],
  ".mp4": ["video/mp4"],
  ".mp3": ["audio/mpeg"]
};
function acceptsType(type, tokens) {
  if (!tokens.length) {
    return true;
  }
  const mime = essence(type);
  if (!mime) {
    return void 0;
  }
  const matches = tokens.some(
    (token) => isExtension(token) ? extensionTypes[token]?.includes(mime) : matchesType(mime, token)
  );
  if (matches) {
    return true;
  }
  return tokens.some((token) => isExtension(token) && !extensionTypes[token]) ? void 0 : false;
}
function fileLimit(rules) {
  if (rules.multiple === false) {
    return Math.min(1, rules.maxFiles ?? 1);
  }
  return rules.maxFiles ?? Infinity;
}
function validateFiles(files, rules) {
  const tokens = parseAccept(rules.accept);
  const limit = fileLimit(rules);
  const accepted = [];
  const rejected = [];
  for (const file of files) {
    const reasons = [];
    if (!acceptsFile(file, tokens)) {
      reasons.push("file-type");
    }
    if (rules.maxSize !== void 0 && file.size > rules.maxSize) {
      reasons.push("file-too-large");
    }
    if (rules.minSize !== void 0 && file.size < rules.minSize) {
      reasons.push("file-too-small");
    }
    const custom = reasons.length ? void 0 : rules.validate?.(file, { accepted });
    if (custom) {
      reasons.push(custom);
    }
    if (!reasons.length && accepted.length >= limit) {
      reasons.push("too-many-files");
    }
    if (reasons.length) {
      rejected.push({ file, reasons });
    } else {
      accepted.push(file);
    }
  }
  return { accepted, rejected };
}
function dragStatus(types, rules) {
  if (types.length > fileLimit(rules)) {
    return "reject";
  }
  const tokens = parseAccept(rules.accept);
  return types.some((type) => acceptsType(type, tokens) === false) ? "reject" : "accept";
}
var sizeUnits = [
  "byte",
  "kilobyte",
  "megabyte",
  "gigabyte",
  "terabyte"
];
function formatFileSize(bytes, locale) {
  let value = bytes;
  let unit = 0;
  while (Math.round(value) >= 1e3 && unit < sizeUnits.length - 1) {
    value /= 1e3;
    unit++;
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: sizeUnits[unit],
    // The short form of a byte is the word in the singular, like "70 byte".
    unitDisplay: unit ? "short" : "long",
    maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0
  }).format(value);
}
var paths = /* @__PURE__ */ new WeakMap();
function setRelativePath(file, path) {
  paths.set(file, path);
}
function relativePath(file) {
  return paths.get(file) || file.webkitRelativePath || file.name;
}
export {
  acceptsFile,
  acceptsType,
  dragStatus,
  formatFileSize,
  parseAccept,
  relativePath,
  setRelativePath,
  validateFiles
};
