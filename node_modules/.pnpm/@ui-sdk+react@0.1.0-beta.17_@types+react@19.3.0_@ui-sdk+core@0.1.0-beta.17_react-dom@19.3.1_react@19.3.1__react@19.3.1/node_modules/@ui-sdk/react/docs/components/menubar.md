# Menubar

Move between an application’s menus with one tab stop.

Wrap a few [Menus](./menu.md) in a Menubar to connect their triggers. Tab enters the bar once; arrow keys move between menus, and pointing at another trigger switches an open menu.

```tsx title="demo.tsx"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroupLabel,
  MenuItem,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import { useLog } from "./log"

const recent = ["Q3 roadmap", "Launch checklist", "Offsite notes"]
const formats = ["PDF", "Markdown", "HTML"]
const appearances = ["Light", "Dark", "System"]

function Example() {
  const log = useLog()
  const chose = (value: string) => log(`Chose ${value}`)

  return (
    <Menubar>
      <Menu onAction={chose}>
        <MenuTrigger>File</MenuTrigger>
        <MenuContent>
          <MenuItem value="New document" shortcut="mod+n">
            New Document
          </MenuItem>
          <MenuItem value="Open" shortcut="mod+o">
            Open…
          </MenuItem>
          <MenuSub>
            <MenuSubTrigger>
              Open Recent
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              {recent.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuSub>
            <MenuSubTrigger>
              Export
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              {formats.map((format) => (
                <MenuItem key={format} value={`Export as ${format}`}>
                  {format}
                </MenuItem>
              ))}
            </MenuSubContent>
          </MenuSub>
          <MenuItem value="Print" shortcut="mod+p">
            Print…
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu onAction={chose}>
        <MenuTrigger>Edit</MenuTrigger>
        <MenuContent>
          <MenuItem value="Undo" shortcut="mod+z" disabled>
            Undo
          </MenuItem>
          <MenuItem value="Redo" shortcut="mod+shift+z">
            Redo
          </MenuItem>
          <MenuSeparator />
          <MenuItem value="Cut" shortcut="mod+x">
            Cut
          </MenuItem>
          <MenuItem value="Copy" shortcut="mod+c">
            Copy
          </MenuItem>
          <MenuItem value="Paste" shortcut="mod+v">
            Paste
          </MenuItem>
          <MenuSeparator />
          <MenuItem value="Find" shortcut="mod+f">
            Find…
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu
        onCheckedChange={(checked, details) =>
          log(`${details.value} ${checked ? "on" : "off"}`)
        }
        onValueChange={(value) => log(`${value} appearance`)}
      >
        <MenuTrigger>View</MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem value="Ruler">
            <MenuItemIndicator>
              <CheckIcon aria-hidden="true" />
            </MenuItemIndicator>
            Show Ruler
          </MenuCheckboxItem>
          <MenuCheckboxItem value="Word count" defaultChecked>
            <MenuItemIndicator>
              <CheckIcon aria-hidden="true" />
            </MenuItemIndicator>
            Show Word Count
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuRadioGroup defaultValue="System">
            <MenuGroupLabel>Appearance</MenuGroupLabel>
            {appearances.map((appearance) => (
              <MenuRadioItem key={appearance} value={appearance}>
                <MenuItemIndicator />
                {appearance}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </Menubar>
  )
}

export { Example }
```

Tab into the bar and use Left and Right to choose a menu, or point at another trigger once one is open. File has submenus, Edit has shortcuts, and View has checkboxes and an appearance choice. The console logs each one.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Menubar`:

```text
Menubar
├── Menu
│   ├── MenuTrigger
│   └── MenuContent
│       ├── MenuItem
│       └── MenuItem
└── Menu
    ├── MenuTrigger
    └── MenuContent
        ├── MenuItem
        └── MenuItem
```

Each Menu joins its surrounding Menubar automatically. There are no separate menubar trigger or item components. Name the bar with `aria-label` when people need to distinguish it from another one.

## Usage

Import the parts and put them together:

```tsx
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"

function Example() {
  return (
    <Menubar aria-label="Application">
      <Menu>
        <MenuTrigger>File</MenuTrigger>
        <MenuContent>
          <MenuItem>New file</MenuItem>
          <MenuItem>Open file</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>Edit</MenuTrigger>
        <MenuContent>
          <MenuItem>Undo</MenuItem>
          <MenuItem>Redo</MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
  )
}

export { Example }
```

## Submenu

A submenu still uses Menu’s Sub, SubTrigger, and SubContent. The arrow toward it enters that level. On an ordinary item, the same arrow can move to the next top-level menu instead.

```tsx title="submenu.tsx"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"
import { ChevronRightIcon } from "lucide-react"

