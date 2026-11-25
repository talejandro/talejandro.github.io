import { isDisabled } from "../../foundation/forms/form.js";
import { type NumberFormat } from "../../foundation/number/format.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { SliderChangeOptions, SliderOptions } from "./slider.js";
type State = {
    value: number | number[];
    initial: number | number[];
    min: number;
    max: number;
    step: number;
    largeStep: number;
    minStepsBetweenThumbs: number;
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    formDisabled: boolean;
    name: string | undefined;
    form: string | undefined;
    format: NumberFormat | undefined;
    locale: string | undefined;
    pageLocale: string | null;
    active: number | null;
    last: number | null;
    thumbValues: Record<string, number>;
    thumbInputId: string | null;
};
declare const valuesOf: (value: number | number[]) => number[];
declare function thumbValuesOf(value: number | number[]): Record<string, number>;
declare const shaped: (values: number[], like: number | number[]) => number | number[];
declare function rangeOf(state: State): {
    min: number;
    max: number;
    step: number;
    largeStep: number;
    minStepsBetweenThumbs: number;
};
declare function normalized(value: number | number[], options: SliderOptions): number | number[];
declare function settings(options: SliderOptions): {
    largeStep: number;
    minStepsBetweenThumbs: number;
    orientation: "horizontal" | "vertical";
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    format: NumberFormat | undefined;
    locale: string | undefined;
    min: number;
    max: number;
    step: number;
};
declare function formatValue(value: number, state: State): string;
/** One form value for several numbers, `"start/end"` like an ISO interval (G12). */
declare function formatRange(values: readonly (number | string)[]): string;
declare function submitted(state: State): string;
declare function sliderApiBody(context: PrimitiveContext<SliderOptions, State, string>): {
    getValue: () => number | number[];
    setValue: (value: number | number[], { reason, event }?: SliderChangeOptions) => boolean;
    focus: (thumb?: number) => void | undefined;
    internal: {
        press(event: PointerEvent, control: HTMLElement): void;
        begin(pressed: number, thumb: number | null, event?: Event): number;
        move(pressed: number, event?: Event): void;
        end(event?: Event): void;
        adjust(index: number, target: number, event: Event): void;
        keydown(event: KeyboardEvent, index: number, input: HTMLElement): void;
        commitKeys(event?: KeyboardEvent): void;
        reset(): void;
        restore(saved: string): void;
        setFormDisabled(formDisabled: boolean): void;
        submitted: () => string | null;
        syncInput(input: HTMLInputElement, index: number): void;
    };
};
declare const sliderApi: (...args: Parameters<typeof sliderApiBody>) => SliderApi;
/**
 * `slider`'s api, which its slots and controller call. Adapters
 * expose it as `api`.
 * @stable
 */
interface SliderApi extends ReturnType<typeof sliderApiBody> {
}
export { formatRange, formatValue, isDisabled, normalized, rangeOf, settings, shaped, type SliderApi, sliderApi, type State, submitted, thumbValuesOf, valuesOf, };
