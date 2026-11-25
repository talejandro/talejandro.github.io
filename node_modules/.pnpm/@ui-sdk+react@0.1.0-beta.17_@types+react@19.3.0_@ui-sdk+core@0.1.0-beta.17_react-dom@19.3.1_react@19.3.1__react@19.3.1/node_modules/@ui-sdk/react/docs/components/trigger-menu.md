# Trigger Menu

"Opens suggestions at the caret when you type a trigger such as @, /, or #."

A trigger menu suggests what to insert when someone types a trigger character, like `@` for people or `/` for commands. It opens at the caret, narrows as they type, and inserts the choice into the text.

```tsx title="demo.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
  TriggerMenuStatus,
} from "@ui-sdk/react/trigger-menu"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  return (
    <TriggerMenu triggers={[{ char: "@", type: "mention", items: people }]}>
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @ to mention someone…" />}
        />
      </Field>
      <div data-slot="visually-hidden">
        <TriggerMenuStatus />
      </div>
      <TriggerMenuContent>
        <TriggerMenuEmpty>No one found</TriggerMenuEmpty>
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem
                key={item.value}
                value={item.value}
                label={item.label}
              >
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
```

Type @, narrow the list with a name, and press Enter to insert the highlighted person.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `TriggerMenu`:

```text
TriggerMenu
├── TriggerMenuInput
├── TriggerMenuStatus
└── TriggerMenuContent
    ├── TriggerMenuEmpty
    └── TriggerMenuList
        ├── TriggerMenuItem
        └── TriggerMenuItem
```

`TriggerMenu` holds the triggers and what each one lists. `TriggerMenuInput` is the field people type in, and `TriggerMenuContent` is the popup with the suggestions. Without a `TriggerMenuContent` among its direct children, the menu renders the current trigger's items for you. Inside a [Token Input](./token-input.md), leave out `TriggerMenuInput`: the menu suggests into the token input.

## Usage

Import the parts and put them together:

```tsx
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"

function Example() {
  return (
    <TriggerMenu triggers={[{ char: "@" }]}>
      <TriggerMenuInput
        aria-label="Message"
        placeholder="Type @ to mention someone…"
      />
      <TriggerMenuContent>
        <TriggerMenuList>
          <TriggerMenuItem value="hollis" label="Hollis Grant">
            Hollis Grant
          </TriggerMenuItem>
          <TriggerMenuItem value="ines" label="Inès Moreau">
            Inès Moreau
          </TriggerMenuItem>
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
```

`label` is the text an item is matched by and inserts. Choosing Hollis Grant replaces `@` and what was typed after it with `@Hollis Grant `.

## Trigger Menu or Token Input

Trigger Menu suggests what to insert: it matches the trigger, filters, moves the highlight, loads items and asks for a command's arguments. [Token Input](./token-input.md) holds a value that mixes text and tokens.

