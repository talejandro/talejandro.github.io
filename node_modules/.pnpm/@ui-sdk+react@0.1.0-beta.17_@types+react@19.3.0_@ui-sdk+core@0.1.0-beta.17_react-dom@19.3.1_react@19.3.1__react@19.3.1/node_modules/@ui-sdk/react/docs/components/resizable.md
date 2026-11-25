# Resizable

Resize, collapse, and save panel layouts with pointer and keyboard controls.

Use a resizable group to let people size the panes of a layout, like a file list beside an editor, by dragging the handle between them or with the keyboard.

```tsx title="basic.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={35} minSize={20}>
        <h3>Files</h3>
        <ul>
          <li>page.tsx</li>
          <li>layout.tsx</li>
          <li>globals.css</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize files" />
      <ResizablePanel defaultSize={65} minSize={40}>
        <Resizable orientation="vertical">
          <ResizablePanel defaultSize={60} minSize={30}>
            <h3>page.tsx</h3>
            <span data-slot="hint">Saved just now</span>
          </ResizablePanel>
          <ResizableHandle aria-label="Resize editor" />
          <ResizablePanel defaultSize={40} minSize={30}>
            <h3>Terminal</h3>
            <span data-slot="hint">Ready on port 3000</span>
          </ResizablePanel>
        </Resizable>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Drag the handle beside Files, then the one between page.tsx and Terminal.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Resizable`:

```text
Resizable
├── ResizablePanel
├── ResizableHandle
└── ResizablePanel
```

Put a handle between the panels you want to resize, and name it with `aria-label`, like "Resize files". The group lays its panels out in a row, so give it a size, and each panel's size is a percentage of the space the panels share. A group can sit inside a panel, like an editor above a terminal.

## Usage

Import the parts and put them together:

```tsx
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={30}>Files</ResizablePanel>
      <ResizableHandle aria-label="Resize files" />
      <ResizablePanel>Editor</ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

The panel without `defaultSize` takes what's left, here 70%.

## Build Your Own

`@ui-sdk/react/resizable` comes with a ready-made Resizable. If you'd like to build your own, with your own names, start from the `resizable` primitive in `@ui-sdk/core`:

```ts title="split-view.ts"
"use client"

import { resizable } from "@ui-sdk/core/resizable"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: SplitView,
  Panel: SplitViewPane,
  Handle: SplitViewDivider,
} = createParts(resizable, { root: "div", panel: "div", handle: "div" })

export { SplitView, SplitViewDivider, SplitViewPane }
```

```tsx
<SplitView>
  <SplitViewPane defaultSize={30}>Files</SplitViewPane>
  <SplitViewDivider aria-label="Resize files" />
  <SplitViewPane>Editor</SplitViewPane>
</SplitView>
```

Each part keeps the behavior, state and data attributes of its ready-made counterpart: the root lays the panels out, each pane writes its size to `--resizable-panel-size`, and the divider is the focusable separator. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Vertical

Set `orientation="vertical"` to stack the panels, and give the group a height. ArrowUp and ArrowDown move the handle. Every part gets `data-orientation` with the group's direction, so a vertical group's handle is `[data-slot="resizable-handle"][data-orientation="vertical"]`.

```tsx title="vertical.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable orientation="vertical">
      <ResizablePanel defaultSize={45} minSize={25}>
        <h3>Inbox</h3>
        <span data-slot="hint">3 unread messages</span>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize inbox" />
      <ResizablePanel defaultSize={55} minSize={25}>
        <h3>Quarterly report</h3>
        <span data-slot="hint">From Hollis Grant</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Drag the handle between Inbox and Quarterly report, or focus it and use ArrowUp and ArrowDown.

## Handle

Put anything inside a handle, like a grip that shows it can be dragged. The handle can stay a thin line: its hit area is at least 10 pixels across, centered on it, and 24 for touch, without any styles.

