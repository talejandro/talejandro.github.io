import { type AsyncOptionsStatus } from "../../foundation/lists/async-options.js";
import { type PopupOpener } from "../../foundation/popups/popup.js";
import { type PopupState } from "../../foundation/popups/create-popup.js";
import { type ListData } from "../../foundation/lists/listbox.js";
import { type Listing } from "../../foundation/lists/listbox-listing.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { SelectChangeOptions, SelectContentProps, SelectOpenChangeReason, SelectOptions, SelectQueryChangeReason, SelectValueChangeReason } from "./select.js";
import { type ItemIcons } from "../../foundation/lists/item-icon.js";
type SelectState = PopupState & {
    value: unknown;
    initial: unknown;
    highlighted: string | null;
    prepared: boolean;
    listed: boolean;
    labeled: boolean | null;
    multiple: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    autoComplete: string | undefined;
    formDisabled: boolean;
    placeholder: string | undefined;
    items: ListData<unknown> | undefined;
    labels: number;
    icons: number;
    pageLocale: string | null;
    query: string;
    searchable: boolean;
    focusInList: boolean;
    virtualFocus: boolean;
    status: AsyncOptionsStatus;
    mounts: number;
    settled: boolean;
    presentation: "popover" | "sheet";
    groupLabels: readonly string[];
    listing: Listing;
};
type InitialHighlight = "selected" | "first" | "last";
type Show = {
    event?: Event;
    by?: PopupOpener;
    reason?: SelectOpenChangeReason;
    focus?: InitialHighlight;
    signal?: AbortSignal;
};
declare const virtual: (state: SelectState) => boolean;
declare function initialSelectState(options: SelectOptions<any, any>): SelectState;
declare function syncSelectState(options: SelectOptions<any, any>): {
    query?: string | undefined;
    value?: any;
    open?: boolean | undefined;
    initial?: any;
    multiple: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    virtualFocus: boolean;
    name: string | undefined;
    form: string | undefined;
    autoComplete: string | undefined;
    placeholder: string | undefined;
    items: ListData<any> | undefined;
    status: AsyncOptionsStatus;
};
declare function selectApiBody(context: PrimitiveContext<SelectOptions<any, any>, SelectState, string>): {
    getValue: () => unknown;
    setValue: (value: unknown, { reason, event }?: SelectChangeOptions<SelectValueChangeReason>) => boolean;
    clear: ({ reason, event, }?: SelectChangeOptions<SelectValueChangeReason>) => boolean;
    getQuery: () => string;
    setQuery: (query: string, { reason, event, }?: SelectChangeOptions<SelectQueryChangeReason>) => boolean;
    focus: () => void | undefined;
    internal: {
        focusTrigger: (options?: FocusOptions) => void | undefined;
        options: () => SelectOptions<any, any>;
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
            listingInputs: () => (string | number | boolean | ListData<unknown, import("./select.js").ListItem<unknown>> | ((item: import("./select.js").ListItem<unknown>, query: string) => boolean | number) | undefined)[];
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
        hooks: {
            choose?: (key: string, event?: Event) => void;
            icons?: ItemIcons;
        };
        store: import("../../index.js").Store<SelectState>;
        readonly icons: {
            get: (key: string) => Element | undefined;
            register(key: string, icon: Element, keep?: (icon: Element) => Element): () => void;
        };
        changeValue: (value: unknown, { reason, event, }?: {
            reason?: SelectValueChangeReason;
            event?: Event;
        }) => boolean;
        popup: {
            bind(el: HTMLElement, config?: import("../../foundation/popups/popup.js").AttachConfig): () => void;
            keydown: (event: KeyboardEvent) => void;
            triggerKeydown(event: KeyboardEvent): void;
            opening(by: PopupOpener, event?: Event): void;
            opener: () => PopupOpener;
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
        show: (request?: import("../../index.js").PopupChangeOptions<string> & {
            payload?: unknown;
            anchor?: import("../../index.js").Anchor;
            signal?: AbortSignal;
        } & Partial<{}> & {
            by?: PopupOpener;
            trigger?: string;
        }, openReason?: string | undefined) => Promise<import("../../index.js").PopupResult<string, string>>;
        hide: (request?: import("../../index.js").ChangeOptions<string> & {
            focus?: import("../../foundation/popups/popup.js").ReturnMode;
            returnValue?: string | undefined;
        }) => boolean;
        choose: (key: string, event?: Event) => void;
        hasValueIcon: () => boolean;
        prepare: () => void;
        initialFocus: () => HTMLElement | undefined;
        loadMore: {
            reached: () => void;
            bind: (el: HTMLElement) => () => void;
        };
        searchElement: () => HTMLInputElement | undefined;
        filterQuery: () => string;
        matchQuery: () => string;
        matchMode: () => "startsWith" | "contains" | "fuzzy" | undefined;
        typed: (event: Event) => boolean;
        hover(key: string, event: PointerEvent): void;
        isEmpty: (state: SelectState) => boolean;
        itemCount: () => number;
        activeDescendant(state: SelectState): string | undefined;
        alignedAnchor: (content: HTMLElement) => {
            getBoundingClientRect: () => {
                x: number;
                y: number;
                width: number;
                height: number;
            };
        } | null;
        triggerElement: () => HTMLElement | undefined;
        controlElement: () => HTMLElement | undefined;
        formElement: () => HTMLElement | undefined;
        onContentKeyDown: (event: KeyboardEvent) => void;
        onTriggerKeyDown: (event: KeyboardEvent, trigger: HTMLElement | undefined) => void;
        pointerPress: (trigger: HTMLElement, event: PointerEvent) => void;
        consumePressClick: () => boolean;
        keyOf: (value: unknown) => string;
        isSelected: (key: string, itemValue?: unknown) => boolean;
        labels: () => string[];
        queueLabels: () => void;
        learnLabels: (find: (keys: ReadonlySet<string>) => readonly {
            value: unknown;
            label: string;
        }[]) => boolean;
        serialized: () => string[];
        arrowElement: () => HTMLElement | undefined;
        itemProps: (key: string) => SelectItemMeta | undefined;
        contentProps: (key?: string) => SelectContentProps;
        adoptValue: (value: unknown) => void;
        reset(): void;
        setFormDisabled(formDisabled: boolean): void;
        autofill(text: string): void;
        restore(saved: string): void;
    };
    close: (options?: SelectChangeOptions<SelectOpenChangeReason>) => boolean;
    open: (options?: (SelectChangeOptions<SelectOpenChangeReason> & {
        signal?: AbortSignal;
    }) | undefined) => Promise<import("../../index.js").PopupResult<SelectOpenChangeReason, never>>;
    toggle: (options?: SelectChangeOptions<SelectOpenChangeReason>) => boolean;
    isOpen: () => boolean;
    setOpen: (open: boolean, options?: SelectChangeOptions<SelectOpenChangeReason>) => boolean;
    id: string;
};
declare const selectApi: (...args: Parameters<typeof selectApiBody>) => SelectApi;
type SelectItemMeta = {
    value: unknown;
    label?: string;
    disabled?: boolean;
    group?: string;
    index?: number;
};
/**
 * `select`'s api, which its slots and controller call. Adapters
 * expose it as `api`.
 * @stable
 */
interface SelectApi extends ReturnType<typeof selectApiBody> {
}
export { type InitialHighlight, initialSelectState, type SelectApi, selectApi, type SelectState, type Show, syncSelectState, virtual, };
