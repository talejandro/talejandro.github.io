import { type Listbox } from "./listbox.js";
import type { BaseSlotProps } from "../kernel/primitive-types.js";
import { type ValueSelection } from "./listbox-value.js";
/** What a select-all option receives: how many of its items are selected. */
type ListSelectAllState = {
    /** Whether every item it covers is selected. */
    checked: boolean;
    /** Whether some of its items are selected, but not all. */
    indeterminate: boolean;
    /** Whether it's highlighted, by the keyboard or the pointer. */
    highlighted: boolean;
    /** Whether it can't be used: nothing it covers can be chosen, or choosing them all would pass `maxSelected`. */
    disabled: boolean;
};
type SelectAllApi = {
    internal: {
        listbox: Listbox;
        selection: ValueSelection;
        limit?: () => number | undefined;
        choose: (key: string, event?: Event) => void;
        hover: (key: string, event: PointerEvent) => void;
    };
};
type SelectAllOwnerState = {
    multiple: boolean;
    highlighted: string | null;
    focusInList: boolean;
};
type OptionFocus = "roving" | "active-descendant";
type SelectAllFeatureApi = SelectAllApi & {
    internal: {
        hooks: {
            choose?: (key: string, event?: Event) => void;
        };
        changeValue: (value: unknown, details: {
            reason: "item-press";
            event?: Event;
        }) => unknown;
    };
};
/**
 * Select-all as a feature: the option, and what pressing it does. The
 * component calls the `choose` hook for a select-all key once it has checked
 * the value can change.
 */
declare function selectAllFeature<State extends SelectAllOwnerState, Api extends SelectAllFeatureApi>({ focus }: {
    focus: OptionFocus;
}): {
    slots: {
        "select-all": {
            present: (state: State) => boolean;
            state: (state: State, { api, key }: {
                id: string;
                key: string;
                props: BaseSlotProps;
                api: Api;
            }) => {
                checked: boolean;
                indeterminate: boolean;
                highlighted: boolean;
                disabled: boolean;
            };
            role: "option";
            focus: OptionFocus;
            attrs: (state: State, { id, api, key }: {
                id: string;
                key: string;
                props: BaseSlotProps;
                api: Api;
            }) => {
                "data-checked": string | undefined;
                "data-unchecked": string | undefined;
                "data-indeterminate": string | undefined;
                id: string;
                tabindex: string | undefined;
                "aria-selected": string;
                "aria-checked": string;
                "aria-disabled": string | undefined;
                "data-disabled": string | undefined;
            };
            live: {
                read: (state: State, part: {
                    id: string;
                    key: string;
                    props: BaseSlotProps;
                    api: Api;
                }) => import("../../index.js").Attrs;
                attach(part: import("../../index.js").Part<State, Api, BaseSlotProps>, el: HTMLElement): () => void;
            };
            on: {
                pointermove: (event: PointerEvent, { api, key }: {
                    el: HTMLElement | undefined;
                    id: string;
                    key: string;
                    props: BaseSlotProps;
                    store: import("../../index.js").Store<State>;
                    api: Api;
                }) => void;
                pointerdown: typeof import("../focus/index.js").holdFocus;
                mousedown: typeof import("../focus/index.js").holdFocus;
            };
            press: ({ api, key }: {
                el: HTMLElement | undefined;
                id: string;
                key: string;
                props: BaseSlotProps;
                store: import("../../index.js").Store<State>;
                api: Api;
            }, event: Event | undefined) => void;
            bind: (el: HTMLElement, { api, key }: import("../../index.js").Part<State, Api, BaseSlotProps>) => () => void;
        };
    };
    extend(api: Api): void;
};
export { type ListSelectAllState, selectAllFeature };
