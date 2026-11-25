// src/foundation/date/parse.ts
import { dateFormatter, monthNames, weekdayNames } from "./format.js";
import { dateParts, isoDate } from "./plain-date.js";
var directionMarks = /[‎‏؜]/g;
var fieldLetters = { year: "Y", month: "M", day: "D" };
var numericDate = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
};
var patterns = /* @__PURE__ */ new Map();
function datePattern(locale) {
  const key = locale ?? "";
  let pattern = patterns.get(key);
  if (!pattern) {
    patterns.set(key, pattern = readPattern(locale));
  }
  return pattern;
}
function readPattern(locale) {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const parts = dateFormatter(locale, numericDate).formatToParts(
    Date.UTC(year, 11, 31)
  );
  const names = fieldNames(locale);
  const fields = [];
  let separator = "";
  let placeholder = "";
  for (const part of parts) {
    const value = part.value.replace(directionMarks, "");
    if (part.type === "year" || part.type === "month" || part.type === "day") {
      fields.push(part.type);
      placeholder += names[part.type].repeat(part.type === "year" ? 4 : 2);
    } else {
      if (fields.length === 1 && !separator) {
        separator = value;
      }
      placeholder += value;
    }
  }
  const example = parts.map((part) => part.value.replace(directionMarks, "")).join("");
  return { fields, separator, placeholder, example };
}
function fieldNames(locale) {
  try {
    const names = new Intl.DisplayNames(locale, { type: "dateTimeField" });
    const letter = (field) => {
      const first = names.of(field)?.[0]?.toLocaleUpperCase(locale);
      return first && first !== first.toLocaleLowerCase(locale) ? first : fieldLetters[field];
    };
    return { year: letter("year"), month: letter("month"), day: letter("day") };
  } catch {
    return fieldLetters;
  }
}
function parseDate(text, locale, options = {}) {
  const normalized = toLatinDigits(
    text.replace(directionMarks, "").trim(),
    locale
  );
  if (!normalized) {
    return void 0;
  }
  const { fields, separator } = datePattern(locale);
  if (!(separator === "-" && fields[0] === "year" && fields[1] !== "month") && dateParts(normalized)) {
    return normalized;
  }
  const referenceYear = Number((options.referenceDate ?? "").slice(0, 4)) || (/* @__PURE__ */ new Date()).getFullYear();
  let namedMonth;
  let words = normalized.toLocaleLowerCase(locale);
  for (const [name, month] of months(locale).spaced) {
    const at = wordIndex(words, name);
    if (at >= 0) {
      namedMonth = month;
      words = `${words.slice(0, at)} ${words.slice(at + name.length)}`;
      break;
    }
  }
  const numbers = [];
  for (const token of words.match(/\p{N}+|[\p{L}\p{M}]+/gu) ?? []) {
    if (/^\d+$/.test(token)) {
      numbers.push(token);
      continue;
    }
    const month = monthFromName(token, locale);
    if (month !== void 0 && namedMonth === void 0) {
      namedMonth = month;
    } else if (!isPatternWord(token, locale)) {
      return void 0;
    }
  }
  const values = {};
  if (namedMonth !== void 0) {
    if (numbers.length > 2 || numbers.length === 0) {
      return void 0;
    }
    const orders = numbers.length === 1 ? [["day"]] : [namedOrder(locale), fields];
    for (const order of orders) {
      const named = {
        month: String(namedMonth)
      };
      order.filter((field) => field !== "month").forEach((field, index) => named[field] = numbers[index]);
      const date = dateOf(named, locale, referenceYear);
      if (date) {
        return date;
      }
    }
    return void 0;
  } else if (numbers.length === 1) {
    const digits = numbers[0];
    if (digits.length !== 8 && digits.length !== 6) {
      return void 0;
    }
    const yearLength = digits.length - 4;
    let offset = 0;
    for (const field of fields) {
      const length = field === "year" ? yearLength : 2;
      values[field] = digits.slice(offset, offset += length);
    }
  } else if (numbers.length === 2 || numbers.length === 3) {
    const short = shortPattern(locale);
    const typed = normalized.match(/\d(\D+)\d/)?.[1]?.trim();
    const all = typed === short.separator && short.separator !== separator.trim() ? short.fields : fields;
    const order = numbers.length === 3 ? all : all.filter((field) => field !== "year");
    order.forEach((field, index) => values[field] = numbers[index]);
  } else {
    return void 0;
  }
  return dateOf(values, locale, referenceYear);
}
function dateOf(values, locale, referenceYear) {
  const offset = yearOffset(locale);
  const year = values.year === void 0 ? referenceYear : fullYear(values.year, referenceYear + offset) - offset;
  return isoDate(year, Number(values.month), Number(values.day));
}
var yearOffsets = /* @__PURE__ */ new Map();
function yearOffset(locale) {
  const key = locale ?? "";
  let offset = yearOffsets.get(key);
  if (offset === void 0) {
    yearOffsets.set(key, offset = readYearOffset(locale));
  }
  return offset;
}
function readYearOffset(locale) {
  const formatter = dateFormatter(locale, numericDate);
  const parts = formatter.formatToParts(Date.UTC(2026, 11, 31));
  const year = Number(
    toLatinDigits(
      parts.find((part) => part.type === "year")?.value ?? "",
      locale
    )
  );
  if (!year || formatter.resolvedOptions().calendar === "japanese") {
    return 0;
  }
  return year - 2026;
}
function fullYear(text, referenceYear) {
  const year = Number(text);
  if (text.length > 2) {
    return year;
  }
  const century = Math.floor((referenceYear + 20) / 100) * 100;
  return century + year > referenceYear + 20 ? century - 100 + year : century + year;
}
var fieldOrders = /* @__PURE__ */ new Map();
function fieldOrdersOf(locale) {
  const key = locale ?? "";
  let orders = fieldOrders.get(key);
  if (!orders) {
    const fieldsOf = (options) => dateFormatter(locale, options).formatToParts(Date.UTC(2026, 9, 16)).filter(
      (part) => ["year", "month", "day"].includes(part.type)
    );
    const shortParts = dateFormatter(locale, {
      dateStyle: "short"
    }).formatToParts(Date.UTC(2026, 9, 16));
    const firstField = shortParts.findIndex(
      (part) => ["year", "month", "day"].includes(part.type)
    );
    orders = {
      named: fieldsOf({ year: "numeric", month: "long", day: "numeric" }).map(
        (part) => part.type
      ),
      short: {
        ...datePattern(locale),
        fields: fieldsOf({ dateStyle: "short" }).map((part) => part.type),
        separator: shortParts[firstField + 1]?.value.replace(directionMarks, "").trim() ?? ""
      }
    };
    fieldOrders.set(key, orders);
  }
  return orders;
}
var namedOrder = (locale) => fieldOrdersOf(locale).named;
var shortPattern = (locale) => fieldOrdersOf(locale).short;
function wordIndex(text, name) {
  for (let at = text.indexOf(name); at >= 0; at = text.indexOf(name, at + 1)) {
    const after = text[at + name.length] ?? "";
    if (!/[\p{L}\p{M}\p{N}]/u.test(after) && !/[\p{L}\p{M}]/u.test(text[at - 1] ?? "")) {
      return at;
    }
  }
  return -1;
}
var monthLookups = /* @__PURE__ */ new Map();
function months(locale) {
  const key = locale ?? "";
  let found = monthLookups.get(key);
  if (!found) {
    const lookup = monthLookup(locale);
    const spaced = [...lookup].filter(([name]) => /\p{L}/u.test(name) && /[^\p{L}\p{M}]/u.test(name)).sort(([a], [b]) => b.length - a.length);
    monthLookups.set(key, found = { lookup, spaced });
  }
  return found;
}
function monthFromName(word, locale) {
  const { lookup } = months(locale);
  const exact = lookup.get(word);
  if (exact !== void 0) {
    return exact;
  }
  for (let index = 1; index < word.length - 2; index++) {
    const month = lookup.get(word.slice(index));
    if (month !== void 0 && isPatternWord(word.slice(0, index), locale)) {
      return month;
    }
  }
  if (word.length < 3) {
    return void 0;
  }
  let found;
  for (const [name, month] of lookup) {
    if (name.startsWith(word)) {
      if (found !== void 0 && found !== month) {
        return void 0;
      }
      found = month;
    }
  }
  return found;
}
function monthLookup(locale) {
  const lookup = /* @__PURE__ */ new Map();
  const add = (name, month) => lookup.set(name.toLocaleLowerCase(locale).replace(/\.$/, ""), month);
  for (const width of ["long", "short"]) {
    monthNames(locale, width).forEach((name, index) => add(name, index + 1));
    const inDate = dateFormatter(locale, { day: "numeric", month: width });
    for (let index = 0; index < 12; index++) {
      const name = inDate.formatToParts(Date.UTC(2026, index, 16)).find((part) => part.type === "month");
      if (name) {
        add(name.value, index + 1);
      }
    }
  }
  return lookup;
}
var patternWords = /* @__PURE__ */ new Map();
function isPatternWord(word, locale) {
  const key = locale ?? "";
  let words = patternWords.get(key);
  if (!words) {
    words = /* @__PURE__ */ new Set();
    for (const options of [
      { dateStyle: "short" },
      { dateStyle: "medium" },
      { dateStyle: "long" },
      { dateStyle: "full" }
    ]) {
      for (const part of dateFormatter(locale, options).formatToParts(
        Date.UTC(2026, 9, 16)
      )) {
        if (part.type === "literal") {
          for (const literal of part.value.toLocaleLowerCase(locale).match(/[\p{L}\p{M}]+/gu) ?? []) {
            words.add(literal);
          }
        }
      }
    }
    for (const width of ["long", "short"]) {
      for (const name of weekdayNames(locale, width)) {
        words.add(name.toLocaleLowerCase(locale).replace(/\.$/, ""));
      }
    }
    patternWords.set(key, words);
  }
  return words.has(word);
}
var digitMaps = /* @__PURE__ */ new Map();
function toLatinDigits(text, locale) {
  const key = locale ?? "";
  let digits = digitMaps.get(key);
  if (!digits) {
    const native = new Intl.NumberFormat(locale, { useGrouping: false }).format(
      9876543210
    );
    digits = new Map(
      [...native].map((digit, index) => [digit, String(9 - index)])
    );
    digitMaps.set(key, digits);
  }
  const latin = digits;
  return text.replace(
    /\p{Nd}/gu,
    (digit) => latin.get(digit) ?? digit.normalize("NFKC")
  );
}
export {
  datePattern,
  parseDate
};
