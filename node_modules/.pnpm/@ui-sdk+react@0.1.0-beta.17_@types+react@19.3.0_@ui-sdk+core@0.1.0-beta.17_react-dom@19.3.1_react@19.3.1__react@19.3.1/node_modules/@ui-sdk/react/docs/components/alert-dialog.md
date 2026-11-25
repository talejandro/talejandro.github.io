# Alert Dialog

Ask someone to confirm an action before you continue.

Use an alert dialog when someone needs to answer a question before an action continues, such as deleting a project.

```tsx title="basic.tsx"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete Project</AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <div data-slot="stack">
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the project, its files and its deployment
            history for everyone on your team.
          </AlertDialogDescription>
        </div>
        <div data-slot="row">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose data-variant="solid" value="confirm">
            Delete
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
```

Open the dialog with Enter to start on Cancel. Tab stays inside, clicking outside leaves it open, and Escape closes it and returns focus to the trigger.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build an `AlertDialog`:

```text
AlertDialog
├── AlertDialogTrigger
├── AlertDialogBackdrop
└── AlertDialogContent
    ├── AlertDialogTitle
    ├── AlertDialogDescription
    ├── AlertDialogClose
    └── AlertDialogClose
```

Put the question in `AlertDialogTitle`, explain what happens in `AlertDialogDescription`, and use `AlertDialogClose` for each answer. Add `AlertDialogBackdrop` to dim the page.

