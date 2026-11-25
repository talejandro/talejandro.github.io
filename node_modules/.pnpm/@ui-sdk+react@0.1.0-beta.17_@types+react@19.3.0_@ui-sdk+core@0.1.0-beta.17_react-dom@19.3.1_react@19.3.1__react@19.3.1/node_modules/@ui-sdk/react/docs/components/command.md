# Command

Search commands, run actions, and open pages of more choices.

Command puts a search field over a list of actions. The list stays open while someone searches. You can use it on its own, or put it in a dialog to build a command palette.

```tsx title="demo.tsx"
"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@ui-sdk/react/command"
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"

const suggestions = [
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "emoji", label: "Search Emoji", icon: SmileIcon },
  {
    value: "calculator",
    label: "Calculator",
    icon: CalculatorIcon,
    disabled: true,
  },
]

const settings = [
  { value: "profile", label: "Profile", icon: UserIcon, shortcut: "mod+p" },
  {
    value: "billing",
    label: "Billing",
    icon: CreditCardIcon,
    shortcut: "mod+b",
  },
  {
    value: "settings",
    label: "Settings",
    icon: SettingsIcon,
    shortcut: "mod+s",
  },
]

function Example() {
  return (
    <Command>
      <div data-slot="row">
        <SearchIcon aria-hidden="true" />
        <CommandInput
          aria-label="Search commands"
          placeholder="Type a command or search…"
        />
      </div>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          <CommandGroupLabel>Suggestions</CommandGroupLabel>
          {suggestions.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              <CommandItemIcon>
                <item.icon />
              </CommandItemIcon>
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandGroupLabel>Settings</CommandGroupLabel>
          {settings.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              shortcut={item.shortcut}
            >
              <CommandItemIcon>
                <item.icon />
              </CommandItemIcon>
              <span>{item.label}</span>
              <CommandShortcut />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export { Example }
```

Type “bil” to find Billing. Arrow keys move the highlight; Escape clears the search.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Command`:

```text
Command
├── CommandInput
├── CommandEmpty
└── CommandList
    ├── CommandItem
    └── CommandItem
```

Give the input an accessible name and each command a unique value. Keep empty and status messages outside the list, which holds commands and groups. `onAction` reports the value of the command that ran; use it to perform the action.

Use `CommandGroup` and `CommandGroupLabel` to name related commands, with a `CommandSeparator` between groups. Groups and separators disappear when filtering leaves them empty.

## Usage

Import the parts and put them together:

```tsx
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command"

function Example() {
  return (
    <Command>
      <CommandInput aria-label="Search commands" />
      <CommandEmpty>No commands found.</CommandEmpty>
      <CommandList>
        <CommandItem value="new-file">New file</CommandItem>
        <CommandItem value="new-folder">New folder</CommandItem>
      </CommandList>
    </Command>
  )
}

export { Example }
```

## Build Your Own

`@ui-sdk/react/command` comes with a ready-made Command. If you'd like to build your own, with your own names, start from the `command` primitive in `@ui-sdk/core`:

```ts title="palette.ts"
"use client"

import { command } from "@ui-sdk/core/command"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: Palette,
  Input: PaletteSearch,
  Empty: PaletteEmpty,
  List: PaletteList,
  Item: PaletteAction,
} = createParts(command, {
  input: "input",
  empty: "div",
  list: "div",
  item: "div",
})

export { Palette, PaletteAction, PaletteEmpty, PaletteList, PaletteSearch }
```

```tsx
<Palette>
  <PaletteSearch aria-label="Search actions" />
  <PaletteEmpty>No actions found.</PaletteEmpty>
  <PaletteList>
    <PaletteAction value="new-file">New file</PaletteAction>
    <PaletteAction value="new-folder">New folder</PaletteAction>
  </PaletteList>
</Palette>
```

Each part keeps the behavior, state and data attributes of its ready-made counterpart: typing filters the commands, arrow keys move the highlight and Enter runs it. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Dialog

Put Command inside a [Dialog](./dialog.md) for a command palette. Give the dialog a title, put `shortcut="mod+k"` on its trigger, and close it when a command runs. The dialog handles dismissal and returns focus to the trigger.

```tsx title="dialog.tsx"
"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
} from "@ui-sdk/react/command"
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"
import { useLog } from "./log"
import * as React from "react"

const commands = [
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "emoji", label: "Search Emoji", icon: SmileIcon },
  {
    value: "calculator",
    label: "Calculator",
    icon: CalculatorIcon,
    disabled: true,
  },
  { value: "profile", label: "Profile", icon: UserIcon },
  { value: "billing", label: "Billing", icon: CreditCardIcon },
  { value: "settings", label: "Settings", icon: SettingsIcon },
]

