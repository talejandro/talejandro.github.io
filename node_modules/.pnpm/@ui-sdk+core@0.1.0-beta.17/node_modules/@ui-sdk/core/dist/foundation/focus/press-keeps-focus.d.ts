declare function holdFocus(event: Event, { el }: {
    el: HTMLElement | undefined;
}): void;
declare const pressKeepsFocus: {
    pointerdown: typeof holdFocus;
    mousedown: typeof holdFocus;
};
export { holdFocus, pressKeepsFocus };
