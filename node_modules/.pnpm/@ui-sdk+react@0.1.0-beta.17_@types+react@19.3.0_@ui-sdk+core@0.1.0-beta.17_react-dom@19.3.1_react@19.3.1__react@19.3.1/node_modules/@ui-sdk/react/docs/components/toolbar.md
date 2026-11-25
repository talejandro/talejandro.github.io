# Toolbar

Give buttons, toggles, menus and fields one tab stop with arrow-key navigation.

Use a Toolbar to group the controls of an editor, a canvas or a table. Tab enters it once, and the arrow keys move between its buttons, toggles, menus and fields.

```tsx title="demo.tsx"
"use client"

import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import { BoldIcon, ItalicIcon, LinkIcon, UnderlineIcon } from "lucide-react"
import { useLog } from "./log"

const styles = [
  { label: "Bold", icon: BoldIcon },
  { label: "Italic", icon: ItalicIcon },
  { label: "Underline", icon: UnderlineIcon },
]

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Formatting">
      {styles.map(({ label, icon: Icon }) => (
        <Toggle
          key={label}
          aria-label={label}
          onPressedChange={(pressed) =>
            log(`${label} ${pressed ? "on" : "off"}`)
          }
        >
          <ToggleIcon>
            <Icon />
          </ToggleIcon>
        </Toggle>
      ))}
      <ToolbarSeparator />
      <ToolbarButton
        aria-label="Insert link"
        onClick={() => log("Insert link")}
      >
        <LinkIcon aria-hidden="true" />
      </ToolbarButton>
    </Toolbar>
  )
}

export { Example }
```

Tab into the toolbar, then use Left and Right to move between Bold, Italic, Underline and Insert link. Press Space to toggle the focused style. The console logs each change.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Toolbar`:

```text
Toolbar
├── ToolbarButton
├── ToolbarSeparator
├── ToolbarGroup
│   ├── ToolbarButton
│   └── ToolbarButton
├── ToolbarLink
└── ToolbarInput
```

Put buttons, links and fields straight inside the toolbar. `ToolbarGroup` names a set of related items, and `ToolbarSeparator` draws a line between sets. Toggles and toggle groups join the toolbar on their own, and menu and select triggers join through `ToolbarButton`.

## Usage

Import the parts and put them together:

```tsx
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar"

function Example() {
  return (
    <Toolbar aria-label="Formatting">
      <ToolbarButton>Undo</ToolbarButton>
      <ToolbarButton>Redo</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton>Insert Link</ToolbarButton>
    </Toolbar>
  )
}

export { Example }
```

Name the toolbar with `aria-label`, and give every icon-only control its own.

## Toggle Groups

A [Toggle](./toggle.md) group inside a toolbar joins its navigation instead of adding another tab stop. Arrow keys move focus without pressing anything; Enter or Space presses the focused toggle.

```tsx title="toggle-group.tsx"
"use client"

import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import { Toolbar, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react"
import { useLog } from "./log"

const alignments = [
  { value: "left", label: "Align left", icon: AlignLeftIcon },
  { value: "center", label: "Align center", icon: AlignCenterIcon },
  { value: "right", label: "Align right", icon: AlignRightIcon },
]

const lists = [
  { value: "bulleted", label: "Bulleted list", icon: ListIcon },
  { value: "numbered", label: "Numbered list", icon: ListOrderedIcon },
]

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Paragraph">
      <ToggleGroup
        defaultValue={["left"]}
        deselectable={false}
        aria-label="Alignment"
        onValueChange={([value]) => log(`Align ${value}`)}
      >
        {alignments.map(({ value, label, icon: Icon }) => (
          <Toggle key={value} value={value} aria-label={label}>
            <ToggleIcon>
              <Icon />
            </ToggleIcon>
          </Toggle>
        ))}
      </ToggleGroup>
      <ToolbarSeparator />
      <ToggleGroup
        aria-label="List"
        onValueChange={([value]) =>
          log(lists.find((list) => list.value === value)?.label ?? "No list")
        }
      >
        {lists.map(({ value, label, icon: Icon }) => (
          <Toggle key={value} value={value} aria-label={label}>
            <ToggleIcon>
              <Icon />
            </ToggleIcon>
          </Toggle>
        ))}
      </ToggleGroup>
    </Toolbar>
  )
}

