/**
 * One entry of a pagination's range: a page number, or a gap before or after the current page's neighbours.
 * @stable
 */
type PaginationRangeItem = number | "ellipsis-start" | "ellipsis-end";
/**
 * What `paginationRange()` takes.
 * @stable
 */
type PaginationRangeOptions = {
    /** The current page, from 1. Clamped to the range. */
    page: number;
    /** How many pages there are. */
    pageCount: number;
    /**
     * How many pages show on each side of the current one.
     * @defaultValue 1
     */
    siblings?: number;
    /**
     * How many pages always show at each end.
     * @defaultValue 1
     */
    boundaries?: number;
};
/**
 * The pages to show, with an ellipsis for each gap. The list has the same
 * length on every page of a given count, so links never shift under the
 * pointer while paging, and a gap of one page shows that page instead.
 *
 * ```ts
 * paginationRange({ page: 5, pageCount: 10 }) // [1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 10]
 * ```
 * @stable
 */
declare function paginationRange({ page, pageCount, siblings, boundaries, }: PaginationRangeOptions): PaginationRangeItem[];
/** A page number brought within 1 and `pageCount`. Anything that isn't a number is page 1. */
declare function clampPage(page: number, pageCount: number): number;
/** How many pages `total` items fill, `pageSize` to a page. Never less than 1. */
declare function pageCountOf(total: number, pageSize: number): number;
export { clampPage, pageCountOf, paginationRange, type PaginationRangeItem, type PaginationRangeOptions, };
