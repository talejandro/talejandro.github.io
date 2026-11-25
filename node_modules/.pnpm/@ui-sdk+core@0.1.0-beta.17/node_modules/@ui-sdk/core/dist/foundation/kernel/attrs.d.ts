/**
 * `data-open` or `data-closed`, never both. Every part that opens writes these.
 * @stable
 */
declare function openAttrs(open: boolean): {
    "data-open": string | undefined;
    "data-closed": string | undefined;
};
/**
 * `data-checked`, `data-unchecked` or `data-indeterminate`. Every part with a
 * checked state writes these.
 * @stable
 */
declare function checkedAttrs(checked: boolean | "indeterminate"): {
    "data-checked": string | undefined;
    "data-unchecked": string | undefined;
    "data-indeterminate": string | undefined;
};
/**
 * A value made safe inside an id, like `${id}-item-${idPart(value)}`. Values
 * may hold spaces or `%`, which would break an `aria-controls` or
 * `aria-labelledby` reference.
 * @stable
 */
declare function idPart(value: string): string;
export { checkedAttrs, idPart, openAttrs };