function Example() {
  return (
    <Menubar>
      <Menu>
        <MenuTrigger>File</MenuTrigger>
        <MenuContent>
          <MenuItem>New File</MenuItem>
          <MenuSub>
            <MenuSubTrigger>
              Share
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Email link</MenuItem>
              <MenuItem>Messages</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>Edit</MenuTrigger>
        <MenuContent>
          <MenuItem>Undo</MenuItem>
          <MenuSub>
            <MenuSubTrigger>
              Find
              <ChevronRightIcon aria-hidden="true" />
            </MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Find…</MenuItem>
              <MenuItem>Find Next</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    </Menubar>
  )
}

export { Example }
```

Open File and enter Share with the arrow key. Go back to File, then move to Edit without leaving the menubar.

## Vertical

Set `orientation="vertical"` to move between triggers with Up and Down. The arrow toward the popup opens it; the arrow back closes it and returns to the trigger.

```tsx title="vertical.tsx"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Menubar } from "@ui-sdk/react/menubar"

function Example() {
  return (
    <Menubar orientation="vertical">
      {["Inbox", "Drafts", "Archive"].map((label) => (
        <Menu key={label}>
          <MenuTrigger>{label}</MenuTrigger>
          <MenuContent>
            <MenuItem>Open {label}</MenuItem>
            <MenuItem>Mark all as read</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </Menubar>
  )
}

export { Example }
```

Use Up and Down to choose Inbox, Drafts, or Archive. Right opens its menu in left-to-right text; Left returns to its trigger.

## Menus as Data

Each Menu can take `items` and register its shortcuts while closed. The [Menu data example](./menu.md#menus-as-data) explains the item shapes and callbacks.

```tsx
const file: MenuData = [
  { value: "new", label: "New File", shortcut: "mod+alt+n" },
  { value: "open", label: "Open…" },
  { type: "separator" },
  { type: "submenu", label: "Share", items: [{ value: "email", label: "Email link" }] },
]

<Menubar>
  <Menu items={file} onAction={(value) => run(value)}>
    <MenuTrigger>File</MenuTrigger>
    <MenuContent />
  </Menu>
</Menubar>
```

## Disabled

A disabled trigger stays focusable with `aria-disabled`, so people can discover it, but cannot open its menu. Set `disabled` on the bar to disable all its triggers while preserving the tab stop.

```tsx
<Menubar>
  <Menu>
    <MenuTrigger disabled>Share</MenuTrigger>
    <MenuContent />
  </Menu>
</Menubar>

<Menubar disabled />
```

## Modal

The bar supplies `modal` to menus that do not set their own value. The default, `"pointer"`, consumes an outside press while closing. With `true`, the page also becomes inert and stops scrolling, but the menubar stays usable so you can switch menus.

```tsx
<Menubar modal />
```

## Loop

Arrow keys wrap between triggers and open menus by default. Set `loop` false to stop at the ends.

```tsx
<Menubar loop={false} />
```

## Controller

Create a `createMenubarController()` and pass it to the bar. `focus()` moves focus to it; `close()` closes its active menu. Each menu still owns its own open state and controller. Connect a shortcut like Alt+M to `focus()`, like an application command that moves focus into its menus.

```tsx
const [menubar] = React.useState(() => createMenubarController())
useShortcut("alt+m", () => menubar.focus())

<Menubar controller={menubar} />
<button onClick={() => menubar.focus()}>Focus Menubar</button>
```

## Shared Menu Features

[Checkboxes](./menu.md#checkboxes), [radio groups](./menu.md#radio-group), [icons](./menu.md#icons), [shortcuts](./menu.md#shortcuts), and [links](./menu.md#links-and-custom-rendering) work as they do in Menu. The first example combines settings and actions in one bar. Menus inside a menubar always use the popover presentation.

## Styling

The bar gets `data-open` while any menu is open; a trigger gets it only for its own menu. Use `data-orientation` for row or column layout. Style the popups and their items through the same [Menu attributes and CSS variables](./menu.md#styling).

Each part has a `data-slot`, such as `menubar`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### Menubar
`[data-slot="menubar"]`

- `data-orientation` (`horizontal`, `vertical`): Which arrow keys move between menus.
- `data-disabled`: Present when the whole menubar is disabled.
- `data-open`: Present while one of its menus is open.

## API Reference

### Menubar

- `orientation?` (`MenubarOrientation`): Which arrow keys move between menus: left and right, or up and down. A vertical menubar opens its menus to the side.
- `loop?` (`boolean`): Whether arrow keys wrap from the last menu to the first, between triggers and between open menus.
- `disabled?` (`boolean`): Stops every menu from opening. Triggers stay focusable with `aria-disabled`, so the menubar keeps its tab stop and stays discoverable.
- `modal?` (`"pointer" | boolean`): The `modal` setting of every menu in the menubar that doesn't set its own. `"pointer"`: an outside press only closes the open menu. `true`: also locks scroll, traps focus and makes the rest of the page inert, except the menubar. `false`: outside presses reach what they hit.
- `controller?` (`{ focus: () => void; isOpen: () => boolean; close: (options?: ChangeOptions<MenuOpenChangeReason>) => boolean; }`): Opens, closes and focuses the menubar from anywhere. Create one with `createMenubarController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

Menus, items and their icons take the props on the Menu page, like [`MenuItemIcon`](./menu.md#menuitemicon).

### State

- `orientation` (`MenubarOrientation`): Which arrow keys move between menus, from the `orientation` option. A vertical menubar opens its menus to the side.
- `disabled` (`boolean`): Whether the whole menubar is disabled.
- `open` (`boolean`): Whether one of its menus is open.
- `modal` (`boolean | "pointer"`): The modal setting its menus inherit.

### Reasons

A menu that another menu in the menubar takes over closes with `submenu-switch`, one opened by pointing at its trigger opens with `trigger-hover`, and one opened with an arrow key opens with `trigger-press`. See [Menu](./menu.md#reasons) for every reason.

### Controller

- `focus()` (`() => void`): Moves focus to the trigger that holds the menubar's tab stop: the one used last, or the first.
- `isOpen()` (`() => boolean`): Whether one of its menus is open.
- `close(options?)` (`(options?: ChangeOptions<MenuOpenChangeReason> | undefined) => boolean`): Closes the open menu, if any, and its submenus. Returns false when the close was canceled or it was already closed.

## Accessibility

The menubar follows the [WAI-ARIA menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

### Keyboard

Tab first lands on the first trigger, then remembers the last one used. While a menu is open, moving the pointer onto another enabled trigger opens its menu, unless the pointer is only passing over it on the way into the open menu. Pressing that trigger keeps it open. Moving to a disabled trigger closes the current menu without opening another.

| Key             | On a Trigger              | In an Open Menu                                  |
| --------------- | ------------------------- | ------------------------------------------------ |
| Left / Right    | Previous or next trigger. | Previous or next menu, or enter/leave a submenu. |
| Down            | Open at the first item.   | Next item.                                       |
| Up              | Open at the last item.    | Previous item.                                   |
| Enter / Space   | Open at the first item.   | Choose the focused item.                         |
| Home / End      | First or last trigger.    | First or last item.                              |
| A letter        | Find a trigger by name.   | Find an item by name.                            |
| Escape          | —                         | Close and return to the trigger.                 |
| Tab / Shift+Tab | Leave the bar.            | Close and leave the bar.                         |

These directions describe a horizontal bar in left-to-right text. Right-to-left text reverses the horizontal keys and submenu side; vertical bars use Up and Down between triggers.

### Tested Behavior

Every line below is an automated test.

- The menubar is named, and its triggers are menu items that open menus.
- The menubar is one tab stop, on its first trigger.
- Left and Right move between triggers, and Home goes to the first.
- Tab comes back to the trigger used last.
- ArrowDown opens a menu and focuses its first item.
- Enter opens a menu and focuses its first item.
- Space opens a menu and focuses its first item.
- Escape closes the menu and focuses its trigger.
- Escape in a menu reached with ArrowRight returns focus to its trigger.
- Tab in an open menu closes it and moves past the menubar.
- A press opens a menu, and a press on its trigger closes it.
- While a menu is open, pointing at another trigger opens its menu instead.
- Crossing another trigger on the way to the open menu keeps the menu.
- Resting on another trigger on the way to the open menu switches to it.
- While a menu is open, pointing at a disabled trigger closes it and opens nothing.
- After pointing at a disabled trigger, pointing at another trigger opens its menu.
- Pointing at a trigger while every menu is closed opens nothing.
- A press outside closes the open menu.
- Choosing an item runs it, closes the menu and focuses its trigger.
- Checkbox and radio items work in a menubar's menus.
- A disabled item in a menubar's menu is focusable and does nothing.
- With loop off, arrows stop at the ends.

**Vertical**

- Up and Down move between triggers, and Right opens a menu to the side.

Runs in React, Vue and web components.
