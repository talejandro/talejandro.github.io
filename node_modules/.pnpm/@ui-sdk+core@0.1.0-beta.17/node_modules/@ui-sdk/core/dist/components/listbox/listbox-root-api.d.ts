import { type ListData } from "../../foundation/lists/listbox-engine.js";
import type { ListboxChangeOptions, ListboxOptions } from "./listbox-root.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
type ListboxStore = {
    value: unknown;
    initial: unknown;
    highlighted: string | null;
    stop: string | null;
    multiple: boolean;
    activation: "automatic" | "manual";
    deselectable: boolean;
    orientation: "horizontal" | "vertical";
    keepInView: boolean;
    virtualFocus: boolean;
    disabled: boolean;
    formDisabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    items: ListData<unknown> | undefined;
    labels: number;
    icons: number;
    groupLabels: readonly string[];
};
declare function initialListboxStore(options: ListboxOptions<any, any>): ListboxStore;
declare function syncListboxStore(options: ListboxOptions<any, any>): {
    value?: any;
    initial?: any;
    multiple: boolean;
    activation: "manual" | "automatic";
    deselectable: boolean;
    orientation: "horizontal" | "vertical";
    keepInView: boolean;
    virtualFocus: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    items: ListData<any> | undefined;
};
declare function listboxApiBody(context: PrimitiveContext<ListboxOptions<any, any>, ListboxStore, string>): {
    id: string;
    getValue: () => unknown;
    setValue: (value: unknown, { reason, event }?: ListboxChangeOptions) => boolean;
    clear: ({ reason, event }?: ListboxChangeOptions) => boolean;
    selectAll({ reason, event }?: ListboxChangeOptions): boolean;
    getHighlighted(): {} | null;
    highlight(value: unknown): boolean;
    focus: () => void;
    internal: {
        options: () => ListboxOptions<any, any>;
        listbox: {
            entries: () => import("../../foundation/lists/index.js").ListEntry[];
            visibleData: () => {
                data: ListData<unknown>;
                query: string;
                filter: unknown;
                rank: boolean;
                list: ListData<unknown>;
                flat: import("../../foundation/lists/index.js").ListEntry[];
            } | undefined;
            dataItems: () => import("../../foundation/lists/index.js").ListEntry[] | undefined;
            find: (key: string | null) => import("../../foundation/lists/index.js").ListEntry | undefined;
            disabled: (entry: import("../../foundation/lists/index.js").ListEntry) => boolean;
            isItemDisabled: (key: string) => boolean;
            highlight: (key: string | null, { focus, event }?: {
                focus?: boolean;
                event?: Event;
            }) => void;
            move: (step: number | "first" | "last", event?: Event) => void;
            stepKey: (step: number | "first" | "last", { loop }?: {
                loop?: boolean | undefined;
            }) => string | undefined;
            firstEnabled: () => string | undefined;
            search: (char: string, from: string | null) => import("../../foundation/lists/index.js").ListEntry | undefined;
            register: (key: string, el: HTMLElement, meta: () => {
                value: unknown;
                label?: string;
                keywords?: string[];
                disabled?: boolean;
                group?: string;
                pinned?: boolean;
                index?: number;
            }) => () => void;
            typing: () => boolean;
            resetTyping: () => void;
            labelOf(key: string): string | undefined;
            valueOf(key: string): unknown;
            matches: (key: string, meta: {
                value: unknown;
                label?: string;
                keywords?: string[];
                disabled?: boolean;
                group?: string;
                pinned?: boolean;
                index?: number;
            }) => boolean;
            listing(more?: (key: string, value: unknown) => string): Record<string, string>;
            listingInputs: () => (string | number | boolean | ListData<unknown, import("./listbox-root.js").ListItem<unknown>> | ((item: import("./listbox-root.js").ListItem<unknown>, query: string) => boolean | number) | undefined)[];
            selectable(group?: string): string[];
            count(): number;
            groupMatches(group: string): boolean;
            element: (key: string) => HTMLElement | undefined;
            labelsVersion: () => number;
            remember(key: string, label: string, value: unknown, keywords?: string[]): void;
        };
        selection: {
            values: () => any[] | unknown[];
            keys: () => string[];
            keysOf: (value: unknown) => string[];
            isSelected: (key: string, itemValue?: unknown) => boolean;
            labelOf: (value: unknown) => string;
            labels(): string[];
            queueLabels: () => void;
            learn(find: (keys: ReadonlySet<string>) => readonly {
                value: unknown;
                label: string;
            }[]): boolean;
            needsItems: (hasValueIcon: boolean) => boolean;
            toggled(key: string, itemValue: unknown): any[];
            without: (key: string) => any[];
            empty: () => never[] | null;
            restore(saved: string, write: (value: unknown) => void): void;
            stopRestoring: () => void;
            isFilling: () => boolean;
        };
        icons: {
            get: (key: string) => Element | undefined;
            register(key: string, icon: Element, keep?: (icon: Element) => Element): () => void;
        };
        keyOf: (value: unknown) => string;
        claim: (key: string, eligible: boolean) => boolean;
        focused: (key: string) => void;
        focusStop: () => void;
        highlightVirtually: (key: string, event?: Event) => void;
        blurred: (event: FocusEvent) => void;
        onKeyDown: (event: KeyboardEvent, root: HTMLElement) => void;
        press: (key: string, event?: Event) => void;
        controlElement: () => HTMLElement | undefined;
        formElement: () => HTMLElement | undefined;
        serialized: () => string[];
        itemProps: (key: string) => ListboxItemMeta | undefined;
        adoptValue: (value: unknown) => void;
        reset(): void;
        restore(saved: string): void;
        setFormDisabled(formDisabled: boolean): void;
        autofill(text: string): void;
    };
};
declare const listboxApi: (...args: Parameters<typeof listboxApiBody>) => ListboxApi;
type ListboxItemMeta = {
    value: unknown;
    label?: string;
    disabled?: boolean;
    group?: string;
};
/**
 * `listbox`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface ListboxApi extends ReturnType<typeof listboxApiBody> {
}
export { initialListboxStore, type ListboxApi, listboxApi, type ListboxStore, syncListboxStore, };
