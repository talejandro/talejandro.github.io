import { type CalendarModelState } from "../calendar/calendar-api.js";
import { type ISOMonth } from "../calendar/calendar-model.js";
import { type ISODate } from "../../foundation/date/plain-date.js";
import { type PopupState } from "../../foundation/popups/create-popup.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { DatePickerChangeOptions, DatePickerContentProps, DatePickerMonthChangeReason, DatePickerOptions, DatePickerValue, DatePickerValueChangeReason } from "./date-picker.js";
type State = PopupState & CalendarModelState & {
    apple: boolean;
    presentation: "popover" | "sheet";
    drafts: [string | null, string | null];
    draftFor: string;
    invalid: [boolean, boolean];
    initial: DatePickerValue;
    closeOnSelect: boolean;
    name: string | undefined;
    startName: string | undefined;
    endName: string | undefined;
    form: string | undefined;
    required: boolean;
    hinted: boolean;
};
declare const valueKey: (value: unknown) => string;
declare function dateAt(state: State, index: number): string | null;
declare function textOf(state: State, index: number): string;
declare const invalidAt: (state: State, index: number) => boolean;
declare function nameAt(state: State, index: number): string | undefined;
/**
 * `datePicker`'s api, which its slots and controller call. Adapters expose it as `api`.
 * @stable
 */
