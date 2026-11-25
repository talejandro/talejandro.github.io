/**
 * How values show: `Intl.NumberFormat` options, or a function of the value.
 * @stable
 */
type NumberFormat = Intl.NumberFormatOptions | ((value: number) => string);
/**
 * The `Intl.NumberFormat` for a locale and options, built once and reused,
 * since formatters are slow to build.
 * @experimental
 */
declare function numberFormatter(locale?: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat;
declare function displayOptions(format: Intl.NumberFormatOptions | undefined, step: number): {
    localeMatcher?: "lookup" | "best fit" | undefined;
    style?: Intl.NumberFormatOptionsStyle | undefined;
    currency?: string | undefined;
    currencyDisplay?: Intl.NumberFormatOptionsCurrencyDisplay | undefined;
    useGrouping?: Intl.NumberFormatOptionsUseGrouping | undefined;
    minimumIntegerDigits?: number | undefined;
    minimumFractionDigits?: number | undefined;
    maximumFractionDigits?: number | undefined;
    minimumSignificantDigits?: number | undefined;
    maximumSignificantDigits?: number | undefined;
    numberingSystem?: string | undefined;
    compactDisplay?: "short" | "long" | undefined;
    notation?: "standard" | "scientific" | "engineering" | "compact" | undefined;
    signDisplay?: Intl.NumberFormatOptionsSignDisplay | undefined;
    unit?: string | undefined;
    unitDisplay?: "short" | "long" | "narrow" | undefined;
    currencySign?: "standard" | "accounting" | undefined;
};
/**
 * A value as people read it: the function's text, or `Intl.NumberFormat` in
 * the locale, like "$1,234.50", "45%" or "1.2K". Empty for null and non-finite values.
 * @experimental
 */
declare function formatNumber(value: number | null, locale?: string, format?: NumberFormat): string;
/**
 * A range as people read it in a locale, like "$5 – $10" or "5–10%", with what
 * both ends share written once. A format function joins its two texts with a dash.
 * @experimental
 */
declare function formatNumberRange(start: number, end: number, locale?: string, format?: NumberFormat): string;
/**
 * The parts `Intl` formats a value into, like each digit group, the decimal
 * separator and the currency sign, for styling them apart or rolling digits
 * like an odometer. A format function's text is one literal part.
 * @experimental
 */
declare function formatNumberToParts(value: number | null, locale?: string, format?: NumberFormat): Intl.NumberFormatPart[];
export { displayOptions, formatNumber, formatNumberRange, formatNumberToParts, type NumberFormat, numberFormatter, };
