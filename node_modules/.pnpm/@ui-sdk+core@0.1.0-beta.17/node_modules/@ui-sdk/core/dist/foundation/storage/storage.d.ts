/**
 * Options for `createCookieStorage`.
 * @experimental
 */
type CookieStorageOptions = {
    /** The request's `Cookie` header, so the server reads the same value the browser will. */
    cookie?: string | null;
    /**
     * How long the cookie lasts, in seconds.
     * @defaultValue 31536000
     */
    maxAge?: number;
    /**
     * The paths that send the cookie.
     * @defaultValue "/"
     */
    path?: string;
    /** The domain that sends the cookie. Defaults to the page's host. */
    domain?: string;
    /**
     * Whether other sites' requests send the cookie.
     * @defaultValue "lax"
     */
    sameSite?: "strict" | "lax" | "none";
    /** Whether only HTTPS requests send the cookie. Defaults to true on HTTPS pages. */
    secure?: boolean;
};
/**
 * What `script` puts on the component's root.
 * @experimental
 */
type StorageScriptOptions = {
    /** The attribute that shows the value, which has to start with `data-`, like `"data-color-scheme"`. */
    attribute: `data-${string}`;
    /** The values it may show. Anything else saved under the ID leaves the root as the server rendered it. */
    values: readonly string[];
};
type Kind = "local" | "session" | "cookie";
declare const readSaved = "function(k,i){var c=window.__uiSdkStorage||(window.__uiSdkStorage={}),n=k+\":\"+i;if(!(n in c)){var s=null;try{if(k===\"cookie\"){var m=(\"; \"+document.cookie).split(\"; \"+encodeURIComponent(i)+\"=\");if(m.length>1)s=decodeURIComponent(m[1].split(\";\")[0])}else s=(k===\"local\"?localStorage:sessionStorage).getItem(i)}catch(e){}c[n]=s}return c[n]}";
declare const literal: (value: unknown) => string;
/**
 * A value kept in localStorage under `id`, which lasts until it's removed and
 * reaches every tab on the site. The server can't read it.
 * @experimental
 */
declare function createLocalStorage(id: string): {
    /** The ID the value is kept under: the localStorage or sessionStorage key, or the cookie's name. */
    id: string;
    /** Where the value is kept: `"local"`, `"session"` or `"cookie"`. */
    kind: Kind;
    /** Whether the server reads the value too, so it renders right from the first render. True for cookies. */
    readsOnServer: boolean;
    /**
     * The inline script a component renders right after its root, which puts
     * the saved value on the root before hydration, so CSS shows it on the
     * first paint. Undefined for a cookie, since the server renders its value.
     */
    script: (options: StorageScriptOptions) => string | undefined;
    /**
     * Whether storage appears available. A later write can still fail.
     * On the server, a cookie with a request header is available for reading only.
     */
    available: () => boolean;
    /** The value kept under the ID, or null when nothing is, or the storage is unavailable. */
    get: () => string | null;
    /**
     * Saves a value under the ID. Returns false when writing is unavailable or
     * the browser reports a write failure. For cookies, true means the assignment
     * didn't throw; it doesn't confirm the cookie was saved.
     */
    set: (value: string) => boolean;
    /**
     * Removes the value. Returns false when writing is unavailable or the
     * browser reports a write failure. For cookies, true means the assignment
     * didn't throw; it doesn't confirm the cookie was removed.
     */
    remove: () => boolean;
    /**
     * Hears the value change, through another storage with the same ID on the
     * page or in another tab. Returns the function that stops it.
     */
    subscribe(listener: (value: string | null) => void): () => void;
};
/**
 * A value kept in sessionStorage under `id`, which lasts while the tab is
 * open and stays in that tab. The server can't read it.
 * @experimental
 */
declare function createSessionStorage(id: string): {
    /** The ID the value is kept under: the localStorage or sessionStorage key, or the cookie's name. */
    id: string;
    /** Where the value is kept: `"local"`, `"session"` or `"cookie"`. */
    kind: Kind;
    /** Whether the server reads the value too, so it renders right from the first render. True for cookies. */
    readsOnServer: boolean;
    /**
     * The inline script a component renders right after its root, which puts
     * the saved value on the root before hydration, so CSS shows it on the
     * first paint. Undefined for a cookie, since the server renders its value.
     */
    script: (options: StorageScriptOptions) => string | undefined;
    /**
     * Whether storage appears available. A later write can still fail.
     * On the server, a cookie with a request header is available for reading only.
     */
    available: () => boolean;
    /** The value kept under the ID, or null when nothing is, or the storage is unavailable. */
    get: () => string | null;
    /**
     * Saves a value under the ID. Returns false when writing is unavailable or
     * the browser reports a write failure. For cookies, true means the assignment
     * didn't throw; it doesn't confirm the cookie was saved.
     */
    set: (value: string) => boolean;
    /**
     * Removes the value. Returns false when writing is unavailable or the
     * browser reports a write failure. For cookies, true means the assignment
     * didn't throw; it doesn't confirm the cookie was removed.
     */
    remove: () => boolean;
    /**
     * Hears the value change, through another storage with the same ID on the
     * page or in another tab. Returns the function that stops it.
     */
    subscribe(listener: (value: string | null) => void): () => void;
};
/**
 * A value kept in a cookie named `id`, which the server reads from the
 * request's `Cookie` header, so the value renders right from the first render.
 * @experimental
 */
declare function createCookieStorage(id: string, options?: CookieStorageOptions): {
    /** The ID the value is kept under: the localStorage or sessionStorage key, or the cookie's name. */
    id: string;
    /** Where the value is kept: `"local"`, `"session"` or `"cookie"`. */
    kind: Kind;
    /** Whether the server reads the value too, so it renders right from the first render. True for cookies. */
    readsOnServer: boolean;
    /**
     * The inline script a component renders right after its root, which puts
     * the saved value on the root before hydration, so CSS shows it on the
     * first paint. Undefined for a cookie, since the server renders its value.
     */
    script: (options: StorageScriptOptions) => string | undefined;
    /**
     * Whether storage appears available. A later write can still fail.
     * On the server, a cookie with a request header is available for reading only.
     */
    available: () => boolean;
    /** The value kept under the ID, or null when nothing is, or the storage is unavailable. */
    get: () => string | null;
    /**
     * Saves a value under the ID. Returns false when writing is unavailable or
     * the browser reports a write failure. For cookies, true means the assignment
     * didn't throw; it doesn't confirm the cookie was saved.
     */
    set: (value: string) => boolean;
    /**
     * Removes the value. Returns false when writing is unavailable or the
     * browser reports a write failure. For cookies, true means the assignment
     * didn't throw; it doesn't confirm the cookie was removed.
     */
    remove: () => boolean;
    /**
     * Hears the value change, through another storage with the same ID on the
     * page or in another tab. Returns the function that stops it.
     */
    subscribe(listener: (value: string | null) => void): () => void;
};
/**
 * A value kept under an ID, from `createLocalStorage`, `createSessionStorage`
 * or `createCookieStorage`. Pass one to anything that saves a value, like
 * `createColorScheme`'s `storage`.
 * @experimental
 */
type ValueStorage = ReturnType<typeof createLocalStorage>;
export { literal, readSaved, type CookieStorageOptions, type StorageScriptOptions, type ValueStorage, createCookieStorage, createLocalStorage, createSessionStorage, };
