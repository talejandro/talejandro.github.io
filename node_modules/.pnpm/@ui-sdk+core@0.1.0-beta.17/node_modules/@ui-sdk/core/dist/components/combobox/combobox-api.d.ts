import { type AsyncOptionsStatus } from "../../foundation/lists/async-options.js";
import type { ComboboxChangeOptions, ComboboxContentProps, ComboboxOpenChangeReason, ComboboxOptions, ComboboxQueryChangeReason, ComboboxValueChangeReason } from "./combobox.js";
import { type FieldName } from "../../foundation/lists/field-name.js";
import { type PopupOpener } from "../../foundation/popups/popup.js";
import { type PopupState } from "../../foundation/popups/create-popup.js";
import { type ListData, type ListEntry } from "../../foundation/lists/listbox.js";
import { type Listing } from "../../foundation/lists/listbox-listing.js";
import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import { type ItemIcons } from "../../foundation/lists/item-icon.js";
declare const CREATE = "\0create";
type ComboboxState = PopupState & {
    value: unknown;
    initial: unknown;
    highlighted: string | null;
    query: string;
    dirty: boolean;
    status: AsyncOptionsStatus;
    listed: boolean;
    labeled: boolean;
    fieldName: FieldName;
    inlineInput: boolean;
    multiple: boolean;
    maxSelected: number | undefined;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    formDisabled: boolean;
    items: ListData<unknown> | undefined;
    pending: boolean;
    error: unknown;
    labels: number;
    icons: number;
    pageLocale: string | null;
    mounts: number;
    settled: boolean;
    presentation: "popover" | "sheet";
    prepared: boolean;
    focusInList: boolean;
    groupLabels: readonly string[];
    visibleChips: number | null;
    listing: Listing;
};
declare function initialComboboxState(options: ComboboxOptions<any, any>): ComboboxState;
declare function syncComboboxState(options: ComboboxOptions<any, any>): {
    query?: string | undefined;
    value?: any;
    open?: boolean | undefined;
    initial?: any;
    multiple: boolean;
    maxSelected: number | undefined;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    status: AsyncOptionsStatus;
    items: ListData<any> | undefined;
};
declare function comboboxApiBody(context: PrimitiveContext<ComboboxOptions<any, any>, ComboboxState, string>): {
    getValue: () => unknown;
    setValue: (value: unknown, { reason, event }?: ComboboxChangeOptions<ComboboxValueChangeReason>) => boolean;
    clear: ({ reason, event, }?: ComboboxChangeOptions<ComboboxValueChangeReason>) => boolean;
    getQuery: () => string;
    setQuery: (query: string, { reason, event, }?: ComboboxChangeOptions<ComboboxQueryChangeReason>) => boolean;
    getHighlighted: () => {} | null;
    highlight: (value: unknown) => boolean;
    focus: () => void | undefined;
    internal: {
        options: () => ComboboxOptions<any, any>;
        allowCustomValue: () => boolean;
        listbox: {
            entries: () => ListEntry[];
            visibleData: () => {
                data: ListData<unknown>;
                query: string;
                filter: unknown;
                rank: boolean;
                list: ListData<unknown>;
                flat: ListEntry[];
            } | undefined;
            dataItems: () => ListEntry[] | undefined;
            find: (key: string | null) => ListEntry | undefined;
            disabled: (entry: ListEntry) => boolean;
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
            search: (char: string, from: string | null) => ListEntry | undefined;
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
            listingInputs: () => (string | number | boolean | ListData<unknown, import("./combobox.js").ListItem<unknown>> | ((item: import("./combobox.js").ListItem<unknown>, query: string) => boolean | number) | undefined)[];
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
        store: import("../../index.js").Store<ComboboxState>;
        readonly icons: {
            get: (key: string) => Element | undefined;
            register(key: string, icon: Element, keep?: (icon: Element) => Element): () => void;
        };
        changeValue: (value: unknown, { reason, event, }?: {
            reason?: ComboboxValueChangeReason;
            event?: Event;
        }) => boolean;
        presentation: {
            open: () => void;
            resolve: () => string;
            bind(el: HTMLElement, config: import("../../foundation/popups/index.js").SheetConfig): () => void;
        };
        contentElement: () => HTMLElement | undefined;
        hasValueIcon: () => boolean;
        prepare: () => true | void;
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
        remove: (value: unknown, event?: Event) => void;
        create: (event?: Event) => void;
        createShown: (state: ComboboxState) => boolean;
        maxReached: () => boolean;
        typed: (text: string, event?: Event, focused?: boolean) => void;
        onInput: (event: Event) => void;
        onInputKeyDown: (event: KeyboardEvent) => void;
        onListKeyDown: (event: KeyboardEvent) => void;
        onChipKeyDown: (event: KeyboardEvent, el: HTMLElement, value: unknown) => void;
        onTriggerKeyDown: (event: KeyboardEvent) => void;
        loadMore: {
            reached: () => void;
            bind: (el: HTMLElement) => () => void;
        };
        limit: () => number | undefined;
        matchQuery: () => string;
        matchMode: () => "startsWith" | "contains" | "fuzzy" | undefined;
        hover(key: string, event: PointerEvent): void;
        chipsElement: () => HTMLElement | undefined;
        chipElements: () => HTMLElement[];
        setVisibleChips: (visibleChips: number | null) => false | void;
        ownsElement: (target: Node) => boolean;
        inputElement: () => HTMLElement | undefined;
        controlElement: () => HTMLElement | undefined;
        anchorElement: () => HTMLElement | undefined;
        arrowElement: () => HTMLElement | undefined;
        filterQuery: () => string;
        keyOf: (value: unknown) => string;
        isSelected: (key: string, itemValue?: unknown) => boolean;
        labelOf: (value: unknown) => string;
        labels: () => string[];
        queueLabels: () => void;
        learnLabels(find: Parameters<(find: (keys: ReadonlySet<string>) => readonly {
            value: unknown;
            label: string;
        }[]) => boolean>[0]): void;
        serialized: () => string[];
        initialFocus(): HTMLElement | undefined;
        isEmpty: (state: ComboboxState) => boolean;
        itemCount: () => number;
        itemProps: (key: string) => ComboboxItemMeta | undefined;
        contentProps: (key?: string) => ComboboxContentProps;
        activeDescendant(state: ComboboxState): string | undefined;
        adoptValue: (value: unknown) => void;
        reset(): void;
        setFormDisabled(formDisabled: boolean): void;
        restore(saved: string): void;
    };
    close: (options?: ComboboxChangeOptions<ComboboxOpenChangeReason>) => boolean;
    open: (options?: (ComboboxChangeOptions<ComboboxOpenChangeReason> & {
        signal?: AbortSignal;
    }) | undefined) => Promise<import("../../index.js").PopupResult<ComboboxOpenChangeReason, never>>;
    toggle: (options?: ComboboxChangeOptions<ComboboxOpenChangeReason>) => boolean;
    isOpen: () => boolean;
    setOpen: (open: boolean, options?: ComboboxChangeOptions<ComboboxOpenChangeReason>) => boolean;
    id: string;
};
declare const comboboxApi: (...args: Parameters<typeof comboboxApiBody>) => ComboboxApi;
type ComboboxItemMeta = {
    value: unknown;
    label?: string;
    keywords?: string[];
    disabled?: boolean;
    group?: string;
    index?: number;
};
/**
 * `combobox`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface ComboboxApi extends ReturnType<typeof comboboxApiBody> {
}
export { type ComboboxApi, comboboxApi, type ComboboxState, CREATE, initialComboboxState, syncComboboxState, };
