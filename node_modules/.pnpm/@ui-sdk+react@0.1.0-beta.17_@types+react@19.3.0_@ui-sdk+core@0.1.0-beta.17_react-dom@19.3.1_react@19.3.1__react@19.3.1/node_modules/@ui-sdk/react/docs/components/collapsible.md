# Collapsible

Show and hide a panel, preserve its contents, and animate its height.

Use a collapsible to show and hide one panel of content. For a set of panels, use an [accordion](./accordion.md).

```tsx title="basic.tsx"
"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

const items = [
  { name: "Linen shirt", price: "$48.00" },
  { name: "Canvas tote", price: "$18.00" },
  { name: "Wool socks", price: "$18.00" },
]

function Example() {
  return (
    <Collapsible data-variant="card">
      <CollapsibleTrigger>
        <span data-slot="stack">
          <span>Order #4189</span>
          <span data-slot="hint">3 items, $84.00</span>
        </span>
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        {items.map((item) => (
          <div data-slot="row" key={item.name}>
            <span>{item.name}</span>
            <span>{item.price}</span>
          </div>
        ))}
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
```

Press Order #4189, or focus it and press Enter or Space, to show the items.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Collapsible`:

```text
Collapsible
├── CollapsibleTrigger
└── CollapsiblePanel
```

The root and panel render divs, and the trigger renders a native button. Put other content around them, like a heading or a summary that always shows.

## Usage

Import the parts and put them together:

```tsx
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"

function Example() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Order details</CollapsibleTrigger>
      <CollapsiblePanel>2 × Linen shirt</CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
```

## Build Your Own

`@ui-sdk/react/collapsible` comes with a ready-made Collapsible. If you'd like to build your own, with your own names, start from the `collapsible` primitive in `@ui-sdk/core`:

```ts title="spoiler.ts"
"use client"

import { collapsible } from "@ui-sdk/core/collapsible"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: Spoiler,
  Trigger: SpoilerToggle,
  Panel: SpoilerContent,
} = createParts(collapsible, {
  root: "div",
  trigger: "button",
  panel: "div",
})

export { Spoiler, SpoilerContent, SpoilerToggle }
```

```tsx
<Spoiler>
  <SpoilerToggle>Show the ending</SpoilerToggle>
  <SpoilerContent>The butler did it.</SpoilerContent>
</Spoiler>
```

Each part keeps the behavior, state and data attributes of its ready-made counterpart. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Disabled

Set `disabled` on the root to stop its trigger from opening or closing the panel. The trigger stays in the tab order and reports `aria-disabled="true"`. A disabled `<fieldset>` around the collapsible disables it too.

```tsx
<Collapsible disabled>
  <CollapsibleTrigger>Gift options</CollapsibleTrigger>
  <CollapsiblePanel>Add a gift message and wrapping.</CollapsiblePanel>
</Collapsible>
```

## Keep Mounted

Panels unmount when they close, so Tab skips their contents. Set `keepMounted` on the panel to keep it mounted and hidden, so a field keeps what you typed into it.

```tsx title="keep-mounted.tsx"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import { ChevronDownIcon } from "lucide-react"

function Example() {
  return (
    <Collapsible data-variant="card">
      <CollapsibleTrigger>
        <span data-slot="stack">
          <span>Add a delivery note</span>
          <span data-slot="hint">Optional, for the courier</span>
        </span>
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsiblePanel keepMounted>
        <Field>
          <FieldLabel>Delivery note</FieldLabel>
          <Textarea placeholder="Leave it with the front desk…" />
        </Field>
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
```

Open Add a delivery note, type a note, then close and reopen the panel. Your note is still there.

## Find in Page

Set `hiddenUntilFound` on the panel to keep it in the DOM as `hidden="until-found"`. Browser Find and links to content inside the panel can reveal it. The panel opens without an animation so the match is visible immediately.

React serializes `hidden` as a boolean on the server. The closed panel becomes findable after hydration.

```tsx title="find-in-page.tsx"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

function Example() {
  return (
    <Collapsible data-variant="card">
      <CollapsibleTrigger>
        <span data-slot="stack">
          <span>Ingredients</span>
          <span data-slot="hint">Morning buns, makes 12</span>
        </span>
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsiblePanel hiddenUntilFound>
        <p>
          Flour, butter, brown sugar, eggs, a pinch of cardamom and sea salt.
        </p>
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
```

Leave Ingredients closed. Open your browser's Find command and search for cardamom to reveal the panel.

## Controlled

Pass `open` and update it in `onOpenChange`. Call `details.cancel()` in the callback to cancel the change.

