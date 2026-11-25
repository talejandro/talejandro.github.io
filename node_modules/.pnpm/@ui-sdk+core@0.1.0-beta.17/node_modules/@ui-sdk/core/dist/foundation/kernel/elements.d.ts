import type { Part } from "./primitive-types.js";
/**
 * A slot's bound elements, in document order, so collections keep no index
 * bookkeeping. Name the slot's props to type them: `elements<{ value: string }>(context, "item")`.
 * @stable
 */
declare function elements<Props extends object = object>(context: {
    parts(): Iterable<Part>;
}, slot: string): {
    el: HTMLElement;
    key: string;
    props: Props;
}[];
export { elements };
