import type { BaseSlotProps } from "../kernel/primitive-types.js";
import type { Store } from "../kernel/store.js";
/** Props of an item's icon part, in every framework. */
type ItemIconProps = {
    /**
     * Flips the icon horizontally in right-to-left text, for icons that point a
     * way, like arrows and chevrons. Icons that picture a thing, like a
     * clock or a check, stay as they are.
     * @defaultValue false
     */
    mirror?: boolean;
};
/** What an icon part's render function receives. */
type ItemIconState = {
    /** Whether it flips in right-to-left text. */
    mirror: boolean;
};
type IconProps = ItemIconProps & BaseSlotProps & {
    /** @internal The key of the item the icon is in, for a list whose value shows it. */
    item?: string;
};
type IconPlacement = {
    item: string;
    list?: string;
};
/**
 * An icon inside an item, like a menu item, an option, a tab or a toggle.
 * `register` hears about each icon's element, for a value that shows the
 * selected item's icon.
 */
declare function itemIconPart<State extends object, Api>(placement: IconPlacement & {
    component: string;
    register?: (el: HTMLElement, context: {
        api: Api;
        props: IconProps;
    }) => () => void;
}): {
    props: {
        mirror: "boolean";
        id: "id";
        item: {
            kind: "string";
            from: string;
        };
    };
    state: (state: State, { props }: {
        id: string;
        key: string;
        props: IconProps;
        api: Api;
    }) => {
        mirror: boolean;
    };
    attrs: (state: State, { props }: {
        id: string;
        key: string;
        props: IconProps;
        api: Api;
    }) => {
        "aria-hidden": string;
        "data-mirror": string | undefined;
    };
    bind(el: HTMLElement, { api, props, id, store }: import("../../index.js").Part<State, Api, IconProps>): () => void;
};
declare function createItemIcons(store: Store<{
    icons: number;
}>): {
    /** The icon element of an item. */
    get: (key: string) => Element | undefined;
    /** Remembers an item's icon until another replaces it. `keep` copies it when it leaves. */
    register(key: string, icon: Element, keep?: (icon: Element) => Element): () => void;
};
type ItemIcons = ReturnType<typeof createItemIcons>;
/**
 * Item icons as a feature: the icon inside an item, the selected item's icon
 * outside the list, and the icons by key the second copies from, created when
 * the feature is first used.
 */
declare function itemIconsFeature<State extends {
    icons: number;
}, Api extends ValueIconApi & IconsFeatureApi>(placement: IconPlacement & {
    component: string;
    register?: (el: HTMLElement, context: {
        api: Api;
        props: IconProps;
    }) => () => void;
}): {
    slots: {
        "item-icon": {
            props: {
                mirror: "boolean";
                id: "id";
                item: {
                    kind: "string";
                    from: string;
                };
            };
            state: (state: State, { props }: {
                id: string;
                key: string;
                props: IconProps;
                api: Api;
            }) => {
                mirror: boolean;
            };
            attrs: (state: State, { props }: {
                id: string;
                key: string;
                props: IconProps;
                api: Api;
            }) => {
                "aria-hidden": string;
                "data-mirror": string | undefined;
            };
            bind(el: HTMLElement, { api, props, id, store }: import("../../index.js").Part<State, Api, IconProps>): () => void;
        };
        "value-icon": {
            present: (state: State, { api }: {
                id: string;
                key: string;
                props: BaseSlotProps;
                api: Api;
            }) => boolean;
            attrs: () => {
                "aria-hidden": string;
            };
            bind(el: HTMLElement, { api, store }: import("../../index.js").Part<State, Api, BaseSlotProps>): () => void;
        };
    };
    extend(api: Api): void;
};
type IconsFeatureApi = {
    internal: {
        hooks: {
            icons?: ItemIcons;
        };
        store: Store<{
            icons: number;
        }>;
    };
};
declare const optionIcon: {
    item: string;
    list: string;
};
declare function rememberIcon(el: HTMLElement, { api, props }: {
    api: ValueIconApi;
    props: IconProps;
}): () => void;
type ValueIconApi = {
    internal: {
        icons: ItemIcons;
        selection: {
            keys: () => string[];
        };
    };
};
export { createItemIcons, itemIconPart, type ItemIconProps, type ItemIcons, itemIconsFeature, type ItemIconState, optionIcon, rememberIcon, };
