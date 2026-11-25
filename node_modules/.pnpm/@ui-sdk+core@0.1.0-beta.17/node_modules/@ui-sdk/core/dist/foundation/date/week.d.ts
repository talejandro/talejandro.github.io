/**
 * The day a week starts on in a locale, 0 for Sunday to 6 for Saturday, as
 * `Date#getDay` counts: 0 in the United States, 1 in most of Europe, 6 in much
 * of the Middle East. A tag's `-u-fw-` extension wins. Without a locale, the
 * runtime's own.
 * @stable
 */
declare function firstDayOfWeek(locale?: string): number;
export { firstDayOfWeek };
