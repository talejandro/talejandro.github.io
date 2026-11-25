import { type TextControl } from "./value.js";
import type { ChangeDetails, ChangeOptions } from "../kernel/details.js";
import type { PrimitiveContext } from "../kernel/primitive-types.js";
/**
 * Why a text field's value changed.
 * @stable
 */
type InputValueChangeReason = "input-change" | "clear-press" | "reset" | "imperative";
/** The options every text field takes. */
type TextFieldOptions = {
    /** The value, for a controlled field. */
    value?: string;
    /** The value it starts with. A form reset returns here. */
    defaultValue?: string;
    /**
     * Called when the user changes the value: typing (`"input-change"`), a Clear
     * part (`"clear-press"`), a form reset (`"reset"`) or a controller
     * (`"imperative"`). `details.cancel()` keeps the value as it was.
     */
    onValueChange?: (value: string, details: ChangeDetails<InputValueChangeReason>) => void;
};
type TextState = {
    value: string;
    filled: boolean;
};
type ClearTarget = {
    internal: {
        clearPress: (event?: Event) => void;
    };
};
declare const textFields: WeakMap<TextControl, ClearTarget>;
declare const initialText: (options: TextFieldOptions) => {
    value: string;
    filled: boolean;
};
declare const syncText: (options: TextFieldOptions) => {
    value?: undefined;
    filled?: undefined;
} | {
    value: string;
    filled: boolean;
};
declare function textFieldApi<Slot extends string>({ store, options, element, }: Pick<PrimitiveContext<TextFieldOptions, TextState, Slot>, "store" | "options" | "element">, change: (key: "value", value: string, details: {
    reason: InputValueChangeReason;
    event?: Event;
}) => boolean, slot: Slot): {
    getValue: () => string;
    setValue: (value: string, { reason, event, }?: ChangeOptions<InputValueChangeReason>) => boolean;
    clear: ({ reason, event, }?: ChangeOptions<InputValueChangeReason>) => boolean;
    focus: () => void | undefined;
    internal: {
        clearPress: (event?: Event) => boolean;
        bind(el: TextControl): () => void;
    };
};
declare function focusFromSurroundings(event: Event | undefined, container: HTMLElement | undefined, field: TextControl | undefined): void;
export { focusFromSurroundings, initialText, type InputValueChangeReason, syncText, type TextFieldOptions, textFields, textFieldApi, type TextState, };
