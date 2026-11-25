declare function nameFrom(_el: Element, _names: () => boolean): () => void;
declare function checkName(_el: HTMLElement, _part: string, _from: {
    component: string;
    id?: string;
}): void;
export { checkName, nameFrom };
