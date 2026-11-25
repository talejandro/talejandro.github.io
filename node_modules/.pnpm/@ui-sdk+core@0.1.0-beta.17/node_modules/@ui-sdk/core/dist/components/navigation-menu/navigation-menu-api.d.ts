import { type PopupOpener } from "../../foundation/popups/popup.js";
import { type Anchor } from "../../foundation/platform/position.js";
import type { ChangeOptions } from "../../foundation/kernel/details.js";
import type { Part, PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
type Orientation = "horizontal" | "vertical";
type NavigationMenuStoreState = {
    value: string | null;
    orientation: Orientation;
    mounted: boolean;
    active: string | null;
    previous: string | null;
    forward: boolean | null;
    exiting: string[];
    contents: string[];
    viewport: boolean;
    nested: boolean;
};
type NavigationMenuInternalOptions = {
    parent?: {
        api: NavigationMenuApi;
        item: string;
    };
};
type ApiOptions = NavigationMenuInternalOptions & {
    onOpenChangeComplete?: (open: boolean) => void;
    delay?: number;
    closeDelay?: number;
    openOnHover?: boolean;
    closeOnSelect?: boolean;
};
/**
 * `navigationMenu`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface NavigationMenuApi extends ReturnType<typeof navigationMenuApiBody> {
}
declare function navigationMenuApiBody(context: PrimitiveContext<ApiOptions, NavigationMenuStoreState, string>): {
    /** The open item's value, or null when every panel is closed. */
    getValue: () => string | null;
    /** Opens an item's panel, or closes the open one with `null`. Returns false when canceled. */
    setValue(value: string | null, { reason, event }?: ChangeOptions<string>): boolean;
    /** Whether a panel is open. */
    isOpen: () => boolean;
    /** Closes the open panel. Returns false when canceled or already closed. */
    close: ({ reason, event }?: ChangeOptions<string>) => boolean;
    /** Moves focus to an item's trigger: the open one, or the first one, without a value. */
    focus(value?: string): void;
    internal: {
        options: () => ApiOptions;
        viewportElement: () => HTMLElement | undefined;
        surface: () => {
            show: (request?: import("../../index.js").PopupChangeOptions<string> & {
                payload?: unknown;
                anchor?: Anchor;
                signal?: AbortSignal;
            } & Partial<{}> & {
                by?: PopupOpener;
                trigger?: string;
            }, openReason?: string | undefined) => Promise<import("../../index.js").PopupResult<string, string>>;
            hide: (request?: ChangeOptions<string> & {
                focus?: import("../../foundation/popups/popup.js").ReturnMode;
                returnValue?: string | undefined;
            }) => boolean;
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
        ensureSurface: (key: string) => void;
        surfaces: Map<string | null, {
            show: (request?: import("../../index.js").PopupChangeOptions<string> & {
                payload?: unknown;
                anchor?: Anchor;
                signal?: AbortSignal;
            } & Partial<{}> & {
                by?: PopupOpener;
                trigger?: string;
            }, openReason?: string | undefined) => Promise<import("../../index.js").PopupResult<string, string>>;
            hide: (request?: ChangeOptions<string> & {
                focus?: import("../../foundation/popups/popup.js").ReturnMode;
                returnValue?: string | undefined;
            }) => boolean;
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
        }>;
        hoverEnter: (event: PointerEvent, key: string, disabled?: boolean) => void;
        hoverMove(event: PointerEvent, key: string, disabled?: boolean): void;
        leaveTrigger: (event: PointerEvent, key: string) => void;
        enterPanel: (event: PointerEvent) => void;
        triggerPress: (key: string, el: HTMLElement | undefined, event?: Event) => boolean | undefined;
        listKeydown: (event: KeyboardEvent, list: HTMLElement) => void;
        panelKeydown: (event: KeyboardEvent, panel: HTMLElement) => void;
        rootKeydown: (event: KeyboardEvent) => void;
        linkPress: (event: Event, closeOnSelect: boolean | undefined) => void;
        leavePanel: (event: PointerEvent) => void;
        watch(listener: (value: string | null) => void): () => void;
        bindViewport: (el: HTMLElement, part: Part) => () => void;
        bindContent: (el: HTMLElement, key: string, props: {
            hiddenUntilFound?: boolean;
        }, part: Part) => () => void;
        bindLink: (el: HTMLElement, key: string) => () => void;
        bindIndicator: (el: HTMLElement) => () => void;
        inViewport(key: string): boolean;
    };
};
declare const navigationMenuApi: (...args: Parameters<typeof navigationMenuApiBody>) => NavigationMenuApi;
declare function isShown(state: NavigationMenuStoreState, key: string): boolean;
export { isShown, type NavigationMenuApi, navigationMenuApi, type NavigationMenuInternalOptions, type NavigationMenuStoreState, };
