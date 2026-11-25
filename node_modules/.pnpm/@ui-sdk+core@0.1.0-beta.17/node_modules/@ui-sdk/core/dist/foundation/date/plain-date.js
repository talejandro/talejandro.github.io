// src/foundation/date/plain-date.ts
var firstDay = toDays(1, 1, 1);
var lastDay = toDays(9999, 12, 31);
function isISODate(value) {
  return typeof value === "string" && dateParts(value) !== void 0;
}
function dateParts(date) {
  const match = date ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) : null;
  if (!match) {
    return void 0;
  }
  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
  return isRealDate(parts) ? parts : void 0;
}
function isoDate(year, month, day) {
  const parts = { year, month, day };
  return isRealDate(parts) ? format(parts) : void 0;
}
function toISODate(value) {
  if (value == null) {
    return void 0;
  }
  if (typeof value === "string") {
    return isISODate(value) ? value : void 0;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? void 0 : isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  return isoDate(value.year, value.month, value.day);
}
function daysInMonth(year, month) {
  return month === 2 && isLeapYear(year) ? 29 : monthLengths[month - 1] ?? 0;
}
var monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function addDays(date, days) {
  return fromDays(clampDays(daysOf(date) + days));
}
function addMonths(date, months) {
  const { year, month, day } = partsOf(date);
  const index = year * 12 + month - 1 + months;
  const nextYear = Math.floor(index / 12);
  if (nextYear < 1) {
    return format(fromDayNumber(firstDay));
  }
  if (nextYear > 9999) {
    return format(fromDayNumber(lastDay));
  }
  const nextMonth = index - nextYear * 12 + 1;
  return format({
    year: nextYear,
    month: nextMonth,
    day: Math.min(day, daysInMonth(nextYear, nextMonth))
  });
}
function addYears(date, years) {
  return addMonths(date, years * 12);
}
function daysBetween(from, to) {
  return daysOf(to) - daysOf(from);
}
function weekday(date) {
  return ((daysOf(date) + 4) % 7 + 7) % 7;
}
function startOfWeek(date, weekStartsOn = 0) {
  return addDays(date, -((weekday(date) - weekStartsOn + 7) % 7));
}
function endOfWeek(date, weekStartsOn = 0) {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}
function startOfMonth(date) {
  return `${date.slice(0, 8)}01`;
}
function endOfMonth(date) {
  const { year, month } = partsOf(date);
  return format({ year, month, day: daysInMonth(year, month) });
}
function isSameMonth(a, b) {
  return a.slice(0, 7) === b.slice(0, 7);
}
function clampDate(date, min, max) {
  if (min && date < min) {
    return min;
  }
  if (max && date > max) {
    return max;
  }
  return date;
}
function monthGrid(month, options = {}) {
  const first = startOfMonth(month);
  const start = daysOf(startOfWeek(first, options.weekStartsOn ?? 0));
  const end = daysOf(endOfMonth(first));
  const count = options.fixedWeeks === false ? Math.ceil((end - start + 1) / 7) : 6;
  const weeks = [];
  for (let row = 0; row < count; row++) {
    const week = [];
    for (let column = 0; column < 7; column++) {
      week.push(fromDays(clampDays(start + row * 7 + column)));
    }
    weeks.push(week);
  }
  return weeks;
}
function toDays(year, month, day) {
  const shifted = month <= 2 ? year - 1 : year;
  const era = Math.floor(shifted / 400);
  const yearOfEra = shifted - era * 400;
  const dayOfYear = Math.floor((153 * ((month + 9) % 12) + 2) / 5) + day - 1;
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}
function fromDayNumber(days) {
  const shifted = days + 719468;
  const era = Math.floor(shifted / 146097);
  const dayOfEra = shifted - era * 146097;
  const yearOfEra = Math.floor(
    (dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365
  );
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const shiftedMonth = Math.floor((5 * dayOfYear + 2) / 153);
  const month = shiftedMonth < 10 ? shiftedMonth + 3 : shiftedMonth - 9;
  const day = dayOfYear - Math.floor((153 * shiftedMonth + 2) / 5) + 1;
  return { year: yearOfEra + era * 400 + (month <= 2 ? 1 : 0), month, day };
}
var fromDays = (days) => format(fromDayNumber(days));
var clampDays = (days) => Math.min(Math.max(days, firstDay), lastDay);
function partsOf(date) {
  const parts = dateParts(date);
  if (!parts) {
    throw new RangeError(`"${date}" is not an ISO date (YYYY-MM-DD).`);
  }
  return parts;
}
function daysOf(date) {
  const { year, month, day } = partsOf(date);
  return toDays(year, month, day);
}
var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
function isRealDate({ year, month, day }) {
  return Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day) && year >= 1 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}
var pad = (value, length) => String(value).padStart(length, "0");
function format({ year, month, day }) {
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}
export {
  addDays,
  addMonths,
  addYears,
  clampDate,
  dateParts,
  daysBetween,
  daysInMonth,
  endOfMonth,
  endOfWeek,
  isISODate,
  isSameMonth,
  isoDate,
  monthGrid,
  startOfMonth,
  startOfWeek,
  toISODate,
  weekday
};
