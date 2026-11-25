// src/page/history/history.ts
import { sameValue } from "../../foundation/kernel/store.js";
import { guardedActions } from "../agent/guard.js";
import { observe } from "../observe/observe.js";
import { entries as registered, setterOf } from "../observe/registry.js";
import { stageChanges } from "./stage.js";
var idOf = (change) => `${change.ref}:${change.key}`;
var current = ({ ref, key }) => registered.get(ref)?.instance.deref()?.get()?.[key];
var round = (value) => typeof value === "number" ? Math.round(value * 100) / 100 : value && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(
  Object.entries(value).map(([key, inner]) => [key, round(inner)])
) : value;
var same = (a, b) => sameValue(a, b) || JSON.stringify(a) === JSON.stringify(b);
var show = (value) => Array.isArray(value) ? value.join(", ") || "none" : typeof value === "object" && value ? JSON.stringify(round(value)).replace(/"/g, "") : String(round(value));
function describeEntry(entry) {
  return `${entry.source === "agent" ? "Agent" : "You"} set ${entry.label} to ${show(entry.value)}`;
}
function valueAt(entries, position, id) {
  let value;
  let seen = false;
  for (const [index, entry] of entries.entries()) {
    if (idOf(entry) !== id) {
      continue;
    }
    if (!seen) {
      value = entry.previous;
    }
    seen = true;
    if (index >= position) {
      break;
    }
    if (!entry.reverted) {
      value = entry.value;
    }
  }
  return value;
}
function createHistory(agent, options = {}) {
  const act = guardedActions.get(agent.act);
  if (!act) {
    throw new Error(
      "createHistory requires an agent with the original act method returned by createAgent."
    );
  }
  const keys = options.keys ?? ["value", "checked", "pressed"];
  let entries = [];
  let position = 0;
  let count = 0;
  let restoring = /* @__PURE__ */ new Set();
  const listeners = /* @__PURE__ */ new Set();
  const emit = () => listeners.forEach((listener) => listener());
  const update = (next, at) => {
    entries = next;
    position = at;
    emit();
  };
  const heard = (observed) => {
    if (!keys.includes(observed.key)) {
      return;
    }
    const id = idOf(observed);
    if (observed.source === "agent" && restoring.has(id)) {
      return;
    }
    restoring.delete(id);
    const entry = {
      id: `e${++count}`,
      ref: observed.ref,
      label: observed.label ?? observed.component,
      key: observed.key,
      value: observed.value,
      previous: observed.previous,
      source: observed.source,
      reason: observed.reason
    };
    if (registered.get(observed.ref)?.secret) {
      entry.redacted = true;
    }
    const kept = entries.slice(0, position);
    const last = kept[kept.length - 1];
    if (options.coalesce !== false && last && !last.reverted && last.ref === entry.ref && last.key === entry.key && last.source === entry.source && last.reason === entry.reason && entry.reason !== "item-press" && entry.reason !== "imperative") {
      return update(
        [...kept.slice(0, -1), { ...last, value: entry.value }],
        kept.length
      );
    }
    update([...kept, entry], kept.length + 1);
  };
  const stop = observe(heard, {
    within: options.within,
    live: options.coalesce === false
  });
  const restore = async (steps) => {
    restoring = new Set(steps.map(idOf));
    const stopGuard = observe(
      (change) => {
        if (change.source !== "agent") {
          restoring.delete(idOf(change));
        }
      },
      { within: options.within, live: true }
    );
    const redacted = new Set(
      entries.filter((entry) => entry.redacted).map(idOf)
    );
    const failed = [];
    try {
      for (const step of steps) {
        const done = step.value !== void 0 && !redacted.has(idOf(step)) && restoring.has(idOf(step)) && (await act(
          [
            {
              ref: step.ref,
              action: setterOf(step.key),
              args: [step.value]
            }
          ],
          () => restoring.has(idOf(step))
        )).ok && // A change callback or a controlled owner can refuse a write the agent still calls done.
        same(current(step), step.value);
        if (!done) {
          failed.push(step);
        }
      }
    } finally {
      stopGuard();
      restoring = /* @__PURE__ */ new Set();
    }
    return failed;
  };
  let turn = Promise.resolve();
  const inTurn = (run) => {
    const next = turn.then(run);
    turn = next.catch(() => {
    });
    return next;
  };
  return {
    /** Every entry, oldest first. */
    entries: () => entries,
    /** How many entries are applied: `entries().length` is now, 0 is the start. */
    position: () => position,
    /** Calls `listener` whenever the entries or the position change, until the returned function runs. */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /**
     * Puts the page back to how it was after `to` entries, or forward again,
     * and resolves with the changes it couldn't put back. When none went
     * back, the position stays where it was.
     */
    seek: (to) => inTurn(async () => {
      const target = Math.max(0, Math.min(entries.length, to));
      if (target === position) {
        return [];
      }
      const from = position;
      const before = entries;
      const touched = /* @__PURE__ */ new Map();
      for (const entry of entries.slice(
        Math.min(target, from),
        Math.max(target, from)
      )) {
        touched.set(idOf(entry), { ref: entry.ref, key: entry.key });
      }
      update(entries, target);
      const failed = await restore(
        [...touched].map(([id, step]) => ({
          ...step,
          value: valueAt(entries, target, id)
        }))
      );
      if (failed.length === touched.size && entries === before) {
        update(entries, from);
      }
      return failed;
    }),
    /**
     * Reverts every applied change one source made, like `"agent"`, keeps the
     * rest, and resolves with the changes it couldn't put back, whose entries
     * stay applied.
     */
    undoSource: (source) => inTurn(async () => {
      const undone = /* @__PURE__ */ new Set();
      const values = /* @__PURE__ */ new Map();
      entries.slice(0, position).forEach((entry) => {
        const id = idOf(entry);
        if (!values.has(id)) {
          values.set(id, entry.previous);
        }
        if (entry.reverted) {
          return;
        }
        if (entry.source === source) {
          undone.add(entry);
        } else {
          values.set(id, entry.value);
        }
      });
      const touched = new Set([...undone].map(idOf));
      if (!touched.size) {
        return [];
      }
      const failed = await restore(
        [...touched].map((id) => {
          const [ref, key] = id.split(":");
          return { ref, key, value: values.get(id) };
        })
      );
      const stayed = new Set(failed.map(idOf));
      update(
        entries.map(
          (entry) => undone.has(entry) && !stayed.has(idOf(entry)) ? { ...entry, reverted: true } : entry
        ),
        position
      );
      return failed;
    }),
    /** Forgets every entry, keeping the page as it is. */
    clear() {
      update([], 0);
    },
    /** Stops recording. */
    destroy() {
      stop();
      listeners.clear();
    }
  };
}
export {
  createHistory,
  describeEntry,
  stageChanges
};
