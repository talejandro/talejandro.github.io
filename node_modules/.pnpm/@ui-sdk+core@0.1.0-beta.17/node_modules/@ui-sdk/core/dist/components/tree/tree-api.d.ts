import type { Part, PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import { type TreeCheckStrategy } from "../../foundation/lists/tree-checked.js";
import { type TreeItemData } from "../../foundation/lists/tree-collection.js";
import type { TreeChangeOptions, TreeCheckedChangeReason, TreeExpandedChangeReason, TreeItemProps, TreeOptions, TreeMode, TreeValueChangeReason } from "./tree.js";
type TreeStore = {
    value: string | string[] | null;
    selected: string[];
    expanded: string[];
    checked: string[];
    checks: Record<string, true | "indeterminate">;
    mode: TreeMode;
    checkable: boolean;
    checkStrategy: TreeCheckStrategy;
    activation: "automatic" | "manual";
    expandOnPress: boolean;
    disabled: boolean;
    formDisabled: boolean;
    focusableWhenDisabled: boolean;
    keepMounted: boolean;
    hiddenUntilFound: boolean;
    current: string | null;
    items: TreeItemData[] | undefined;
    paths: readonly string[] | undefined;
    active: string | null;
    exiting: string[];
    loading: string[];
    failed: string[];
    pending: string[];
    version: number;
    siblings: Record<string, number>;
};
type Item = {
    key: string;
    props: TreeItemProps;
};
/**
 * `tree`'s api, which its slots and controller call. Adapters
 * expose it as `api`.
 * @stable
 */
interface TreeApi extends ReturnType<typeof treeApiBody> {
}
declare function treeApiBody(context: PrimitiveContext<TreeOptions, TreeStore, string>): {
    id: string;
    roving: {
        bind(el: HTMLElement, part: import("../../index.js").RovingFocusItem<TreeItemProps>): () => void;
        tabIndex(state: TreeStore, part: import("../../index.js").RovingFocusItem<TreeItemProps>): "0" | "-1";
        keydown(event: KeyboardEvent, el: HTMLElement): {
            key: string;
            from: string;
            shift: boolean;
        } | undefined;
        items: () => {
            key: string;
            props: TreeItemProps;
            el: HTMLElement;
        }[];
        focus(itemKey?: string): void;
        remember(itemKey: string): void;
        check: () => void;
        stopFor: (preferred: (item: import("../../index.js").RovingFocusItem<TreeItemProps>) => boolean) => string | undefined;
    };
    getExpanded: () => string[];
    setExpanded: (expanded: string[], why?: TreeChangeOptions<TreeExpandedChangeReason>) => boolean;
    isExpanded: (value: string) => boolean;
    expand: (value: string, why?: TreeChangeOptions<TreeExpandedChangeReason>) => boolean;
    collapse: (value: string, why?: TreeChangeOptions<TreeExpandedChangeReason>) => boolean;
    toggle: (value: string, why?: TreeChangeOptions<TreeExpandedChangeReason>) => boolean;
    expandAll(why?: TreeChangeOptions<TreeExpandedChangeReason>): boolean;
    collapseAll(why?: TreeChangeOptions<TreeExpandedChangeReason>): boolean;
    getValue: () => string | string[] | null;
    setValue: (value: string | string[] | null, why?: TreeChangeOptions<TreeValueChangeReason>) => boolean;
    getChecked: () => string[];
    setChecked: (checked: string[], why?: TreeChangeOptions<TreeCheckedChangeReason>) => boolean;
    checkedState: (value: string) => true | "indeterminate";
    reveal(value: string): void;
    focus: (value?: string) => void;
    internal: {
        mode: () => TreeMode;
        isBranch: (key: string, props?: TreeItemProps | undefined) => boolean;
        isDisabled: (state: TreeStore, key: string, props?: TreeItemProps | undefined) => boolean;
        level(key: string, props?: TreeItemProps | undefined): number;
        dataPosition(key: string): {
            index: number;
            size: number;
        } | undefined;
        composedPosition(siblings: Record<string, number>, key: string, props: TreeItemProps): {
            index: number;
            size: number;
        } | undefined;
        tabIndex: (state: TreeStore, part: Item) => "0" | "-1";
        items: () => TreeItemData[] | undefined;
        press: (key: string, el: HTMLElement | undefined, event?: Event) => void;
        keydown: (event: KeyboardEvent, el: HTMLElement | undefined, key: string) => void;
        pressIndicator(key: string, event?: Event): void;
        pressCheckbox(key: string, event?: Event): void;
        bindItem(el: HTMLElement, part: Item): () => void;
        bindRoot(el: HTMLElement): (() => void) | undefined;
        bindGroup(el: HTMLElement, key: string, isFindable: () => boolean, part: Part): () => void;
    };
};
declare const treeApi: (...args: Parameters<typeof treeApiBody>) => TreeApi;
export { type TreeApi, treeApi, type TreeStore };
