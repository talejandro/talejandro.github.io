import { type Direction } from "../../foundation/focus/collection.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { RadioGroupChangeOptions, RadioGroupOptions } from "./radio.js";
type Details = RadioGroupChangeOptions;
type RadioGroupStore = {
    value: string | null;
    initial: string | null;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    formDisabled: boolean;
    stop: string | null;
    exiting: string[];
    orientation?: "horizontal" | "vertical";
    direction?: Direction;
    highlighted?: string | null;
};
declare function radioGroupState(options: RadioGroupOptions, extra?: Pick<RadioGroupStore, "orientation" | "direction" | "highlighted">): RadioGroupStore;
declare function syncRadioGroup(options: RadioGroupOptions): {
    value?: string | null | undefined;
    initial?: string | null | undefined;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
};
declare const isNativeButton: (el: HTMLElement | undefined) => el is HTMLButtonElement;
type RadioSlotNames = {
    group: string;
    item: string;
};
/**
 * `radioGroup`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface RadioGroupApi extends ReturnType<typeof radioGroupApiBody> {
}
declare function radioGroupApiBody(context: PrimitiveContext<RadioGroupOptions, RadioGroupStore, string>, slots?: RadioSlotNames): {
    id: string;
    getValue: () => string | null;
    isChanged: () => boolean;
    setValue(value: string | null, { reason, event }?: Details): boolean;
    focus: () => void;
    form: () => HTMLFormElement | null;
    internal: {
        check: (key: string, details?: Details) => boolean;
        reset(): void;
        restore(saved: string): void;
        setFormDisabled(formDisabled: boolean): void;
        finishExit(key: string): void;
        roving: {
            bind(el: HTMLElement, part: import("../../index.js").RovingFocusItem<{
                value: string;
                disabled?: boolean;
            }>): () => void;
            tabIndex(state: RadioGroupStore, part: import("../../index.js").RovingFocusItem<{
                value: string;
                disabled?: boolean;
            }>): "0" | "-1";
            keydown(event: KeyboardEvent, el: HTMLElement): {
                key: string;
                from: string;
                shift: boolean;
            } | undefined;
            items: () => {
                key: string;
                props: {
                    value: string;
                    disabled?: boolean;
                };
                el: HTMLElement;
            }[];
            focus(itemKey?: string): void;
            remember(itemKey: string): void;
            check: () => void;
            stopFor: (preferred: (item: import("../../index.js").RovingFocusItem<{
                value: string;
                disabled?: boolean;
            }>) => boolean) => string | undefined;
        };
        group: () => HTMLElement | undefined;
        radio: (key: string) => HTMLElement | undefined;
        itemProps: (key: string) => {
            disabled?: boolean;
        };
        anchor: () => HTMLElement;
        onKeyDown(event: KeyboardEvent, el: HTMLElement): void;
    };
};
declare const radioGroupApi: (...args: Parameters<typeof radioGroupApiBody>) => RadioGroupApi;
declare function itemState(state: RadioGroupStore, key: string, props: {
    disabled?: boolean;
}): {
    checked: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
};
declare function itemData(state: RadioGroupStore, key: string, props: {
    disabled?: boolean;
}): {
    "data-checked": string | undefined;
    "data-unchecked": string | undefined;
    "data-disabled": string | undefined;
    "data-readonly": string | undefined;
    "data-required": string | undefined;
};
export { isNativeButton, itemData, itemState, radioGroupApi, type RadioGroupApi, radioGroupState, type RadioGroupStore, syncRadioGroup, };
