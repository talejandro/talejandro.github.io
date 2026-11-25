/** A tag in the markup, with its attributes in order and its children. */
type MarkupNode = {
    tag: string;
    attributes: [name: string, value: string][];
    children: (MarkupNode | string)[];
};
declare function parseMarkup(markup: string): (string | MarkupNode)[];
export { type MarkupNode, parseMarkup };
