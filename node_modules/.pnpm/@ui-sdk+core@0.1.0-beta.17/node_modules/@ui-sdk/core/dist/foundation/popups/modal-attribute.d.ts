/**
 * A `modal` attribute as a `Modal` (`popup.ts`), for a schema's `modal` option. A bare
 * `modal` means true, like any boolean attribute, "false" is false, and
 * "pointer" or "trap-focus" keep one effect. A missing one is undefined, so
 * the component's default applies.
 */
declare function modalAttribute(attribute: string | null): boolean | "pointer" | "trap-focus" | undefined;
/**
 * The same for popups that take no "trap-focus", like menus and the lists of
 * Select, Combobox and Autocomplete: it reads as a bare `modal`.
 */
declare function pointerModalAttribute(attribute: string | null): boolean | "pointer" | undefined;
export { modalAttribute, pointerModalAttribute };
