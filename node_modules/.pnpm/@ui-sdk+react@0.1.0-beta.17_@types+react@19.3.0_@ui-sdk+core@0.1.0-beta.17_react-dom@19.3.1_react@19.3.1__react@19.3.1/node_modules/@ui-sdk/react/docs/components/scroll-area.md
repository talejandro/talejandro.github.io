# Scroll Area

Add styled scrollbars, edge indicators, and follow-to-end behavior to native scrolling.

Use a scroll area when content needs its own scrolling region with scrollbars that match your design. The browser still does the scrolling, so the wheel, touch, keyboard and find in page work as usual.

```tsx title="basic.tsx"
"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const tags = Array.from(
  { length: 50 },
  (_, index) => `v1.2.0-beta.${50 - index}`
)

function Example() {
  return (
    <ScrollArea>
      <ScrollAreaViewport role="region" aria-label="Tags">
        <ScrollAreaContent>
          <h3>Tags</h3>
          <ul>
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}

export { Example }
```

Scroll the tags with the wheel, the keyboard or the scrollbar thumb. The scrollbar shows while the pointer is over the list.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `ScrollArea`:

```text
ScrollArea
├── ScrollAreaViewport
│   └── ScrollAreaContent
└── ScrollAreaScrollbar
    └── ScrollAreaThumb
```

Put the content inside a viewport, then add a scrollbar for each axis you want to style.

