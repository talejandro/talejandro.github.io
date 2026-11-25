import type { Color } from "../../foundation/color/convert.js";
import { type ColorFormat } from "../../foundation/color/format.js";
import { type ColorGamut } from "../../foundation/color/gamut.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { ColorPickerChangeOptions, ColorPickerOptions, ColorPickerValueChangeReason } from "./color-picker.js";
import { type Channel, type ColorChannel, type ColorPickerSpace } from "./color-picker-channels.js";
type State = {
    value: string;
    initial: string;
    color: Color;
    space: ColorPickerSpace;
    format: ColorFormat;
    gamut: ColorGamut | false;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    formDisabled: boolean;
    text: string | null;
    rtl: boolean;
    eyeDropper: boolean | null;
    stop: string | null;
};
type Orientation = "horizontal" | "vertical";
type Details = {
    reason: ColorPickerValueChangeReason;
    event?: Event;
};
declare const output: (color: Color, state: Pick<State, "format" | "gamut">) => string;
declare function initialState(options: ColorPickerOptions): State;
declare function syncState(options: ColorPickerOptions): {
    value?: string | undefined;
    initial?: string | undefined;
    space: ColorPickerSpace;
    format: ColorFormat;
    gamut: false | ColorGamut;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
};
declare const isLocked: (state: State) => boolean;
declare function colorPickerApiBody(context: PrimitiveContext<ColorPickerOptions, State, string>): {
    getValue: () => string;
    setValue(value: string, { reason, event }?: ColorPickerChangeOptions): boolean;
    focus(): void;
    internal: {
        area: (x: ColorChannel | undefined, y: ColorChannel | undefined) => {
            set: (next: import("../../index.js").AreaValue) => boolean;
            pointerdown(event: PointerEvent, el: HTMLElement): void;
            keydown(event: KeyboardEvent): boolean;
            fractions(state: object): {
                x: number;
                y: number;
            };
            thumbStyle(state: object): string;
            thumbAttrs(state: object): {
                role: string;
                tabindex: string;
                "aria-roledescription": string;
                "aria-valuemin": string;
                "aria-valuemax": string;
                "aria-valuenow": string;
                "aria-valuetext": string;
                "aria-disabled": string | undefined;
                "data-area-thumb": string;
            };
        };
        channel: (name: ColorChannel | undefined) => {
            index: number;
            max: number;
            step: number;
            scale: number;
            unit: "\u00B0" | "%" | "";
            name: ColorChannel;
            label: string;
        };
        sliderValue: (channelName: ColorChannel | undefined) => number;
        roving: {
            bind(el: HTMLElement, part: import("../../index.js").RovingFocusItem<{
                value: string;
            }>): () => void;
            tabIndex(state: State, part: import("../../index.js").RovingFocusItem<{
                value: string;
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
                };
                el: HTMLElement;
            }[];
            focus(itemKey?: string): void;
            remember(itemKey: string): void;
            check: () => void;
            stopFor: (preferred: (item: import("../../index.js").RovingFocusItem<{
                value: string;
            }>) => boolean) => string | undefined;
        };
        output: (color: Color) => string;
        isSelected: (value: string | undefined) => boolean;
        setRTL: (el: HTMLElement) => void;
        areaPointerdown(event: PointerEvent, el: HTMLElement, x?: ColorChannel, y?: ColorChannel): void;
        areaKeydown(event: KeyboardEvent, x?: ColorChannel, y?: ColorChannel): void;
        sliderPointerdown(event: PointerEvent, el: HTMLElement, name?: ColorChannel, orientation?: Orientation): void;
        sliderKeydown(event: KeyboardEvent, name?: ColorChannel): void;
        setChannelValue(name: ColorChannel | undefined, value: number, event: Event): void;
        setText(text: string): void;
        commitText(event?: Event): void;
        revertText(): void;
        choose: (value: string, details: Details) => boolean;
        setEyeDropper: (el: HTMLElement) => void;
        pickFromScreen(el: HTMLElement | undefined, event?: Event): void;
        reset(): void;
        restore(saved: string): void;
        setFormDisabled(formDisabled: boolean): void;
        submitted: () => string | null;
    };
};
declare const colorPickerApi: (...args: Parameters<typeof colorPickerApiBody>) => ColorPickerApi;
declare const valueText: (value: number, spec: Channel) => string;
/**
 * `colorPicker`'s api, which its slots and controller call. Adapters expose it as `api`.
 * @experimental
 */
interface ColorPickerApi extends ReturnType<typeof colorPickerApiBody> {
}
export { colorPickerApi, type ColorPickerApi, initialState, isLocked, type Orientation, output, type State, syncState, valueText, };
