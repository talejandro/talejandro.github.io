declare const isBrowser: boolean;
declare function isIOS(): boolean;
/**
 * Whether `el` lays out right to left, from its computed direction. False on the server.
 * @stable
 */
declare function isRTL(el: Element | null | undefined): boolean;
export { isBrowser, isIOS, isRTL };