```tsx title="handle.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={35} minSize={20}>
        <h3>Channels</h3>
        <ul>
          <li>general</li>
          <li>design</li>
          <li>releases</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize channels">
        <div />
      </ResizableHandle>
      <ResizablePanel defaultSize={65} minSize={20}>
        <h3>general</h3>
        <span data-slot="hint">Kofi Mensah: The release notes are ready.</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Grab the grip beside Channels, or focus the handle and use the arrow keys.

## Collapsible

`collapsible` lets a panel collapse below its `minSize` to `collapsedSize`, 0 by default: by dragging past the midpoint to its collapsed size, with Enter or a double-click on its handle, or through the controller. Dragging back past the same point opens it at its minimum, and Enter restores the size it had. A collapsed panel gets `data-collapsed`, and at size 0 its content leaves the tab order and the accessibility tree.

```tsx title="collapsible.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import { FolderIcon, SearchIcon, SettingsIcon } from "lucide-react"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={30} minSize={25} collapsible collapsedSize="48px">
        <ul>
          <li data-slot="row">
            <FolderIcon aria-hidden="true" />
            <span>Files</span>
          </li>
          <li data-slot="row">
            <SearchIcon aria-hidden="true" />
            <span>Search</span>
          </li>
          <li data-slot="row">
            <SettingsIcon aria-hidden="true" />
            <span>Settings</span>
          </li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize sidebar">
        <div />
      </ResizableHandle>
      <ResizablePanel minSize={40}>
        <h3>README.md</h3>
        <span data-slot="hint">Edited by Inès Moreau</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Drag the sidebar closed to leave only its icons, or focus its handle and press Enter to collapse and restore it.

## Sizes in Pixels

Sizes are percentages as numbers, or strings with `%`, `px` or `rem`. Pixel and rem bounds hold as the group resizes, so a navigation with `minSize="160px"` never gets narrower, and a change they cause reports the `resize` reason.

```tsx title="sizes.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize="200px" minSize="160px" maxSize="320px">
        <h3>Docs</h3>
        <ul>
          <li>Getting Started</li>
          <li>Components</li>
          <li>Guides</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize navigation">
        <div />
      </ResizableHandle>
      <ResizablePanel minSize={30}>
        <h3>Getting Started</h3>
        <span data-slot="hint">Install the packages</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Resize Docs. It stays between 160 and 320 pixels wide, whatever the width of the group.

## Default Layout

`defaultLayout` sets every panel's size at once, in order. Otherwise panels without `defaultSize` share what's left evenly.

```tsx title="default-layout.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable defaultLayout={[25, 35, 40]}>
      <ResizablePanel minSize={15}>
        <h3>Mail</h3>
        <ul>
          <li>Inbox</li>
          <li>Drafts</li>
          <li>Sent</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize folders" />
      <ResizablePanel minSize={15}>
        <h3>Inbox</h3>
        <ul>
          <li>Hollis Grant</li>
          <li>Inès Moreau</li>
          <li>Kofi Mensah</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize inbox" />
      <ResizablePanel minSize={15}>
        <h3>Quarterly report</h3>
        <span data-slot="hint">From Hollis Grant</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

The three mail panels start at 25, 35 and 40 percent. Resize any of them.

## Controlled

