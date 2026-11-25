// src/components/pagination/pagination-range.ts
var count = (value, fallback) => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
var span = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);
function paginationRange({
  page,
  pageCount,
  siblings,
  boundaries
}) {
  const total = count(pageCount, 0);
  const around = count(siblings, 1);
  const ends = count(boundaries, 1);
  if (total === 0) {
    return [];
  }
  const current = clampPage(page, total);
  const slots = 2 * ends + 2 * around + 3;
  if (total <= slots) {
    return span(1, total);
  }
  const start = Math.min(
    Math.max(current - around, ends + 2),
    total - ends - 1 - 2 * around
  );
  const end = start + 2 * around;
  return [
    ...span(1, ends),
    start > ends + 2 ? "ellipsis-start" : ends + 1,
    ...span(start, end),
    end < total - ends - 1 ? "ellipsis-end" : total - ends,
    ...span(total - ends + 1, total)
  ];
}
function clampPage(page, pageCount) {
  if (!Number.isFinite(page)) {
    return 1;
  }
  return Math.min(Math.max(Math.round(page), 1), Math.max(1, pageCount));
}
function pageCountOf(total, pageSize) {
  if (!Number.isFinite(total) || !Number.isFinite(pageSize) || pageSize <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(total / pageSize));
}
export {
  clampPage,
  pageCountOf,
  paginationRange
};
