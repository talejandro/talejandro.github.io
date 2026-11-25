import { type Association, type FormValue } from "./form.js";
declare function formCallback(el: HTMLElement, type: "reset"): void;
declare function formCallback(el: HTMLElement, type: "disabled", disabled: boolean): void;
declare function formCallback(el: HTMLElement, type: "restore", state: unknown, mode: string): boolean;
declare function formCallback(el: HTMLElement, type: "customValidity", message: string): boolean;
declare function bindElementInternals(el: HTMLElement, internals: ElementInternals, options: Association & {
    value: () => FormValue;
    name?: () => string | undefined;
    state: () => string;
    restore: (state: string) => void;
    valueMissing: () => boolean;
    message: () => string;
    invalid?: () => {
        flags: ValidityStateFlags;
        message: string;
        anchor?: HTMLElement;
    } | undefined;
    anchor?: () => HTMLElement | undefined;
    focus?: () => void;
    subscribe: (listener: () => void) => () => void;
}): () => void;
export { bindElementInternals, formCallback };
