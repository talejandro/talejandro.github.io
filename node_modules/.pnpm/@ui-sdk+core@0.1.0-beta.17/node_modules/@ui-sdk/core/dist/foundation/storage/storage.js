// src/foundation/storage/storage.ts
import { isBrowser } from "../platform/env.js";
var readSaved = `function(k,i){var c=window.__uiSdkStorage||(window.__uiSdkStorage={}),n=k+":"+i;if(!(n in c)){var s=null;try{if(k==="cookie"){var m=("; "+document.cookie).split("; "+encodeURIComponent(i)+"=");if(m.length>1)s=decodeURIComponent(m[1].split(";")[0])}else s=(k==="local"?localStorage:sessionStorage).getItem(i)}catch(e){}c[n]=s}return c[n]}`;
var seed = `function(k,i,a,v){try{var s=(${readSaved})(k,i),t=document.currentScript,r=t&&t.previousElementSibling;if(r&&s!==null&&v.indexOf(s)>-1)r.setAttribute(a,s)}catch(e){}}`;
var literal = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
var listenersByKey = /* @__PURE__ */ new Map();
var listenersOf = (kind, id) => {
  const key = `${kind}:${id}`;
  let listeners = listenersByKey.get(key);
  if (!listeners) {
    listenersByKey.set(key, listeners = /* @__PURE__ */ new Set());
  }
  return listeners;
};
var writable = /* @__PURE__ */ new WeakSet();
function areaOf(kind) {
  if (!isBrowser) {
    return;
  }
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return;
  }
}
function canWrite(area) {
  if (writable.has(area)) {
    return true;
  }
  try {
    const probe = "__ui-sdk-storage__";
    area.setItem(probe, probe);
    area.removeItem(probe);
    writable.add(area);
    return true;
  } catch {
    return false;
  }
}
function checkId(id) {
  if (typeof id !== "string" || id === "") {
    throw new Error(
      'A storage needs an ID, like createLocalStorage("color-scheme").'
    );
  }
}
function createStorage(kind, id, area) {
  checkId(id);
  const listeners = listenersOf(kind, id);
  const storageKind = kind;
  const save = (value) => {
    if (!area.write(value)) {
      return false;
    }
    for (const listener of [...listeners]) {
      listener(value);
    }
    return true;
  };
  return {
    /** The ID the value is kept under: the localStorage or sessionStorage key, or the cookie's name. */
    id,
    /** Where the value is kept: `"local"`, `"session"` or `"cookie"`. */
    kind: storageKind,
    /** Whether the server reads the value too, so it renders right from the first render. True for cookies. */
    readsOnServer: area.readsOnServer,
    /**
     * The inline script a component renders right after its root, which puts
     * the saved value on the root before hydration, so CSS shows it on the
     * first paint. Undefined for a cookie, since the server renders its value.
     */
    script: (options) => area.script?.(options),
    /**
     * Whether storage appears available. A later write can still fail.
     * On the server, a cookie with a request header is available for reading only.
     */
    available: area.available,
    /** The value kept under the ID, or null when nothing is, or the storage is unavailable. */
    get: area.read,
    /**
     * Saves a value under the ID. Returns false when writing is unavailable or
     * the browser reports a write failure. For cookies, true means the assignment
     * didn't throw; it doesn't confirm the cookie was saved.
     */
    set: (value) => save(value),
    /**
     * Removes the value. Returns false when writing is unavailable or the
     * browser reports a write failure. For cookies, true means the assignment
     * didn't throw; it doesn't confirm the cookie was removed.
     */
    remove: () => save(null),
    /**
     * Hears the value change, through another storage with the same ID on the
     * page or in another tab. Returns the function that stops it.
     */
    subscribe(listener) {
      const entry = (value) => listener(value);
      listeners.add(entry);
      const unwatch = area.watch(() => listener(area.read()));
      return () => {
        listeners.delete(entry);
        unwatch();
      };
    }
  };
}
function createAreaStorage(kind, id) {
  return createStorage(kind, id, {
    readsOnServer: false,
    script: ({ attribute, values }) => {
      if (!/^data-[a-z0-9-]+$/.test(attribute)) {
        throw new Error(
          `A storage script only sets data-* attributes, not "${attribute}".`
        );
      }
      return `(${seed})(${[kind, id, attribute, values].map(literal).join(",")})`;
    },
    available: () => {
      const area = areaOf(kind);
      return Boolean(area && canWrite(area));
    },
    read: () => {
      try {
        return areaOf(kind)?.getItem(id) ?? null;
      } catch {
        return null;
      }
    },
    write: (value) => {
      const area = areaOf(kind);
      if (!area) {
        return false;
      }
      try {
        if (value === null) {
          area.removeItem(id);
        } else {
          area.setItem(id, value);
        }
        return true;
      } catch {
        return false;
      }
    },
    watch: (heard) => {
      if (!isBrowser) {
        return () => {
        };
      }
      const onStorage = (event) => {
        if (event.key !== id && event.key !== null) {
          return;
        }
        if (event.storageArea !== areaOf(kind)) {
          return;
        }
        heard();
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  });
}
function createLocalStorage(id) {
  return createAreaStorage("local", id);
}
function createSessionStorage(id) {
  return createAreaStorage("session", id);
}
var cookieValue = (header, name) => {
  if (!header) {
    return null;
  }
  for (const pair of header.split(";")) {
    const at = pair.indexOf("=");
    if (at < 0 || pair.slice(0, at).trim() !== name) {
      continue;
    }
    try {
      return decodeURIComponent(pair.slice(at + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
};
var cookiesEnabled = () => {
  try {
    return isBrowser && navigator.cookieEnabled !== false && typeof document.cookie === "string";
  } catch {
    return false;
  }
};
function createCookieStorage(id, options = {}) {
  const name = encodeURIComponent(id);
  return createStorage("cookie", id, {
    readsOnServer: true,
    available: () => isBrowser ? cookiesEnabled() : options.cookie != null,
    read: () => {
      if (!isBrowser) {
        return cookieValue(options.cookie, name);
      }
      try {
        return cookieValue(document.cookie, name);
      } catch {
        return null;
      }
    },
    write: (value) => {
      if (!cookiesEnabled()) {
        return false;
      }
      const secure = options.secure ?? location.protocol === "https:";
      const parts = [
        `${name}=${value === null ? "" : encodeURIComponent(value)}`,
        `path=${options.path ?? "/"}`,
        `max-age=${value === null ? 0 : options.maxAge ?? 31536e3}`,
        `samesite=${options.sameSite ?? "lax"}`
      ];
      if (options.domain) {
        parts.push(`domain=${options.domain}`);
      }
      if (secure) {
        parts.push("secure");
      }
      try {
        document.cookie = parts.join("; ");
        return true;
      } catch {
        return false;
      }
    },
    watch: (heard) => {
      const store = isBrowser ? window.cookieStore : void 0;
      if (!store) {
        return () => {
        };
      }
      const onChange = (event) => {
        const { changed = [], deleted = [] } = event;
        if ([...changed, ...deleted].some((cookie) => cookie.name === name)) {
          heard();
        }
      };
      store.addEventListener("change", onChange);
      return () => store.removeEventListener("change", onChange);
    }
  });
}
export {
  createCookieStorage,
  createLocalStorage,
  createSessionStorage,
  literal,
  readSaved
};
