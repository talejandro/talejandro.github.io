import type { CommandData, CommandDataItem } from "./command.js";
declare function pageItems(items: CommandData | undefined, pages: readonly string[]): CommandData | undefined;
declare function findCommand(items: CommandData | undefined, value: string): CommandDataItem | undefined;
declare function commandShortcuts(items: CommandData | undefined): {
    value: string;
    shortcut: string;
}[];
export { commandShortcuts, findCommand, pageItems };
