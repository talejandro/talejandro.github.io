import type { DevEvent } from "./dev.js";
declare const dev: boolean;
declare function emit(_event: DevEvent): void;
declare function warn(_message: string, _from?: {
    component: string;
    id?: string;
}, _detail?: unknown): void;
declare function note(_message: string, _from?: {
    component: string;
    id?: string;
}, _detail?: unknown): void;
declare function warnMissing<T>(slots: T, _from: {
    component: string;
    id?: string;
}): T;
declare function exposeShortcuts(_list: () => unknown[]): void;
declare function checkRoles(_slots: Record<string, object>, _from: {
    component: string;
}): void;
declare function checkRole(_definition: object, _slot: string, _own: Record<string, unknown> | undefined, _role: unknown, _from: {
    component: string;
    id?: string;
}, _live?: Record<string, unknown>): void;
declare function checkFocus(_focus: unknown, _slot: string, _el: HTMLElement, _from: {
    component: string;
    id?: string;
}): void;
declare function expectControlled(_instance: object, _info: {
    component: string;
    id: string;
    key: string;
    value: unknown;
    reason: string;
    source: string;
}, _current: () => unknown): void;
declare function forgetControlled(_instance: object): void;
declare function heardControlled(_instance: object, _options: object): void;
declare function measured(read: () => void): void;
declare const isMeasuring: () => boolean;
declare function checkEvent(_reason: string, _event: Event | undefined, _from: {
    component: string;
    id?: string;
}): void;
declare function checkPrevented(_name: string, _prevented: boolean, _details: {
    event?: Event;
    canceled: boolean;
}, _from: {
    component: string;
    id?: string;
}): void;
declare function checkMarks(_elements: Element[], _marks: string[]): void;
declare function checkControlled(_from: {
    component: string;
    id: string;
}, _keys: string[], _options: object): void;
export { checkControlled, checkFocus, checkRole, checkRoles, checkEvent, checkMarks, checkPrevented, dev, emit, expectControlled, exposeShortcuts, forgetControlled, heardControlled, isMeasuring, measured, note, warn, warnMissing, };
export type { DevEvent } from "./dev.js";
