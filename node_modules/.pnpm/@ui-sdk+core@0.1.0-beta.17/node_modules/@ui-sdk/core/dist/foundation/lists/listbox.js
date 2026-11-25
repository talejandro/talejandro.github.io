// src/foundation/lists/listbox.ts
import {
  createListboxEngine,
  isGroup,
  isSeparator,
  toListItem
} from "./listbox-engine.js";
import { foldText, leadingSpaces } from "../text/match.js";
import {
  flattenData,
  highlightable,
  highlightedValue,
  highlightFromCode,
  itemKey,
  revealInList,
  toListItem as toListItem2
} from "./listbox-engine.js";
function textMatches(text, query, mode) {
  const needle = foldText(query.trim());
  if (!needle) {
    return true;
  }
  const haystack = foldText(text);
  return mode === "startsWith" ? haystack.startsWith(needle, leadingSpaces(haystack)) : haystack.includes(needle);
}
function itemScore(item, query, filter) {
  if (filter === false || filter === void 0 || !query.trim()) {
    return 1;
  }
  if (typeof filter === "function") {
    const result = filter(item, query);
    return typeof result === "number" ? Math.max(0, result) : result ? 1 : 0;
  }
  return [item.label, ...item.keywords ?? []].some(
    (text) => textMatches(text, query, filter)
  ) ? 1 : 0;
}
function itemMatches(item, query, filter) {
  return itemScore(item, query, filter) > 0;
}
function filterData(data, query, filter, { rank = false } = {}) {
  if (filter === false || filter === void 0 || !query.trim()) {
    return data;
  }
  if (rank) {
    return rankData(data, query, filter);
  }
  const result = [];
  let separator;
  const keep = (entry) => {
    if (separator && result.length) {
      result.push(separator);
    }
    separator = void 0;
    result.push(entry);
  };
  for (const entry of data) {
    if (isSeparator(entry)) {
      separator = entry;
      continue;
    }
    if (isGroup(entry)) {
      const items = entry.items.filter(
        (child) => itemMatches(toListItem(child), query, filter)
      );
      if (items.length) {
        keep({ ...entry, items });
      }
      continue;
    }
    if (itemMatches(toListItem(entry), query, filter)) {
      keep(entry);
    }
  }
  return result;
}
var byScore = (a, b) => b.score - a.score;
function rankData(data, query, filter) {
  const ranked = [];
  let separator;
  const keep = (entry, score) => {
    ranked.push({
      entry,
      score,
      separator: ranked.length ? separator : void 0
    });
    separator = void 0;
  };
  for (const entry of data) {
    if (isSeparator(entry)) {
      separator = entry;
      continue;
    }
    if (isGroup(entry)) {
      const items = [];
      for (const child of entry.items) {
        const score2 = itemScore(toListItem(child), query, filter);
        if (score2 > 0) {
          items.push({ entry: child, score: score2 });
        }
      }
      if (!items.length) {
        continue;
      }
      items.sort(byScore);
      keep(
        {
          ...entry,
          items: items.map((item) => item.entry)
        },
        items[0].score
      );
      continue;
    }
    const score = itemScore(toListItem(entry), query, filter);
    if (score > 0) {
      keep(entry, score);
    }
  }
  const sorted = [...ranked].sort(byScore);
  if (sorted.some((item, index) => item !== ranked[index])) {
    return sorted.map((item) => item.entry);
  }
  return ranked.flatMap(
    (item) => item.separator ? [item.separator, item.entry] : [item.entry]
  );
}
var filtering = { data: filterData, matches: itemMatches };
function createFilteredListbox(config) {
  return createListboxEngine(config, filtering);
}
function filterAttribute(modes, fallback) {
  return (attribute) => {
    if (attribute === null) {
      return void 0;
    }
    if (attribute === "false") {
      return false;
    }
    return modes.includes(attribute) ? attribute : fallback;
  };
}
export {
  createFilteredListbox,
  filterAttribute,
  filterData,
  flattenData,
  highlightFromCode,
  highlightable,
  highlightedValue,
  itemKey,
  itemMatches,
  revealInList,
  textMatches,
  toListItem2 as toListItem
};
