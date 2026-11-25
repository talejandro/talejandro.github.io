/** What a button-like part is rendered as, `unknown` until it binds. */
type ButtonElement = "button" | "link" | "other" | "unknown";
declare function buttonElement(el: HTMLElement): "button" | "link" | "other";
declare function buttonRole<State>(elementOf: (state: State, context: {
    key: string;
}) => ButtonElement): {
    role: (state: State, context: {
        key: string;
    }) => "button" | undefined;
    roles: readonly ["button"];
};
declare function buttonElementAttrs(element: ButtonElement, options: {
    type?: string;
    disabled: boolean;
    focusable: boolean;
    tabindex?: string;
}): {
    type: string | undefined;
    disabled: string | undefined;
    "aria-disabled": string | undefined;
    tabindex: string | undefined;
};
declare function buttonKeydown(event: KeyboardEvent, el: HTMLElement): void;
declare function buttonKeyup(event: KeyboardEvent, el: HTMLElement): void;
declare function opensElsewhere(event: Event | undefined, el: HTMLElement | undefined): boolean;
export { buttonElement, buttonElementAttrs, type ButtonElement, buttonKeydown, buttonKeyup, buttonRole, opensElsewhere, };