For a button elsewhere on the page, create a [controller](#controller) with `createCollapsibleController()` and pass it as `controller`. Create one controller per mounted collapsible.

```tsx title="controlled.tsx"
"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  createCollapsibleController,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"
import { useLog } from "./log"
import * as React from "react"

const recoveryCodes = ["7KQ2-M9XD", "P4TR-8HZC", "W3NB-6JUE", "C5YF-2LSA"]

function Example() {
  const log = useLog()
  const [collapsible] = React.useState(createCollapsibleController)
  const [open, setOpen] = React.useState(false)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => collapsible.toggle()}>
          Toggle
        </button>
      </div>
      <Collapsible
        data-variant="card"
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next)
          log(`${next ? "Opened" : "Closed"} (${details.reason})`)
        }}
        controller={collapsible}
      >
        <CollapsibleTrigger>
          <span data-slot="stack">
            <span>Recovery codes</span>
            <span data-slot="hint">Each code signs you in once</span>
          </span>
          <ChevronDownIcon />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <div data-slot="stack">
            <ul>
              {recoveryCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
            <button type="button" onClick={() => collapsible.close()}>
              Done
            </button>
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  )
}

export { Example }
```

Open Recovery codes with Toggle or its trigger, then press Done. The console logs each change and its reason, and Done returns focus to the trigger.

## Animation

Animate the measured `--collapsible-panel-height` between zero and the content's height. `data-starting-style` marks the opening frame, and `data-ending-style` stays on while it closes. The panel stays mounted until its closing animation finishes, and a panel open on its first paint doesn't animate.

```css
[data-slot="collapsible-panel"] {
  height: var(--collapsible-panel-height);
  overflow: hidden;
  transition: height 0.2s ease-out;

  &:is([data-starting-style], [data-ending-style]) {
    height: 0;
  }
}
```

`onOpenChangeComplete` reports when opening or closing has finished.

```tsx title="animation.tsx"
"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"
import { useLog } from "./log"

const notes = [
  "Search now matches file contents, not only names.",
  "Shared links remember the folder they were opened from.",
  "Uploads resume after the connection drops.",
]

function Example() {
  const log = useLog()
  return (
    <Collapsible
      data-variant="card"
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <CollapsibleTrigger>
        <span data-slot="stack">
          <span>Release notes</span>
          <span data-slot="hint">Version 2.4, released October 28</span>
        </span>
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <ul>
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
```

Open and close Release notes. The console logs when each animation finishes.

## Custom Rendering

Use `render` to choose the element for a part, or a render function to read its state. The trigger below renders inside a heading, and the panel renders as an ordered list.

```tsx title="render.tsx"
"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible"
import { ChevronDownIcon } from "lucide-react"

const updates = [
  { label: "Out for delivery", time: "07:40" },
  { label: "Arrived at the local depot", time: "05:12" },
  { label: "Left the sorting center", time: "Wed 21:03" },
]

function Example() {
  return (
    <Collapsible data-variant="card">
      <CollapsibleTrigger
        render={(props) => (
          <h3>
            <button {...props} />
          </h3>
        )}
      >
        {(state) => (
          <>
            <span data-slot="stack">
              <span>Track parcel</span>
              <span data-slot="hint">
                {state.open ? "3 updates" : "Arrives Thursday"}
              </span>
            </span>
            <ChevronDownIcon />
          </>
        )}
      </CollapsibleTrigger>
      <CollapsiblePanel render={<ol />}>
        {updates.map((update) => (
          <li data-slot="row" key={update.label}>
            <span>{update.label}</span>
            <span>{update.time}</span>
          </li>
        ))}
      </CollapsiblePanel>
    </Collapsible>
  )
}

export { Example }
```

Press Track parcel to open the ordered list. The summary changes from Arrives Thursday to 3 updates.

## Styling

Use `data-open`, `data-closed` and `data-disabled` to style each state. The examples turn their chevron from the trigger's `data-open`.

Each part has a `data-slot`, such as `collapsible-panel`, and its state attributes are listed under [Data Attributes](#data-attributes).

### CollapsiblePanel
- `--collapsible-panel-height`: The panel's content height in pixels while it animates, auto once open and 0px while closed.
- `--collapsible-panel-width`: The panel's content width, the same way. For panels that open sideways.

## Data Attributes

### Collapsible
`[data-slot="collapsible"]`

- `data-open`: Present while the panel is open.
- `data-closed`: Present while the panel is closed, including while it animates out.
- `data-disabled`: Present when the collapsible can't open or close.

### CollapsibleTrigger
`[data-slot="collapsible-trigger"]`

- `data-open`: Present while the panel is open.
- `data-closed`: Present while the panel is closed, including while it animates out.
- `data-disabled`: Present when the collapsible can't open or close.

### CollapsiblePanel
`[data-slot="collapsible-panel"]`

- `data-open`: Present while the panel is open.
- `data-closed`: Present while the panel is closed, including while it animates out.
- `data-disabled`: Present when the collapsible can't open or close.
- `data-starting-style`: Present for the panel's first frame. Style the state you animate from.
- `data-ending-style`: Present while the panel animates closed. Style the state you animate to.

## API Reference

Props and callbacks are the same as below, as React props.

### Collapsible

- `open?` (`boolean`): Whether the panel is open. Pass it to control the collapsible.
- `defaultOpen?` (`boolean`): Whether the panel is open at first, when uncontrolled.
- `onOpenChange?` (`((open: boolean, details: ChangeDetails<CollapsibleOpenChangeReason>) => void)`): Runs when the panel wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `onOpenChangeComplete?` (`((open: boolean) => void)`): Runs once the panel has finished opening or closing, after any animation.
- `disabled?` (`boolean`): Stops the trigger from opening or closing the panel. The trigger stays focusable.
- `controller?` (`object`): Opens and closes the panel from anywhere. Create one with `createCollapsibleController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### CollapsibleTrigger

The trigger takes no options of its own, only the props of the element it renders.

### CollapsiblePanel

- `keepMounted?` (`boolean`): Whether the panel stays in the page, hidden, while closed.
- `hiddenUntilFound?` (`boolean`): Keeps the closed panel in the page as `hidden="until-found"`, so the browser's find in page can match its text and open it.

### State

What render functions, state-based class names and slots receive. The trigger and the panel receive the same
state as the collapsible.

- `open` (`boolean`): Whether the panel is open.
- `disabled` (`boolean`): Whether the trigger ignores presses, by its own `disabled` or a disabled fieldset around it. The `open` option and the controller can still open and close it.

### Reasons

`details.reason` says why the panel opened or closed.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `find-in-page` (`Event`): The browser's find in page matched hidden content.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createCollapsibleController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, and returns `false` when the change was canceled or changed nothing.

- `isOpen()` (`() => boolean`): Whether the panel is open.
- `setOpen(open, options?)` (`(open: boolean, options?: CollapsibleChangeOptions | undefined) => boolean`): Opens or closes the panel. Returns false when the change was canceled or not possible.
- `open(options?)` (`(options?: CollapsibleChangeOptions | undefined) => boolean`): Opens the panel.
- `close(options?)` (`(options?: CollapsibleChangeOptions | undefined) => boolean`): Closes the panel.
- `toggle(options?)` (`(options?: CollapsibleChangeOptions | undefined) => boolean`): Opens the panel when it's closed, and closes it when it's open.
- `focus()` (`() => void`): Moves focus to the trigger.

### Events

Callbacks get the new state first, then the details.

| Prop                   | On            | Receives                                                     |
| ---------------------- | ------------- | ------------------------------------------------------------ |
| `onOpenChange`         | `Collapsible` | `(open, details)`: the new state, and the [reason](#reasons) |
| `onOpenChangeComplete` | `Collapsible` | `(open)`, after the panel's animation                        |

## Accessibility

The collapsible follows the [WAI-ARIA disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). The trigger says whether the panel is open with `aria-expanded`, and points to the panel with `aria-controls` while it's mounted. Every line below is an automated test.

### Keyboard

| Key          | Does                                                   |
| ------------ | ------------------------------------------------------ |
| Enter, Space | Opens or closes the panel. Focus stays on the trigger. |
| Tab          | Moves from the trigger into an open panel              |

Closing a panel while focus is inside it moves focus back to the trigger.

### Tested Behavior

**Opening and closing**

- Starts closed, with the panel out of the page.
- Clicking the trigger opens the panel, and clicking again closes it.
- The trigger controls the panel.
- Generated ids start with ui-sdk-.
- It can start open.
- An opening can be canceled.
- A disabled collapsible doesn't open.
- A disabled trigger stays focusable and says it's disabled.
- A controller opens and closes it from anywhere.

**Keyboard**

- Enter toggles the panel and keeps focus on the trigger.
- Space toggles the panel and keeps focus on the trigger.
- Tab moves from the open trigger into the panel.
- Tab skips a closed panel.

**Mounting**

- With keepMounted, the closed panel stays in the page, hidden.
- With keepMounted, a class that sets display doesn't show the closed panel.
- With hiddenUntilFound, the closed panel stays findable.
- With hiddenUntilFound, a class that sets display keeps the closed panel findable.
- Finding text in the closed panel opens it.
- Following a link into the closed panel opens it.
- The browser's own find opens the closed panel.

Runs in React, Vue and web components.

Beyond the pattern's baseline:

**Enhancements**

- Closing the panel while focus is inside it moves focus to the trigger.
- OnOpenChangeComplete runs once the animation has finished.
- An inert its owner writes during the exit stays once the exit ends.
- Find in page reports its own reason and opens without an animation.
- A canceled find in page keeps the panel hidden until found.
- An infinite exit animation still unmounts the panel.
- Parts report open and closed through data attributes.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the collapsible with a keyboard.

Runs in React, Vue and web components.
