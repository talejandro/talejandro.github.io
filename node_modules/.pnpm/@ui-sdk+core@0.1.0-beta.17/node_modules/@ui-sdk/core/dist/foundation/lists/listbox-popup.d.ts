import { type AsyncOptionsStatus } from "./async-options.js";
import { type FieldName } from "./field-name.js";
import { type Anchor, type PortalProps, type PositionProps } from "../platform/position.js";
import { registerPopupElement } from "../popups/popup-elements.js";
import { type SheetConfig } from "../popups/presentation.js";
import type { BaseSlotProps, Part } from "../kernel/primitive-types.js";
import type { Store } from "../kernel/store.js";
type ListPopupState = {
    open: boolean;
    mounted: boolean;
    presentation: "popover" | "sheet";
    status: AsyncOptionsStatus;
    listed: boolean;
    labeled: boolean;
    fieldName: FieldName;
    settled: boolean;
    multiple?: boolean;
    prepared?: boolean;
};
type ListContentProps = PositionProps & PortalProps & {
    keepMounted?: boolean;
};
type ListContentInternal = {
    presentation: {
        bind: (el: HTMLElement, config: SheetConfig) => () => void;
    };
    loadMore: {
        bind: (el: HTMLElement) => () => void;
    };
    contentProps: (key: string) => ListContentProps;
    arrowElement: () => HTMLElement | undefined;
    initialFocus: () => HTMLElement | undefined;
};
type ListPopupApi = {
    internal: ListContentInternal & {
        anchorElement: () => Anchor | undefined;
        onListKeyDown: (event: KeyboardEvent) => void;
    };
};
type FieldState = {
    open: boolean;
    disabled: boolean;
    formDisabled: boolean;
    readOnly: boolean;
    required: boolean;
};
declare const inputState: (state: FieldState) => {
    open: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
};
declare const listId: (state: {
    listed: boolean;
}, id: string) => string;
declare function listContentPart<State extends ListPopupState, Api extends ListPopupApi>(): {
    props: {
        side: "string";
        align: "string";
        sideOffset: "number";
        alignOffset: "number";
        collisionPadding: "number";
        arrowPadding: "number";
        container: "value";
        anchor: "string";
        keepMounted: "boolean";
    };
    connect: typeof registerPopupElement;
    present: (state: State, { props }: {
        id: string;
        key: string;
        props: PositionProps & PortalProps & {
            keepMounted?: boolean;
        } & BaseSlotProps;
        api: Api;
    }) => boolean;
    role: (state: State) => "listbox" | "presentation";
    roles: ("listbox" | "presentation")[];
    keys: ("ArrowUp" | "ArrowDown" | "Home" | "End" | "PageUp" | "PageDown" | "Enter" | " " | "typeahead" | "ctrl+n" | "ctrl+p")[];
    attrs: (state: State, { id }: {
        id: string;
        key: string;
        props: PositionProps & PortalProps & {
            keepMounted?: boolean;
        } & BaseSlotProps;
        api: Api;
    }) => {
        "aria-busy": string | undefined;
        "data-presentation": "popover" | "sheet";
        "aria-labelledby": string | undefined;
        "aria-label": string | undefined;
        "aria-multiselectable": string | undefined;
        "data-open": string | undefined;
        "data-closed": string | undefined;
        id: string;
        tabindex: string;
        hidden: string | undefined;
    };
    on: {
        keydown: (event: KeyboardEvent, { api }: {
            el: HTMLElement | undefined;
            id: string;
            key: string;
            props: PositionProps & PortalProps & {
                keepMounted?: boolean;
            } & BaseSlotProps;
            store: Store<State>;
            api: Api;
        }) => void;
        pointerdown: typeof import("../focus/index.js").holdFocus;
        mousedown: typeof import("../focus/index.js").holdFocus;
    };
    bind: (el: HTMLElement, part: Part<State, Api, PositionProps & PortalProps & {
        keepMounted?: boolean;
    } & BaseSlotProps>) => () => void;
};
declare function bindListContent(el: HTMLElement, key: string, flags: Store<{
    settled: boolean;
}>, internal: ListContentInternal, config: {
    part: Part;
    anchor: () => Anchor | undefined;
    aligned?: () => Anchor | false | null | undefined;
    snapPoints?: SheetConfig["snapPoints"];
}): () => void;
declare function listPart<State extends ListPopupState, Api>(): {
    role: "listbox";
    keys: {
        none: string;
    };
    attrs: (state: State, { id }: {
        id: string;
        key: string;
        props: BaseSlotProps;
        api: Api;
    }) => {
        "aria-busy": string | undefined;
        "aria-labelledby": string | undefined;
        "aria-label": string | undefined;
        id: string;
        "aria-multiselectable": string | undefined;
    };
    bind: (el: HTMLElement, { store }: Part<State, Api, BaseSlotProps>) => () => void;
};
export { bindListContent, inputState, listContentPart, listId, listPart };