export { Example }
```

Arrow from the alignment group to the list group, then press Space on Align center or Numbered list. The console logs each choice.

## Groups

Use `ToolbarGroup` to name related controls. Set `disabled` on the group to disable them together; they stay focusable with `aria-disabled`.

```tsx title="group.tsx"
"use client"

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@ui-sdk/react/toolbar"
import {
  ClipboardIcon,
  CopyIcon,
  RedoIcon,
  ScissorsIcon,
  UndoIcon,
} from "lucide-react"
import { useLog } from "./log"

const clipboard = [
  { label: "Cut", icon: ScissorsIcon },
  { label: "Copy", icon: CopyIcon },
  { label: "Paste", icon: ClipboardIcon },
]

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Edit">
      <ToolbarGroup aria-label="Clipboard">
        {clipboard.map(({ label, icon: Icon }) => (
          <ToolbarButton
            key={label}
            aria-label={label}
            onClick={() => log(label)}
          >
            <Icon aria-hidden="true" />
          </ToolbarButton>
        ))}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup disabled aria-label="History">
        <ToolbarButton aria-label="Undo">
          <UndoIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton aria-label="Redo">
          <RedoIcon aria-hidden="true" />
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  )
}

export { Example }
```

Move through Cut, Copy and Paste into History with the arrow keys. Undo and Redo stay focusable but do nothing.

## Menus

Render a [Menu](./menu.md) trigger through `ToolbarButton`. In a horizontal toolbar, Down opens the menu while Left and Right keep moving between toolbar items.

```tsx
<Menu>
  <ToolbarButton render={<MenuTrigger />}>Share</ToolbarButton>
  <MenuContent>…</MenuContent>
</Menu>
```

```tsx title="menu.tsx"
"use client"

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import { ChevronDownIcon } from "lucide-react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Document">
      <ToolbarButton onClick={() => log("Saved")}>Save</ToolbarButton>
      <Menu onAction={(value) => log(`Shared by ${value}`)}>
        <ToolbarButton render={<MenuTrigger />}>
          Share
          <ChevronDownIcon aria-hidden="true" />
        </ToolbarButton>
        <MenuContent>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="link">Copy Link</MenuItem>
        </MenuContent>
      </Menu>
      <ToolbarButton onClick={() => log("Printed")}>Print</ToolbarButton>
    </Toolbar>
  )
}

export { Example }
```

Focus Share and press Down, then choose Email or Copy Link. Escape closes the menu and returns focus to Share.

## Selects

A [Select](./select.md) trigger joins the same way. It keeps its select behavior while it takes part in the toolbar's focus order.

```tsx title="select.tsx"
"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

const zooms = ["50%", "75%", "100%", "150%", "200%"]

