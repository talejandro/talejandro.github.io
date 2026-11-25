// src/components/trigger-menu/trigger-menu-select.ts
import { createDetails } from "../../foundation/kernel/details.js";
import { changeSource } from "../../foundation/kernel/input-source.js";
import { toListItem } from "../../foundation/lists/listbox.js";
import { isPromise } from "../../foundation/kernel/action.js";
import {
  argumentOf
} from "./trigger-menu-levels.js";
function itemsByKey(data, toKey) {
  const map = /* @__PURE__ */ new Map();
  const visit = (list) => {
    for (const entry of list) {
      if (typeof entry === "object" && "type" in entry) {
        if (entry.type === "group") {
          visit(entry.items);
        }
        continue;
      }
      const item = toListItem(
        entry
      );
      map.set(toKey(item.value), item);
    }
  };
  if (data) {
    visit(data);
  }
  return map;
}
function defaultInsert(item, level, rule, tokens, toKey) {
  const values = Object.values(level.values);
  const trigger = level.continued ? "" : level.match.trigger;
  if (!tokens) {
    return `${[`${trigger}${item.label}`, ...values].join(" ")} `;
  }
  return {
    type: rule.type ?? "mention",
    value: toKey(item.value),
    label: [item.label, ...values].join(" "),
    data: { trigger, ...values.length ? { arguments: level.values } : {} }
  };
}
function createTriggerSelect({
  levels,
  editor,
  options,
  items,
  find,
  highlighted,
  itemProps,
  toKey,
  waiting
}) {
  let writing = false;
  let byKey = itemsByKey(void 0, toKey);
  let byKeyData;
  function itemFor(key) {
    const data = items();
    if (data !== byKeyData) {
      byKeyData = data;
      byKey = itemsByKey(data, toKey);
    }
    const fromData = byKey.get(key);
    if (fromData) {
      return fromData;
    }
    const entry = find(key);
    if (!entry) {
      return void 0;
    }
    const props = itemProps(key);
    const onSelect = props && "onSelect" in props ? props.onSelect : void 0;
    const composed = {
      value: entry.value,
      label: entry.label,
      keywords: entry.keywords,
      disabled: entry.disabled,
      onSelect
    };
    return composed;
  }
  function write(range, content, pending) {
    const target = editor();
    if (!target) {
      return;
    }
    writing = true;
    try {
      target.replace(range, content, pending ? { pending } : void 0);
    } finally {
      writing = false;
    }
  }
  function choose(key, event, { tab = false } = {}) {
    const level = levels.current();
    if (!level) {
      return;
    }
    if (level.item) {
      return accept(event, { tab });
    }
    const item = itemFor(key);
    const at = levels.caret();
    if (!item || item.disabled || at === null) {
      return;
    }
    if (!item.arguments?.length) {
      return complete(item, level, at, event, { tab });
    }
    const text = `${level.match.trigger}${item.label} `;
    write({ start: level.match.start, end: at }, text);
    const start = level.match.start + text.length;
    levels.enter(
      {
        ...level,
        item,
        starts: [start],
        values: {},
        queryStart: start,
        match: { ...level.match, end: start }
      },
      "",
      "item-press",
      "item-press",
      event
    );
  }
  function accept(event, { tab = false } = {}) {
    const level = levels.current();
    const argument = argumentOf(level);
    const at = levels.caret();
    if (!argument || at === null) {
      return;
    }
    const query = (levels.textFrom(level.queryStart) ?? "").trim();
    const key = highlighted();
    const chosen = key !== null ? itemFor(key) : void 0;
    const value = chosen ? toKey(chosen.value) : argument.allowCustomValue !== false ? query : "";
    if (!value && argument.required) {
      return;
    }
    const values = {
      ...level.values,
      ...value ? { [argument.name]: value } : {}
    };
    const label = chosen ? chosen.label : query;
    const index = level.starts.length - 1;
    const rest = level.item.arguments.slice(index + 1);
    const finish = !rest.length || !tab && rest.every((next2) => !next2.required);
    const text = label ? `${label} ` : "";
    if (text) {
      write({ start: level.queryStart, end: at }, text);
    }
    const next = level.queryStart + text.length;
    if (finish) {
      return complete(level.item, { ...level, values }, next, event, { tab });
    }
    levels.enter(
      {
        ...level,
        values,
        starts: [...level.starts, next],
        queryStart: next,
        match: { ...level.match, end: next }
      },
      "",
      "item-press",
      "item-press",
      event
    );
  }
  function complete(item, level, at, event, { tab = false } = {}) {
    const rule = options().triggers[level.rule];
    const range = { start: level.match.start, end: at };
    const match = {
      ...level.match,
      end: at,
      query: level.continued ? levels.textFrom(level.queryStart) ?? "" : level.match.query
    };
    let prevented = false;
    let inserted = false;
    let waited;
    const details = createDetails(
      {
        reason: "item-press",
        event,
        trigger: level.match.trigger,
        match,
        item,
        arguments: level.values,
        insert(content) {
          inserted = true;
          write(range, content);
        },
        waitUntil: (promise) => waited = promise,
        preventDefault: () => prevented = true
      },
      changeSource("item-press", event)
    );
    Object.defineProperty(details, "defaultPrevented", {
      get: () => prevented || inserted || details.canceled
    });
    const selectDetails = details;
    const results = [
      item.onSelect?.(item.value, selectDetails),
      options().onSelect?.(item.value, selectDetails)
    ];
    const pending = results.find(isPromise) ?? waited;
    if (pending) {
      waiting(pending);
    }
    if (!selectDetails.defaultPrevented) {
      const content = rule.insert?.(item, {
        match,
        arguments: level.values
      }) ?? defaultInsert(item, level, rule, !!editor()?.tokens, toKey);
      write(range, content, typeof content === "string" ? void 0 : pending);
    }
    const after = item.after ?? "compose";
    if (after === "continue") {
      const start = levels.caret() ?? at;
      return levels.enter(
        {
          rule: level.rule,
          match: { trigger: level.match.trigger, start, end: start, query: "" },
          queryStart: start,
          starts: [],
          values: {},
          continued: true
        },
        "",
        "item-press",
        "item-press",
        event
      );
    }
    levels.end("item-press", event);
    if (after === "submit" && !tab) {
      editor()?.submit?.(event);
    }
  }
  return { choose, accept, write, isWriting: () => writing };
}
export {
  createTriggerSelect
};
