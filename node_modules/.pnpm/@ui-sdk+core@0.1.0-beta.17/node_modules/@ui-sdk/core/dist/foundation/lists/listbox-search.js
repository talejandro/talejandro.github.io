// src/foundation/lists/listbox-search.ts
import { announce } from "../platform/announce.js";
import { sourceOf } from "../kernel/modality.js";
import { trusted } from "../kernel/trusted.js";
import "./listbox.js";
import { matchRanges, matchSegments } from "../text/match.js";
function describeList(change) {
  if (change.type === "removed") {
    return `${change.label} removed`;
  }
  if (change.loading) {
    return "Loading";
  }
  if (!change.count) {
    return "No results";
  }
  return change.count === 1 ? "1 result" : `${change.count} results`;
}
function matchMode(filter) {
  return filter === "contains" || filter === "startsWith" || filter === "fuzzy" ? filter : void 0;
}
var unmatched = (text) => ({
  segments: [{ text, match: false }],
  matched: false
});
function itemTextPart() {
  const memo = /* @__PURE__ */ new WeakMap();
  const stateOf = (api, key, text) => {
    const { matchQuery, matchMode: mode } = api.internal;
    const query = mode() ? matchQuery() : "";
    let cache = memo.get(api);
    if (!cache) {
      memo.set(api, cache = /* @__PURE__ */ new Map());
    }
    const last = cache.get(key);
    if (last && last.text === text && last.query === query) {
      return last.state;
    }
    const ranges = query.trim() ? matchRanges(text, query, mode()) : [];
    const state = ranges.length ? { segments: matchSegments(text, ranges), matched: true } : last && !last.state.matched && last.text === text ? last.state : unmatched(text);
    cache.set(key, { text, query, state });
    return state;
  };
  return {
    // Internal: passed by renderers. Its id is made for it.
    props: { text: "string", write: "boolean", id: "id" },
    state: (state, { api, key, props }) => stateOf(api, key, props.text),
    attrs: (state, { api, key, props }) => ({
      "data-matched": stateOf(api, key, props.text).matched ? "" : void 0
    }),
    bind(el, { api, key, props, store }) {
      if (!props.write) {
        return;
      }
      let written;
      const write = () => {
        const next = stateOf(api, key, props.text);
        if (next === written) {
          return;
        }
        written = next;
        el.replaceChildren(
          ...next.segments.map(({ text, match }) => {
            if (!match) {
              return text;
            }
            const mark = el.ownerDocument.createElement("mark");
            mark.textContent = text;
            return mark;
          })
        );
      };
      write();
      const unsubscribe = store.subscribe(write);
      return () => {
        unsubscribe();
        el.textContent = props.text;
      };
    }
  };
}
var opensIntoList = (event) => !!event && trusted(event) && sourceOf(event) === "virtual";
var ANNOUNCE_DELAY = 500;
function announceResults({
  store,
  query,
  count,
  loading,
  shown,
  silent,
  announcement
}) {
  let timer;
  let previousQuery = query();
  let previousLoading = loading();
  let waiting = false;
  const say = () => {
    timer = void 0;
    if (!shown() || silent() || !query().trim()) {
      return;
    }
    const change = {
      type: "results",
      count: count(),
      query: query(),
      loading: loading()
    };
    const message = (announcement() ?? describeList)(change);
    if (message) {
      announce(message);
    }
    waiting = change.loading;
  };
  store.subscribe(() => {
    const next = query();
    const nowLoading = loading();
    const typed = next !== previousQuery;
    const arrived = previousLoading && !nowLoading && waiting;
    previousQuery = next;
    previousLoading = nowLoading;
    if (!typed && !arrived) {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(say, ANNOUNCE_DELAY);
  });
}
function createLoadMore({
  count,
  status,
  onLoadMore
}) {
  let requestedAt = -1;
  function reached() {
    const load = onLoadMore();
    const current = status();
    if (!load || current === "loading") {
      return;
    }
    if (count() === requestedAt && current !== "error") {
      return;
    }
    requestedAt = count();
    load();
  }
  function bind(el) {
    const onScroll = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 40) {
        reached();
      }
    };
    el.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => el.removeEventListener("scroll", onScroll, { capture: true });
  }
  return { reached, bind };
}
export {
  announceResults,
  createLoadMore,
  describeList,
  itemTextPart,
  matchMode,
  opensIntoList
};
