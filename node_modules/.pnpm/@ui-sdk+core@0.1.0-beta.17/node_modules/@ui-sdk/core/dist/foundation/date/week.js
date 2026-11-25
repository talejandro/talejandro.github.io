// src/foundation/date/week.ts
var regionDays = /* @__PURE__ */ new Map();
for (const [day, regions] of [
  [
    0,
    "AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN IS JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW"
  ],
  [5, "MV"],
  [6, "AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY"]
]) {
  for (const region of regions.split(" ")) {
    regionDays.set(region, day);
  }
}
var extensionDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
var cache = /* @__PURE__ */ new Map();
function firstDayOfWeek(locale) {
  const key = locale ?? "";
  let day = cache.get(key);
  if (day === void 0) {
    cache.set(key, day = resolveFirstDay(locale));
  }
  return day;
}
function resolveFirstDay(locale) {
  let tag;
  try {
    tag = new Intl.Locale(
      locale ?? new Intl.DateTimeFormat().resolvedOptions().locale
    );
  } catch {
    return 1;
  }
  const extension = /-u(?:-[a-z0-9]{2,8})*?-fw-([a-z]{3})\b/i.exec(tag.toString())?.[1]?.toLowerCase();
  if (extension && extensionDays.includes(extension)) {
    return extensionDays.indexOf(extension);
  }
  const info = weekInfo(tag);
  if (info) {
    return info.firstDay % 7;
  }
  return regionDays.get(tag.maximize().region ?? "") ?? 1;
}
function weekInfo(tag) {
  const locale = tag;
  try {
    return locale.getWeekInfo?.() ?? locale.weekInfo;
  } catch {
    return void 0;
  }
}
export {
  firstDayOfWeek
};
