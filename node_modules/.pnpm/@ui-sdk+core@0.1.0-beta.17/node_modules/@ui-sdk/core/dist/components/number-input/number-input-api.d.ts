import { isDisabled } from "../../foundation/forms/form.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { NumberInputChangeOptions, NumberInputOptions, NumberInputScrubAreaProps } from "./number-input.js";
type State = {
    value: number | null;
    initial: number | null;
    text: string;
    min: number;
    max: number;
    step: number;
    largeStep: number;
    smallStep: number;
    format: Intl.NumberFormatOptions | undefined;
    locale: string | undefined;
    pageLocale: string | null;
    wheel: boolean;
    disabled: boolean;
    formDisabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    controlId: string | null;
    scrubbing: boolean;
    platform: "ios" | "android" | "other";
    cursor: {
        x: number;
        y: number;
    } | null;
};
declare function settings(options: NumberInputOptions): {
    min: number;
    max: number;
    step: number;
    largeStep: number;
    smallStep: number;
    format: Intl.NumberFormatOptions | undefined;
    locale: string | undefined;
    wheel: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
};
declare const rangeOf: (state: {
    min: number;
    max: number;
    step: number;
}) => {
    min: number;
    max: number;
    step: number;
};
declare const display: (value: number | null, state: Pick<State, "locale" | "pageLocale" | "format" | "step">) => string;
declare const isLocked: (state: State) => boolean;
declare function inputMode(state: State): "numeric" | "decimal" | "text";
declare function canStep(state: State, direction: number, step?: number): boolean;
declare function atBound(state: State, direction: number, step?: number): boolean;
declare function numberInputApiBody(context: PrimitiveContext<NumberInputOptions, State, string>): {
    getValue: () => number | null;
    setValue(value: number | null, { reason, event }?: NumberInputChangeOptions): boolean;
    increment: ({ reason, event, large, }?: NumberInputChangeOptions & {
        large?: boolean;
    }) => boolean;
    decrement: ({ reason, event, large, }?: NumberInputChangeOptions & {
        large?: boolean;
    }) => boolean;
    focus: () => void | undefined;
    internal: {
        beforeinput(event: InputEvent, el: HTMLInputElement): void;
        type(text: string, event?: Event): boolean | undefined;
        commitText(event?: FocusEvent | KeyboardEvent): void;
        keydown(event: KeyboardEvent): boolean | void;
        keyup: (event: KeyboardEvent) => void;
        wheel(event: WheelEvent, el: HTMLInputElement): void;
        bindButton(el: HTMLElement, direction: number, disabled: () => boolean): () => void;
        clickButton(event: MouseEvent, direction: number): void;
        scrub(event: PointerEvent, el: HTMLElement, props: Omit<NumberInputScrubAreaProps, "controller">): void;
        focusAndSelect(): void;
        reset(): void;
        restore(saved: string): void;
        setFormDisabled(formDisabled: boolean): void;
        readPlatform(): void;
        submitted: () => string | null;
    };
};
declare const numberInputApi: (...args: Parameters<typeof numberInputApiBody>) => NumberInputApi;
/**
 * `numberInput`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface NumberInputApi extends ReturnType<typeof numberInputApiBody> {
}
export { atBound, canStep, display, inputMode, isDisabled, isLocked, type NumberInputApi, numberInputApi, rangeOf, settings, type State, };
