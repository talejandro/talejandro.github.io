// src/components/trigger-menu/trigger-menu-levels.ts
import {
  findTriggerMatch,
  isValidQuery,
  lookBehind,
  mapDismissed
} from "./trigger-match.js";
var argumentOf = (level) => level?.item?.arguments?.[level.starts.length - 1];
var triggerLevel = (found) => ({
  rule: found.rule,
  match: found.match,
  queryStart: found.match.start + found.match.trigger.length,
  starts: [],
  values: {}
});
function createTriggerLevels({
  editor,
  rules,
  isWriting,
  apply,
  close
}) {
  let current = null;
  let dismissed = [];
  function caret() {
    const selection = editor()?.selection();
    return selection && selection.start === selection.end ? selection.end : null;
  }
  function textFrom(start) {
    const at = caret();
    if (at === null || at < start) {
      return null;
    }
    const before = editor()?.textBefore(at - start);
    return before && before.offset === start ? before.text : null;
  }
  function matchAtCaret() {
    if (caret() === null) {
      return null;
    }
    const before = editor()?.textBefore(lookBehind(rules()));
    return before ? findTriggerMatch(before.text, before.offset, rules()) : null;
  }
  function enter(level, query, reason, open, event) {
    current = level;
    apply(level, query, reason, open, event);
  }
  function end(reason, event, { dismiss = false } = {}) {
    const level = current;
    if (dismiss && level && !level.continued) {
      const at = caret() ?? level.match.end;
      dismissed.push({
        trigger: level.match.trigger,
        start: level.match.start,
        end: Math.max(at, level.match.end)
      });
    }
    current = null;
    close(reason, event);
  }
  function reopen(reason, event) {
    const found = matchAtCaret();
    if (!found) {
      return false;
    }
    dismissed = dismissed.filter((entry) => entry.start !== found.match.start);
    enter(
      triggerLevel(found),
      found.match.query,
      reason === "shortcut" ? "input-change" : "imperative",
      reason,
      event
    );
    return true;
  }
  function onInput(change) {
    dismissed = dismissed.flatMap(
      (entry) => mapDismissed(entry, change.range, change.inserted.length) ?? []
    );
    if (isWriting() || editor()?.composing()) {
      return;
    }
    if (current?.item || current?.continued) {
      return followLevel(change.user);
    }
    const found = matchAtCaret();
    const isDismissed = !!found && dismissed.some(
      (entry) => entry.start === found.match.start && entry.trigger === found.match.trigger
    );
    const editEnd = change.range.start + change.inserted.length;
    const touched = !!found && change.range.start <= found.match.end && editEnd >= found.match.start;
    const same = !!found && current?.match.start === found.match.start && current.match.trigger === found.match.trigger;
    if (!found || isDismissed || !same && !(change.user && touched)) {
      if (current) {
        end("input-change");
      }
      return;
    }
    enter(
      triggerLevel(found),
      found.match.query,
      "input-change",
      "input-change"
    );
  }
  function followLevel(user) {
    const level = current;
    const at = caret();
    if (at === null) {
      return end("input-change");
    }
    if (at < level.queryStart) {
      return user ? stepBack() : end("input-change");
    }
    const query = textFrom(level.queryStart) ?? "";
    if (query.includes("\n") || level.continued && !isValidQuery(query, rules()[level.rule])) {
      return end("input-change");
    }
    enter(
      { ...level, match: { ...level.match, end: at } },
      query,
      "input-change",
      "input-change"
    );
  }
  function stepBack() {
    const level = current;
    if (level.continued) {
      return end("input-change");
    }
    if (level.starts.length > 1) {
      const starts = level.starts.slice(0, -1);
      const values = { ...level.values };
      delete values[level.item.arguments[starts.length - 1].name];
      const queryStart = starts.at(-1);
      return enter(
        { ...level, starts, values, queryStart },
        textFrom(queryStart) ?? "",
        "input-change",
        "input-change"
      );
    }
    current = null;
    const found = matchAtCaret();
    if (!found) {
      return end("input-change");
    }
    enter(
      triggerLevel(found),
      found.match.query,
      "input-change",
      "input-change"
    );
  }
  function onSelection() {
    if (!current || isWriting()) {
      return;
    }
    const at = caret();
    if (at === null || at < current.queryStart) {
      return end("caret-move");
    }
    if (current.item || current.continued) {
      return;
    }
    if (matchAtCaret()?.match.start !== current.match.start) {
      end("caret-move");
    }
  }
  return {
    current: () => current,
    caret,
    textFrom,
    matchAtCaret,
    enter,
    end,
    reopen,
    onEditorChange(change) {
      if (change.type === "input") {
        onInput(change);
      } else if (change.type === "selection") {
        onSelection();
      }
    }
  };
}
export {
  argumentOf,
  createTriggerLevels
};
