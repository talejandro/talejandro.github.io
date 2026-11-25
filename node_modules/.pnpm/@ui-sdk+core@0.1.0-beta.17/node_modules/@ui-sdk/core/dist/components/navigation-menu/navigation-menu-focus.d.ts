declare function createFocus(config: {
    orientation: () => "horizontal" | "vertical";
    value: () => string | null;
    list: () => HTMLElement | undefined;
    triggers: () => {
        el: HTMLElement;
        key: string;
        props?: {
            disabled?: boolean;
        };
    }[];
    links: () => HTMLElement[];
    trigger: (key: string) => HTMLElement | undefined;
    content: (key: string) => HTMLElement | undefined;
    panel: () => HTMLElement | undefined;
    open: (key: string, event: KeyboardEvent) => void;
}): {
    topLevel: () => HTMLElement[];
    listKeydown(event: KeyboardEvent, list: HTMLElement): void;
    panelKeydown(event: KeyboardEvent, panel: HTMLElement): void;
    rootKeydown(event: KeyboardEvent): void;
    contentBound(key: string, el: HTMLElement): void;
};
export { createFocus };