function Example() {
  const log = useLog()
  const [zoom, setZoom] = React.useState("100%")
  const index = zooms.indexOf(zoom)
  const change = (value: string) => {
    setZoom(value)
    log(`Zoom ${value}`)
  }
  return (
    <Toolbar aria-label="View">
      <ToolbarButton
        aria-label="Zoom out"
        disabled={index === 0}
        onClick={() => change(zooms[index - 1])}
      >
        <ZoomOutIcon aria-hidden="true" />
      </ToolbarButton>
      <Select value={zoom} onValueChange={(value) => value && change(value)}>
        <ToolbarButton render={<SelectTrigger />} aria-label="Zoom">
          <SelectValue />
          <ChevronsUpDownIcon aria-hidden="true" />
        </ToolbarButton>
        <SelectContent>
          {zooms.map((zoom) => (
            <SelectItem key={zoom} value={zoom}>
              {zoom}
              <SelectItemIndicator>
                <CheckIcon aria-hidden="true" />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToolbarButton
        aria-label="Zoom in"
        disabled={index === zooms.length - 1}
        onClick={() => change(zooms[index + 1])}
      >
        <ZoomInIcon aria-hidden="true" />
      </ToolbarButton>
    </Toolbar>
  )
}

export { Example }
```

Open Zoom and choose a value, or step it with Zoom out and Zoom in. Each button turns off at the end of the range.

## Fields

Use `ToolbarInput` for a text field, or render another field through it, like a [Number Input](./number-input.md) control. A field keeps Home, End and the arrow keys while they move its caret. At the matching end, with no text selected, an arrow moves to the next item.

Entering a field with an arrow puts its caret at the far end in that direction: press the same arrow again to leave, or the other arrow to edit. A number input keeps Up and Down for stepping its value.

```tsx title="input.tsx"
"use client"

import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input"
import { Toolbar, ToolbarInput, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import { MinusIcon, PlusIcon } from "lucide-react"

function Example() {
  return (
    <Toolbar aria-label="Text">
      <NumberInput defaultValue={14} min={8} max={72}>
        <NumberInputGroup>
          <NumberInputDecrement aria-label="Decrease font size">
            <MinusIcon aria-hidden="true" />
          </NumberInputDecrement>
          <ToolbarInput
            render={<NumberInputControl aria-label="Font size" />}
          />
          <NumberInputIncrement aria-label="Increase font size">
            <PlusIcon aria-hidden="true" />
          </NumberInputIncrement>
        </NumberInputGroup>
      </NumberInput>
      <ToolbarSeparator />
      <ToolbarInput aria-label="Find" placeholder="Find…" />
    </Toolbar>
  )
}

export { Example }
```

Move into Font size and press Up or Down to change it. In Find, type a word, then move the caret to an edge before that arrow leaves the field.

## Links

`ToolbarLink` joins the same focus order and keeps its link behavior. The demo handles a plain click itself and leaves modified clicks, like opening in a new tab, to the browser.

```tsx title="link.tsx"
"use client"

import {
  Toolbar,
  ToolbarButton,
  ToolbarLink,
  ToolbarSeparator,
} from "@ui-sdk/react/toolbar"
import { CheckIcon, MessageSquareIcon } from "lucide-react"
import type * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const follow = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    log(`Opened ${event.currentTarget.textContent}`)
  }
  return (
    <Toolbar aria-label="Pull request">
      <ToolbarButton aria-label="Approve" onClick={() => log("Approved")}>
        <CheckIcon aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton aria-label="Comment" onClick={() => log("Comment")}>
        <MessageSquareIcon aria-hidden="true" />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarLink href="#files" onClick={follow}>
        Files Changed
      </ToolbarLink>
      <ToolbarLink href="#checks" onClick={follow}>
        Checks
      </ToolbarLink>
    </Toolbar>
  )
}

export { Example }
```

Arrow to Files Changed and press Enter. The console logs the page it opened.

## Vertical

Set `orientation="vertical"` to move with Up and Down, like a canvas tool palette. Separators turn to run across the toolbar.

```tsx title="vertical.tsx"
"use client"

import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import {
  MousePointer2Icon,
  PencilIcon,
  SquareIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react"
import { useLog } from "./log"

const tools = [
  { value: "select", label: "Select", icon: MousePointer2Icon },
  { value: "draw", label: "Draw", icon: PencilIcon },
  { value: "shape", label: "Shape", icon: SquareIcon },
  { value: "text", label: "Text", icon: TypeIcon },
]

function Example() {
  const log = useLog()
  return (
    <Toolbar orientation="vertical" aria-label="Canvas">
      <ToggleGroup
        defaultValue={["select"]}
        deselectable={false}
        orientation="vertical"
        aria-label="Tool"
        onValueChange={([value]) =>
          log(`${tools.find((tool) => tool.value === value)?.label} tool`)
        }
      >
        {tools.map(({ value, label, icon: Icon }) => (
          <Toggle key={value} value={value} aria-label={label}>
            <ToggleIcon>
              <Icon />
            </ToggleIcon>
          </Toggle>
        ))}
      </ToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton
        aria-label="Delete"
        onClick={() => log("Deleted selection")}
      >
        <Trash2Icon aria-hidden="true" />
      </ToolbarButton>
    </Toolbar>
  )
}

export { Example }
```

Use Up and Down to move between the tools and Delete. Space picks the focused tool.

## Disabled

A disabled item stays reachable with `aria-disabled`, so people can find it, but it ignores presses, including keys meant for a component rendered through it. Set `focusableWhenDisabled` to `false` to skip it instead.

```tsx title="disabled.tsx"
"use client"

import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  return (
    <Toolbar aria-label="Message">
      <ToolbarButton onClick={() => log("Reply")}>Reply</ToolbarButton>
      <ToolbarButton disabled onClick={() => log("Archive")}>
        Archive
      </ToolbarButton>
      <ToolbarButton
        disabled
        focusableWhenDisabled={false}
        onClick={() => log("Delete")}
      >
        Delete
      </ToolbarButton>
    </Toolbar>
  )
}

export { Example }
```

Arrow from Reply to Archive, which is disabled but focusable. Delete is skipped. Only Reply logs a press.

Set `disabled` on the toolbar to disable every item. The toolbar keeps its tab stop, and its fields can't be edited.

```tsx
<Toolbar disabled aria-label="Formatting">
  <ToolbarButton>Bold</ToolbarButton>
  <ToolbarInput aria-label="Find" />
</Toolbar>
```

## Loop

Arrow keys wrap from the last item to the first by default. Set `loop` to `false` to stop at the ends.

```tsx title="loop.tsx"
"use client"

import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  return (
    <Toolbar loop={false} aria-label="Pages">
      {["First", "Previous", "Next", "Last"].map((label) => (
        <ToolbarButton key={label} onClick={() => log(`${label} page`)}>
          {label}
        </ToolbarButton>
      ))}
    </Toolbar>
  )
}

export { Example }
```

Focus Last and press Right. Focus stays there; Home still moves to First.

## Controller

Create a controller with `createToolbarController` and pass it as `controller`. Its `focus()` moves focus to the item focused last, like the Alt+F10 shortcut editors give their toolbars. Create one controller per toolbar.

```tsx title="controller.tsx"
"use client"

import { useShortcut } from "@ui-sdk/react/shortcuts"
import {
  createToolbarController,
  Toolbar,
  ToolbarButton,
} from "@ui-sdk/react/toolbar"
import { BoldIcon, ItalicIcon, LinkIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

const actions = [
  { label: "Bold", icon: BoldIcon },
  { label: "Italic", icon: ItalicIcon },
  { label: "Insert link", icon: LinkIcon },
]

function Example() {
  const log = useLog()
  const [toolbar] = React.useState(createToolbarController)
  useShortcut("alt+f10", () => toolbar.focus(), { allowInInput: true })
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => toolbar.focus()}>
          Focus Toolbar
        </button>
      </div>
      <Toolbar controller={toolbar} aria-label="Notes formatting">
        {actions.map(({ label, icon: Icon }) => (
          <ToolbarButton
            key={label}
            aria-label={label}
            onClick={() => log(label)}
          >
            <Icon aria-hidden="true" />
          </ToolbarButton>
        ))}
      </Toolbar>
      <textarea aria-label="Notes" placeholder="Type, then press Alt+F10" />
    </div>
  )
}

