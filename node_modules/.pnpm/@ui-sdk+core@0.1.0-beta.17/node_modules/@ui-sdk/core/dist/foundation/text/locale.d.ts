/**
 * A language tag Intl accepts, read from a BCP 47 or POSIX one (`en_US`), or undefined.
 * @stable
 */
declare function toLocale(tag: string | null | undefined): string | undefined;
/**
 * The user's language, which their typing is in. Undefined on the server.
 * @stable
 */
declare function userLocale(): string | undefined;
/**
 * The language of the page around an element, or of the whole page: the
 * nearest `lang` Intl accepts, else the user's. Undefined on the server.
 * @stable
 */
declare function pageLocale(el?: Element): string | undefined;
declare function bindPageLocale(el: Element, set: (locale: string | null) => void): void;
declare const localeOf: (state: {
    locale?: string | null | undefined;
    pageLocale?: string | null;
}) => string;
export { bindPageLocale, localeOf, pageLocale, toLocale, userLocale };