Pass `layout` and `onLayoutChange` to control the group. The layout is one percentage per panel, in order, adding up to 100. Every change carries a [reason](#reasons), like `drag`, `step-key` or `collapse`, and `details.cancel()` keeps the current layout.

```tsx title="controlled.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import * as React from "react"
import { useLog } from "./log"

const format = (layout: number[]) => layout.map(Math.round).join(" / ")

function Example() {
  const log = useLog()
  const [layout, setLayout] = React.useState([30, 70])
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setLayout([50, 50])}>
          Split Evenly
        </button>
        <button type="button" onClick={() => setLayout([30, 70])}>
          Reset
        </button>
      </div>
      <Resizable
        layout={layout}
        onLayoutChange={(next, details) => {
          if (format(next) !== format(layout)) {
            log(`${format(next)} (${details.reason})`)
          }
          setLayout(next)
        }}
      >
        <ResizablePanel minSize={20}>
          <h3>Files</h3>
          <ul>
            <li>page.tsx</li>
            <li>layout.tsx</li>
            <li>globals.css</li>
          </ul>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize files" />
        <ResizablePanel minSize={20}>
          <h3>page.tsx</h3>
          <span data-slot="hint">Saved just now</span>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}

export { Example }
```

Resize Files to log the layout and its reason. Split Evenly and Reset set the layout from outside.

## Saving on Complete

`onLayoutChange` runs on every frame of a drag. `onLayoutCommit` runs once, when the interaction that changed the layout ends: the pointer lifts, the key comes up, or a panel collapses. Save there. Escape during a drag puts the panels back where they started, and nothing commits.

```tsx title="complete.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  return (
    <Resizable
      onLayoutCommit={(layout, details) =>
        log(`Saved ${layout.map(Math.round).join(" / ")} (${details.reason})`)
      }
    >
      <ResizablePanel defaultSize={40} minSize={20}>
        <h3>Files</h3>
        <ul>
          <li>page.tsx</li>
          <li>layout.tsx</li>
          <li>globals.css</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize files" />
      <ResizablePanel minSize={20}>
        <h3>page.tsx</h3>
        <span data-slot="hint">Saved just now</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Drag the handle and release it, or press an arrow key. The console logs the layout once, when you let go.

## Persistence

`autoSaveId` saves the layout in `localStorage` when an interaction completes and restores it when the group attaches in the browser. Server markup starts with the default sizes. Each set of panels keeps its own layout, so a panel that comes and goes gets its sizes back. Give panels an `id` so the saved layout survives changes elsewhere on the page.

It's the same idea as [Preferences](./preferences.md), which saves one choice between visits, like a theme. Resizable saves the whole layout, under its `autoSaveId`.

```tsx title="persistence.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable autoSaveId="docs-persistence">
      <ResizablePanel id="docs-sidebar" defaultSize={30} minSize={20}>
        <h3>Outline</h3>
        <ul>
          <li>Introduction</li>
          <li>Installation</li>
          <li>Usage</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize outline">
        <div />
      </ResizableHandle>
      <ResizablePanel id="docs-content" minSize={30}>
        <h3>Introduction</h3>
        <span data-slot="hint">Last edited by Wren Takahashi</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Resize Outline, then reload this page to restore its saved width.

## Storage

`storage` takes anything with `getItem` and `setItem`, like `sessionStorage` or a cookie. That's the browser's storage shape, not the [storage](./preferences.md#save-the-value) helpers Preferences takes, such as `createLocalStorage`, which each keep one value. Choose between local storage, session storage and a cookie as you would for a preference, under [Remember the Choice](../core.md#remember-the-choice).

This example keeps the layout in `sessionStorage`, for the tab's session:

```tsx title="storage.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
  type ResizableStorage,
} from "@ui-sdk/react/resizable"

const session: ResizableStorage = {
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
}

function Example() {
  return (
    <Resizable autoSaveId="docs-storage" storage={session}>
      <ResizablePanel id="session-chats" defaultSize={35} minSize={20}>
        <h3>Messages</h3>
        <ul>
          <li>Inès Moreau</li>
          <li>Kofi Mensah</li>
          <li>Wren Takahashi</li>
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize messages" />
      <ResizablePanel id="session-thread" minSize={20}>
        <h3>Inès Moreau</h3>
        <span data-slot="hint">Can we move the review to Friday?</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Resize Messages, then reload. The width comes back in this tab, but not in a new one.

A server can't read `localStorage`, so it renders each panel's `defaultSize` and the saved layout arrives when the page hydrates. To render the saved layout on the first paint, keep it in a cookie and pass the sizes back as each panel's `defaultSize`. Here a Next.js page reads the cookie on the server. It imports `resizableStorageKey`, which names the cookie, from `@ui-sdk/core/resizable`, since the component entries are client modules:

```tsx title="app/page.tsx"
import { resizableStorageKey } from "@ui-sdk/core/resizable"
import { cookies } from "next/headers"
import { Editor } from "./editor"

export default async function Page() {
  const saved = JSON.parse(
    (await cookies()).get(resizableStorageKey("editor"))?.value ?? "{}"
  )
  const [sidebar = 25, main = 75] = saved["sidebar,main"] ?? []
  return <Editor sidebar={sidebar} main={main} />
}
```

```tsx title="app/editor.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
  type ResizableStorage,
} from "@ui-sdk/react/resizable"

const cookieStorage: ResizableStorage = {
  getItem: (key) => {
    const value = document.cookie.match(
      new RegExp(`(?:^|; )${key}=([^;]*)`)
    )?.[1]
    return value === undefined ? null : decodeURIComponent(value)
  },
  setItem: (key, value) => {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000`
  },
}

function Editor({ sidebar, main }: { sidebar: number; main: number }) {
  return (
    <Resizable autoSaveId="editor" storage={cookieStorage}>
      <ResizablePanel id="sidebar" defaultSize={sidebar} />
      <ResizableHandle aria-label="Resize sidebar" />
      <ResizablePanel id="main" defaultSize={main} />
    </Resizable>
  )
}

export { Editor }
```

## Controller

A controller, from `createResizableController()`, collapses, expands and resizes panels from anywhere, by id or index, and reads the layout with `getLayout()`. Changes it makes report the `imperative` reason.

```tsx title="controller.tsx"
"use client"

import {
  createResizableController,
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import * as React from "react"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [editor] = React.useState(createResizableController)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={() => editor.collapse("controller-sidebar")}
        >
          Collapse
        </button>
        <button
          type="button"
          onClick={() => editor.expand("controller-sidebar")}
        >
          Expand
        </button>
        <button
          type="button"
          onClick={() => editor.resize("controller-sidebar", "240px")}
        >
          240px
        </button>
        <button
          type="button"
          onClick={() =>
            log(
              `Layout ${editor.getLayout().map(Math.round).join(" / ")}${editor.isCollapsed("controller-sidebar") ? ", collapsed" : ""}`
            )
          }
        >
          Read
        </button>
      </div>
      <Resizable controller={editor}>
        <ResizablePanel id="controller-sidebar" defaultSize={30} minSize={20} collapsible>
          <h3>Files</h3>
          <ul>
            <li>page.tsx</li>
            <li>layout.tsx</li>
            <li>globals.css</li>
          </ul>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize files" />
        <ResizablePanel minSize={30}>
          <h3>page.tsx</h3>
          <span data-slot="hint">Saved just now</span>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}

export { Example }
```

Use Collapse, Expand and 240px to move Files from outside the group, and Read to log its sizes.

## Step Size

`step` sets how far an arrow key moves a handle, 1% by default, and `largeStep` how far Shift with an arrow moves it, 10% by default.

```tsx title="keyboard.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable step={5} largeStep={25}>
      <ResizablePanel defaultSize={50} minSize={20}>
        <h3>Original</h3>
        <span data-slot="hint">v1.2.0</span>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize original" />
      <ResizablePanel defaultSize={50} minSize={20}>
        <h3>Changes</h3>
        <span data-slot="hint">v1.3.0</span>
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Focus the handle between Original and Changes. The arrow keys move it 5%, Shift with an arrow 25%, and Home and End as far as it goes.

## Disabled

`disabled` on a handle fixes it in place. On the group it fixes every handle. Disabled handles leave the tab order, and their panels keep their sizes. A disabled `<fieldset>` around the group fixes every handle too.

```tsx title="disabled.tsx"
"use client"

import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"
import { CheckIcon } from "lucide-react"
import * as React from "react"

function Example() {
  const [locked, setLocked] = React.useState(false)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <Checkbox
            checked={locked}
            onCheckedChange={(next) => setLocked(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Lock layout
        </label>
      </div>
      <Resizable disabled={locked}>
        <ResizablePanel minSize={15}>
          <h3>Pinned</h3>
          <span data-slot="hint">2 notes</span>
        </ResizablePanel>
        <ResizableHandle disabled aria-label="Resize pinned" />
        <ResizablePanel minSize={15}>
          <h3>Inbox</h3>
          <span data-slot="hint">3 unread</span>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize inbox" />
        <ResizablePanel minSize={15}>
          <h3>Message</h3>
          <span data-slot="hint">From Kofi Mensah</span>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}

export { Example }
```

The handle after Pinned stays fixed. Drag the one after Inbox, then check Lock layout to fix it too.

## Custom Rendering

`render`, `className` and `children` can be functions of the part's state, like a panel's `size` and whether it's `collapsed`, or whether a handle is `dragging` or `hovering`. See [Parts and Composition](../parts-and-composition.md) for the rendering contract.

```tsx title="render.tsx"
"use client"

import {
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@ui-sdk/react/resizable"

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={35} minSize={20} collapsible>
        {(state) => (
          <>
            <h3>Files</h3>
            <span data-slot="hint">
              {state.collapsed ? "Collapsed" : `${Math.round(state.size)}%`}
            </span>
          </>
        )}
      </ResizablePanel>
      <ResizableHandle aria-label="Resize files" render={<div />} />
      <ResizablePanel minSize={30}>
        {(state) => (
          <>
            <h3>Editor</h3>
            <span data-slot="hint">{`${Math.round(state.size)}%`}</span>
          </>
        )}
      </ResizablePanel>
    </Resizable>
  )
}

export { Example }
```

Resize Files to see both panels report their size, or collapse it to see Collapsed.

The primitive writes drag sizes directly to panel styles. Reading `size` or `layout` in a render function also renders that part on every frame of the drag.

## Styling

Parts are unstyled, apart from the layout they need: the group is a flex row or column, panels take their size as a flex basis, and handles don't shrink and take `touch-action: none`. Give the group a size, the handle a width or height and a background, and style it with `data-hovering`, `data-dragging` and `:focus-visible`. While a handle is hovered or dragged, its cursor shows over the whole page, and points the only way it can go at a limit.

Each part has a `data-slot`, such as `resizable-handle`, and its state attributes are listed under [Data Attributes](#data-attributes).

### ResizablePanel
- `--resizable-panel-size`: The panel's share of the group, as a percentage. Written on every frame of a drag, without a render.

## Data Attributes

### Resizable
`[data-slot="resizable"]`

- `data-orientation` (`horizontal`, `vertical`): The group's direction, on every part. A handle's own `aria-orientation` is the other one, since it runs across the group.
- `data-disabled`: Present when the group, or this handle, is disabled.
- `data-dragging`: Present while a handle of the group is being dragged.

### ResizablePanel
`[data-slot="resizable-panel"]`

- `data-orientation` (`horizontal`, `vertical`): The group's direction, on every part. A handle's own `aria-orientation` is the other one, since it runs across the group.
- `data-collapsed`: Present while a collapsible panel is collapsed.

### ResizableHandle
`[data-slot="resizable-handle"]`

- `data-orientation` (`horizontal`, `vertical`): The group's direction, on every part. A handle's own `aria-orientation` is the other one, since it runs across the group.
- `data-disabled`: Present when the group, or this handle, is disabled.
- `data-dragging`: Present while this handle is being dragged.
- `data-hovering`: Present while the pointer is over the handle or within its hit area, which reaches past the handle itself.

## API Reference

Props and callbacks are the same as below, as React props.

### Resizable

- `layout?` (`number[]`): Each panel's size in percent, in panel order, like `[25, 75]`. Pass it to control the group.
- `defaultLayout?` (`number[]`): The layout at first, when uncontrolled. Panels' own `defaultSize` is what a server renders, so prefer that with server rendering.
- `onLayoutChange?` (`((layout: number[], details: ResizableLayoutChangeDetails) => void)`): Runs while the layout changes: on every frame of a drag and every key. `details.cancel()` keeps the layout.
- `onLayoutCommit?` (`((layout: number[], details: ResizableLayoutCommitDetails) => void)`): Runs once an interaction that changed the layout ends: the pointer lifts, the key comes up, or a panel collapses. For saving.
- `orientation?` (`"horizontal" | "vertical"`): The direction panels are laid out in. Horizontal panels sit side by side, vertical ones stack.
- `disabled?` (`boolean`): Stops every handle: no drags, no keys, and handles leave the tab order.
- `step?` (`number`): How far an arrow key moves a handle, in percent.
- `largeStep?` (`number`): How far Shift with an arrow key moves a handle, in percent.
- `autoSaveId?` (`string`): Saves the layout when an interaction completes and restores it on the next visit, under this key. Give panels an `id` so it survives changes elsewhere on the page.
- `storage?` (`ResizableStorage`): Where `autoSaveId` saves: anything with `getItem` and `setItem`, like a cookie store a server can read.
- `controller?` (`object`): Resizes the group from anywhere. Create one with `createResizableController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ResizablePanel

- `id?` (`string`): Identifies the panel for the controller, `aria-controls` and saved layouts. It's the element's id. Generated when left out.
- `defaultSize?` (`ResizableSize`): Where the panel starts, in percent or with a unit, like `30` or `"240px"`. Without one, panels share what's left evenly. A server renders this size.
- `minSize?` (`ResizableSize`): The smallest the panel gets while open.
- `maxSize?` (`ResizableSize`): The largest the panel gets.
- `collapsible?` (`boolean`): Lets the panel collapse below its minimum to `collapsedSize`: by dragging past half the way there, with Enter or a double-click on its handle, or through the controller.
- `collapsedSize?` (`ResizableSize`): The size a collapsible panel collapses to. At 0, its content leaves the tab order and the accessibility tree.

### ResizableHandle

- `disabled?` (`boolean`): Stops this handle: no drags and no keys, and it leaves the tab order.

### State

What render functions, state-based class names and slots receive.

- `orientation` (`"horizontal" | "vertical"`): The direction panels are laid out in.
- `disabled` (`boolean`): Whether the group is disabled.
- `dragging` (`boolean`): Whether a handle is being dragged.
- `layout` (`number[]`): Each panel's size in percent. Reading it renders on every frame of a drag.

Panels:

- `orientation` (`"horizontal" | "vertical"`): The direction panels are laid out in.
- `size` (`number`): The panel's size in percent. Reading it renders on every frame of a drag.
- `collapsed` (`boolean`): Whether the panel is down at its `collapsedSize`, below its minimum.
- `collapsible` (`boolean`): Whether the panel can collapse.

Handles:

- `orientation` (`"horizontal" | "vertical"`): The direction panels are laid out in. The separator itself runs across it.
- `disabled` (`boolean`): Whether the handle can't move.
- `dragging` (`boolean`): Whether the handle is being dragged.
- `hovering` (`boolean`): Whether the pointer is over the handle or within its hit area.

### Reasons

`details.reason` says why the layout changed.

- `drag` (`PointerEvent`): A slider thumb or a resize handle was dragged, or an item was dragged to a new place in a list.
- `step-key` (`KeyboardEvent`): Arrow, Page Up, Page Down, Home or End stepped a slider or a number input.
- `collapse` (`MouseEvent | KeyboardEvent`): Enter or a double-click on a resize handle collapsed the panel beside it, or restored it.
- `resize` (`none`): The group changed size, so panels with sizes in pixels moved to stay within their bounds.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createResizableController()` and pass it as `controller`.

Write methods take an optional `{ reason, event }`, run the change callback like a drag, and return `false` when nothing changed or the change was canceled.

- `getLayout()` (`() => number[]`): Each panel's size in percent, in order.
- `setLayout(layout, options?)` (`(layout: number[], options?: ResizableChangeOptions | undefined) => boolean`): Sets every panel's size at once, in percent. It's fitted to the panels' bounds and adds up to 100. Returns whether anything changed.
- `collapse(panel, options?)` (`(panel: string | number, options?: ResizableChangeOptions | undefined) => boolean`): Collapses a collapsible panel, by its id or its index. Returns whether it collapsed.
- `expand(panel, options?)` (`(panel: string | number, options?: ResizableChangeOptions | undefined) => boolean`): Expands a collapsed panel to the size it had before it collapsed, or its minimum. Returns whether it expanded.
- `resize(panel, size, options?)` (`(panel: string | number, size: ResizableSize, options?: ResizableChangeOptions | undefined) => boolean`): Resizes one panel, by its id or its index, like `resize("sidebar", "240px")`. Its neighbours give or take the difference.
- `isCollapsed(panel)` (`(panel: string | number) => boolean`): Whether a panel is collapsed.

### Events

Callbacks get the new layout first, then the details.

| Prop             | On          | Receives                                                       |
| ---------------- | ----------- | -------------------------------------------------------------- |
| `onLayoutChange` | `Resizable` | `(layout, details)`: the new layout and the [reason](#reasons) |
| `onLayoutCommit` | `Resizable` | `(layout, details)`: the layout once the interaction ends      |

## Accessibility

Handles follow the [WAI-ARIA window splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/). Each is a focusable `separator` whose `aria-valuenow` is the size of the panel before it, with `aria-valuemin` and `aria-valuemax` as far as the panels allow, `aria-controls` pointing at that panel, and `aria-orientation` running across the group. Name each handle with `aria-label`.

### Keyboard

Focus a handle and press the arrow keys along the group's axis to move it by `step`, or with Shift by `largeStep`. Home and End move it as far as the panels allow, and Enter collapses or restores a collapsible panel beside it. A panel at its minimum passes the rest of a move on to the next one. Disabled handles leave the tab order.

### Tested Behavior

Every line below is an automated test.

**Keyboard**

- Starts at each panel's default size, and panels without one share the rest.
- ArrowRight grows the panel before the handle by one step, and ArrowLeft shrinks it.
- Shift with an arrow key moves by the large step.
- Arrows across the group's axis do nothing.
- ArrowDown and ArrowUp move a vertical group's handle.
- Home collapses a collapsible panel, and End grows it to its maximum.
- Home stops at the minimum of a panel that can't collapse.
- Enter collapses the panel before the handle, and restores its size.
- Enter collapses the panel after the handle when only that one can collapse.
- One step past a collapsible panel's minimum collapses it.
- A panel at its minimum passes the rest on to the next one.
- End stops where the panels' bounds meet.
- Keys pressed without waiting all land.
- Keys complete the change once they come up.
- Step and large step set how far keys move.
- A canceled change keeps the layout.
- A controlled group follows its layout.
- A controlled group that ignores a change completes nothing. React and Vue only.
- A disabled handle stops a move from the next one, so the panels past it keep their sizes.
- DefaultLayout sets where the panels start.
- A disabled group's handles leave the tab order and ignore drags.

**Pointer**

- Dragging a handle moves it with the pointer.
- A drag reports its moves with the drag reason and completes once.
- Dragging past a disabled handle moves nothing beyond it.
- Dragging a vertical group's handle moves it up and down.
- Dragging past half a collapsible panel's minimum collapses it, and back opens it.
- A drag stops at the panels' bounds.
- Escape during a drag puts the panels back where they started.
- A double-click on a handle collapses its panel, and another restores it.
- A press just beside the thin handle drags it.
- A press farther from the handle doesn't drag.
- Where two handles meet, one drag moves both.
- A drag shows the axis cursor over the whole page until it ends.

**Controller**

- Collapses and expands a panel, with the imperative reason.
- Resizes a panel to a size in pixels.

**Container**

- A panel with a minimum in pixels keeps it as the group shrinks.
- Panels keep their share as the group grows.

**Pages around a group**

- A layer above a handle keeps its presses.
- A press beside a handle doesn't click what's under it.
- Only the main button drags.
- An iframe under the pointer doesn't stop a drag.
- At a limit, the cursor points the only way a handle can go.
- A saved layout is there on the first paint.

**Touch**

- A touch drag that starts beside the handle, in its touch hit area, resizes without scrolling.

Runs in React, Vue and web components.
