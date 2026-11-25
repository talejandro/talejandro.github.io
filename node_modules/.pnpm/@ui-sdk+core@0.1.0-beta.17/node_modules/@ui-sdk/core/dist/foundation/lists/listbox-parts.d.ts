import { type AsyncOptionsStatus } from "./async-options.js";
import { isDisabled } from "../forms/form.js";
import { type ListData, type Listbox } from "./listbox.js";
import type { BaseSlotProps } from "../kernel/primitive-types.js";
import type { Store } from "../kernel/store.js";
import { type ValueSelection } from "./listbox-value.js";
type ListboxState = FormState & {
    open: boolean;
};
type FormState = {
    value: unknown;
    multiple: boolean;
    disabled: boolean;
    formDisabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
    autoComplete?: string;
};
type ListboxApi = {
    focus: () => void;
    internal: {
        listbox: Listbox;
        selection: ValueSelection;
        keyOf: (value: unknown) => string;
        controlElement: () => HTMLElement | undefined;
        itemProps: (key: string) => ItemMeta | undefined;
        restore: (saved: string) => void;
        reset: () => void;
        setFormDisabled: (disabled: boolean) => void;
        autofill?: (text: string) => void;
    };
};
type ItemMeta = {
    value: unknown;
    label?: string;
    keywords?: string[];
    disabled?: boolean;
    group?: string;
    index?: number;
};
type IndicatorProps = {
    item?: string;
    keepMounted?: boolean;
};
declare const noItems: ListData<unknown>;
declare const listStepKeys: readonly ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "ctrl+n", "ctrl+p"];
declare const isLocked: (state: {
    disabled: boolean;
    formDisabled: boolean;
    readOnly: boolean;
}) => boolean;
declare const formAttrs: (state: Pick<ListboxState, "disabled" | "formDisabled" | "readOnly" | "required">) => {
    "data-disabled": string | undefined;
    "data-readonly": string | undefined;
    "data-required": string | undefined;
};
declare function stashContent(el: HTMLElement, shown: () => boolean, subscribe: (listener: () => void) => () => void): () => void;
declare function warnIfUnnamed(el: HTMLElement, message: string, from: {
    component: string;
    id: string;
}, named?: () => boolean): void;
declare function positionAttrs(index: number | undefined, listbox: Listbox): {
    "aria-posinset"?: undefined;
    "aria-setsize"?: undefined;
} | {
    "aria-posinset": string;
    "aria-setsize": string;
};
type OptionListApi = {
    internal: {
        listbox: Listbox;
        itemProps: (key: string) => ItemMeta | undefined;
        filterQuery: () => string;
        isEmpty: (state: never) => boolean;
        itemCount: () => number;
    };
};
type OptionListState = {
    items: ListData<unknown> | undefined;
    status: AsyncOptionsStatus;
    query: string;
};
declare function registerItem(el: HTMLElement, { api, key, props, }: {
    api: {
        internal: Pick<OptionListApi["internal"], "listbox" | "itemProps">;
    };
    key: string;
    props: ItemMeta;
}): () => void;
declare function bindItem(el: HTMLElement, { api, key, props }: {
    api: ListboxApi;
    key: string;
    props: ItemMeta;
}): () => void;
declare function optionGroupPart<State extends GroupLabelsState, Api extends {
    internal: {
        listbox: Listbox;
    };
}>(): {
    props: {
        id: "id";
    };
    role: "group";
    attrs: (state: State, { id, key, api }: {
        id: string;
        key: string;
        props: BaseSlotProps;
        api: Api;
    }) => {
        "aria-labelledby": string | undefined;
        hidden: string | undefined;
    };
};
declare const groupLabelledBy: (state: GroupLabelsState, id: string, group: string) => string | undefined;
type GroupLabelsState = {
    groupLabels: readonly string[];
};
declare function optionSeparatorPart<State extends OptionListState, Api extends OptionListApi>(): {
    role: "none";
    attrs: (state: State, { api }: {
        id: string;
        key: string;
        props: BaseSlotProps;
        api: Api;
    }) => {
        "aria-hidden": string;
        hidden: string | undefined;
    };
};
type EmptyProps = {
    /** @internal Hides the message while the list has items, for web components that can't skip rendering it. */
    stash?: boolean;
};
declare function emptyPart<State extends OptionListState, Api extends OptionListApi>(): {
    props: {
        stash: "boolean";
    };
    state: (state: State, { api }: {
        id: string;
        key: string;
        props: EmptyProps & BaseSlotProps;
        api: Api;
    }) => {
        loading: boolean;
        empty: boolean;
        query: string;
    };
    role: "status";
    attrs: (state: State, { api }: {
        id: string;
        key: string;
        props: EmptyProps & BaseSlotProps;
        api: Api;
    }) => {
        "aria-live": string;
        "aria-atomic": string;
        "data-empty": string | undefined;
        "data-loading": string | undefined;
    };
    bind(el: HTMLElement, { api, store, props }: import("../../index.js").Part<State, Api, EmptyProps & BaseSlotProps>): (() => void) | undefined;
};
declare function statusPart<State extends OptionListState, Api extends OptionListApi>(): {
    state: (state: State, { api }: {
        id: string;
        key: string;
        props: BaseSlotProps;
        api: Api;
    }) => {
        status: AsyncOptionsStatus;
        loading: boolean;
        count: number;
    };
    role: "status";
    attrs: (state: State) => {
        "aria-live": string;
        "aria-atomic": string;
        "data-loading": string | undefined;
    };
};
declare function rootPart<State extends ListboxState, Api extends ListboxApi>({ focusOnSelfClick, }: {
    focusOnSelfClick: boolean;
}): {
    attrs: (state: State) => {
        "data-open": string | undefined;
        "data-closed": string | undefined;
        "data-disabled": string | undefined;
        "data-readonly": string | undefined;
        "data-required": string | undefined;
    };
    bind: (el: HTMLElement, context: import("../../index.js").Part<State, Api, BaseSlotProps>) => () => void;
};
declare function bindFormRoot<State extends FormState, Api extends ListboxApi>(el: HTMLElement, { api, store }: {
    api: Api;
    store: Store<State>;
}, { focusOnSelfClick }: {
    focusOnSelfClick: boolean;
}): () => void;
declare function hiddenInputPart<State extends FormState, Api extends ListboxApi>(slot: string): {
    attrs: (state: State, { id, api }: {
        id: string;
        key: string;
        props: BaseSlotProps;
        api: Api;
    }) => {
        id: string;
        name: string | undefined;
        value: string;
        form: string | undefined;
        autocomplete: string | undefined;
        required: string | undefined;
        disabled: string | undefined;
        "aria-hidden": string;
        tabindex: string;
        style: string;
    };
    bind: (el: HTMLElement, { api, store }: import("../../index.js").Part<State, Api, BaseSlotProps>) => () => void;
};
declare function valueInputPart<State extends FormState, Api>(): {
    props: {
        value: "string";
    };
    attrs: (state: State, { props }: {
        id: string;
        key: string;
        props: {
            value: string;
        } & BaseSlotProps;
        api: Api;
    }) => {
        type: string;
        name: string | undefined;
        value: string;
        form: string | undefined;
        disabled: string | undefined;
    };
};
declare function itemIndicatorPart<State extends object, Api extends ListboxApi>(): {
    props: {
        item: {
            kind: "string";
            from: string;
            required: true;
        };
        keepMounted: "boolean";
        id: "id";
    };
    present: (state: State, { props, api }: {
        id: string;
        key: string;
        props: IndicatorProps & BaseSlotProps;
        api: Api;
    }) => boolean;
    state: (state: State, { props, api }: {
        id: string;
        key: string;
        props: IndicatorProps & BaseSlotProps;
        api: Api;
    }) => {
        selected: boolean;
    };
    attrs: (state: State, { props, api }: {
        id: string;
        key: string;
        props: IndicatorProps & BaseSlotProps;
        api: Api;
    }) => {
        "aria-hidden": string;
        "data-selected": string | undefined;
    };
    bind: (el: HTMLElement, { api, props }: import("../../index.js").Part<State, Api, IndicatorProps & BaseSlotProps>) => (() => void) | undefined;
};
declare function groupLabelPart<State extends GroupLabelsState, Api>(): {
    props: {
        id: {
            kind: "string";
            from: string;
            required: true;
        };
        group: {
            kind: "string";
            from: string;
            required: true;
        };
    };
    attrs: (state: State, { id, props }: {
        id: string;
        key: string;
        props: {
            group?: string;
        } & BaseSlotProps;
        api: Api;
    }) => {
        id: string;
    };
    bind: (el: HTMLElement, { store, props }: import("../../index.js").Part<State, Api, {
        group?: string;
    } & BaseSlotProps>) => () => void;
};
declare function arrowPart<State extends {
    open: boolean;
}, Api extends {
    internal: {
        popup: {
            checkPlacement: () => void;
        };
    };
}>(): {
    state: (state: State) => {
        open: boolean;
    };
    attrs: (state: State) => {
        "data-open": string | undefined;
        "data-closed": string | undefined;
        "aria-hidden": string;
    };
    bind(_: HTMLElement, { api }: import("../../index.js").Part<State, Api, BaseSlotProps>): void;
};
export { arrowPart, bindFormRoot, bindItem, emptyPart, formAttrs, groupLabelledBy, groupLabelPart, hiddenInputPart, isDisabled, isLocked, itemIndicatorPart, listStepKeys, noItems, optionGroupPart, optionSeparatorPart, positionAttrs, registerItem, rootPart, stashContent, statusPart, valueInputPart, warnIfUnnamed, };
