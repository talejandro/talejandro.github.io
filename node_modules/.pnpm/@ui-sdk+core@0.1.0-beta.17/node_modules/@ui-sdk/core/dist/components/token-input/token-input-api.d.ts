import type { PrimitiveContext } from "../../foundation/kernel/primitive-types.js";
import type { TextEditorAdapter, TextRange, Token, TokenInsert } from "../../foundation/text/text-editor.js";
import type { TokenInputChangeOptions, TokenInputOptions, TokenInputValueChangeReason } from "./token-input.js";
import { toText, type TokenInputValue } from "./token-input-model.js";
import type { TokenView } from "./token-input-view.js";
type TokenInputState = {
    value: TokenInputValue;
    initial: TokenInputValue;
    selected: string;
    hosts: number;
    custom: boolean;
    disabled: boolean;
    formDisabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
};
declare function initialTokenInputState(options: TokenInputOptions): {
    value: TokenInputValue;
    initial: TokenInputValue;
    selected: string;
    hosts: number;
    custom: boolean;
    disabled: boolean;
    formDisabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
};
declare function syncTokenInputState(options: TokenInputOptions): {
    initial?: TokenInputValue | undefined;
    value?: TokenInputValue | undefined;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    name: string | undefined;
    form: string | undefined;
};
type Edit = {
    reason: TokenInputValueChangeReason;
    event?: Event;
    inputType?: string;
    selection?: TextRange;
    group?: string;
    record?: boolean;
};
declare function tokenInputApiBody(context: PrimitiveContext<TokenInputOptions, TokenInputState, string>): {
    id: string;
    editor: TextEditorAdapter;
    getValue: () => TokenInputValue;
    setValue: (value: TokenInputValue, { reason, event }?: TokenInputChangeOptions) => boolean;
    getText: (custom?: Parameters<typeof toText>[1]) => string;
    getLabel: () => string;
    insert(content: string | TokenInsert | TokenInputValue, { at, resolve, reason, event, }?: TokenInputChangeOptions & {
        at?: "caret" | "end" | TextRange;
        resolve?: PromiseLike<void | Partial<TokenInsert>>;
    }): boolean;
    updateToken: (tokenId: string, patch: Partial<Omit<Token, "id">>) => boolean;
    removeToken: (tokenId: string, { reason, event }?: TokenInputChangeOptions) => boolean;
    undo: () => boolean;
    redo: () => boolean;
    canUndo: () => boolean;
    canRedo: () => boolean;
    clear: ({ reason, event }?: TokenInputChangeOptions) => boolean;
    focus({ at }?: {
        at?: "start" | "end";
    }): void;
    internal: {
        options: () => TokenInputOptions;
        editable: () => boolean;
        codec: () => import("./token-input-model.js").TokenCodec;
        describe: (token: Token) => string;
        commit: (next: TokenInputValue, { reason, event, inputType, selection: after, group, record }: Edit) => boolean;
        undo: (event?: Event) => boolean;
        redo: (event?: Event) => boolean;
        submit: (event?: Event) => void;
        canSubmit: () => boolean;
        say: (message: string) => void;
        seal: () => void;
        latest: () => TokenInputValue;
        removeToken: (tokenId: string, { reason, record, event, }?: {
            reason?: TokenInputValueChangeReason;
            record?: boolean;
            event?: Event;
        }) => boolean;
        caretAt: (offset: number) => {
            start: number;
            end: number;
        };
        setView(next: TokenView | undefined): void;
        view: () => {
            render: (value: TokenInputValue) => void;
            read: () => TokenInputValue;
            typedBeforeBind: (value: TokenInputValue) => TokenInputValue | undefined;
            selection: () => {
                start: number;
                end: number;
            } | null;
            select: ({ start, end }: TextRange) => void;
            rectAt: (offset: number) => {
                x: number;
                y: number;
                width: number;
                height: number;
            } | null;
            offsetAt: (node: Node, offset: number) => number;
            inHost: (node: Node | null) => boolean;
            hosts: () => {
                id: string;
                token: Token;
                host: HTMLElement;
            }[];
            hostElement: (id: string) => HTMLElement | undefined;
            showLabels: () => void;
            destroy(): void;
        } | undefined;
        setSelection(next: TextRange | null): void;
        selection: () => TextRange | null;
        setFocused(next: boolean): void;
        setComposing(next: boolean): void;
        composing: () => boolean;
        hosts: () => {
            id: string;
            token: Token;
            host: HTMLElement;
        }[];
        setCustom: (custom: boolean) => void;
        text: () => string;
        reset(): void;
        setFormDisabled: (formDisabled: boolean) => void;
        restore: (saved: string) => boolean;
    };
};
declare const tokenInputApi: (...args: Parameters<typeof tokenInputApiBody>) => TokenInputApi;
/**
 * `tokenInput`'s api, which its slots and controller call.
 * Adapters expose it as `api`.
 * @stable
 */
interface TokenInputApi extends ReturnType<typeof tokenInputApiBody> {
}
export { initialTokenInputState, syncTokenInputState, type TokenInputApi, tokenInputApi, type TokenInputState, };