A Close part reports its `value` when it closes. `value="confirm"` is the agreeing answer that the [confirm helper](#confirm) recognizes.

## Usage

Import the parts and put them together:

```tsx
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete Project</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>
          The project and its files will be deleted for everyone.
        </AlertDialogDescription>
        <AlertDialogClose>Cancel</AlertDialogClose>
        <AlertDialogClose value="confirm">Delete</AlertDialogClose>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
```

## Build Your Own

`@ui-sdk/react/alert-dialog` comes with a ready-made Alert Dialog. If you'd like to build your own, with your own names, start from the `alertDialog` primitive in `@ui-sdk/core`:

```ts title="confirm.ts"
"use client"

import { alertDialog } from "@ui-sdk/core/alert-dialog"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: Confirm,
  Trigger: ConfirmTrigger,
  Backdrop: ConfirmBackdrop,
  Content: ConfirmContent,
  Title: ConfirmTitle,
  Description: ConfirmDescription,
  Close: ConfirmClose,
} = createParts(alertDialog, {
  trigger: "button",
  backdrop: "div",
  content: "div",
  title: "h2",
  description: "p",
  close: "button",
})

export {
  Confirm,
  ConfirmBackdrop,
  ConfirmClose,
  ConfirmContent,
  ConfirmDescription,
  ConfirmTitle,
  ConfirmTrigger,
}
```

```tsx
<Confirm>
  <ConfirmTrigger>Delete Project</ConfirmTrigger>
  <ConfirmBackdrop />
  <ConfirmContent>
    <ConfirmTitle>Delete this project?</ConfirmTitle>
    <ConfirmDescription>
      This permanently deletes the project.
    </ConfirmDescription>
    <ConfirmClose>Cancel</ConfirmClose>
    <ConfirmClose value="confirm">Delete</ConfirmClose>
  </ConfirmContent>
</Confirm>
```

Each part keeps the behavior, state and data attributes of its ready-made counterpart: the content opens in the top layer, traps focus and makes the page inert. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Controlled

Pass `open` and `onOpenChange` when your app needs to read or control whether the dialog is open. [State and Events](../state-and-events.md) explains controlled state and canceling a change.

```tsx title="controlled.tsx"
"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  const [open, setOpen] = React.useState(false)

  return (
    <div data-slot="stack">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger>Review Changes</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <div data-slot="stack">
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits will be lost if you leave without saving.
            </AlertDialogDescription>
          </div>
          <div data-slot="row">
            <AlertDialogClose>Keep Editing</AlertDialogClose>
            <AlertDialogClose data-variant="solid" value="confirm">
              Discard
            </AlertDialogClose>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
```

Choose Review Changes, then Keep Editing or Discard.

## Shortcut

Give the trigger a `shortcut` to open the dialog from the keyboard, and put `AlertDialogShortcut` inside it to show the keys. [Dialog](./dialog.md#keyboard-shortcut) covers the shortcut syntax.

```tsx title="shortcut.tsx"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogShortcut,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger shortcut="mod+shift+h">
        Clear History
        <AlertDialogShortcut />
      </AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <div data-slot="stack">
          <AlertDialogTitle>Clear your history?</AlertDialogTitle>
          <AlertDialogDescription>
            Recent searches and visited pages are removed from this device.
          </AlertDialogDescription>
        </div>
        <div data-slot="row">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose data-variant="solid" value="confirm">
            Clear
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
```

Press Cmd+Shift+H (Ctrl+Shift+H on Windows and Linux) to open the dialog without clicking.

## Animation

The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the dialog stays mounted until the exit finishes:

```css
[data-slot="alert-dialog-content"] {
  transition:
    opacity 0.2s,
    translate 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    scale 0.25s cubic-bezier(0.22, 1, 0.36, 1);

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    translate: 0 16px;
    scale: 0.96;
  }

  &[data-ending-style] {
    transition-duration: 0.15s;
  }
}
```

```tsx title="animation.tsx"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Leave Workspace</AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <div data-slot="stack">
          <AlertDialogTitle>Leave this workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            You'll lose access to its projects until someone invites you again.
          </AlertDialogDescription>
        </div>
        <div data-slot="row">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialogClose data-variant="solid" value="confirm">
            Leave
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
```

Open and close the dialog. It slides up and fades in, and slides down and fades out before it unmounts.

## Nested

An alert dialog opened inside another joins its stack, such as a second confirmation before something can't be undone. Escape closes the topmost one and returns focus to its trigger. The dialog underneath gets `data-nested-open`, so you can show which layer is active. To close both once the last question is answered, control the outer dialog and close it when the inner one closes with `returnValue` `"confirm"`.

```tsx title="nested.tsx"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"
import * as React from "react"

function Example() {
  const [open, setOpen] = React.useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>Delete Workspace</AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <div data-slot="stack">
          <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            All 12 projects and their deployments will be deleted for everyone
            on your team.
          </AlertDialogDescription>
        </div>
        <div data-slot="row">
          <AlertDialogClose>Cancel</AlertDialogClose>
          <AlertDialog
            onOpenChange={(nested, details) => {
              if (!nested && details.returnValue === "confirm") {
                setOpen(false)
              }
            }}
          >
            <AlertDialogTrigger data-variant="solid">Delete</AlertDialogTrigger>
            <AlertDialogBackdrop />
            <AlertDialogContent>
              <div data-slot="stack">
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  There's no way to get the workspace back.
                </AlertDialogDescription>
              </div>
              <div data-slot="row">
                <AlertDialogClose>Go Back</AlertDialogClose>
                <AlertDialogClose data-variant="solid" value="confirm">
                  Delete Workspace
                </AlertDialogClose>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { Example }
```

Choose Delete Workspace, then Delete. Press Escape to step back to the first question, or choose Delete Workspace to close both.

## Async Action

An `action` on a Close part runs before it closes the dialog. Return a Promise to keep the dialog open until the work finishes. A resolved Promise closes it with the reason `action`; a rejection keeps it open and puts the error in that part's state.

```tsx title="async-action.tsx"
"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  const attempts = React.useRef(0)

  async function deleteProject() {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    if (attempts.current++ === 0) {
      throw new Error("Couldn't delete the project.")
    }
  }

  return (
    <div data-slot="stack">
      <AlertDialog pendingAnnouncement="Deleting project">
        <AlertDialogTrigger>Delete Project</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <div data-slot="stack">
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project, its files and its deployment
              history for everyone on your team.
            </AlertDialogDescription>
          </div>
          <AlertDialogClose
            data-variant="solid"
            value="confirm"
            action={deleteProject}
            render={(props, state) => (
              <div data-slot="stack">
                <p data-slot="hint" role="alert">
                  {state.error instanceof Error && state.error.message}
                </p>
                <div data-slot="row">
                  <AlertDialogClose>Cancel</AlertDialogClose>
                  <button {...props}>
                    {state.pending
                      ? "Deleting…"
                      : state.error
                        ? "Try Again"
                        : "Delete"}
                  </button>
                </div>
              </div>
            )}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
```

Choose Delete Project, then Delete. The first attempt fails so you can try again. While Deleting… is shown, Cancel and Escape leave the dialog open. A successful retry closes it.

While the action runs, its button stays focusable and gets `data-pending`, `aria-busy`, and `aria-disabled`. Other Close parts get `aria-disabled` and `data-disabled`, and neither they nor dismissals can close the dialog until it settles. `onDismissAttempt` reports refused dismissals; a controller can still close it.

The root's `pendingAnnouncement` sets what screen readers hear after a second of waiting. The error clears on the next attempt or when the dialog opens again. The action also receives `{ source }` after its event argument; [Changes After an Await](./button.md#changes-after-an-await) explains when to use it.

## Confirm From Anywhere

The shared `confirm()` asks a question without any dialog markup. Render `OverlayHost` once near the root of your app, and it shows each question as an alert dialog. `confirm()` resolves `true` when someone agrees. [Confirm Options](#confirm-options) lists what you can pass.

```tsx title="confirm-anywhere.tsx"
import { confirm } from "@ui-sdk/react/alert-dialog"
import { OverlayHost } from "@ui-sdk/react/overlays"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  async function archive() {
    const yes = await confirm({
      title: "Archive this project?",
      description: "It moves to Archived, and you can restore it anytime.",
      confirmLabel: "Archive",
    })
    log(yes ? "Archived the project" : "Kept the project")
  }

  return (
    <>
      <button type="button" onClick={archive}>
        Archive Project
      </button>
      <OverlayHost />
    </>
  )
}

export { Example }
```

Choose Archive Project, then Archive or Cancel. The console shows the answer.

## Confirm

Use `createConfirm<Payload>()` to ask a question from an event handler and await the answer. Create it once, then pass its `controller` to your alert dialog. The content reads the question's data from `state.payload`.

`await confirm({ name })` resolves `true` when the Close part with `value="confirm"` closes the dialog. Cancel, Escape, and other answers resolve `false`. This lets several rows share one dialog:

```tsx title="confirm.tsx"
"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  createConfirm,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  const [confirm] = React.useState(() => createConfirm<{ name: string }>())
  const [projects, setProjects] = React.useState(["Acme", "Globex", "Initech"])
  const reset = React.useRef<HTMLButtonElement>(null)

  async function remove(name: string, button: HTMLButtonElement) {
    if (!(await confirm({ name }))) {
      return
    }
    const row = button.closest("li")
    const next = (
      row?.nextElementSibling ?? row?.previousElementSibling
    )?.querySelector("button")
    const target = next ?? reset.current
    target?.focus()
    setProjects((list) => list.filter((project) => project !== name))
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          ref={reset}
          type="button"
          onClick={() => setProjects(["Acme", "Globex", "Initech"])}
        >
          Reset Projects
        </button>
      </div>
      <ul data-slot="list" aria-label="Projects">
        {projects.map((name) => (
          <li data-slot="row" key={name}>
            {name}
            <button
              type="button"
              data-size="sm"
              aria-label={`Delete ${name}`}
              onClick={(event) => remove(name, event.currentTarget)}
            >
              Delete
            </button>
          </li>
        ))}
        {projects.length === 0 && (
          <li data-slot="row">All projects deleted.</li>
        )}
      </ul>
      <AlertDialog controller={confirm.controller}>
        <AlertDialogBackdrop />
        <AlertDialogContent<{
          name: string
        }>>
          {(state) => (
            <>
              <div data-slot="stack">
                <AlertDialogTitle>
                  Delete {state.payload?.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  The project and its files will be deleted for everyone on your
                  team.
                </AlertDialogDescription>
              </div>
              <div data-slot="row">
                <AlertDialogClose>Cancel</AlertDialogClose>
                <AlertDialogClose data-variant="solid" value="confirm">
                  Delete
                </AlertDialogClose>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
```

Delete a project. Cancel or Escape keeps it; Delete removes it and focuses a neighboring row's button. Reset Projects brings the list back.

When the action removes the button that opened the dialog, choose a useful place for focus to go. This example focuses a neighboring row, or Reset Projects when the list is empty.

## Queued Questions

Calls to the same confirm function wait their turn. You can ask two questions at once; the second appears only after the first has an answer.

```tsx title="queue.tsx"
"use client"

import * as React from "react"
import { useLog } from "./log"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  createConfirm,
} from "@ui-sdk/react/alert-dialog"

function Example() {
  const [confirm] = React.useState(() => createConfirm<{ name: string }>())
  const log = useLog()

  async function review() {
    const acme = confirm({ name: "Acme" })
    const globex = confirm({ name: "Globex" })
    const [first, second] = await Promise.all([acme, globex])
    log(`Acme: ${first ? "confirmed" : "canceled"}`)
    log(`Globex: ${second ? "confirmed" : "canceled"}`)
  }

  return (
    <div data-slot="stack">
      <button type="button" onClick={review}>
        Review Two Projects
      </button>
      <AlertDialog controller={confirm.controller}>
        <AlertDialogBackdrop />
        <AlertDialogContent<{
          name: string
        }>>
          {(state) => (
            <>
              <div data-slot="stack">
                <AlertDialogTitle>
                  Archive {state.payload?.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Archived projects leave the active list. You can restore them
                  later.
                </AlertDialogDescription>
              </div>
              <div data-slot="row">
                <AlertDialogClose>Cancel</AlertDialogClose>
                <AlertDialogClose data-variant="solid" value="confirm">
                  Archive
                </AlertDialogClose>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { Example }
```

Choose Review Two Projects. Answer the Acme question, then the Globex question. The console shows both answers once the second one is in.

## Styling

Each part has a `data-slot`, such as `alert-dialog-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes). [Styling and Animation](../styling-and-animation.md) covers state attributes and entry and exit transitions.

### AlertDialogContent
- `--dialog-stack`: How many dialogs are open above this one, nested inside it. 0 for the topmost.
- `--keyboard-inset`: How many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: The width of the part of the page you can see.
- `--visual-viewport-height`: The height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: How far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

### AlertDialogTrigger
`[data-slot="alert-dialog-trigger"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-disabled`: Present when the trigger is disabled.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.

### AlertDialogBackdrop
`[data-slot="alert-dialog-backdrop"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the dialog animates out. Style the state you animate to.

### AlertDialogContent
`[data-slot="alert-dialog-content"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the dialog animates out. Style the state you animate to.
- `data-keyboard`: Present while the on-screen keyboard covers part of the page.

### AlertDialogClose
`[data-slot="alert-dialog-close"]`

- `data-disabled`
- `data-pending`: Present on a Close part while its action runs.

## API Reference

Alert Dialog shares [Dialog's](./dialog.md) options, except `modal`, `closeOnOutsidePress`, and `presentation`. It is always modal, never closes on an outside press, and does not present as a sheet.

### AlertDialog

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the dialog is open. Pass it to control the dialog.
- `defaultOpen?` (`boolean`): Whether the dialog starts open, when uncontrolled. Focus moves into it once it's on the page.
- `onOpenChangeComplete?` (`((open: boolean) => void)`): Runs once the dialog has finished opening or closing, after any animation.
- `dismissible?` (`boolean`): Whether Escape, an outside press and Android's back gesture can close the dialog. Close parts, triggers and the controller always can. Pass `false` while a form has unsaved changes, and ask in `onDismissAttempt`.
- `onDismissAttempt?` (`((details: DialogDismissAttemptDetails) => void)`): Runs when a dismissal was refused, because `dismissible` is false, an outside press doesn't close it, or a Close part's action is running. Ask "Discard changes?" here.
- `persistentElements?` (`(string | Element)[] | (() => Element[])`): Elements that stay usable while the dialog makes the page inert, like a chat launcher or a password manager's button. Elements, CSS selectors, or a function that returns elements, read when the dialog opens. Presses on them never close it.
- `pendingAnnouncement?` (`string`): What screen readers hear once a Close part's action has been running for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `onOpenChange?` (`((open: boolean, details: DialogOpenChangeDetails<AlertDialogOpenChangeReason>) => void)`): Runs when the alert dialog wants to open or close. `details.reason` says why, `details.cancel()` stops it, and `details.returnValue` is the `value` of the Close part that closed it.
- `onPayloadChange?` (`((payload: unknown, details: ChangeDetails<AlertDialogPayloadChangeReason>) => void)`): Runs when a trigger or a controller with another payload opens the alert dialog, before `onOpenChange`, or a controller's `open({ payload })` gives the open one another payload. `details.cancel()` keeps the previous payload.
- `controller?` (`PopupController<any, AlertDialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Opens, closes and inspects the alert dialog from anywhere. Create one with `createAlertDialogController()` or `createConfirm()`.

### AlertDialogTrigger

- `disabled?` (`boolean`): Stops the trigger from opening the dialog. A native button can't be focused or pressed, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled trigger in the tab order with `aria-disabled` instead of the native attribute, so it can host a tooltip that says why. Presses still do nothing.
- `payload?` (`unknown`): Data for the content to render when this trigger opens the dialog, like the row it belongs to.
- `shortcut?` (`string`): A keyboard shortcut that presses the trigger, like `"mod+k"`. `mod` is Command on Apple platforms and Control elsewhere. Sets `aria-keyshortcuts`, and a Shortcut part inside shows it. A modal dialog pauses the page's shortcuts while it's open.
- `controller?` (`PopupController<any, AlertDialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Connects a trigger outside the alert dialog to the alert dialog with this controller.

### AlertDialogBackdrop

Dims the page behind the dialog. Renders a `div` and accepts its props and `render`.

### AlertDialogContent

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `initialFocus?` (`DialogInitialFocus`): Where focus goes when the dialog opens. Opening with touch focuses the dialog itself, so no on-screen keyboard appears.
- `finalFocus?` (`PopupFocusTarget`): Where focus goes when the dialog closes while focus is inside it.
- `keepMounted?` (`boolean`): Whether the dialog stays in the page, hidden, while closed. Its content keeps its state between opens.
- `inline?` (`boolean`): Renders the dialog and its backdrop where they are in the page instead of above it, so it can stay inside a frame, like an app preview. Pair it with `modal="trap-focus"` to keep the rest of the page usable. A `container` on the dialog still moves its backdrop, so leave it off.

### AlertDialogTitle

The question. Renders an `h2`, and the content uses it as its accessible name.

### AlertDialogDescription

What happens if you agree. Renders a `p`, and the content uses it as its accessible description.

### AlertDialogClose

- `value?` (`string`): Reported as `returnValue` in `onOpenChange` and by the controller's `open()`. `createConfirm()` resolves `true` for `"confirm"`.
- `action?` (`((event: Event | undefined, details: ActionDetails) => unknown)`): Runs when the part is pressed, before the dialog closes. A returned Promise keeps the dialog open while it runs: the part gets `data-pending`, `aria-busy` and `aria-disabled`, screen readers hear the dialog's `pendingAnnouncement` after a second, and nothing but the controller closes the dialog. It closes with reason `"action"` once the Promise resolves. A rejection keeps it open and puts the reason in the part's `error` state until the next press, or until the dialog opens again. `details.source` says how the part was pressed, for changes made after an `await`.

### AlertDialogShortcut

- `shortcut?` (`string`): The keys to show. Inside a trigger, its `shortcut`.

### Confirm Options

The shared `confirm()` function uses these options when an `OverlayHost` renders the question. See [Toasts and Confirms](../popups.md#toasts-and-confirms) for the host setup. With your own dialog, `createConfirm<Payload>()` accepts the payload you choose instead.

- `title` (`string`): The question, like "Delete this project?".
- `description?` (`string`): What agreeing does.
- `confirmLabel?` (`string`): The agreeing button's text.
- `cancelLabel?` (`string`): The other button's text.

### State

`AlertDialogContent`:

- `open` (`boolean`): Whether the dialog is open. False while it animates out.
- `modal` (`boolean | "trap-focus"`): The `modal` setting. Always true for an alert dialog.
- `nested` (`boolean`): Whether the dialog was opened from inside another dialog.
- `nestedOpen` (`boolean`): Whether a dialog opened from inside this one is open.
- `stack` (`number`): How many dialogs are open above this one, nested inside it.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.
- `pending` (`boolean`): Whether a Close part's action is running.
- `presentation` (`"dialog"`): Always `"dialog"`: an alert dialog never presents as a sheet.

`AlertDialogClose`:

- `pending` (`boolean`): Whether this part's action is running.
- `error` (`unknown`): Why this part's last action failed, until it's pressed again or the dialog opens again.

`AlertDialogShortcut`:

- `text` (`string`): The shortcut formatted for this platform: `⌘K` on Apple platforms and `Ctrl+K` elsewhere. Empty without one.

### Reasons

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `parent-close` (`none`): The parent layer closed.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `action` (`MouseEvent | KeyboardEvent`): A Close part's `action` finished.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

`onPayloadChange(payload, details)` runs before `onOpenChange` when the dialog opens with another payload. Calling `controller.open({ payload })` on an open dialog updates the payload with the reason `imperative`.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Use `createAlertDialogController<Payload, Result>()` for direct control. `createConfirm<Payload>()` returns a confirm function with its own `controller`.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<AlertDialogOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<DialogPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<AlertDialogOpenChangeReason> & { returnValue?: Result | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<AlertDialogOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.

## Accessibility

Give the dialog a title and a description, and put the least destructive answer first. It follows the [WAI-ARIA alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/).

The dialog uses the `alertdialog` role and keeps the rest of the page inert while it's open. Screen readers announce its title and description. Opening it focuses the first Close part, so put Cancel first. A touch open focuses the content instead, so no on-screen keyboard appears. Escape closes the dialog, but pressing outside never does. [Dialog](./dialog.md#focus) covers other initial and final focus targets.

These behaviors are covered by automated tests:

**Alert dialog**

- Opens with focus on the least destructive action.
- Is described by its message.
- An outside press keeps it open.
- Escape closes it and returns focus to the trigger.
- Tab cycles between its actions.
- The action reports and closes.

Runs in React, Vue and web components.