function Example() {
  const [open, setOpen] = React.useState(false)
  const log = useLog()
  return (
    <div data-slot="stack">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger shortcut="mod+k">
          Search…
          <DialogShortcut />
        </DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <DialogTitle>Command palette</DialogTitle>
          <Command
            onAction={(value) => {
              log(`Ran ${value}`)
              setOpen(false)
            }}
          >
            <div data-slot="row">
              <SearchIcon aria-hidden="true" />
              <CommandInput aria-label="Search commands" placeholder="Type a command or search…" />
            </div>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandGroupLabel>Suggestions</CommandGroupLabel>
                {commands.map((item) => (
                  <CommandItem key={item.value} value={item.value} disabled={item.disabled}>
                    <CommandItemIcon>
                      <item.icon />
                    </CommandItemIcon>
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
```

Press Search or use Cmd+K / Ctrl+K. Choose a command to run it and close the palette; the console logs what ran.

## Shortcuts

An item’s `shortcut` can run it while the command list is mounted, even when the search or current page hides it. `CommandShortcut` displays the keys for the current platform, and the item gets `aria-keyshortcuts`. Shortcuts inside a dialog run while it is open.

```tsx title="shortcuts.tsx"
"use client"

import {
  Command,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandShortcut,
} from "@ui-sdk/react/command"
import { CreditCardIcon, SettingsIcon, UserIcon } from "lucide-react"
import { useLog } from "./log"

const settings = [
  { value: "profile", label: "Profile", icon: UserIcon, shortcut: "mod+p" },
  {
    value: "billing",
    label: "Billing",
    icon: CreditCardIcon,
    shortcut: "mod+b",
  },
  {
    value: "settings",
    label: "Settings",
    icon: SettingsIcon,
    shortcut: "mod+s",
  },
]

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <Command onAction={(value) => log(`Ran ${value}`)}>
        <CommandInput aria-label="Search settings" placeholder="Search settings…" />
        <CommandList>
          <CommandGroup>
            <CommandGroupLabel>Settings</CommandGroupLabel>
            {settings.map((item) => (
              <CommandItem key={item.value} value={item.value} shortcut={item.shortcut}>
                <CommandItemIcon>
                  <item.icon />
                </CommandItemIcon>
                <span>{item.label}</span>
                <CommandShortcut>{(state) => state.text}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

export { Example }
```

Press Cmd+P / Ctrl+P to run Profile, even when the search hides it. The console logs each command that runs.

## Highlight Matches

`CommandItemText` marks the matched text. The default fuzzy filter can match letters that are apart, so one command may have several marked segments.

```tsx title="highlight.tsx"
"use client"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItemText,
  CommandList,
} from "@ui-sdk/react/command"
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"

const commands = [
  { value: "calendar", label: "Calendar", icon: CalendarIcon },
  { value: "emoji", label: "Search Emoji", icon: SmileIcon },
  {
    value: "calculator",
    label: "Calculator",
    icon: CalculatorIcon,
    disabled: true,
  },
  { value: "profile", label: "Profile", icon: UserIcon },
  { value: "billing", label: "Billing", icon: CreditCardIcon },
  { value: "settings", label: "Settings", icon: SettingsIcon },
]

function Example() {
  return (
    <Command>
      <div data-slot="row">
        <SearchIcon aria-hidden="true" />
        <CommandInput aria-label="Search commands" placeholder="Try “prf” or “emo”…" />
      </div>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        {commands.map((item) => (
          <CommandItem key={item.value} value={item.value} disabled={item.disabled}>
            <CommandItemIcon>
              <item.icon />
            </CommandItemIcon>
            <CommandItemText>{item.label}</CommandItemText>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

export { Example }
```

Type “prf” to find Profile. Matching letters are marked even when they are not next to each other.

## Filter and Keywords

`"fuzzy"` is the default: `nf` matches New file. `"contains"` and `"startsWith"` match the text itself. A custom function returns a boolean or a score; zero hides a command and higher scores rank first.

Data commands are sorted by score. Commands written directly in markup keep their order, even though the best match can be highlighted.

`keywords` adds search terms without changing the command's label. Use it for synonyms or names someone might type instead.

```tsx title="filter.tsx"
"use client"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

const commands = [
  { label: "Home" },
  { label: "Inbox", keywords: ["mail", "messages"] },
  { label: "Documents" },
  { label: "Downloads" },
  { label: "New file" },
  { label: "New folder" },
  { label: "Copy" },
  { label: "Paste" },
  { label: "Delete", keywords: ["remove", "trash"] },
  { label: "Zoom in" },
  { label: "Zoom out" },
  { label: "Search emoji", keywords: ["smiley", "face"] },
  { label: "Keyboard shortcuts", keywords: ["hotkeys"] },
  { label: "Settings", keywords: ["preferences"] },
]

const modes = [
  { value: "fuzzy", label: "Fuzzy" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "words", label: "Words" },
]
type Mode = "fuzzy" | "contains" | "startsWith" | "words"

function words(item: { label: string }, query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) =>
      item.label
        .toLowerCase()
        .split(" ")
        .some((part) => part.startsWith(word))
    )
}

function Example() {
  const [mode, setMode] = React.useState<Mode>("fuzzy")
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={modes}
          value={mode}
          onValueChange={(next) => next && setMode(next as Mode)}
        >
          <SelectLabel>Filter</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {modes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Command filter={mode === "words" ? words : mode}>
        <CommandInput aria-label="Search commands" placeholder="Try “nf”, “zo in” or “smiley”" />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
          {commands.map((command) => (
            <CommandItem key={command.label} value={command.label} keywords={command.keywords}>
              {command.label}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}

export { Example }
```

Type “nf” with Fuzzy to find New file. Choose Words and type “zo in” for Zoom in, or type “smiley” to find Search emoji through a keyword.

## Pages

Set an item’s `page` to the value of a `CommandPage` to open it. An unnamed page holds the first set of commands. The `pages` array records the stack of pages that have been opened.

Backspace in an empty search goes back and restores the previous page’s query. Escape clears the query first, then goes back. A Go back command can call `pop()` on a controller.

```tsx title="pages.tsx"
"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandPage,
  createCommandController,
} from "@ui-sdk/react/command"
import { ArrowLeftIcon, MoonIcon, UsersIcon } from "lucide-react"
import * as React from "react"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const teams = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
]

function Example() {
  const command = React.useState(() => createCommandController())[0]
  const [pages, setPages] = React.useState<string[]>([])
  return (
    <Command
      controller={command}
      pages={pages}
      onPagesChange={setPages}
      onAction={(value) => {
        if (value === "back") {
          command.pop()
        }
      }}
    >
      <div data-slot="row">
        {pages.map((page) => (
          <span key={page} data-slot="badge">
            {page}
          </span>
        ))}
      </div>
      <CommandInput
        aria-label="Search commands"
        placeholder={
          pages.length ? "Search… (Backspace to go back)" : "What do you need?"
        }
      />
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandList>
        <CommandPage>
          <CommandGroup>
            <CommandGroupLabel>Workspace</CommandGroupLabel>
            <CommandItem value="theme" page="theme">
              <CommandItemIcon>
                <MoonIcon />
              </CommandItemIcon>
              Change theme…
            </CommandItem>
            <CommandItem value="teams" page="teams">
              <CommandItemIcon>
                <UsersIcon />
              </CommandItemIcon>
              Switch team…
            </CommandItem>
          </CommandGroup>
        </CommandPage>
        <CommandPage value="theme">
          {themes.map((theme) => (
            <CommandItem key={theme.value} value={theme.value}>
              {theme.label}
            </CommandItem>
          ))}
        </CommandPage>
        <CommandPage value="teams">
          {teams.map((team) => (
            <CommandItem key={team.value} value={team.value}>
              {team.label}
            </CommandItem>
          ))}
        </CommandPage>
        {pages.length > 0 && (
          <CommandItem value="back">
            <CommandItemIcon mirror>
              <ArrowLeftIcon />
            </CommandItemIcon>
            Go back
          </CommandItem>
        )}
      </CommandList>
    </Command>
  )
}

export { Example }
```

Choose Change theme or Switch team. Use Go back, or press Backspace in an empty search field, to return.

## Items as Data

Pass `items` to provide commands, groups, separators, and pages as `CommandData`. A data command with its own `items` opens a page. Its shortcut still works when another page or filter hides it.

The data can render bare parts for you. For styled commands, render from the list’s `state.items`, which follows the current page and ranked results. The example handles groups and separators as well as commands. [Lists and Menus](../lists-and-menus.md) covers the shared data format.

Pass `emptyItems` alongside `items` to show suggested or recent commands while the first page's search is empty. Once someone types, the full collection is searched.

```tsx
<Command
  items={commands}
  emptyItems={[{ type: "group", label: "Suggested", items: recent }]}
/>
```

```tsx title="data.tsx"
"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  type CommandData,
  type CommandDataItem,
} from "@ui-sdk/react/command"
import { useLog } from "./log"

const commands: CommandData = [
  {
    type: "group",
    label: "Navigation",
    items: [
      { value: "home", label: "Go home", keywords: ["start"] },
      { value: "inbox", label: "Open inbox", shortcut: "mod+i" },
    ],
  },
  { type: "separator" },
  {
    type: "group",
    label: "Preferences",
    items: [
      {
        value: "theme",
        label: "Change theme…",
        items: [
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ],
      },
      {
        value: "language",
        label: "Change language…",
        items: ["English", "Français", "Deutsch", "日本語"],
      },
      { value: "sign-out", label: "Sign out", shortcut: "mod+shift+q" },
    ],
  },
]

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <Command items={commands} onAction={(value) => log(`Ran ${value}`)}>
        <CommandInput aria-label="Search commands" placeholder="Type a command…" />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>{(state) => <Commands items={state.items} />}</CommandList>
      </Command>
    </div>
  )
}

function Commands({ items }: { items: CommandData }) {
  return items.map((entry, index) => {
    if (typeof entry !== "string" && "type" in entry) {
      if (entry.type === "separator") {
        return <CommandSeparator key={`separator-${index}`} />
      }
      return (
        <CommandGroup key={entry.label}>
          <CommandGroupLabel>{entry.label}</CommandGroupLabel>
          <Commands items={entry.items} />
        </CommandGroup>
      )
    }
    const command: CommandDataItem =
      typeof entry === "string" ? { value: entry, label: entry } : entry
    return (
      <CommandItem
        key={command.value}
        value={command.value}
        label={command.label}
        disabled={command.disabled}
        shortcut={command.shortcut}
      >
        {command.label}
        {command.shortcut && <CommandShortcut />}
      </CommandItem>
    )
  })
}

export { Example }
```

Choose Change theme to open its commands. Press Cmd+I / Ctrl+I to run Open inbox from any page; the console logs what ran.

## Async Results

Use [async options](../hooks/async-options.md) to wait for typing to pause and discard stale results. Send query changes to `setQuery()`, render the returned items, and pass `status`. Set `filter` to `false` to keep the server’s order.

`CommandStatus` describes loading and failures, and the list gets `aria-busy` while loading. `onLoadMore` can request another page when scrolling or highlighting reaches the last command. Without a status part, `announcement` controls the result-count message after typing pauses.

```tsx title="async.tsx"
"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStatus,
} from "@ui-sdk/react/command"

function searchIssues(query: string, { signal }: { signal: AbortSignal }) {
  const issues = [
    "Fix login redirect",
    "Dark mode flicker",
    "Add billing page",
    "Search is slow",
    "Update dependencies",
    "Crash on upload",
    "Export to CSV",
    "Keyboard shortcuts help",
  ]
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(
        issues
          .filter((issue) => issue.toLowerCase().includes(needle))
          .map((issue) => ({
            value: issue.toLowerCase().replaceAll(" ", "-"),
            label: issue,
          }))
      )
    }, 400)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

function Example() {
  const issues = useAsyncOptions(searchIssues, {
    debounce: 250,
    immediate: true,
  })

  return (
    <Command
      filter={false}
      status={issues.status}
      onQueryChange={(query) => issues.setQuery(query)}
      onLoadMore={issues.loadMore}
    >
      <CommandInput aria-label="Search issues" placeholder="Search issues…" />
      <CommandStatus>
        {(state) =>
          state.loading
            ? "Searching…"
            : `${state.count} ${state.count === 1 ? "issue" : "issues"}`
        }
      </CommandStatus>
      <CommandEmpty>
        {(state) =>
          state.empty && !state.loading
            ? `No issues match “${state.query}”.`
            : null
        }
      </CommandEmpty>
      <CommandList>
        {issues.items.map((issue) => (
          <CommandItem key={issue.value} value={issue.value} label={issue.label}>
            {issue.label}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

export { Example }
```

Type “login” and wait for matching issues. Replace the text to start a new search; only the latest results appear.

## Pending Actions

Return a promise from `onAction` or an item’s `onSelect`. The command gets `data-pending`, `aria-busy` and `aria-disabled` until it settles; further presses do not start another run. A rejection becomes the command’s `error` state, which clears when it runs again.

An item’s `onSelect` runs before `onAction`. Call `preventDefault()` on its event to stop the action.

```tsx title="pending.tsx"
"use client"

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command"
import { LoaderCircleIcon } from "lucide-react"
import { useLog } from "./log"

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <Command>
        <CommandInput aria-label="Search actions" placeholder="Search actions…" />
        <CommandList>
          <CommandItem
            value="deploy"
            onSelect={async () => {
              await wait(1200)
              log("Deployed to production")
            }}
          >
            {(state) => (
              <>
                Deploy to production
                {state.pending && (
                  <LoaderCircleIcon data-slot="spinner" aria-hidden="true" />
                )}
              </>
            )}
          </CommandItem>
          <CommandItem
            value="sync"
            onSelect={async () => {
              await wait(600)
              log("Couldn't sync: offline")
              throw new Error("Offline")
            }}
          >
            {(state) => (
              <>
                Sync with server
                {state.pending ? (
                  <LoaderCircleIcon data-slot="spinner" aria-hidden="true" />
                ) : (
                  state.error !== undefined && (
                    <span data-slot="hint">Failed, try again</span>
                  )
                )}
              </>
            )}
          </CommandItem>
        </CommandList>
      </Command>
    </div>
  )
}

export { Example }
```

Run Deploy to production and try it again while it's pending. Sync with server fails and can be retried; the console logs each outcome.

## Virtualized

Pass the full `items` collection so filtering and keyboard navigation include commands that are not mounted. Render only visible rows, giving each its index in the current results. `onValueChange` includes that index so you can scroll a newly highlighted row into view.

```tsx title="virtualized.tsx"
"use client"

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command"
import * as React from "react"

const commands = Array.from({ length: 10_000 }, (_, index) => ({
  value: `command-${index + 1}`,
  label: `Command ${index + 1}`,
}))

const row = 32
const height = 256

function Example() {
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  return (
    <Command
      items={commands}
      onValueChange={(value, { index }) => {
        const el = scroller.current
        if (!el || index < 0) {
          return
        }
        const top = index * row
        if (top < el.scrollTop) {
          el.scrollTop = top
        } else if (top + row > el.scrollTop + el.clientHeight) {
          el.scrollTop = top + row - el.clientHeight
        }
      }}
    >
      <CommandInput aria-label="Search 10,000 commands" placeholder="Search 10,000 commands…" />
      <div
        ref={scroller}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <CommandList>
          {(state) => {
            const start = Math.max(0, Math.floor(scrollTop / row) - 4)
            const end = Math.min(
              state.items.length,
              Math.ceil((scrollTop + height) / row) + 4
            )
            return (
              <div style={{ height: state.items.length * row }}>
                {(state.items as typeof commands)
                  .slice(start, end)
                  .map((item, offset) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      label={item.label}
                      index={start + offset}
                      style={{ top: (start + offset) * row }}
                    >
                      {item.label}
                    </CommandItem>
                  ))}
              </div>
            )
          }}
        </CommandList>
      </div>
    </Command>
  )
}

export { Example }
```

Search 10,000 commands or move through them with the arrow keys. Only the rows near the viewport render.

## Controlled

The highlighted command, search text, and page stack are separate:

| Value   | Shape                               | Change Notification |
| ------- | ----------------------------------- | ------------------- |
| `value` | A command’s string value or `null`. | `onValueChange`     |
| `query` | The search text.                    | `onQueryChange`     |
| `pages` | An array of page values.            | `onPagesChange`     |

Supply a value and its change callback to control it, or use `defaultValue`, `defaultQuery`, and `defaultPages` for starting state. Change callbacks receive details; call `details.cancel()` to reject a change. `value` is the highlighted command, not a chosen one, and it changes as the highlight moves. `onAction` reports activation, so moving the highlight alone does not run a command. [State and Events](../state-and-events.md) covers the shared binding pattern.

```tsx title="controlled.tsx"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPage,
} from "@ui-sdk/react/command"
import * as React from "react"
import { useLog } from "./log"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

function Example() {
  const [value, setValue] = React.useState<string | null>("dark")
  const [query, setQuery] = React.useState("")
  const [pages, setPages] = React.useState(["theme"])
  const log = useLog()
  return (
    <Command
      value={value}
      onValueChange={(next, details) => {
        setValue(next)
        log(`Highlighted ${next ?? "nothing"} (${details.reason})`)
      }}
      query={query}
      onQueryChange={(next, details) => {
        setQuery(next)
        log(`Query “${next}” (${details.reason})`)
      }}
      pages={pages}
      onPagesChange={(next, details) => {
        setPages(next)
        log(`Pages [${next.join(", ")}] (${details.reason})`)
      }}
      onAction={(next) => log(`Ran ${next}`)}
    >
      <CommandInput aria-label="Search themes" placeholder="Search themes…" />
      <CommandList>
        <CommandPage>
          <CommandItem value="theme" page="theme">
            Change theme…
          </CommandItem>
        </CommandPage>
        <CommandPage value="theme">
          {themes.map((theme) => (
            <CommandItem key={theme.value} value={theme.value}>
              {theme.label}
            </CommandItem>
          ))}
        </CommandPage>
      </CommandList>
    </Command>
  )
}

export { Example }
```

Open Change theme, search and move the highlight. The console logs each highlight, query and page change with its reason.

## Controller

Create a `createCommandController()` for one instance and pass it as `controller`. It can read and set the highlight, query, and page stack. Use `push()` and `pop()` to navigate pages, `run()` to run the highlighted command or a named one, and `focus()` to focus the search. See [Controllers](../controllers.md) for setup and lifecycle.

```tsx title="controller.tsx"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPage,
  createCommandController,
} from "@ui-sdk/react/command"
import { useLog } from "./log"

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const palette = createCommandController()

function Example() {
  const log = useLog()
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => palette.push("theme")}>
          Open Themes
        </button>
        <button type="button" onClick={() => palette.pop()}>
          Back
        </button>
        <button type="button" onClick={() => palette.setValue("dark")}>
          Highlight Dark
        </button>
        <button type="button" onClick={() => palette.setQuery("li")}>
          Search “li”
        </button>
        <button type="button" onClick={() => palette.run()}>
          Run Highlighted
        </button>
        <button type="button" onClick={() => palette.focus()}>
          Focus
        </button>
      </div>
      <Command controller={palette} onAction={(value) => log(`Ran ${value}`)}>
        <CommandInput aria-label="Search commands" />
        <CommandList>
          <CommandPage>
            <CommandItem value="theme" page="theme">
              Change theme…
            </CommandItem>
          </CommandPage>
          <CommandPage value="theme">
            {themes.map((theme) => (
              <CommandItem key={theme.value} value={theme.value}>
                {theme.label}
              </CommandItem>
            ))}
          </CommandPage>
        </CommandList>
      </Command>
    </div>
  )
}

export { Example }
```

Use the buttons to open pages, search, move the highlight and run it from outside. The console logs each command that runs.

## Custom Rendering

Render a command as an anchor when it should navigate. Enter follows the highlighted link; modified clicks keep their usual browser behavior.

```tsx title="custom-rendering.tsx"
"use client"

import {
  Command,
  CommandInput,
  CommandItem,
  CommandItemText,
  CommandList,
} from "@ui-sdk/react/command"
import { CornerDownLeftIcon } from "lucide-react"

const pages = ["Composition", "Installation", "Styling"]

function Example() {
  return (
    <Command>
      <CommandInput aria-label="Search docs" placeholder="Search docs…" />
      <CommandList>
        {pages.map((page) => (
          <CommandItem
            key={page}
            value={page}
            render={<a href={`#${page.toLowerCase()}`} />}
          >
            {(state) => (
              <>
                <CommandItemText>
                  {(text) =>
                    text.segments.map((segment, index) =>
                      segment.match ? (
                        <strong key={index}>{segment.text}</strong>
                      ) : (
                        segment.text
                      )
                    )
                  }
                </CommandItemText>
                {state.highlighted && <CornerDownLeftIcon aria-hidden="true" />}
              </>
            )}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

export { Example }
```

Search for Installation and press Enter. The command follows the link to that section on this page.

## Styling

Each part has a `data-slot`, such as `command-item`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

Use `data-highlighted` for the active command and `data-pending` for an action in progress. Give the list a height limit and `overflow-y: auto` for long lists; keyboard navigation scrolls the highlighted command into view. When mixing commands with and without icons, `data-has-icons` on the list and `data-has-icon` on each item let you reserve matching space with logical padding.

## Data Attributes

### Command
`[data-slot="command"]`

- `data-loading`: Present while results load, with `status="loading"`.

### CommandInput
### CommandList
`[data-slot="command-list"]`

- `data-has-icons`: Present while any command inside holds an icon part, so items without one can line up.

### CommandItem
`[data-slot="command-item"]`

- `data-disabled`: Present when the command can't run. Arrow keys skip it.
- `data-highlighted`: Present on the highlighted command, which Enter runs. Focus stays in the field.
- `data-pending`: Present while the Promise the command's `onSelect` or `onAction` returned is running.
- `data-has-icon`: Present on a command while it holds an icon part.

### CommandItemText
`[data-slot="command-item-text"]`

- `data-matched`: Present on a command's text while the search matched part of it, which is marked.

### CommandItemIcon
`[data-slot="command-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### CommandEmpty
`[data-slot="command-empty"]`

- `data-loading`: Present while results load, with `status="loading"`.
- `data-empty`: Present while no command matches.

### CommandStatus
`[data-slot="command-status"]`

- `data-loading`: Present while results load, with `status="loading"`.

## API Reference

Props and callbacks are the same as below, as React props.

### Command

- `value?` (`string | null`): The highlighted command's value. Pass it to control the highlight. `null` highlights nothing.
- `defaultValue?` (`string | null`): The command highlighted at first, when uncontrolled. Without it, the first command is, with `autoHighlight`.
- `onValueChange?` (`((value: string | null, details: CommandValueChangeDetails) => void)`): Runs when the highlight moves: arrow keys, the pointer, typing, a page change or a controller. `details.index` says where the command is, for virtualized lists.
- `query?` (`string`): The search text, which filters the commands. Pass it to control it.
- `defaultQuery?` (`string`): The search text at first, when uncontrolled.
- `onQueryChange?` (`((query: string, details: ChangeDetails<CommandQueryChangeReason>) => void)`): Runs when the search text wants to change: typing, opening a page, going back, or a controller.
- `pages?` (`string[]`): The stack of open pages, from the first page opened to the current one. Pass it to control it.
- `defaultPages?` (`string[]`): The pages open at first, when uncontrolled.
- `onPagesChange?` (`((pages: string[], details: ChangeDetails<CommandPagesChangeReason>) => void)`): Runs when a page opens or Backspace or Escape goes back.
- `onAction?` (`((value: string, details: CommandActionDetails) => unknown)`): Runs when a command runs, with its value: Enter, a click, or its shortcut. Return a Promise to mark the command pending until it settles: it gets `data-pending`, `aria-busy` and `aria-disabled`, and running it again waits. A rejection puts the reason in its `error` state until the next run.
- `pendingAnnouncement?` (`string`): What screen readers hear once a command has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `items?` (`CommandData`): The commands as data. Renders them for you, ranked as the user types, with pages for commands that have `items`.
- `emptyItems?` (`CommandData`): Commands shown instead of `items` on the first page while the search is empty, like recent or suggested ones. Groups work, like `{ type: "group", label: "Suggestions", items }`. Needs `items`.
- `filter?` (`SearchFilter<string>`): How typing narrows the list: `"fuzzy"` keeps commands with the text's letters in order, best matches first; `"contains"` and `"startsWith"` match the text itself. A function returns a score (0 hides) or a boolean. `false` keeps every command, for results a server already filtered. Composed commands keep their order, and data commands are ranked by score.
- `autoHighlight?` (`boolean`): Whether the first command is highlighted while nothing else is, and the best match as the user types, so Enter runs it.
- `loop?` (`boolean`): Whether arrow keys wrap from the last command to the first.
- `status?` (`AsyncOptionsStatus`): Whether results are loading or failed, for the empty and status parts. Sets `aria-busy` on the list while loading.
- `onLoadMore?` (`(() => void)`): Runs when the highlight or scrolling reaches the last command, so the next page can load, like `createAsyncOptions`'s `loadMore`. Not again for the same commands, unless the last load failed.
- `announcement?` (`((change: ListAnnouncement) => string | null | undefined)`): What screen readers hear after typing pauses, when no `CommandStatus` is rendered. Return null for nothing.
- `controller?` (`object`): Reads and drives the list from anywhere. Create one with `createCommandController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CommandInput

The search field. Renders an `input` with the combobox role.

### CommandStatus

Describes loading and failures. Renders a `div` with the status role.

### CommandEmpty

Shows while no command matches. Renders a `div`.

### CommandList

Holds the commands. Renders a `div` with the listbox role, always shown.

### CommandPage

- `value?` (`string`): The page's name, which a command's `page` opens. Leave it out for the first page.

### CommandGroup

Groups commands under a label. Renders a `div` with the group role.

### CommandGroupLabel

Names its group. Renders a `div`.

### CommandItem

- `value?` (`string`): Passed to `onAction` and `onValueChange`, and identifies the command. Without it, one is generated.
- `label?` (`string`): The text the search matches, when the content isn't plain text. Not the accessible name: use `aria-label` for that.
- `keywords?` (`string[]`): More words the search matches.
- `disabled?` (`boolean`): Keeps the command from running. Arrow keys and the pointer skip it. Sets `data-disabled` and `aria-disabled`.
- `shortcut?` (`string`): A keyboard shortcut that runs the command while it's in the page, like `"mod+p"`. Sets `aria-keyshortcuts`, and a `CommandShortcut` inside shows it.
- `page?` (`string`): The page choosing this command opens, by the `value` of a `CommandPage`.
- `index?` (`number`): The command's position among all visible commands, for virtualized lists that render only some. Sets `aria-posinset` and `aria-setsize`.
- `onSelect?` (`((event: Event) => unknown)`): Runs when the command runs, before `onAction`, with the click or key press that ran it, or a new `select` Event for a shortcut or a controller's `run()`. Call `event.preventDefault()` to skip `onAction` and the page. Return a Promise to mark the command pending until it settles, like `onAction`.

### CommandItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### CommandItemText

Shows its command's label, and marks what matched the search. Renders a `span`.

### CommandShortcut

- `shortcut?` (`string`): The keys to show, like `"mod+p"`. Inside a command, its `shortcut`.

### CommandSeparator

Separates commands or groups. Renders a `div` with the separator role.

### Items as Data

Each command in `items`. Groups are `{ type: "group", label, items }` and separators `{ type: "separator" }`.

- `value` (`string`): Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`.
- `label` (`string`): The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen.
- `keywords?` (`string[]`): More words filtering matches, like `["team"]` for a plan called Pro.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard skips it, like in a native select.
- `shortcut?` (`string`): A keyboard shortcut that runs the command, like `"mod+p"`, while the list is in the page, whatever page it's on. Shows `⌘P` on Apple platforms and `Ctrl+P` elsewhere.
- `items?` (`CommandData`): Commands on a page of their own. Choosing this command opens the page, and Backspace in the empty field goes back.

### State

What render functions, state-based class names and slots receive, per part.

`Command`:

- `page` (`string | null`): The current page, or `null` on the first page.
- `loading` (`boolean`): Whether results are loading.

`CommandInput`:

- `page` (`string | null`): The current page, or `null` on the first page.

`CommandList`:

- `status` (`AsyncOptionsStatus`): Whether results are loading or failed.
- `items` (`CommandData`): The visible data commands, ranked, for rendering a virtualized list yourself.

`CommandItem`:

- `highlighted` (`boolean`): Whether the command is highlighted, by the keyboard, the pointer or typing.
- `disabled` (`boolean`): Whether the command can't run.
- `pending` (`boolean`): Whether its action's Promise is running.
- `error` (`unknown`): Why its last action failed, until it runs again.

`CommandEmpty`:

- `loading` (`boolean`): Whether results are loading.
- `empty` (`boolean`): Whether no item matches.
- `query` (`string`): The text the list is filtered by.

`CommandStatus`:

- `status` (`"idle" | "loading" | "error"`): Whether results are loading or failed.
- `loading` (`boolean`): Whether results are loading.
- `count` (`number`): How many items are visible.

`CommandShortcut`:

- `text` (`string`): The shortcut formatted for this platform: `⌘P` on Apple platforms and `Ctrl+P` elsewhere. Empty without one.

`CommandItemText`, which takes no props of its own:

- `segments` (`MatchSegment[]`): The text in pieces, each marked when it matched. Joined, they're the whole text.
- `matched` (`boolean`): Whether any piece matched.

`CommandItemIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

### Reasons

Why the highlighted command changed:

- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `item-hover` (`PointerEvent`): The pointer moved onto an item, which highlighted it, like in a command list.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `item-removed` (`none`): The selected item left the page, and another was picked.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Why the search text changed:

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

And why the stack of pages changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createCommandController()` and pass it as `controller`.

- `getValue()` (`() => string | null`): The highlighted command's value, or `null`.
- `setValue(value, options?)` (`(value: string | null, options?: CommandChangeOptions<CommandValueChangeReason> | undefined) => boolean`): Highlights a command, and scrolls it into view. Returns false when the change was canceled or nothing changed.
- `getQuery()` (`() => string`): The search text.
- `setQuery(query, options?)` (`(query: string, options?: CommandChangeOptions<CommandQueryChangeReason> | undefined) => boolean`): Changes the search text, which filters the commands. Returns false when the change was canceled or nothing changed.
- `getPages()` (`() => string[]`): The stack of open pages, from the first page opened to the current one. Empty on the first page.
- `setPages(pages, options?)` (`(pages: string[], options?: CommandChangeOptions<CommandPagesChangeReason> | undefined) => boolean`): Replaces the stack of pages. Returns false when the change was canceled or nothing changed.
- `push(page, options?)` (`(page: string, options?: CommandChangeOptions<CommandPagesChangeReason> | undefined) => boolean`): Opens a page on top of the current one, by the `value` of a `CommandPage` or a data command. Returns false when the change was canceled or nothing changed.
- `pop(options?)` (`(options?: CommandChangeOptions<CommandPagesChangeReason> | undefined) => boolean`): Goes back to the previous page, and puts back the search text typed there. Returns false when the change was canceled or nothing changed.
- `run(value?)` (`(value?: string | undefined) => void`): Runs a command, as Enter would: the highlighted one, or the one with this value.
- `focus()` (`() => void`): Moves focus to the search field.

### Events

Callbacks get the new state first, then the details.

| Prop            | On            | Receives                                                                              |
| --------------- | ------------- | ------------------------------------------------------------------------------------- |
| `onValueChange` | `Command`     | `(value, details)`: the highlighted command, the [reason](#reasons) and its `index`   |
| `onQueryChange` | `Command`     | `(query, details)`: the new text, and the [reason](#reasons)                          |
| `onPagesChange` | `Command`     | `(pages, details)`: the new stack, and the [reason](#reasons)                         |
| `onAction`      | `Command`     | `(value, { event })`: the command that ran. Return a Promise to mark it pending       |
| `onLoadMore`    | `Command`     | `()`, when the last command is reached                                                |
| `onSelect`      | `CommandItem` | `(event)`: before `onAction`. `preventDefault()` skips it. A Promise marks it pending |

## Accessibility

The command list follows the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) with a listbox that's always shown. Focus stays in the input, which points to the highlighted command with `aria-activedescendant`. Every line below is an automated test.

### Keyboard

| Key                | Does                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| Typing             | Filters the commands and highlights the best match                    |
| ArrowDown, ArrowUp | Moves the highlight. Wraps unless `loop={false}`                      |
| Enter              | Runs the highlighted command, or follows it when it renders as a link |
| Escape             | Clears the search, then goes back a page                              |
| Backspace          | In an empty search, goes back a page and restores its query           |
| An item's shortcut | Runs it while the list is mounted, even when hidden by the search     |

The first available command is highlighted by default. Set `autoHighlight` to `false` to wait for an arrow key or pointer movement.

### Tested Behavior

**Field**

- Is a combobox that controls an always-expanded listbox.
- The list is named by the field, not by what's typed.
- The first command is highlighted from the start.

**Filtering**

- Typing keeps the commands that match, ignoring case and accents.
- Groups without a match hide, and the rest keep their labels.
- The first match is highlighted as the text changes, so Enter runs it.
- Deleting text brings back the commands the shorter text matches.
- Commands without a value that mount while the field has text show when they match.
- Going back a page reports the new highlight as back, not as a removal.
- Nothing matching shows the empty message.

**Keyboard**

- Arrow keys move the highlight while focus stays in the field.
- Home and End stay in the field for the caret.
- The highlighted option has the id aria-activedescendant names.
- Enter runs the highlighted command.

**Pointer**

- Clicking a command runs it.
- A disabled command doesn't run.

**AutoHighlight**

- Without autoHighlight, nothing is highlighted until an arrow key.

Runs in React, Vue and web components.

Long lists stay fast and announce their size:

**Virtualized**

- Renders only the rows in view, each with its place in the whole list.
- Arrow keys reach commands that weren't rendered, and the active descendant follows.
- Typing ranks every command, rendered or not, best match first.

Runs in React.

Also tested:

**Enhancements**

- The highlighted command is the selected option, as the APG's list autocomplete marks it.
- Keywords match as well as labels.
- Fuzzy matching finds the letters in order, across words.
- Arrow keys skip disabled commands.
- A command's shortcut runs it and sets aria-keyshortcuts.
- A shortcut runs its command while the search hides it.
- A command is pending while its action's Promise runs, and runs only once.
- A command opens its page, and Backspace in the empty field goes back with the text.
- Escape clears the text, then goes back a page.
- Results that still hold the highlighted command keep the highlight.
- The list is busy while results load.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while searching with a keyboard.

Runs in React, Vue and web components.
