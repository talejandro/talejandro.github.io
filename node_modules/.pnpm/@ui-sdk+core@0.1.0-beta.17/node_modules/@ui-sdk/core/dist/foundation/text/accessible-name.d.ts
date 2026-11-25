declare const namedByContent: Set<string>;
declare function roleOf(el: Element): string;
/**
 * An approximate accessible name: what `aria-labelledby`, `aria-label`,
 * labels, an image's alt, content for roles named by it, or `title` give,
 * with whitespace collapsed. Content counts its images' alt, its icons' names
 * and its elements' own labels.
 */
declare function accessibleName(el: Element): string;
/** Whether `el` has an accessible name, reading its labels only when nothing else names it. */
declare function hasAccessibleName(el: Element): boolean;
export { accessibleName, hasAccessibleName, namedByContent, roleOf };
