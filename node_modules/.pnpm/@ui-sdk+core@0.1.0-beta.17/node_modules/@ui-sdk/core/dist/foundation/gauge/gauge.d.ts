import { type NumberFormat } from "../../foundation/number/format.js";
/**
 * What `getValueLabel` receives after the value. `Value` is `number` for a
 * meter, which always has one, and `number | null` for a progress bar.
 * @stable
 */
type GaugeLabelDetails<Value extends number | null = number | null> = {
    /** The value as `format` and `locale` show it. Empty while there is no value. */
    formatted: string;
    /** Where the value sits between `min` and `max`, from 0 to 100. Null while there is no value. */
    percent: number | Extract<Value, null>;
    /** The lowest value. */
    min: number;
    /** The highest value. */
    max: number;
};
/** The options Progress and Meter share. `Value` is the type of the value they show. */
type GaugeOptions<Value extends number | null = number | null> = {
    /**
     * The lowest value.
     * @defaultValue 0
     */
    min?: number;
    /**
     * The highest value.
     * @defaultValue 100
     */
    max?: number;
    /**
     * How the value reads, for screen readers and the Value part:
     * `Intl.NumberFormat` options, or a function of the value. A percent style
     * shows where the value sits between `min` and `max`; any other style shows
     * the value itself, like `{ style: "unit", unit: "gigabyte" }`.
     * @defaultValue { style: "percent" }
     */
    format?: NumberFormat;
    /**
     * The locale the value is formatted in. Defaults to the page's `lang`, or
     * the browser's language without one, once the page is interactive. Server
     * markup uses English until then, so it never disagrees with the client.
     */
    locale?: string;
    /**
     * The text screen readers announce for the value, when the formatted value
     * says too little, like "3 of 12 files". It receives the value, null while
     * a progress bar is indeterminate, and details: the `formatted` value, its
     * `percent`, `min` and `max`.
     */
    getValueLabel?: (value: Value, details: GaugeLabelDetails<Value>) => string;
};
type GaugeSettings = {
    min: number;
    max: number;
    format: NumberFormat | undefined;
    locale: string | undefined;
    getValueLabel: GaugeOptions["getValueLabel"];
    pageLocale?: string | null;
};
declare function gaugeSettings(options: GaugeOptions): {
    min: number;
    max: number;
    format: NumberFormat | undefined;
    locale: string | undefined;
    getValueLabel: ((value: number | null, details: GaugeLabelDetails<number | null>) => string) | undefined;
};
declare function finite(value: number | null | undefined, fallback: number): number;
/** Where a value sits between the bounds, from 0 to 100, clamped. */
declare function percentBetween(value: number, min: number, max: number): number;
declare function formatGaugeValue(value: number | null, settings: GaugeSettings): string;
declare function gaugeAria(value: number | null, settings: GaugeSettings): {
    "aria-valuemin": string;
    "aria-valuemax": string;
    "aria-valuenow": string | undefined;
    "aria-valuetext": string | undefined;
};
declare function indicatorStyle(percent: number | null): string | undefined;
declare function roundPercent(percent: number): number;
declare const labelId: (id: string) => string;
declare const labelledBy: (state: {
    labels: number;
    bound: boolean;
}, id: string) => string | undefined;
declare function gaugeApi(store: {
    get: () => {
        labels: number;
    };
    set: (patch: {
        labels: number;
    }) => void;
}): {
    internal: {
        label: () => () => void;
    };
};
export { finite, formatGaugeValue, gaugeAria, type GaugeLabelDetails, type GaugeOptions, gaugeSettings, type GaugeSettings, gaugeApi, indicatorStyle, labelId, labelledBy, percentBetween, roundPercent, };
export type { NumberFormat } from "../number/format.js";