Use Trigger Menu with a textarea or an input to insert text. Put it inside a Token Input to insert tokens instead. Another editor connects through an [adapter](#any-editor).

## Triggers as Data

Give each trigger a `char` and its `items`. Items can be strings, objects, groups or a loader, and they render themselves when you leave out `TriggerMenuContent`. The same field can offer people after `@`, commands after `/` and channels after `#`.

```tsx title="data.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerDefinition,
  TriggerMenu,
  TriggerMenuInput,
} from "@ui-sdk/react/trigger-menu"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

const commands = ["away", "remind", "search", "status"]

const channels = [
  "announcements",
  "design",
  "design-reviews",
  "engineering",
  "general",
  "launches",
  "support",
]

function searchChannels(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve(
          channels.filter((channel) => channel.includes(query.toLowerCase()))
        ),
      400
    )
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

const triggers: TriggerDefinition[] = [
  { char: "@", items: people },
  { char: "/", boundary: "start", items: commands },
  { char: "#", items: searchChannels },
]

function Example() {
  return (
    <TriggerMenu triggers={triggers}>
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @, / or #…" />}
        />
      </Field>
    </TriggerMenu>
  )
}

export { Example }
```

Type @ for people, / at the start for commands, or # to load channels.

## Commands with Arguments

A trigger with `boundary: "start"` matches only at the start of the text, so a leading space escapes it. An item with `arguments` asks for each one in order: `TriggerMenuHint` shows what's left at the caret, Tab accepts the highlighted suggestion and moves to the next argument, Enter finishes once only optional arguments remain, and Backspace past an argument's start goes back. An argument without `items` is free text. `after: "submit"` sends the form once the item is inserted.

```tsx title="commands.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  TriggerMenu,
  TriggerMenuHint,
  TriggerMenuInput,
} from "@ui-sdk/react/trigger-menu"
import { useLog } from "./log"

const commands = [
  {
    value: "status",
    label: "status",
    arguments: [
      {
        name: "status",
        hint: "<status>",
        required: true,
        items: ["available", "busy", "away"],
      },
      {
        name: "until",
        hint: "[until]",
        items: ["30m", "1h", "4h", "today"],
        allowCustomValue: false,
      },
    ],
  },
  {
    value: "search",
    label: "search",
    arguments: [{ name: "query", hint: "<query>", required: true }],
  },
  { value: "away", label: "away", after: "submit" as const },
  { value: "clear", label: "clear" },
]

function Example() {
  const log = useLog()
  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        log(`Sent ${new FormData(event.currentTarget).get("message")}`)
      }}
    >
      <TriggerMenu
        triggers={[
          { char: "/", boundary: "start", type: "command", items: commands },
        ]}
        onSelect={(value, details) =>
          log(
            ["Chose", `/${value}`, ...Object.values(details.arguments)].join(
              " "
            )
          )
        }
      >
        <Field name="message">
          <FieldLabel>Message</FieldLabel>
          <FieldControl
            render={<TriggerMenuInput placeholder="Type / for commands…" />}
          />
        </Field>
        <TriggerMenuHint />
      </TriggerMenu>
    </form>
  )
}

export { Example }
```

Type /status, then press Tab to choose a status and an optional time, and Enter to finish. Choose /away to send it at once. The console logs each command.

## Icons

Put an item's icon in a `TriggerMenuItemIcon`, before its text. Screen readers skip it, and filtering and the text a choice inserts ignore it, so an SVG's `<title>`, an icon font's glyph or an emoji never joins the item's name or the field. Items as data have no icon, so compose the items that show one.

- **Icons that point a way**, like arrows and reply, flip in right-to-left text with `mirror`.
- **Items with only an icon** need an `aria-label`, which filtering matches too. In development, one with no name warns.
- **Lining up items.** Items with an icon get `data-has-icon`, and the list gets `data-has-icons` while any item has one, so items without an icon can keep its space with padding.

```tsx title="icons.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuItemIcon,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import {
  ClockIcon,
  ReplyIcon,
  SearchIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react"

const commands = [
  { value: "reply", icon: ReplyIcon, mirror: true },
  { value: "remind", icon: ClockIcon },
  { value: "search", icon: SearchIcon },
  { value: "share", icon: ShareIcon },
  { value: "clear", icon: TrashIcon },
]

function Example() {
  return (
    <TriggerMenu triggers={[{ char: "/", boundary: "start", type: "command" }]}>
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type / for commands…" />}
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuList>
          {commands.map((command) => (
            <TriggerMenuItem key={command.value} value={command.value}>
              <TriggerMenuItemIcon mirror={command.mirror}>
                <command.icon />
              </TriggerMenuItemIcon>
              {command.value}
            </TriggerMenuItem>
          ))}
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
```

Type / to open the commands, then type re to narrow them. Each icon sits before its name, and filtering ignores it.

## Loading Items

A trigger's `items` can be a loader, called with the query and an `AbortSignal` once typing pauses. A newer query aborts the older load, so only its results land, and the last results stay while the next ones load. `TriggerMenuStatus` and `TriggerMenuEmpty` get `loading`, and while a load runs, `aria-busy` marks the list, so you can fade the results that are about to change.

```tsx title="async.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
  TriggerMenuStatus,
} from "@ui-sdk/react/trigger-menu"

const channels = [
  "announcements",
  "design",
  "design-reviews",
  "engineering",
  "general",
  "launches",
  "support",
]

function searchChannels(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve(
          channels
            .filter((channel) => channel.includes(query.toLowerCase()))
            .map((channel) => ({ value: channel, label: channel }))
        ),
      600
    )
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function Example() {
  return (
    <TriggerMenu triggers={[{ char: "#", type: "channel", items: searchChannels }]}>
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type # to link a channel…" />}
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuStatus>
          {(state) =>
            state.loading
              ? "Loading channels…"
              : state.count
                ? `${state.count} ${state.count === 1 ? "channel" : "channels"}`
                : ""
          }
        </TriggerMenuStatus>
        <TriggerMenuEmpty>
          {(state) =>
            state.empty && !state.loading
              ? `No channels match “${state.query}”`
              : null
          }
        </TriggerMenuEmpty>
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
```

Type # and a channel name. The list says it's loading, and older results fade while newer ones load.

## Custom Items

Compose `TriggerMenuItem`s with any content, in groups. `label` is what's matched and inserted, `keywords` adds words to match, and `disabled` keeps an item in the list without letting it be chosen. A trigger's `spaces`, `pattern` and `maxLength` decide what its query may hold, `filter` how it narrows the items, and `insert` what replaces the trigger and query. An item's own `onSelect` runs first and can insert something else with `details.insert()`.

```tsx title="custom-items.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuGroup,
  TriggerMenuGroupLabel,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuItemIcon,
  TriggerMenuList,
  TriggerMenuSeparator,
} from "@ui-sdk/react/trigger-menu"
import { UsersIcon } from "lucide-react"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik", disabled: true },
]

function Example() {
  return (
    <TriggerMenu
      triggers={[
        {
          char: "@",
          spaces: 2,
          maxLength: 30,
          pattern: /[\p{L}.'-]/u,
          filter: "startsWith",
          insert: (item) => `@${item.label.split(" ")[0]} `,
        },
      ]}
    >
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @ and a first name…" />}
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuList>
          <TriggerMenuGroup>
            <TriggerMenuGroupLabel>People</TriggerMenuGroupLabel>
            {people.map((person) => (
              <TriggerMenuItem
                key={person.value}
                value={person.value}
                label={person.label}
                disabled={person.disabled}
              >
                {person.label}
                <span data-slot="hint">
                  {person.disabled ? "Deactivated" : `@${person.value}`}
                </span>
              </TriggerMenuItem>
            ))}
          </TriggerMenuGroup>
          <TriggerMenuSeparator />
          <TriggerMenuItem
            value="here"
            label="here"
            keywords={["everyone", "channel"]}
            onSelect={(value, details) => details.insert("@here ")}
          >
            <TriggerMenuItemIcon>
              <UsersIcon />
            </TriggerMenuItemIcon>
            Notify everyone here
          </TriggerMenuItem>
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
```

Type @ and the start of a first name to insert it, or choose Notify everyone here to insert @here. Deactivated people can't be chosen.

## Input

Render the input part as an `<input>` for a single line. It's a combobox with `aria-expanded`. In a single line, Enter often submits a form, so this example sets `autoHighlight={false}`: Enter chooses only once an arrow key has highlighted a person, and `loop={false}` stops the arrows at either end of the list.

```tsx title="input.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  return (
    <TriggerMenu triggers={[{ char: "@", items: people }]} autoHighlight={false} loop={false}>
      <Field>
        <FieldLabel>Task</FieldLabel>
        <FieldControl
          render={
            <TriggerMenuInput
              render={<input />}
              placeholder="Type @ to assign someone…"
            />
          }
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
```

Type @ in the empty task. Nothing is highlighted until you press ArrowDown, then Enter assigns the person.

## Positioning

By default, the list opens below the trigger at the caret and flips to stay on screen. `side`, `align` and the offsets place it, and `anchor` positions it against another element. This example opens the list above the whole field, lines its items up with the label, and renders it inside the field with `container`.

```tsx title="positioning.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  const [field, setField] = React.useState<HTMLDivElement | null>(null)
  return (
    <TriggerMenu triggers={[{ char: "@", items: people }]}>
      <Field ref={setField}>
        <FieldLabel>Comment</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @ to mention someone…" />}
        />
      </Field>
      <TriggerMenuContent
        side="top"
        align="start"
        sideOffset={8}
        alignOffset={-5}
        collisionPadding={16}
        anchor={field}
        container={field}
        keepMounted
      >
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
```

Type @ in the comment. The list opens above the field, lined up with its label.

## Controlled

Pass `open` and update it in `onOpenChange` to own the popup state. The details say why it changed. `onQueryChange` reports the text after the trigger and the argument being typed, and `onOpenChangeComplete` runs once the menu has finished opening or closing. Escape dismisses a match, and `shortcut` reopens it, Control+Space by default.

```tsx title="controlled.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import { TriggerMenu, TriggerMenuInput } from "@ui-sdk/react/trigger-menu"
import * as React from "react"
import { useLog } from "./log"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

const commands = [
  {
    value: "status",
    label: "status",
    arguments: [
      {
        name: "status",
        hint: "<status>",
        required: true,
        items: ["available", "busy", "away"],
      },
    ],
  },
]

function Example() {
  const log = useLog()
  const [open, setOpen] = React.useState(false)
  return (
    <TriggerMenu
      triggers={[
        { char: "@", items: people },
        { char: "/", boundary: "start", items: commands },
      ]}
      open={open}
      onOpenChange={(next, details) => {
        setOpen(next)
        log(`${next ? "Opening" : "Closing"} (${details.reason})`)
      }}
      onOpenChangeComplete={(next) => log(next ? "Open" : "Closed")}
      onQueryChange={(query, details) =>
        log(
          `Query “${query}”${details.argument ? ` for ${details.argument}` : ""}`
        )
      }
      shortcut="ctrl+j"
    >
      <Field>
        <FieldLabel>Message</FieldLabel>
        <FieldControl
          render={<TriggerMenuInput placeholder="Type @ or /…" />}
        />
      </Field>
    </TriggerMenu>
  )
}

export { Example }
```

Type @ and a name, press Escape, then Control+J to reopen the list. The console logs each callback with its reason.

## Controller

Create a controller with `createTriggerMenuController()` and pass it as `controller` to open suggestions, insert text at the caret, or read the current match. `open()` types the trigger at the caret and returns a Promise that resolves when the menu closes.

```tsx title="controller.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
  createTriggerMenuController,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"
import { useLog } from "./log"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  const log = useLog()
  const [menu] = React.useState(createTriggerMenuController)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={async () => {
            const closed = await menu.open({ trigger: "@" })
            log(`Closed (${closed.reason})`)
          }}
        >
          Mention
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            menu.insert(
              new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })
            )
          }
        >
          Insert Date
        </button>
      </div>
      <TriggerMenu controller={menu} triggers={[{ char: "@", items: people }]}>
        <Field>
          <FieldLabel>Message</FieldLabel>
          <FieldControl
            render={<TriggerMenuInput placeholder="Write a message…" />}
          />
        </Field>
        <TriggerMenuContent>
          <TriggerMenuList>
            {(state) =>
              (state.items as TriggerMenuDataItem[]).map((item) => (
                <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                  {item.label}
                </TriggerMenuItem>
              ))
            }
          </TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
    </div>
  )
}

export { Example }
```

Press Mention and choose a person. The console logs why the list closed. Insert Date adds today's date at the caret.

## Any Editor

Pass `editor` to connect the menu to a field you render yourself, or to another editor. `textFieldAdapter()` makes one for a textarea or an input.

```tsx title="editor.tsx"
"use client"

import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"
import {
  type TextEditorAdapter,
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
  textFieldAdapter,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  const [editor, setEditor] = React.useState<TextEditorAdapter>()
  return (
    <TriggerMenu editor={editor} triggers={[{ char: "@", items: people }]}>
      <Field>
        <FieldLabel>Notes</FieldLabel>
        <FieldControl
          render={
            <textarea
              ref={(field) => {
                if (field && editor?.element !== field) {
                  setEditor(textFieldAdapter(field))
                }
              }}
              placeholder="Type @ to mention someone…"
            />
          }
        />
      </Field>
      <TriggerMenuContent>
        <TriggerMenuList>
          {(state) =>
            (state.items as TriggerMenuDataItem[]).map((item) => (
              <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                {item.label}
              </TriggerMenuItem>
            ))
          }
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}

export { Example }
```

Type @ in the notes, a textarea connected through an editor adapter, and choose a person.

An adapter for another editor reads its text and selection, measures a rectangle at an offset, replaces a range as one undo step, and reports changes. Report changes that weren't the user's with `user: false`, like a collaborator's, and the menu never opens for them.

- `element` (`HTMLElement`): The focused element that gets keys and the menu's ARIA. Undefined until it's in the page.
- `textBefore` (`(length: number) => { text: string; offset: number; } | null`): Up to `length` characters before the caret, and the offset they start at. A token reads as U+FFFC.
- `selection` (`() => TextRange | null`): The selection as text offsets, or null while unfocused.
- `rectAt` (`(offset: number) => TextRect | null`): The rectangle at a text offset, for anchoring.
- `replace` (`(range: TextRange, content: string | TokenInsert, options?: EditorReplaceOptions) => void`): Replaces a range with text or a token as one undoable step, and puts the caret after it.
- `subscribe` (`(listener: (change: EditorChange) => void) => () => void`): Calls `listener` for text edits, caret moves and composition. Returns a cleanup.
- `composing` (`() => boolean`): Whether an input method is composing.
- `tokens?` (`boolean`): Whether `replace` accepts tokens.
- `submit?` (`((event?: Event) => void)`): Sends what's typed, like a form submit, for items that end with `after: "submit"`.

## Undo

Choosing an item keeps the native text field's undo history. Press Command+Z or Control+Z to bring back the query. Safari may combine the insertion with the typing before it in one undo step.

A custom editor adapter must make each replacement one undo step. [Token Input](./token-input.md) handles its own token history.

## Custom Rendering

Every part takes `render`. Render `TriggerMenuInput` as an `<input>`, as the input example does, or through another component, like a `FieldControl`, as every example here does to join a [Field](./field.md). [Parts and Composition](../parts-and-composition.md#choose-the-element) explains how props merge, and each part's state is listed under [State](#state).

## Styling

Style the field, the popup and its items. The content shows `data-trigger`, so each trigger's list can look different, like commands in a monospace font. Items show `data-highlighted` and `data-disabled`, and `data-has-icon` when they hold a `TriggerMenuItemIcon`; the list shows `data-has-icons` while any item has one. Fade a loading list with `aria-busy`, and style the hint as ghost text: it's positioned at the caret for you.

Each part has a `data-slot`, such as `trigger-menu-item`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

### TriggerMenuContent
- `--anchor-width`: Width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Height of the anchor.
- `--available-width`: Space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: The point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.

## Data Attributes

### TriggerMenuInput
`[data-slot="trigger-menu-input"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.
- `data-trigger`: The trigger of the current match, like `@`, while there is one.

### TriggerMenuContent
`[data-slot="trigger-menu-content"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the list animates out. Style the state you animate to.
- `data-side` (`top`, `right`, `bottom`, `left`): Where the list ended up, after flipping away from edges.
- `data-align` (`start`, `center`, `end`): How the list lines up with the trigger.
- `data-open`: Present while the list is open.
- `data-trigger`: The trigger of the current match, like `@`, while there is one.
- `data-has-icons`: Present while any item inside holds an icon part, so items without one can line up.

### TriggerMenuItem
`[data-slot="trigger-menu-item"]`

- `data-disabled`: Present when the item can't be chosen.
- `data-highlighted`: Present on the highlighted item. Focus stays in the field.
- `data-has-icon`: Present on an item while it holds an icon part.

### TriggerMenuEmpty
`[data-slot="trigger-menu-empty"]`

- `data-empty`: Present while no item matches.
- `data-loading`: Present while items load.

### TriggerMenuItemIcon
`[data-slot="trigger-menu-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

## API Reference

Props and callbacks are the same as below, as React props.

### TriggerMenu

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `triggers` (`TriggerDefinition<T>[]`): The texts that open the menu, and what each one lists.
- `editor?` (`TextEditorAdapter`): The editor the menu reads and writes, for editors without a part of their own, like Tiptap. TriggerMenuInput and a surrounding TokenInput set it for you.
- `open?` (`boolean`): Whether the menu is open. Pass it to control it; it shows only while there's a match.
- `onOpenChange?` (`((open: boolean, details: ChangeDetails<TriggerMenuOpenChangeReason> & { trigger: string | null; }) => void)`): Runs when the menu wants to open or close. `details.reason` says why, `details.trigger` which trigger, and `details.cancel()` stops it.
- `onOpenChangeComplete?` (`((open: boolean) => void)`): Runs once the menu has finished opening or closing, after any animation.
- `onQueryChange?` (`((query: string, details: ChangeDetails<TriggerMenuQueryChangeReason> & { trigger: string; argument?: string; }) => void)`): Runs when the text after the trigger changes. Read-only: it's the editor's text. `details.argument` names the argument being typed.
- `onSelect?` (`((value: T, details: TriggerMenuSelectDetails<T>) => void | Promise<void | Partial<TokenInsert>>)`): Runs when an item, with every required argument, is chosen. The default insertion follows unless `details.preventDefault()`. Return a Promise and a token is inserted at once as pending, updated with what it resolves to and removed if it rejects; the menu closes either way.
- `pendingAnnouncement?` (`string`): What screen readers hear once an `onSelect` Promise has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `status?` (`AsyncOptionsStatus`): Whether items that come from outside are loading or failed, for the status and empty parts. Loaders report their own.
- `autoHighlight?` (`boolean`): Whether the first match is highlighted so Enter and Tab choose it. Visual only: screen readers hear about it once an arrow key moves the highlight, so typed characters keep being echoed.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `shortcut?` (`string`): Reopens a match dismissed with Escape, with the caret in it.
- `controller?` (`object`): Opens, closes and inserts from anywhere. Create one with `createTriggerMenuController()`.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `onDismissAttempt`.
- `onDismissAttempt?` (`((details: { reason: "escape-key"; event?: KeyboardEvent | undefined; } | { reason: "outside-press"; event?: MouseEvent | undefined; }) => void)`): Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### Triggers

- `char` (`string`): The text that starts a match: `"@"`, `"/"`, `"#"`, or several characters like `"[["`.
- `boundary?` (`TriggerBoundary`): Where a match may start.
- `spaces?` (`number | boolean`): Whether the query may contain spaces, or up to how many words, like `@next Wednesday`.
- `pattern?` (`RegExp`): Characters a query may contain, tested one at a time.
- `maxLength?` (`number`): The longest query before the match ends.
- `type?` (`string`): The kind of token choosing an item inserts, where the editor takes tokens.
- `items?` (`TriggerItemsLoader<T> | TriggerMenuData<T>`): Suggestions as data, or a loader given the query and an AbortSignal. Without them, the composed items show.
- `filter?` (`ListFilter<T>`): How typing narrows data items. Loaded items aren't filtered.
- `insert?` (`((item: TriggerMenuDataItem<T>, details: { match: TriggerMatch; arguments: Record<string, string>; }) => string | TokenInsert)`): What replaces the trigger and query. Defaults to a token where the editor takes tokens, else the trigger, the label and a space.

### Items as Data

- `value` (`T`): Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`.
- `label` (`string`): The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen.
- `keywords?` (`string[]`): More words filtering matches, like `["team"]` for a plan called Pro.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard skips it, like in a native select.
- `after?` (`TriggerAfter`): After choosing it: `"compose"` closes the menu, `"continue"` keeps it open and lists the same trigger's items for the text typed after it, and `"submit"` asks the editor to send. Tab never submits.
- `arguments?` (`TriggerArgument[]`): Typed arguments asked for in order once it's chosen, like `/model <name>`.

### Arguments

- `name` (`string`): The name it's reported under in `details.arguments`.
- `hint?` (`string`): Ghost text shown at the caret until it's typed. Defaults to `<name>`.
- `required?` (`boolean`): Whether Enter can finish the command without it.
- `items?` (`TriggerItemsLoader<string> | TriggerMenuData<string>`): Suggestions for it, as data or a loader. Without them, it's free text and no list shows.
- `allowCustomValue?` (`boolean`): Whether text that matches no suggestion is accepted, like a combobox's custom value.

### TriggerMenuInput

The field the menu suggests into. Renders a `textarea`, or an `input` through `render`.

### TriggerMenuStatus

A polite status that says the count and the keys once typing pauses. Pass a function as children to say something else. Renders a `div`.

### TriggerMenuContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger the list opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the list lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the line of text and the list, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the text, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `keepMounted?` (`boolean`): Whether the list stays in the page, hidden, while closed.

### TriggerMenuEmpty

Shown while no item matches. Rendering it keeps the menu open with no matches; without it, the menu closes until something matches. Renders a `div`.

### TriggerMenuList

The listbox. Without children, it renders the current trigger's items. Renders a `div`.

### TriggerMenuItem

- `value` (`T`): What `onSelect` receives when the item is chosen.
- `label?` (`string`): The text inserted and matched, when the content isn't plain text.
- `keywords?` (`string[]`): More words filtering matches.
- `disabled?` (`boolean`): Keeps the item from being chosen. It can still be highlighted, as the listbox pattern asks.
- `onSelect?` (`((value: T, details: TriggerMenuSelectDetails<T>) => void | Promise<void | Partial<TokenInsert>>)`): Runs before the menu's `onSelect`. `details.preventDefault()` skips the default insertion.

### TriggerMenuItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### TriggerMenuGroup and TriggerMenuGroupLabel

A group of items, named by its label. Each renders a `div`.

### TriggerMenuSeparator

A line between items or groups, hidden from screen readers. Renders a `div`.

### TriggerMenuHint

Ghost text at the caret for the arguments still to type, like `<status>`. Renders a `span`, hidden from screen readers.

### State

What render functions and state-based class names receive, per part.

`TriggerMenuInput`:

- `open` (`boolean`): Whether the menu is open. It opens on a typed trigger, and closes when nothing matches unless it's loading or renders an empty part.
- `trigger` (`string | null`): The trigger of the current match, like `"@"`, or null.

`TriggerMenuContent` and `TriggerMenuList`:

- `open` (`boolean`): Whether the menu is open. False while it animates out.
- `trigger` (`string | null`): The trigger of the current match, like `"@"`, or null.
- `query` (`string`): The text after the trigger, or after the current argument's start.
- `argument` (`string | null`): The argument being typed, by name, or null at the first level.
- `status` (`AsyncOptionsStatus`): Whether items are loading or failed.
- `items` (`TriggerMenuData<unknown>`): The visible data items, for rendering them yourself.

`TriggerMenuItem`:

- `highlighted` (`boolean`): Whether the item is highlighted, by the keyboard or the pointer.
- `disabled` (`boolean`): Whether the item can't be chosen.

`TriggerMenuItemIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

`TriggerMenuEmpty`:

- `loading` (`boolean`): Whether items are loading.
- `empty` (`boolean`): Whether no item matches.
- `query` (`string`): The text after the trigger.

`TriggerMenuStatus`:

- `open` (`boolean`): Whether the menu is open. It opens on a typed trigger, and closes when nothing matches unless it's loading or renders an empty part.
- `status` (`AsyncOptionsStatus`): Whether items are loading or failed.
- `loading` (`boolean`): Whether items are loading.
- `count` (`number`): How many items match.
- `argument` (`string | null`): The argument being typed, by name, or null.

`TriggerMenuHint`:

- `argument` (`string | null`): The argument being typed, by name, or null.
- `hint` (`string`): The ghost text: the hints of the arguments still to type.

### Reasons

`details.reason` says why the menu opened or closed.

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `caret-move` (`Event | KeyboardEvent | PointerEvent`): The caret left a trigger menu's match: an arrow key, Home or End, a click, or a selection change.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.

With `dismissible` false, the refused dismissals `onDismissAttempt` reports:

- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `outside-press` (`MouseEvent`): A press outside the layer.

Why the query changed:

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createTriggerMenuController()` and pass it as `controller`.

- `isOpen()` (`() => boolean`): Whether the menu is open.
- `setOpen(open, options?)` (`(open: boolean, options?: TriggerMenuChangeOptions<TriggerMenuOpenChangeReason> | undefined) => boolean`): Opens or closes the menu. Opening needs a match; see `open()` for one that types the trigger. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (TriggerMenuChangeOptions<TriggerMenuOpenChangeReason> & { trigger?: string | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens the menu for `trigger`, typing it at the caret first unless a match for it is already there, and resolves once it closes. Resolves exactly once and never rejects.
- `close(options?)` (`(options?: TriggerMenuChangeOptions<TriggerMenuOpenChangeReason> | undefined) => boolean`): Closes the menu. The match isn't dismissed, so typing in it opens it again. Returns false when the close was canceled or it was already closed.
- `getQuery()` (`() => string`): The text after the trigger, or after the current argument's start. Empty while closed.
- `getMatch()` (`() => TriggerMatch | null`): The current match, or null.
- `insert(content)` (`(content: string | Token) => void`): Replaces the current match with text or a token, or inserts at the caret without one.
- `focus()` (`() => void`): Moves focus to the editor.

### Events

Callbacks get the new state first, then the details.

| Prop                   | On                               | Receives                                                                         |
| ---------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| `onOpenChange`         | `TriggerMenu`                    | `(open, details)`: the new state, the [reason](#reasons) and the `trigger`       |
| `onOpenChangeComplete` | `TriggerMenu`                    | `(open)`, after the animation                                                    |
| `onQueryChange`        | `TriggerMenu`                    | `(query, details)`: the text after the trigger, and the `argument` being typed   |
| `onDismissAttempt`     | `TriggerMenu`                    | `({ reason, event })`, when a dismissal was refused                              |
| `onSelect`             | `TriggerMenu`, `TriggerMenuItem` | `(value, details)`: the item, its `arguments`, `insert()` and `preventDefault()` |

When `onSelect` returns a Promise and the editor takes tokens, the token is inserted at once with `data-pending`, updated with what the Promise resolves to, and removed if it rejects. The menu closes either way, so people keep typing.

## Accessibility

Focus stays in the field while the arrow keys move the highlight. A `<textarea>` stays a textbox, the only role ARIA allows it, and points at the list with `aria-controls` and, after an arrow key, `aria-activedescendant`. An `<input>` is a combobox with `aria-expanded`. Counts and loading are said through `TriggerMenuStatus`, a polite status, never through the field, so render one: visually hidden, as in the demo, or at the top of the list, as in [Loading Items](#loading-items). Give the field a visible label through a [Field](./field.md), or an `aria-label`.

### Keyboard

| Key                  | Does                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| ArrowDown, ArrowUp   | Moves the highlight while the list is open; the caret stays in the field                          |
| Enter                | Chooses the highlighted item. In a command's arguments, finishes once only optional ones are left |
| Tab                  | Chooses the highlighted item, or accepts an argument and moves to the next                        |
| Escape               | Closes the list and dismisses the match, so typing on doesn't reopen it                           |
| Control+Space        | Reopens a dismissed match with the caret in it; `shortcut` changes the key                        |
| Backspace            | Past an argument's start, goes back to the previous argument                                      |
| Command+Z, Control+Z | Undoes the insertion and brings back the query                                                    |

### Tested Behavior

Every line below is an automated test.

**Opening**

- Typing a trigger opens the list with every item.
- A field controlled through onChange keeps the typed trigger and opens the list. React only.
- Typing after the trigger filters the list.
- Text an input method commits filters the list.
- Queries match Unicode letters and ignore accents.
- A trigger mid-word doesn't open.
- A trigger followed by a space doesn't open.
- A command trigger opens only at the start, so a leading space escapes it.
- The list opens at the trigger and stays there as the query grows.
- Pasting a trigger opens the list.
- Focusing a field that already has a match doesn't open the list.
- Moving the caret into a match doesn't open the list.
- A query that matches nothing closes the list, and Backspace that matches again opens it.
- With an empty part, a query that matches nothing keeps the list open with the message.

**Choosing**

- The first match is highlighted, and Enter inserts it with a space.
- Tab accepts the highlighted suggestion and focus stays in the field.
- Arrow keys move the highlight, and wrap.
- A disabled item can be highlighted but not chosen.
- Clicking an item inserts it and keeps focus and the caret in the field.
- Text after the caret stays where it was.

**Dismissing**

- Escape closes the list, keeps the text and focus.
- A dismissed match stays closed through caret moves, typing in it and clicks.
- A new trigger after a dismissed one opens.
- Deleting and retyping the trigger opens it again.
- Ctrl+Space reopens a dismissed match.
- Moving the caret out of the match closes the list.
- Pressing outside closes the list.

**Arguments**

- A command with arguments asks for each one, and Enter finishes with them.
- Enter finishes once only optional arguments are left.
- A free-text argument shows no list, and Enter takes the typed text.
- Backspace past an argument's start goes back a level.
- Escape in an argument keeps the inserted text.
- An item that submits sends the form once inserted.

**Loading**

- Items load for the query.
- A newer query aborts the older load, and only its results land.

**Undo**

- Undo after choosing brings the query back, never a dead undo.

**Input**

- The SDK's Textarea works as the field, and undo still works.
- An <input> field works the same.

Runs in React, Vue and web components.

- No axe violations while closed.
- No axe violations while open with an item highlighted.
- No axe violations while open on an input.
- No axe violations with nothing found.
- A textarea stays a textbox, without aria-expanded, and controls the list while open.
- An input is a combobox that says whether it's expanded.
- Aria-activedescendant waits for an arrow key and clears on the next edit.
- Two menus on a page have their own ids, and the role never changes.
- Options are named by their text.
- The status says the count and the keys once typing pauses, then that nothing matches.
- The hint is hidden from assistive technology, and the status names the argument.
- Accessibility tree.

Runs in React, Vue and web components.
