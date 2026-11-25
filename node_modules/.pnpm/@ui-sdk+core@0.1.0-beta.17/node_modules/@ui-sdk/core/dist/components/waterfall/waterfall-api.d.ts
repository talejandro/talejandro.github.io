import type { ChangeOptions } from "../../foundation/kernel/details.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { NumberFormat } from "../../foundation/number/format.js";
import { type WaterfallTickData } from "./waterfall-time.js";
import type { WaterfallData, WaterfallDataItem, WaterfallDataRow, WaterfallExpandedChangeReason, WaterfallOptions, WaterfallValueChangeReason } from "./waterfall.js";
type WaterfallStore = {
    items: WaterfallData;
    range: [number, number] | undefined;
    value: string | null;
    expanded: string[];
    active: string | null;
    cell: string | null;
    format: NumberFormat | undefined;
    locale: string | undefined;
    pageLocale: string | null;
    getBarLabel: WaterfallOptions["getBarLabel"];
};
/**
 * The rows that show when only the spans in `expanded` are open, in order,
 * for a waterfall that renders only the rows in view. Render each as a
 * `WaterfallRow` with its span's `value`.
 * @experimental
 */
declare function visibleWaterfallRows(items: readonly WaterfallDataItem[], expanded: readonly string[]): WaterfallDataRow[];
/**
 * `waterfall`'s api, which its slots and controller call. Adapters expose it as `api`.
 * @experimental
 */
interface WaterfallApi extends ReturnType<typeof waterfallApiBody> {
}
declare function waterfallApiBody(context: PrimitiveContext<WaterfallOptions, WaterfallStore, string>): {
    id: string;
    roving: {
        bind(el: HTMLElement, part: import("../../index.js").RovingFocusItem<{
            value: string;
        }>): () => void;
        tabIndex(state: WaterfallStore, part: import("../../index.js").RovingFocusItem<{
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
    getValue: () => string | null;
    setValue: (value: string | null, why?: ChangeOptions<WaterfallValueChangeReason>) => boolean;
    getExpanded: () => string[];
    setExpanded: (expanded: string[], why?: ChangeOptions<WaterfallExpandedChangeReason>) => boolean;
    isExpanded: (value: string) => boolean;
    expand: (value: string, why?: ChangeOptions<WaterfallExpandedChangeReason>) => boolean;
    collapse: (value: string, why?: ChangeOptions<WaterfallExpandedChangeReason>) => boolean;
    toggle: (value: string, why?: ChangeOptions<WaterfallExpandedChangeReason>) => boolean;
    expandAll: (why?: ChangeOptions<WaterfallExpandedChangeReason>) => boolean;
    collapseAll: (why?: ChangeOptions<WaterfallExpandedChangeReason>) => boolean;
    reveal(value: string): void;
    focus: (value?: string) => void;
    internal: {
        items: () => WaterfallData;
        all: () => WaterfallDataItem[];
        range: (state?: WaterfallStore) => [number, number];
        isBranch: (key: string) => boolean;
        ancestors: (key: string) => string[];
        shows: (key: string, expanded: readonly string[]) => boolean;
        level: (key: string) => number;
        position(key: string): {
            index: number;
            size: number;
        } | undefined;
        placement(state: WaterfallStore, key: string): {
            start: number;
            size: number;
        };
        tabIndex: (state: WaterfallStore, part: {
            key: string;
            props: {
                value: string;
            };
        }) => "0" | "-1";
        ticks: (state: WaterfallStore, max: number) => WaterfallTickData[];
        timeState(state: WaterfallStore, time: number): {
            time: number;
            label: string;
            position: number;
            outside: boolean;
        };
        barLabel(state: WaterfallStore, key: string): string | undefined;
        press: (key: string, el: HTMLElement | undefined, event?: Event) => void;
        keydown: (event: KeyboardEvent, row: HTMLElement, key: string) => void;
        focusin: (event: FocusEvent, row: HTMLElement, key: string) => void;
        pressIndicator(key: string, event?: Event): void;
        bindRow(el: HTMLElement, part: {
            key: string;
            props: {
                value: string;
            };
        }): () => void;
    };
};
declare const waterfallApi: (...args: Parameters<typeof waterfallApiBody>) => WaterfallApi;
export { visibleWaterfallRows, type WaterfallApi, waterfallApi, type WaterfallStore, };
