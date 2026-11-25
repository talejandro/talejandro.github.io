/**
 * What core reports to a devtools hook in development. Internal until the devtools ship.
 */
type DevEvent = {
    type: "instance";
    action: "create" | "destroy";
    component: string;
    id: string;
    /** The keys the instance controls through options, like `["open"]`. */
    controlled: string[];
} | {
    type: "change";
    component: string;
    id: string;
    key: string;
    value: unknown;
    reason: string;
    source: string;
    canceled: boolean;
    /** Whether the key is controlled, so the owner has to pass the value back. */
    controlled: boolean;
} | {
    type: "commit";
    component: string;
    id: string;
    key: string;
    value: unknown;
    reason: string;
    source: string;
} | {
    type: "layers";
    stack: {
        component: string;
        id: string;
        modal: boolean | "pointer";
        blocking: boolean;
        el?: Element;
    }[];
} | {
    type: "warn";
    message: string;
    component?: string;
    id?: string;
} | {
    /**
     * Options a framework handed over from an effect changed state its
     * parts hear, beside the keys it delivers itself, so the parts render
     * again inside that effect. Or what it read of them before, through
     * `follow`, differs from what the handover lands, so it rendered stale
     * state for a pass. Solid and Svelte specs expect none.
     */
    type: "relay";
    component: string;
    id: string;
    /** The keys it changed. */
    keys: string[];
};
/** Whether this is the development build of core. */
declare const dev = true;
/** Reports an event to the devtools hook, when one is present, and to `__UI_SDK__`. */
declare function emit(event: DevEvent): void;
/**
 * Prints a development warning and reports it to the inspector. Names the
 * component and instance when it knows them, like `Popover#p3`. Set
 * `globalThis.__UI_SDK_DEV__ = false` to silence warnings, or
 * `globalThis.__UI_SDK_STRICT__ = true`, as tests do, to throw them instead.
 */
declare function warn(message: string, from?: {
    component: string;
    id?: string;
}, detail?: unknown): void;
/**
 * Like `warn`, for what the app meant to happen, like an action that failed:
 * it's logged and reported, but never thrown in strict mode.
 */
declare function note(message: string, from?: {
    component: string;
    id?: string;
}, detail?: unknown): void;
/** Checks each slot's declared role, and that the slot meets what the role needs. */
declare function checkRoles(slots: Record<string, object>, from: {
    component: string;
}): void;
declare function checkRole(definition: {
    role?: unknown;
    roles?: readonly string[];
}, slot: string, own: Record<string, unknown> | undefined, role: unknown, from: {
    component: string;
    id?: string;
}, live?: Record<string, unknown>): void;
/**
 * Checks a bound element can take focus the way its slot says, a task later,
 * once a framework or an element's own upgrade has written its attributes.
 */
declare function checkFocus(focus: unknown, slot: string, el: HTMLElement, from: {
    component: string;
    id?: string;
}): void;
declare function warnMissing(slots: object, from: {
    component: string;
    id?: string;
}): Record<string, unknown>;
/** Warns once when a change's event doesn't match what its reason declares. */
declare function checkEvent(reason: string, event: Event | undefined, from: {
    component: string;
    id?: string;
}): void;
declare function checkPrevented(name: string, prevented: boolean, details: {
    event?: Event;
    canceled: boolean;
}, from: {
    component: string;
    id?: string;
}): void;
/**
 * Warns about a misspelled agent mark, like `data-agent-confim`, on the
 * elements or their ancestors, once per element. Only near misses warn: an
 * app may use `data-agent-*` for its own data, like a support agent's id.
 */
declare function checkMarks(elements: Element[], marks: string[]): void;
/** Lets `__UI_SDK__.shortcuts()` list the shared shortcut manager's shortcuts. */
declare function exposeShortcuts(list: () => unknown[]): void;
/**
 * Warns about controlled state misuse, once per key: `open` with
 * `defaultOpen`, or a key that was controlled and is now undefined. A value
 * that arrives later, like a bound variable that starts empty, is fine.
 */
declare function checkControlled(from: {
    component: string;
    id: string;
}, keys: string[], options: object): void;
/**
 * Warns when a controlled change was requested and the option it controls
 * still has the old value a second later, like a controlled `open` the owner
 * never updates in `onOpenChange`. A second leaves time for a navigation or
 * a save that passes the value back once it's done.
 */
declare function expectControlled(instance: object, info: {
    component: string;
    id: string;
    key: string;
    value: unknown;
    reason: string;
    source: string;
}, current: () => unknown): void;
/**
 * Stops waiting for each controlled value the owner passed something else
 * for, so one that opens and closes again before the check, like a palette
 * closed by its own command, doesn't warn.
 */
declare function heardControlled(instance: object, options: object): void;
/** Stops waiting for a controlled value, like when the instance leaves the page. */
declare function forgetControlled(instance: object): void;
/** Runs `read`, which writes what it measured in the page. */
declare function measured(read: () => void): void;
/** Whether the writes happening now come from `measured`. */
declare const isMeasuring: () => boolean;
export { checkControlled, checkFocus, checkRole, checkRoles, checkEvent, checkMarks, checkPrevented, dev, type DevEvent, emit, expectControlled, exposeShortcuts, forgetControlled, heardControlled, isMeasuring, measured, note, warn, warnMissing, };