interface DatePickerApi extends ReturnType<typeof datePickerApiBody> {
}
declare function datePickerApiBody(context: PrimitiveContext<DatePickerOptions, State, string>): {
    isOpen: () => boolean;
    setOpen: (open: boolean, options?: DatePickerChangeOptions<import("./date-picker.js").DatePickerOpenChangeReason>) => boolean;
    open: (options?: DatePickerChangeOptions<import("./date-picker.js").DatePickerOpenChangeReason> & {
        signal?: AbortSignal;
    }) => Promise<import("../../index.js").PopupResult<import("./date-picker.js").DatePickerOpenChangeReason, never>>;
    close: (options?: DatePickerChangeOptions<import("./date-picker.js").DatePickerOpenChangeReason>) => boolean;
    toggle: (options?: DatePickerChangeOptions<import("./date-picker.js").DatePickerOpenChangeReason>) => boolean;
    getValue: () => DatePickerValue;
    setValue: (value: DatePickerValue, { reason, event, }?: DatePickerChangeOptions<DatePickerValueChangeReason>) => boolean;
    clear: ({ reason, event, }?: DatePickerChangeOptions<DatePickerValueChangeReason>) => boolean;
    getMonth: () => string;
    setMonth: (month: ISOMonth, { reason, event, }?: DatePickerChangeOptions<DatePickerMonthChangeReason>) => boolean;
    previous: (options?: DatePickerChangeOptions<DatePickerMonthChangeReason>) => boolean;
    next: (options?: DatePickerChangeOptions<DatePickerMonthChangeReason>) => boolean;
    focus: (date?: ISODate) => void;
    internal: {
        show: (request?: import("../../index.js").PopupChangeOptions<string> & {
            payload?: unknown;
            anchor?: import("../../index.js").Anchor;
            signal?: AbortSignal;
        } & Partial<{}> & {
            by?: import("../../foundation/popups/index.js").PopupOpener;
            trigger?: string;
        }, openReason?: string | undefined) => Promise<import("../../index.js").PopupResult<string, string>>;
        hide: (request?: import("../../index.js").ChangeOptions<string> & {
            focus?: import("../../foundation/popups/popup.js").ReturnMode;
            returnValue?: string | undefined;
        }) => boolean;
        popup: {
            bind(el: HTMLElement, config?: import("../../foundation/popups/popup.js").AttachConfig): () => void;
            keydown: (event: KeyboardEvent) => void;
            triggerKeydown(event: KeyboardEvent): void;
            opening(by: import("../../foundation/popups/index.js").PopupOpener, event?: Event): void;
            opener: () => import("../../foundation/popups/index.js").PopupOpener;
            observe(listener: (open: boolean) => import("../../foundation/popups/popup.js").PopupClose<string, unknown> | undefined): void;
            requestClose: (reason: import("../../foundation/popups/index.js").PopupCloseReason, event?: Event) => void;
            returnFocus(mode: import("../../foundation/popups/popup.js").ReturnMode): void;
            initialFocus: (resolve?: (() => HTMLElement | null | undefined | void) | undefined) => void;
            place: () => void | undefined;
            checkPlacement: () => void | undefined;
            updateModal: () => void | undefined;
            layer: () => import("../../foundation/platform/index.js").Layer | undefined;
            element: () => HTMLElement | undefined;
            mountedAs: (open: boolean) => boolean;
            backdrop(backdrop: HTMLElement): () => void;
        };
        presentation: {
            open: () => void;
            resolve: () => string;
            bind(el: HTMLElement, config: import("../../foundation/popups/index.js").SheetConfig): () => void;
        };
        commit: (index: number, event?: Event) => void;
        setText: (index: number, text: string) => void;
        pickValue: (value: DatePickerValue, reason: DatePickerValueChangeReason, event?: Event) => boolean;
        reset: () => void;
        restore: (saved: string) => void;
        submitted: () => string | FormData;
        setFormDisabled: (formDisabled: boolean) => void;
        focusInput: () => void | undefined;
        invalidInput: () => HTMLElement | undefined;
        rootValidates: () => boolean;
        contentProps: () => DatePickerContentProps;
        anchorElement: () => HTMLElement | undefined;
        initialFocus(): HTMLElement;
        inputKeydown(event: KeyboardEvent, index: number): void;
        roving: {
            bind(el: HTMLElement, part: import("../../index.js").RovingFocusItem<import("../calendar/calendar.js").CalendarDayProps>): () => void;
            tabIndex(state: CalendarModelState, part: import("../../index.js").RovingFocusItem<import("../calendar/calendar.js").CalendarDayProps>): "0" | "-1";
            keydown(event: KeyboardEvent, el: HTMLElement): {
                key: string;
                from: string;
                shift: boolean;
            } | undefined;
            items: () => {
                key: string;
                props: import("../calendar/calendar.js").CalendarDayProps;
                el: HTMLElement;
            }[];
            focus(itemKey?: string): void;
            remember(itemKey: string): void;
            check: () => void;
            stopFor: (preferred: (item: import("../../index.js").RovingFocusItem<import("../calendar/calendar.js").CalendarDayProps>) => boolean) => string | undefined;
        };
        recovery: {
            bind(el: HTMLElement, part: {
                key: string;
                props: import("../calendar/calendar.js").CalendarDayProps;
            }): () => void;
        };
        focusLanded: (date: ISODate, event: FocusEvent) => void;
        setValue: (value: import("../calendar/calendar-model.js").CalendarValue, reason: "item-press" | "reset" | "restore" | "imperative" | "clear-press" | "input-commit" | "preset-press", event?: Event) => boolean;
        setMonth: (month: ISOMonth, reason: "item-press" | "list-navigation" | "imperative" | "input-commit" | "previous-press" | "next-press" | "select-change" | "preset-press", event?: Event) => boolean;
        reveal: (date: ISODate, reason: "item-press" | "list-navigation" | "imperative" | "input-commit" | "previous-press" | "next-press" | "select-change" | "preset-press", event?: Event) => void;
        press(props: import("../calendar/calendar.js").CalendarDayProps, event: Event | undefined, el: HTMLElement | undefined): void;
        step: (direction: -1 | 1, event: Event | undefined) => boolean;
        select(kind: "month" | "year", value: number, event?: Event): void;
        keydown(event: KeyboardEvent, el: HTMLElement, props: import("../calendar/calendar.js").CalendarDayProps): void;
        pointerdown(event: PointerEvent): void;
        mousedown(event: MouseEvent, props: import("../calendar/calendar.js").CalendarDayProps): void;
        hover(date: ISODate): void;
        bindRoot(el: HTMLElement): void;
    };
};
declare const datePickerApi: (...args: Parameters<typeof datePickerApiBody>) => DatePickerApi;
declare const initialDatePickerState: (options: DatePickerOptions) => State;
declare const syncDatePickerState: (options: DatePickerOptions) => {
    open?: boolean | undefined;
    initial?: DatePickerValue | undefined;
    closeOnSelect: boolean;
    name: string | undefined;
    startName: string | undefined;
    endName: string | undefined;
    form: string | undefined;
    required: boolean;
    today?: string | null | undefined;
    month?: string | undefined;
    value?: string | string[] | null | undefined;
    mode: import("../calendar/calendar-model.js").CalendarMode;
    min: string | null;
    max: string | null;
    unavailable: import("./date-picker.js").DateMatchers | null;
    disabled: boolean;
    readOnly: boolean;
    deselectable: boolean;
    months: number;
    pageBy: "page" | "month";
    locale: string | null;
    weekStartsOn: number | null;
    weekdayFormat: "short" | "long" | "narrow";
    monthFormat: "short" | "long" | "narrow";
    fixedWeeks: boolean;
    showOutsideDays: boolean;
    minDays: number | undefined;
    maxDays: number | undefined;
    allowUnavailable: boolean;
};
export { datePickerApi, type DatePickerApi, dateAt, initialDatePickerState, invalidAt, nameAt, type State, syncDatePickerState, textOf, valueKey, };
