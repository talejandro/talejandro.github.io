declare const SELECT_ALL = "\0select-all";
declare const selectAllKey: (group?: string) => string;
declare const isSelectAll: (key: string) => boolean;
/**
 * The id of an option's element: an item's from its key, or a built-in
 * option's, like a create or select-all option, from its name.
 */
declare function optionId(id: string, key: string): string;
export { isSelectAll, optionId, SELECT_ALL, selectAllKey };