export { Example }
```

Type in Notes, then press Alt+F10 or choose Focus Toolbar. Press a toolbar button and the console logs it.

## Custom Rendering

Render a component through `ToolbarButton` or `ToolbarInput` to combine their behavior, as the menu, select and number input examples do. A render function must spread the toolbar props onto the inner component. [Parts and Composition](../parts-and-composition.md) explains the rendering contract.

## Styling

Use `data-orientation` on the root for a row or a column, and on a separator for the way its line runs, across the toolbar. Use `data-disabled` to style unavailable items and groups. Toggles inside keep their own `data-pressed`.

Each part has a `data-slot`, such as `toolbar-button`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### Toolbar
`[data-slot="toolbar"]`

- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.
- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.

### ToolbarButton
`[data-slot="toolbar-button"]`

- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.
- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

### ToolbarLink
`[data-slot="toolbar-link"]`

- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.
- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

### ToolbarInput
`[data-slot="toolbar-input"]`

- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.
- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

### ToolbarGroup
`[data-slot="toolbar-group"]`

- `data-disabled`: Present when disabled, by the item itself, its group or the toolbar.
- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

### ToolbarSeparator
`[data-slot="toolbar-separator"]`

- `data-orientation` (`horizontal`, `vertical`): The toolbar's orientation. On a separator, which way the line runs: across the toolbar.

## API Reference

### Toolbar

- `orientation?` (`ToolbarOrientation`): Which arrow keys move between items: left and right, or up and down.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `disabled?` (`boolean`): Stops every item from being used. Items stay focusable with `aria-disabled`, so the toolbar keeps its tab stop and stays discoverable.
- `controller?` (`{ focus: () => void; }`): Focuses the toolbar from anywhere. Create one with `createToolbarController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ToolbarButton

