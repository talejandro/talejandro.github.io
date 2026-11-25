// src/components/trigger-menu/trigger-match.ts
var defaultPattern = /[\p{L}\p{N}\p{M}_\-.]/u;
var defaultMaxLength = 50;
var fullWidth = {
  "\uFF20": "@",
  "\uFF03": "#",
  "\uFF0F": "/",
  "\uFF0B": "+",
  "\uFF1A": ":",
  "\uFF3B": "["
};
var fullWidthPattern = /[＠＃／＋：［]/g;
function normalizeTriggerText(text) {
  return text.replace(fullWidthPattern, (char) => fullWidth[char]);
}
var openers = /* @__PURE__ */ new Set(["(", "[", "{", '"', "'", "\uFFFC"]);
var stateless = /* @__PURE__ */ new WeakMap();
function characterPattern(pattern) {
  if (!pattern.global && !pattern.sticky) {
    return pattern;
  }
  let copy = stateless.get(pattern);
  if (!copy) {
    stateless.set(
      pattern,
      copy = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ""))
    );
  }
  return copy;
}
function isValidQuery(query, rule) {
  if (query.length > (rule.maxLength ?? defaultMaxLength)) {
    return false;
  }
  if (/^\s/.test(query) || query.includes("\n")) {
    return false;
  }
  const pattern = characterPattern(rule.pattern ?? defaultPattern);
  const spaces = rule.spaces ?? false;
  let words = 1;
  let previous = "";
  for (const char of query) {
    if (char === " ") {
      if (!spaces || previous === " ") {
        return false;
      }
      words++;
    } else if (!pattern.test(char)) {
      return false;
    }
    previous = char;
  }
  return typeof spaces !== "number" || words - (previous === " " ? 1 : 0) <= spaces;
}
function isAtBoundary(text, index, offset, boundary) {
  const absolute = offset + index;
  if (boundary === "anywhere" || absolute === 0) {
    return true;
  }
  if (boundary === "start") {
    return false;
  }
  if (index === 0) {
    return false;
  }
  const before = text[index - 1];
  if (boundary === "line") {
    return before === "\n";
  }
  return /\s/.test(before) || openers.has(before);
}
function lookBehind(rules) {
  let longest = 0;
  for (const rule of rules) {
    longest = Math.max(
      longest,
      (rule.maxLength ?? defaultMaxLength) + rule.char.length
    );
  }
  return longest + 1;
}
function findTriggerMatch(text, offset, rules) {
  if (!rules.length) {
    return null;
  }
  const source = normalizeTriggerText(text);
  const caret = source.length;
  const limit = lookBehind(rules);
  for (let index = caret - 1; index >= 0 && caret - index <= limit; index--) {
    for (let rule = 0; rule < rules.length; rule++) {
      const { char: char2, boundary = "word" } = rules[rule];
      if (!char2 || !source.startsWith(char2, index)) {
        continue;
      }
      const query = text.slice(index + char2.length);
      if (isValidQuery(normalizeTriggerText(query), rules[rule]) && isAtBoundary(source, index, offset, boundary)) {
        return {
          rule,
          match: {
            trigger: char2,
            start: offset + index,
            end: offset + caret,
            query
          }
        };
      }
    }
    const char = source[index];
    const continues = rules.some(
      (rule) => rule.char.includes(char) || char === " " && !!rule.spaces || characterPattern(rule.pattern ?? defaultPattern).test(char)
    );
    if (!continues) {
      break;
    }
  }
  return null;
}
function mapDismissed(dismissed, range, inserted) {
  const delta = inserted - (range.end - range.start);
  const triggerEnd = dismissed.start + dismissed.trigger.length;
  if (range.end <= dismissed.start) {
    return {
      ...dismissed,
      start: dismissed.start + delta,
      end: dismissed.end + delta
    };
  }
  if (range.start < triggerEnd) {
    return null;
  }
  if (range.start <= dismissed.end) {
    return { ...dismissed, end: Math.max(triggerEnd, dismissed.end + delta) };
  }
  return dismissed;
}
export {
  findTriggerMatch,
  isAtBoundary,
  isValidQuery,
  lookBehind,
  mapDismissed,
  normalizeTriggerText
};
