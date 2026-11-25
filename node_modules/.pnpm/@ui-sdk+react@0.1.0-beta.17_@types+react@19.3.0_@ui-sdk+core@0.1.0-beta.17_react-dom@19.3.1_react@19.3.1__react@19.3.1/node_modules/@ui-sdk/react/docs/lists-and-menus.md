# Lists and Menus

Supply options as data, load them from a server, and define menu actions.

Select, Combobox, Autocomplete, Listbox, and Trigger Menu accept items as data. Use this when your choices already come from an array. You can also compose their item parts yourself.

## Start with Strings

Give a Select an array and render its trigger and content:

```tsx
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"

function Example() {
  return (
    <Select items={["Apple", "Banana", "Pear"]}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Choose a fruit" />
      </SelectTrigger>
      <SelectContent />
    </Select>
  )
}

export { Example }
```

Each string is both the value and its label. Use objects when those need to differ:

```tsx
<Select
  items={[
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana", disabled: true },
  ]}
>
  {/* Trigger and content. */}
</Select>
```

Items can also have `keywords` for searching. Group them with `{ type: "group", label, items }`, or separate them with `{ type: "separator" }`. Type the array with `ListData`, so each entry is checked where you write it:

```tsx
import type { ListData } from "@ui-sdk/react/select"

const fruits: ListData = [
  { value: "apple", label: "Apple", keywords: ["red"] },
  { type: "separator" },
  { type: "group", label: "Citrus", items: ["Lemon", "Lime"] },
]
```

Command, Menu and Trigger Menu take the same entries, plus fields of their own like a command's `shortcut`. Type them with `CommandData`, `MenuData` and `TriggerMenuData`. Tree takes `TreeItemData[]`.

If the value itself is an object, provide `itemToValue` for its submitted string and `itemToLabel` for its displayed text. [Select](./components/select.md) and [Combobox](./components/combobox.md) show complete examples.

## Style the Items

Items from data render as bare parts, with no classes, check marks or arrows. To style them, render the parts yourself. For an array you have, map it into items, with your classes inline:

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
]

function Example() {
  return (
    <Select items={fruits}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Choose a fruit" />
      </SelectTrigger>
      <SelectContent className="rounded-2xl bg-white p-1">
        {fruits.map((fruit) => (
          <SelectItem
            key={fruit.value}
            value={fruit.value}
            className="flex rounded-xl px-2 py-1.5 data-highlighted:bg-neutral-100"
          >
            {fruit.label}
            <SelectItemIndicator className="ms-auto">✓</SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { Example }
```

Keeping `items` on the select lets it show the chosen label before the list first renders. Searchable components still filter the items you render: the ones that don't match are hidden.

Items that only exist in state, like results from a server, render from the list's children function, with `state.items`:

```tsx
<ComboboxList>
  {(state) =>
    (state.items as { value: string; label: string }[]).map((item) => (
      <ComboboxItem
        key={item.value}
        value={item.value}
        className="rounded-xl px-2 py-1.5 data-highlighted:bg-neutral-100"
      >
        {item.label}
      </ComboboxItem>
    ))
  }
</ComboboxList>
```

## Search and Load Items

Searchable components accept a `filter` to change how typing narrows their items. For data from a server, [Async Options](./hooks/async-options.md) handles loading, debouncing, and aborting stale requests.

For a large list, pass every option through `items` and render only the visible rows. [Select](./components/select.md#virtualized) and [Combobox](./components/combobox.md#virtualized) show how.

## Define a Menu

A `MenuData` array describes actions, separators, groups, and submenus. A plain string is an action whose value and label are the string:

```tsx
"use client"

import { Menu, MenuTrigger, type MenuData } from "@ui-sdk/react/menu"

const actions: MenuData = [
  { value: "open", label: "Open", shortcut: "mod+o" },
  { type: "separator" },
  {
    type: "submenu",
    label: "Share",
    items: [{ value: "email", label: "Email" }],
  },
]

function Example() {
  return (
    <Menu items={actions} onAction={(value) => console.log(value)}>
      <MenuTrigger>File</MenuTrigger>
    </Menu>
  )
}

export { Example }
```

To style it, put your own `MenuContent` in the menu and render its items from the same array, as [Menu](./components/menu.md#menus-as-data) shows. That page also covers checkbox items, radio groups, and nested menus.

## Keys and Shortcuts

`loop` controls whether arrow keys wrap around a list. Components that support `orientation` use it to choose the navigation axis.

A trigger's `shortcut="mod+k"` opens it from elsewhere on the page. `mod` means Command on Apple platforms and Control elsewhere. A data menu runs item shortcuts while closed; a manually rendered MenuItem's shortcut only displays the keys.

[Shortcuts](./hooks/shortcuts.md) covers registering your own. Page shortcuts pause while a modal is open, and ordinary typing in text fields stays typing.