- `disabled?` (`boolean`): Stops the item from being used. It stays focusable with `aria-disabled`, so arrow keys still reach it and a tooltip can say why.
- `focusableWhenDisabled?` (`boolean`): Whether a disabled item stays reachable with arrow keys. Turn it off to skip it, natively disabled.

### ToolbarInput

- `disabled?` (`boolean`): Stops the item from being used. It stays focusable with `aria-disabled`, so arrow keys still reach it and a tooltip can say why.
- `focusableWhenDisabled?` (`boolean`): Whether a disabled item stays reachable with arrow keys. Turn it off to skip it, natively disabled.

### ToolbarGroup

- `disabled?` (`boolean`): Disables every item in the group. They stay focusable with `aria-disabled`.

`ToolbarLink` and `ToolbarSeparator` take no props of their own.

### State

What render functions and state-based class names receive on `ToolbarButton` and `ToolbarInput`:

- `disabled` (`boolean`): Whether the item is disabled, by itself, its group or the toolbar.
- `orientation` (`ToolbarOrientation`): The toolbar's `orientation` option: `"vertical"`, or `"horizontal"` for anything else.

On `ToolbarLink`:

- `disabled` (`boolean`): Whether the link is disabled, by its group or the toolbar.
- `orientation` (`ToolbarOrientation`): The toolbar's `orientation` option: `"vertical"`, or `"horizontal"` for anything else.

On `ToolbarSeparator`:

- `orientation` (`ToolbarOrientation`): Which way the line runs: across the toolbar, so vertical in a horizontal toolbar.

### Controller

- `focus()` (`() => void`): Moves focus to the item that holds the toolbar's tab stop: the one focused last, or the first.

## Accessibility

The toolbar follows the [WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). The root has the `toolbar` role and `aria-orientation`, and separators have the `separator` role.

### Keyboard

The toolbar has one tab stop, a roving focus. Tab enters on the first enabled item, then returns to the item focused last. The next Tab leaves the toolbar.

| Key                        | Action                                          |
| -------------------------- | ----------------------------------------------- |
| `ArrowRight` / `ArrowLeft` | Move focus in a horizontal toolbar              |
| `ArrowDown` / `ArrowUp`    | Move focus in a vertical toolbar                |
| `Home` / `End`             | Focus the first or last item, except in a field |
| `Enter` / `Space`          | Activate a button or toggle, or open its popup  |

Controls keep the keys they use: Down opens a menu, and Up and Down step a number input. Moving focus never presses a toggle. In right-to-left text, Left and Right swap.

### Tested Behavior

Every line below is an automated test.

- The toolbar is named and has a horizontal orientation.
- Tab lands on the first item, and Tab again leaves the toolbar.
- Shift+Tab from after the toolbar lands on its tab stop.
- ArrowRight moves through every item, into toggle groups and out of fields.
- ArrowRight on the last item wraps to the first, and ArrowLeft back.
- Arrow keys never press a toggle, and Space and Enter do.
- Tab comes back to the item focused last.
- A toggle group in the toolbar is no tab stop of its own.
- A disabled button stays reachable, says it's disabled and does nothing.
- A button runs its action when pressed.
- A menu trigger rendered through a button opens with ArrowDown, and arrows still move past it.
- Choosing from a menu in the toolbar returns focus to its trigger.
- A text field keeps Home and End for its caret.
- Up and Down step a number field in the toolbar.
- Separators run across the toolbar.
- A group of buttons is named.
- A link in the toolbar follows its href with Enter.
- With loop off, arrows stop at the ends.
- A disabled toolbar keeps one tab stop, and every item says it's disabled.

**Vertical**

- ArrowDown and ArrowUp move between items, and Left and Right don't.
- Separators run across a vertical toolbar.

**Disabled groups**

- Toggles and toggle groups in a disabled group are disabled.
- A link in a disabled group is disabled, and follows its href once enabled.
- Enabling a group enables the toggles and buttons in it.

Runs in React, Vue and web components.
