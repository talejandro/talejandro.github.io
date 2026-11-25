// src/components/command/command-data.ts
var asCommand = (entry) => typeof entry === "string" ? { value: entry, label: entry } : entry;
function* commandsAt(items) {
  for (const entry of items) {
    if (typeof entry === "string" || !("type" in entry)) {
      yield asCommand(entry);
    } else if (entry.type === "group") {
      for (const child of entry.items) {
        yield asCommand(child);
      }
    }
  }
}
function pageItems(items, pages) {
  let level = items;
  for (const page of pages) {
    if (!level) {
      return void 0;
    }
    let next;
    for (const command of commandsAt(level)) {
      if (command.value === page) {
        next = command.items;
      }
    }
    level = next;
  }
  return level;
}
function findCommand(items, value) {
  if (!items) {
    return void 0;
  }
  for (const command of commandsAt(items)) {
    if (command.value === value) {
      return command;
    }
    const nested = findCommand(command.items, value);
    if (nested) {
      return nested;
    }
  }
}
function commandShortcuts(items) {
  const found = [];
  const visit = (level) => {
    for (const command of commandsAt(level)) {
      if (command.shortcut && !command.disabled) {
        found.push({ value: command.value, shortcut: command.shortcut });
      }
      if (command.items) {
        visit(command.items);
      }
    }
  };
  if (items) {
    visit(items);
  }
  return found;
}
export {
  commandShortcuts,
  findCommand,
  pageItems
};