The viewport is the real scroller. Give the root a size, and the viewport the root's full width and height. Scrollbars sit over the viewport's edges. A thumb appears when its axis overflows; [`type`](#when-scrollbars-show) controls when the scrollbar is visible. Render only the scrollbars you want: with none, the browser's own scrollbars stay.

## Usage

Import the parts and put them together:

```tsx
"use client"

import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from "@ui-sdk/react/scroll-area"

function ReleaseNotes() {
  return (
    <ScrollArea>
      <ScrollAreaViewport role="region" aria-label="Release notes">
        <ScrollAreaContent>Content to scroll</ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}

export { ReleaseNotes }
```

## Horizontal

A horizontal scrollbar scrolls the inline axis. With one, the content grows as wide as it needs instead of wrapping. Here `type="auto"` keeps the scrollbar in view, so the row reads as one that scrolls.

```tsx title="horizontal.tsx"
"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const swatches = [
  { name: "Sand", color: "#e6d8bf" },
  { name: "Clay", color: "#c98b6b" },
  { name: "Rust", color: "#a4502f" },
  { name: "Moss", color: "#7d8b5a" },
  { name: "Sage", color: "#b5c2a3" },
  { name: "Fog", color: "#c9d1d6" },
  { name: "Slate", color: "#5b6b78" },
  { name: "Ink", color: "#2b2f36" },
]

function Example() {
  return (
    <ScrollArea type="auto">
      <ScrollAreaViewport role="region" aria-label="Palette">
        <ScrollAreaContent>
          <ul>
            {swatches.map((swatch) => (
              <li key={swatch.name}>
                <div data-slot="swatch" style={{ background: swatch.color }} />
                {swatch.name}
              </li>
            ))}
          </ul>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}

export { Example }
```

Drag the scrollbar, or use Shift and the wheel, to scroll the palette from Sand to Ink.

## Both Axes

With both scrollbars, each stops short of the corner where they meet, which `ScrollAreaCorner` fills.

```tsx title="both-axes.tsx"
"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const releases = [
  {
    version: "v1.12.0",
    date: "Oct 28, 2026",
    status: "Latest",
    downloads: "18,204",
    size: "4.3 MB",
    node: "20+",
  },
  {
    version: "v1.11.2",
    date: "Oct 14, 2026",
    status: "Stable",
    downloads: "26,931",
    size: "4.2 MB",
    node: "20+",
  },
  {
    version: "v1.11.1",
    date: "Oct 2, 2026",
    status: "Stable",
    downloads: "9,412",
    size: "4.2 MB",
    node: "20+",
  },
  {
    version: "v1.11.0",
    date: "Sep 23, 2026",
    status: "Stable",
    downloads: "31,077",
    size: "4.2 MB",
    node: "20+",
  },
  {
    version: "v1.10.3",
    date: "Sep 9, 2026",
    status: "Stable",
    downloads: "12,640",
    size: "4.1 MB",
    node: "18+",
  },
  {
    version: "v1.10.2",
    date: "Aug 27, 2026",
    status: "Stable",
    downloads: "8,315",
    size: "4.1 MB",
    node: "18+",
  },
  {
    version: "v1.10.1",
    date: "Aug 18, 2026",
    status: "Stable",
    downloads: "5,902",
    size: "4.1 MB",
    node: "18+",
  },
  {
    version: "v1.10.0",
    date: "Aug 5, 2026",
    status: "Stable",
    downloads: "22,486",
    size: "4.0 MB",
    node: "18+",
  },
  {
    version: "v1.9.4",
    date: "Jul 21, 2026",
    status: "Deprecated",
    downloads: "3,118",
    size: "3.9 MB",
    node: "18+",
  },
  {
    version: "v1.9.3",
    date: "Jul 8, 2026",
    status: "Deprecated",
    downloads: "2,764",
    size: "3.9 MB",
    node: "18+",
  },
  {
    version: "v1.9.2",
    date: "Jun 24, 2026",
    status: "Deprecated",
    downloads: "1,950",
    size: "3.9 MB",
    node: "18+",
  },
  {
    version: "v1.9.1",
    date: "Jun 10, 2026",
    status: "Deprecated",
    downloads: "1,208",
    size: "3.8 MB",
    node: "18+",
  },
]

function Example() {
  return (
    <ScrollArea type="auto">
      <ScrollAreaViewport role="region" aria-label="Releases">
        <ScrollAreaContent>
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Released</th>
                <th>Status</th>
                <th>Downloads</th>
                <th>Size</th>
                <th>Node</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((release) => (
                <tr key={release.version}>
                  <th scope="row">{release.version}</th>
                  <td>{release.date}</td>
                  <td>{release.status}</td>
                  <td>{release.downloads}</td>
                  <td>{release.size}</td>
                  <td>{release.node}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollArea>
  )
}

export { Example }
```

Scroll the releases down and across. The header row stays in place, and the scrollbars stop short of the corner.

## Edge Fades

The root holds how far the content reaches past each edge, as `--scroll-area-overflow-y-start`, `--scroll-area-overflow-y-end` and their `x` versions, and how far along the view is, as `--scroll-area-progress-y` and `-x`. A fade as tall as `min(2rem, var(--scroll-area-overflow-y-start))` is gone at the top and full once there's more above. For a fade that only switches, use `data-at-y-start` and `data-at-y-end`.

These variables aren't inherited, so scrolling restyles the root and never the content. An element that reads one takes it from the root with `inherit`, like the fades here, which are children of the root: `--scroll-area-overflow-y-start: inherit`. The first scroll area registers the six names for the whole page with `CSS.registerProperty`. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.

```tsx title="edge-fade.tsx"
"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const notes = [
  {
    version: "v1.12.0",
    date: "Oct 28",
    text: "Scroll areas follow streamed content and stop when you scroll up.",
  },
  {
    version: "v1.11.2",
    date: "Oct 14",
    text: "Focus returns to the right trigger when a nested dialog closes.",
  },
  {
    version: "v1.11.1",
    date: "Oct 2",
    text: "Date pickers keep the selected month when the locale changes.",
  },
  {
    version: "v1.11.0",
    date: "Sep 23",
    text: "Menus open on Arrow Down and skip disabled items while typing.",
  },
  {
    version: "v1.10.3",
    date: "Sep 9",
    text: "Toasts pause their timers while the window is in the background.",
  },
  {
    version: "v1.10.2",
    date: "Aug 27",
    text: "Sliders snap to the nearest step when dragged past either end.",
  },
  {
    version: "v1.10.1",
    date: "Aug 18",
    text: "Tooltips wait for a short delay before moving to a new trigger.",
  },
  {
    version: "v1.10.0",
    date: "Aug 5",
    text: "Comboboxes can load their options while you type.",
  },
]

function Example() {
  return (
    <ScrollArea>
      <ScrollAreaViewport role="region" aria-label="Release notes">
        <ScrollAreaContent>
          {notes.map((note) => (
            <article key={note.version}>
              <h3>
                {note.version} <span data-slot="hint">{note.date}</span>
              </h3>
              <p>{note.text}</p>
            </article>
          ))}
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <div data-slot="top-fade" />
      <div data-slot="bottom-fade" />
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}

export { Example }
```

Scroll the release notes. The top fade grows in as you leave the top, and the bottom fade shrinks away at the end.

## Native Scrollbars

Leave out the Scrollbar parts to keep the browser's own scrollbars, with everything else: data attributes, edge variables, sticking to the end and the controller.

```tsx title="native-scrollbars.tsx"
"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const messages = [
  { from: "Hollis Grant", subject: "Launch checklist for Thursday" },
  { from: "Inès Moreau", subject: "Updated pricing page copy" },
  { from: "Kofi Mensah", subject: "Design review notes" },
  { from: "Wren Takahashi", subject: "Q4 roadmap draft" },
  { from: "Tomasz Wójcik", subject: "Re: Staging deploy failed" },
  { from: "Hollis Grant", subject: "Invoices for October" },
  { from: "Inès Moreau", subject: "Customer interview recordings" },
  { from: "Kofi Mensah", subject: "New icons for the dashboard" },
  { from: "Wren Takahashi", subject: "Offsite agenda" },
  { from: "Tomasz Wójcik", subject: "Database migration plan" },
]

function Example() {
  return (
    <ScrollArea>
      <ScrollAreaViewport role="region" aria-label="Inbox">
        <ScrollAreaContent>
          <ul>
            {messages.map((message) => (
              <li key={message.subject}>
                {message.from}
                <span data-slot="hint">{message.subject}</span>
              </li>
            ))}
          </ul>
        </ScrollAreaContent>
      </ScrollAreaViewport>
    </ScrollArea>
  )
}

export { Example }
```

Scroll the inbox with the browser's own scrollbar. The scroll area still tracks its edges and state.

## When Scrollbars Show

`type` decides when each scrollbar gets `data-visible`:

| `type`              | Shows                                                         |
| ------------------- | ------------------------------------------------------------- |
| `"hover"` (default) | While the pointer is over the scroll area, or while scrolling |
| `"scroll"`          | While its own axis scrolls, or its thumb is dragged           |
| `"auto"`            | Whenever the content overflows on its axis                    |
| `"always"`          | Always, even when the content fits, with no thumb then        |

Style the attribute: give the scrollbar `opacity: 0`, and `opacity: 1` under `[data-visible]`. A hidden scrollbar ignores the pointer, so it never catches presses meant for the content under it.

```tsx title="type.tsx"
"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  type ScrollAreaType,
} from "@ui-sdk/react/scroll-area"

const types: ScrollAreaType[] = ["hover", "scroll", "auto", "always"]

const tags = Array.from(
  { length: 20 },
  (_, index) => `v1.2.0-beta.${50 - index}`
)

function Example() {
  return (
    <div data-slot="grid">
      {types.map((type) => (
        <div data-slot="stack" key={type}>
          <code>type="{type}"</code>
          <ScrollArea type={type}>
            <ScrollAreaViewport>
              <ScrollAreaContent>
                <ul>
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar>
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}

export { Example }
```

Hover and scroll each list to compare. The auto and always scrollbars show from the start; hover waits for the pointer and scroll for scrolling.

## Hide Delay

With `"scroll"` and `"hover"`, `scrollHideDelay` keeps a scrollbar for a while after scrolling stops or the pointer leaves, in ms. It defaults to 600.

```tsx title="hide-delay.tsx"
"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const delays = [
  { value: 0, label: "No delay" },
  { value: 2000, label: "2000 ms delay" },
]

const tags = Array.from(
  { length: 20 },
  (_, index) => `v1.2.0-beta.${50 - index}`
)

function Example() {
  return (
    <div data-slot="grid">
      {delays.map((delay) => (
        <div data-slot="stack" key={delay.value}>
          <span data-slot="hint">{delay.label}</span>
          <ScrollArea type="scroll" scrollHideDelay={delay.value}>
            <ScrollAreaViewport>
              <ScrollAreaContent>
                <ul>
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar>
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}

export { Example }
```

Scroll each list and stop. The scrollbar on the left hides at once; the one on the right waits 2000 milliseconds.

## Controller

A [controller](#controller-1), from `createScrollAreaController()`, scrolls the area from anywhere and reads where it is. Pass it as `controller`.

```tsx title="controller.tsx"
"use client"

import {
  createScrollAreaController,
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"
import * as React from "react"
import { useLog } from "./log"

const tags = Array.from(
  { length: 50 },
  (_, index) => `v1.2.0-beta.${50 - index}`
)

function Example() {
  const log = useLog()
  const [controller] = React.useState(createScrollAreaController)
  const edge = React.useRef<string | null>("start")

  const read = () => {
    const next = controller.isAtEnd()
      ? "end"
      : controller.isAtStart()
        ? "start"
        : null
    if (next && next !== edge.current) {
      log(`At the ${next}`)
    }
    edge.current = next
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={() => controller.scrollToStart({ behavior: "smooth" })}
        >
          Back to Top
        </button>
        <button
          type="button"
          onClick={() => controller.scrollToEnd({ behavior: "instant" })}
        >
          Jump to the End
        </button>
      </div>
      <ScrollArea controller={controller}>
        <ScrollAreaViewport role="region" aria-label="Tags" onScroll={read}>
          <ScrollAreaContent>
            <h3>Tags</h3>
            <ul>
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar>
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    </div>
  )
}

export { Example }
```

Press Jump to the End, then Back to Top. The console logs each end of the list as the view reaches it.

For a chat or a log, set `stickToEnd` to start at the bottom and keep new content in view until the user scrolls up; `ScrollAreaScrollToEnd` is a button that brings it back.

## Pointer

- **Dragging the thumb** moves the content as far along as the thumb moves along its track. Text doesn't get selected, scroll snapping pauses until the pointer lifts, and Escape puts the content back where the drag started.
- **Pressing the track** pages toward the pointer, by most of a viewport, like a native scrollbar, and keeps paging while it's held until the thumb reaches the pointer. With Alt (Option on a Mac), it jumps there and drags instead.
- **A wheel over a scrollbar** scrolls the viewport as far as it would over the content, and the page once the viewport can't scroll further.
- **Pressing a scrollbar** never moves focus.

## Custom Rendering

Every part takes `render`, to render a different element or component in its place, like `render={<section />}`. `render`, `className`, `style` and `children` can be functions of the part's state, like `className={(state) => (state.atEnd ? "done" : undefined)}`.

Here the root renders a `section` and the viewport an `article`, and the root's children read its state to show a hint until you reach the end. See [Parts and Composition](../parts-and-composition.md) for the rendering contract and [State](#state) for each part's fields.

```tsx title="render.tsx"
"use client"

import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

const tags = Array.from(
  { length: 50 },
  (_, index) => `v1.2.0-beta.${50 - index}`
)

function Example() {
  return (
    <ScrollArea render={<section />}>
      {(state) => (
        <>
          <ScrollAreaViewport render={<article />} aria-label="Releases">
            <ScrollAreaContent>
              <ul>
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </ScrollAreaContent>
          </ScrollAreaViewport>
          <p data-slot="hint" aria-hidden>
            {state.atStart
              ? "Scroll for older releases"
              : "More releases below"}
          </p>
          <ScrollAreaScrollbar>
            <ScrollAreaThumb />
          </ScrollAreaScrollbar>
        </>
      )}
    </ScrollArea>
  )
}

export { Example }
```

Scroll the releases. The hint under the list reads the root's state, changes once you leave the top, and disappears at the end.

## Styling

Give the root a size and the viewport its full width and height; the parts set the positioning and overflow they need. Give each scrollbar a width or height and show it under `data-visible`. The thumb sizes and moves itself. Fades and shadows read the root's CSS variables.

Each part has a `data-slot`, such as `scroll-area-thumb`, and its state attributes are listed under [Data Attributes](#data-attributes).

### ScrollArea
- `--scroll-area-overflow-y-start`: How far the content reaches above the view, in pixels. Grow a top fade or shadow with it. Not inherited, like the other overflow and progress variables, so scrolling never restyles the content. A child of the root that reads it takes it with `--scroll-area-overflow-y-start: inherit`.
- `--scroll-area-overflow-y-end`: How far the content reaches below the view, in pixels.
- `--scroll-area-overflow-x-start`: How far the content reaches past the inline start, in pixels, left in LTR and right in RTL.
- `--scroll-area-overflow-x-end`: How far the content reaches past the inline end, in pixels.
- `--scroll-area-progress-y`: How far down the view is, from 0 at the top to 1 at the bottom. A reading progress bar can scale with it.
- `--scroll-area-progress-x`: How far along the inline axis the view is, from 0 to 1.
- `--scroll-area-corner-width`: The vertical scrollbar's width while both scrollbars show, so the horizontal one stops short of it. 0px otherwise.
- `--scroll-area-corner-height`: The horizontal scrollbar's height while both show, so the vertical one stops short of it. 0px otherwise.

### ScrollAreaScrollbar
- `--scroll-area-thumb-height`: On a vertical scrollbar: its thumb's length in pixels. The thumb's inline height reads it.
- `--scroll-area-thumb-width`: On a horizontal scrollbar: its thumb's length in pixels. The thumb's inline width reads it.
- `--scroll-area-thumb-offset`: How far its thumb sits from the track's start, in pixels, negative right to left. The thumb's inline transform reads it.

## Data Attributes

`ScrollAreaCorner` has no state attributes.

### ScrollArea
`[data-slot="scroll-area"]`

- `data-overflow-x`: Present while the content is wider than the viewport.
- `data-overflow-y`: Present while the content is taller than the viewport.
- `data-at-start`: Present while the view is at the start: the top, or the inline start when only the horizontal axis overflows. Also when nothing overflows.
- `data-at-end`: Present while the view is at the end: the bottom, or the inline end when only the horizontal axis overflows.
- `data-at-x-start`: Present while the view is at the inline start, within a pixel.
- `data-at-x-end`: Present while the view is at the inline end, within a pixel.
- `data-at-y-start`: Present while the view is at the top, within a pixel.
- `data-at-y-end`: Present while the view is at the bottom, within a pixel.
- `data-scrolling`: Present while the user scrolls, and for a moment after. Keeping the end in view doesn't count.
- `data-hovering`: Present while a mouse or pen is over the scroll area.
- `data-sticking`: Present while the view follows the end as content grows, with `stickToEnd`.

### ScrollAreaViewport
`[data-slot="scroll-area-viewport"]`

- `data-overflow-y`: Present while the content is taller than the viewport.
- `data-at-start`: Present while the view is at the start: the top, or the inline start when only the horizontal axis overflows. Also when nothing overflows.
- `data-at-end`: Present while the view is at the end: the bottom, or the inline end when only the horizontal axis overflows.
- `data-scrolling`: Present while the user scrolls, and for a moment after. Keeping the end in view doesn't count.
- `data-sticking`: Present while the view follows the end as content grows, with `stickToEnd`.

### ScrollAreaContent
`[data-slot="scroll-area-content"]`

- `data-overflow-y`: Present while the content is taller than the viewport.
- `data-at-start`: Present while the view is at the start: the top, or the inline start when only the horizontal axis overflows. Also when nothing overflows.
- `data-at-end`: Present while the view is at the end: the bottom, or the inline end when only the horizontal axis overflows.

### ScrollAreaScrollbar
`[data-slot="scroll-area-scrollbar"]`

- `data-orientation` (`vertical`, `horizontal`): The axis the scrollbar scrolls.
- `data-visible`: Present while the scrollbar should show, by `type`. Hidden scrollbars let presses through.
- `data-scrolling`: Present while its own axis scrolls.
- `data-hovering`: Present while a mouse or pen is over the scroll area.
- `data-dragging`: Present while the thumb is dragged.
- `data-overflow-y`: Present while the content is taller than the viewport.

### ScrollAreaThumb
`[data-slot="scroll-area-thumb"]`

- `data-orientation` (`vertical`, `horizontal`): The axis the scrollbar scrolls.
- `data-dragging`: Present while the thumb is dragged.

### ScrollAreaScrollToEnd
`[data-slot="scroll-area-scroll-to-end"]`

- `data-visible`: Present while the view is away from the end and not heading there. Otherwise the button is inert.

## API Reference

Props are the same as below, as React props.

### ScrollArea

- `type?` (`ScrollAreaType`): When the scrollbars show: "auto" whenever the content overflows, "always" even when it doesn't, "scroll" while scrolling, and "hover" while scrolling or while the pointer is over the scroll area. Each scrollbar has `data-visible` while it should show; style that.
- `scrollHideDelay?` (`number`): How long scrollbars stay after they stop being needed, in ms, with "scroll" and "hover".
- `stickToEnd?` (`boolean`): Keeps the end in view while the content grows, like a chat or streamed output: it starts at the bottom and stays there. Scrolling toward the top lets go, and scrolling back to the bottom sticks again.
- `controller?` (`{ scrollToEnd: (options?: ScrollAreaScrollOptions) => void; scrollToStart: (options?: ScrollAreaScrollOptions) => void; isAtEnd: () => boolean; isAtStart: () => boolean; isSticking: () => boolean; }`): Drives it from anywhere. Create one with `createScrollAreaController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### ScrollAreaScrollbar

- `orientation?` (`"horizontal" | "vertical"`): The axis the scrollbar scrolls.

### ScrollAreaViewport, ScrollAreaContent, ScrollAreaThumb, ScrollAreaCorner and ScrollAreaScrollToEnd

These take no options of their own, only the props of the element they render. A thumb follows the orientation of its scrollbar.

### State

What render functions, state-based class names and slots receive. The root, the viewport and the content receive the scroll area's state.

- `overflowX` (`boolean`): Whether the content is wider than the viewport.
- `overflowY` (`boolean`): Whether the content is taller than the viewport.
- `atStart` (`boolean`): Whether the view is at the start of the scroll area: the top, or the inline start when only the horizontal axis overflows.
- `atEnd` (`boolean`): Whether the view is at the end of the scroll area: the bottom, or the inline end when only the horizontal axis overflows.
- `scrolling` (`boolean`): Whether the user is scrolling now.
- `hovering` (`boolean`): Whether a mouse or pen is over the scroll area.
- `sticking` (`boolean`): Whether the view follows the end as the content grows, with `stickToEnd`.

`ScrollAreaScrollbar`:

- `orientation` (`"vertical" | "horizontal"`): The axis it scrolls.
- `visible` (`boolean`): Whether it should show now, by `type`.
- `scrolling` (`boolean`): Whether its axis is scrolling now.
- `hovering` (`boolean`): Whether a mouse or pen is over the scroll area.
- `dragging` (`boolean`): Whether its thumb is being dragged.

`ScrollAreaThumb`:

- `orientation` (`"vertical" | "horizontal"`): The axis it scrolls.
- `dragging` (`boolean`): Whether it's being dragged.

`ScrollAreaScrollToEnd`:

- `visible` (`boolean`): Whether it should show: the view is away from the end and isn't heading there.

### Controller

Create one with `createScrollAreaController()` and pass it as `controller`.

- `scrollToEnd(options?)` (`(options?: ScrollAreaScrollOptions | undefined) => void`): Scrolls to the end: the bottom, or the inline end when only the horizontal axis overflows. With `stickToEnd`, it sticks to the end again.
- `scrollToStart(options?)` (`(options?: ScrollAreaScrollOptions | undefined) => void`): Scrolls to the start: the top, or the inline start when only the horizontal axis overflows.
- `isAtEnd()` (`() => boolean`): Whether the view is at the end now, even in a scroll event, before the attributes catch up.
- `isAtStart()` (`() => boolean`): Whether the view is at the start now, even in a scroll event, before the attributes catch up.
- `isSticking()` (`() => boolean`): Whether the view follows the end as the content grows, with `stickToEnd`.

`scrollToEnd` and `scrollToStart` take an optional `{ behavior }`:

- `behavior?` (`"instant" | "smooth"`): "smooth" eases there, following content that keeps growing. It's instant when the user prefers reduced motion.

## Accessibility

No WAI-ARIA pattern covers scroll areas: the viewport is a native scroller, and keyboard access follows axe's [scrollable-region-focusable](https://dequeuniversity.com/rules/axe/4.10/scrollable-region-focusable) rule. Scrollbars and the corner are hidden from screen readers, which scroll the viewport themselves. Make the viewport a landmark with `role="region"` and an `aria-label` when it's worth finding, or give a chat `role="log"`.

### Keyboard

The viewport scrolls natively, so arrow keys, Page Up and Down, Home, End and Space work once focus is inside it. A viewport that scrolls and holds nothing focusable is a tab stop itself, so keyboard users can reach it; one with links or fields inside isn't, since Tab reaches them and they scroll it.

### Tested Behavior

Every line below is an automated test.

**Thumb**

- The wheel scrolls the viewport and moves the thumb.
- The thumb is as long as the visible share of the content.
- At the end of the content, the thumb is at the end of its track.
- Dragging the thumb scrolls the content as far along.
- Dragging the thumb past the track's end stops at the end.
- Dragging the thumb selects no text.
- The horizontal thumb follows horizontal scrolling.
- The thumb shrinks as the content grows.
- An image loading late resizes the thumb.

**Track**

- Pressing the track after the thumb scrolls toward the press.
- Pressing the track before the thumb scrolls back toward the press.
- Holding the track keeps paging until the thumb reaches the pointer.
- Alt with a press on the track jumps there.
- Pressing a scrollbar leaves focus where it was.
- A wheel over a scrollbar scrolls the viewport, not the page.
- A wheel over a scrollbar at the end scrolls the page.

**Overflow**

- Custom scrollbars hide the native ones.
- The root says while the user scrolls, and stops after.
- Content that fits shows no scrollbar.
- Content that overflows both ways shows both scrollbars and the corner between them.

**Keyboard**

- A viewport that scrolls and holds nothing focusable is a tab stop.
- Keys scroll a focused viewport natively.
- A viewport that doesn't scroll is no tab stop.
- Focusing content scrolls it into view.

**Web components**

- A scrollbar whose orientation changes sizes its thumb along the new axis. Web components only.

Runs in React, Vue and web components.

Beyond the baseline:

- A scroll area in another document times its scrollbars with that document's window. Web components only.

**Track**

- Pressing the track pages by most of a viewport, like a native scrollbar.
- Escape during a thumb drag puts the content back.

**Keyboard**

- A viewport with focusable content is no tab stop: Tab goes to the content.

**Native scrollbars**

- Without custom scrollbars, the native ones stay.
- Hiding native scrollbars injects no style element.

**State**

- The root says which axes overflow and which edges the view is at.
- CSS variables say how far the content reaches past each edge, and the progress.
- The variables don't inherit, and a child of the root takes them with inherit.

**Scrollbar types**

- Hover shows the scrollbar while the pointer is over the area, then hides it after the delay.
- Scroll shows the scrollbar only while scrolling, not on hover.
- Scroll shows only the scrollbar of the axis that scrolls.
- Auto shows the scrollbar whenever the content overflows.
- Always shows the scrollbar even when the content fits.
- A hidden scrollbar lets presses through to the content under it.

**Sticking to the end**

- It starts at the end.
- New messages, streamed words and late images keep the end in view.
- A wheel toward the start lets go, and growth no longer moves the view.
- Content streaming in during a wheel toward the start doesn't pull the view back.
- PageUp in the viewport lets go.
- A wheel toward the start inside a scroller in the content keeps following.
- A key a widget inside uses keeps following.
- The controller reads where the view is from a scroll listener. Web components only.
- A scroll toward the start from the app or find in page lets go too.
- Scrolling back to the end follows again.
- Dragging the thumb toward the start lets go, and back to the end follows.
- Keeping the end in view never scrolls the page.
- Keeping the end in view doesn't flash the scrollbars as scrolling.
- A smooth scroll-behavior doesn't slow down keeping the end in view.
- Text selection in progress isn't pulled away by growth.

**Jump to latest**

- It's out of reach at the end, and shows once the view moves away.
- It scrolls to the end, follows the end again, and hides at once.
- From the keyboard, focus moves to the viewport instead of the page.
- With reduced motion, it jumps at once.

**Hidden scrollbars**

- A scrollbar shows its thumb as soon as it's hovered.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Reading a scroll area announces its region and content, and no scrollbar.

Runs in React, Vue and web components.
