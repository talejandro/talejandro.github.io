// src/components/date-input/date-input-model.ts
import { daysInMonth, isoDate } from "../../foundation/date/plain-date.js";
var emptyFields = () => ({
  year: null,
  month: null,
  day: null,
  hour: null,
  minute: null,
  second: null,
  dayPeriod: null
});
var pad = (value, length) => String(value).padStart(length, "0");
var bidiMarks = /[‎‏؜]/g;
function typesOf({ kind, granularity, hourCycle }) {
  const unit = kind === "time" && granularity === "day" ? "minute" : granularity;
  const types = kind === "date" ? ["year", "month", "day"] : [];
  if (unit === "day") {
    return types;
  }
  types.push("hour");
  if (unit !== "hour") {
    types.push("minute");
  }
  if (unit === "second") {
    types.push("second");
  }
  if (hourCycle === 12) {
    types.push("dayPeriod");
  }
  return types;
}
var hourCycles = /* @__PURE__ */ new Map();
function hourCycleOf(locale) {
  let cycle = hourCycles.get(locale);
  if (!cycle) {
    const { hourCycle } = new Intl.DateTimeFormat(locale, {
      hour: "numeric"
    }).resolvedOptions();
    cycle = hourCycle === "h11" || hourCycle === "h12" ? 12 : 24;
    hourCycles.set(locale, cycle);
  }
  return cycle;
}
var layouts = /* @__PURE__ */ new Map();
function layoutOf(format) {
  const key = JSON.stringify(format);
  let layout = layouts.get(key);
  if (layout) {
    return layout;
  }
  const types = typesOf(format);
  const has = (type) => types.includes(type);
  const formatter = new Intl.DateTimeFormat(format.locale, {
    timeZone: "UTC",
    calendar: "gregory",
    numberingSystem: "latn",
    ...has("year") && { year: "numeric", month: "2-digit", day: "2-digit" },
    ...has("hour") && {
      hour: "2-digit",
      hourCycle: format.hourCycle === 12 ? "h12" : "h23"
    },
    ...has("minute") && { minute: "2-digit" },
    ...has("second") && { second: "2-digit" }
  });
  layout = [];
  for (const part of formatter.formatToParts(Date.UTC(2001, 1, 3, 16, 5, 6))) {
    if (part.type === "literal") {
      const text = part.value.replace(bidiMarks, "").replace(/\s/g, " ");
      const last = layout[layout.length - 1];
      if (last?.type === "literal") {
        last.text += text;
      } else if (text) {
        layout.push({ type: "literal", text });
      }
    } else if (has(part.type)) {
      layout.push({ type: part.type, text: "" });
    }
  }
  while (layout[0]?.type === "literal") {
    layout.shift();
  }
  while (layout[layout.length - 1]?.type === "literal") {
    layout.pop();
  }
  layouts.set(key, layout);
  return layout;
}
var periodNames = /* @__PURE__ */ new Map();
function dayPeriodsOf(locale) {
  let names = periodNames.get(locale);
  if (!names) {
    const formatter = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      hourCycle: "h12",
      timeZone: "UTC"
    });
    const name = (hour) => formatter.formatToParts(Date.UTC(2001, 0, 1, hour)).find((part) => part.type === "dayPeriod")?.value;
    names = [name(0) ?? "AM", name(12) ?? "PM"];
    periodNames.set(locale, names);
  }
  return names;
}
var fieldNames = /* @__PURE__ */ new Map();
var englishNames = {
  year: "year",
  month: "month",
  day: "day",
  hour: "hour",
  minute: "minute",
  second: "second",
  dayPeriod: "AM/PM"
};
function labelOf(type, locale) {
  const key = `${locale}|${type}`;
  let name = fieldNames.get(key);
  if (name === void 0) {
    try {
      name = new Intl.DisplayNames(locale, { type: "dateTimeField" }).of(type) ?? englishNames[type];
    } catch {
      name = englishNames[type];
    }
    fieldNames.set(key, name);
  }
  return name;
}
function boundsOf(type, fields, hourCycle) {
  switch (type) {
    case "year":
      return [1, 9999];
    case "month":
      return [1, 12];
    case "day":
      return [
        1,
        fields.month === null ? 31 : daysInMonth(fields.year ?? 2e3, fields.month)
      ];
    case "hour":
      return hourCycle === 12 ? [1, 12] : [0, 23];
    case "dayPeriod":
      return [0, 1];
    default:
      return [0, 59];
  }
}
var digitsOf = (type) => type === "year" ? 4 : 2;
function clampDay(fields) {
  if (fields.day === null || fields.month === null) {
    return fields;
  }
  const last = daysInMonth(fields.year ?? 2e3, fields.month);
  return fields.day > last ? { ...fields, day: last } : fields;
}
function textOf(type, value, locale) {
  if (value === null) {
    return "";
  }
  if (type === "dayPeriod") {
    return dayPeriodsOf(locale)[value];
  }
  return pad(value, digitsOf(type));
}
function segmentsOf(format, fields, buffer) {
  let literals = 0;
  return layoutOf(format).map(({ type, text }) => {
    if (type === "literal") {
      return {
        key: `literal-${literals++}`,
        type,
        text,
        value: null,
        min: 0,
        max: 0,
        empty: false,
        editable: false,
        label: ""
      };
    }
    const value = fields[type];
    const [min, max] = boundsOf(type, fields, format.hourCycle);
    const typing = buffer?.type === type ? buffer.text : null;
    return {
      key: type,
      type,
      text: typing ?? textOf(type, value, format.locale),
      value,
      min,
      max,
      empty: value === null && !typing,
      editable: true,
      label: labelOf(type, format.locale)
    };
  });
}
function typeDigit(fields, buffer, type, digit, hourCycle) {
  const [min, max] = boundsOf(type, fields, hourCycle);
  const digits = digitsOf(type);
  let text = buffer?.type === type ? buffer.text + digit : digit;
  if (text.length > digits || Number(text) > max) {
    text = digit;
  }
  const number = Number(text);
  const done = text.length >= digits || number * 10 > max;
  const value = number >= min && number <= max ? number : null;
  const next = { ...fields, [type]: value };
  return {
    // 2, 20 and 202 aren't leap years, so a year still being typed keeps February 29.
    fields: type === "year" && !done ? next : clampDay(next),
    buffer: done ? null : { type, text },
    done
  };
}
function typePeriod(fields, letter, locale) {
  const lower = letter.toLowerCase();
  const index = [...dayPeriodsOf(locale)].findIndex(
    (name, at) => [name, at ? "pm" : "am"].some(
      (candidate) => candidate.toLowerCase().startsWith(lower)
    )
  );
  return index === -1 ? void 0 : { ...fields, dayPeriod: index };
}
function stepField(fields, type, delta, hourCycle, start) {
  const [min, max] = boundsOf(type, fields, hourCycle);
  const current = fields[type];
  const span = max - min + 1;
  const value = current === null ? start : min + ((current - min + delta) % span + span) % span;
  return clampDay({ ...fields, [type]: value });
}
function stepToEnd(fields, type, end, hourCycle) {
  const [min, max] = boundsOf(type, fields, hourCycle);
  return clampDay({ ...fields, [type]: end === "min" ? min : max });
}
var pageSteps = {
  year: 5,
  month: 3,
  day: 7,
  hour: 3,
  minute: 15,
  second: 15,
  dayPeriod: 1
};
var pageStepOf = (type) => pageSteps[type];
function valueOf(fields, format) {
  const types = typesOf(format);
  if (types.some((type) => fields[type] === null)) {
    return null;
  }
  let date = "";
  if (format.kind === "date") {
    date = isoDate(fields.year, fields.month, fields.day) ?? "";
    if (!date) {
      return null;
    }
    if (!types.includes("hour")) {
      return date;
    }
  }
  const hour = format.hourCycle === 12 ? fields.hour % 12 + (fields.dayPeriod === 1 ? 12 : 0) : fields.hour;
  let time = `${pad(hour, 2)}:${pad(fields.minute ?? 0, 2)}`;
  if (types.includes("second")) {
    time += `:${pad(fields.second, 2)}`;
  }
  return format.kind === "date" ? `${date}T${time}` : time;
}
var datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
var timePattern = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/;
function partsOf(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const [datePart, timePart] = value.includes("T") ? value.split("T") : timePattern.test(value) ? ["", value] : [value, ""];
  const parts = {};
  if (datePart) {
    const match = datePattern.exec(datePart);
    if (!match) {
      return void 0;
    }
    const [year, month, day] = [
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    ];
    if (!isoDate(year, month, day)) {
      return void 0;
    }
    parts.date = { year, month, day };
  }
  if (timePart) {
    const match = timePattern.exec(timePart);
    if (!match) {
      return void 0;
    }
    const [hour, minute, second] = [
      Number(match[1]),
      Number(match[2]),
      Number(match[3] ?? 0)
    ];
    if (hour > 23 || minute > 59 || second > 59) {
      return void 0;
    }
    Object.assign(parts, { hour, minute, second });
  }
  return parts.date || parts.hour !== void 0 ? parts : void 0;
}
function fieldsOf(value, format) {
  const fields = emptyFields();
  const parts = partsOf(value);
  if (!parts) {
    return fields;
  }
  const types = typesOf(format);
  if (format.kind === "date") {
    if (!parts.date) {
      return fields;
    }
    Object.assign(fields, parts.date);
  }
  if (types.includes("hour")) {
    if (parts.hour === void 0) {
      if (format.kind === "time") {
        return fields;
      }
      Object.assign(parts, { hour: 0, minute: 0, second: 0 });
    }
    const hour = parts.hour;
    fields.hour = format.hourCycle === 12 ? hour % 12 || 12 : hour;
    if (format.hourCycle === 12) {
      fields.dayPeriod = hour >= 12 ? 1 : 0;
    }
    if (types.includes("minute")) {
      fields.minute = parts.minute;
    }
    if (types.includes("second")) {
      fields.second = parts.second;
    }
  }
  return fields;
}
function normalizeValue(value, format) {
  return valueOf(
    fieldsOf(typeof value === "string" ? value : null, format),
    format
  );
}
function sortKey(parts) {
  const time = parts.hour === void 0 ? "" : `${pad(parts.hour, 2)}:${pad(parts.minute, 2)}:${pad(parts.second, 2)}`;
  if (!parts.date) {
    return time;
  }
  const { year, month, day } = parts.date;
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}${time ? `T${time}` : ""}`;
}
function compareTo(value, bound) {
  const a = partsOf(value);
  const b = partsOf(bound);
  if (!a || !b) {
    return 0;
  }
  let left = sortKey(a);
  let right = sortKey(b);
  if (a.date && b.date && (b.hour === void 0 || a.hour === void 0)) {
    left = left.slice(0, 10);
    right = right.slice(0, 10);
  }
  return left < right ? -1 : left > right ? 1 : 0;
}
var dateOf = (value) => datePattern.test(value.slice(0, 10)) ? value.slice(0, 10) : void 0;
export {
  boundsOf,
  clampDay,
  compareTo,
  dateOf,
  dayPeriodsOf,
  emptyFields,
  fieldsOf,
  hourCycleOf,
  layoutOf,
  normalizeValue,
  pageStepOf,
  segmentsOf,
  stepField,
  stepToEnd,
  typeDigit,
  typePeriod,
  typesOf,
  valueOf
};
