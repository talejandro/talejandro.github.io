import type { TextRange, Token } from "../../foundation/text/text-editor.js";
import { type TokenInputValue } from "./token-input-model.js";
declare function createTokenView(el: HTMLElement, { describe, customContent, onHosts, }: {
    describe: (token: Token) => string;
    customContent: () => boolean;
    onHosts: () => void;
}): {
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
};
type TokenView = ReturnType<typeof createTokenView>;
/**
 * The same DOM as a string, for a server render that hydrates without the
 * editor jumping. Hosts get their label; the core re-renders on mount.
 */
declare function renderStaticHtml(value: TokenInputValue, describe: (token: Token) => string): string;
export { createTokenView, renderStaticHtml, type TokenView };
