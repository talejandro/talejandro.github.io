# Dialog

Open a focused task over the page.

A dialog gives a task its own space: share a link, edit a record, or collect a few details. It manages focus, Escape, outside presses, and returning to where you started.

```tsx title="basic.tsx"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { XIcon } from "lucide-react"

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Share</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </div>
        <Field>
          <FieldLabel>Link</FieldLabel>
          <Input defaultValue="https://example.com/project" readOnly />
        </Field>
        <div data-slot="row">
          <DialogClose data-variant="solid">Done</DialogClose>
        </div>
        <DialogClose aria-label="Close">
          <XIcon aria-hidden="true" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Open Share, then close it with either Close button, Escape, or a press outside. Focus returns to Share.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Dialog`:

```text
Dialog
├── DialogTrigger
├── DialogBackdrop
└── DialogContent
    ├── DialogTitle
    ├── DialogDescription
    └── DialogClose
```

The title names the dialog; the description gives it context. A dialog can have several Close parts. Give an icon-only close button an accessible name, as the first example does.

The backdrop is optional. Without one, style the content’s `::backdrop`. For a question that requires an explicit answer, use [Alert Dialog](./alert-dialog.md).

## Usage

Import the parts and put them together:

```tsx
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <DialogTitle>Project details</DialogTitle>
        <DialogDescription>
          Review the details before continuing.
        </DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

## Build Your Own

`@ui-sdk/react/dialog` comes with a ready-made Dialog. If you'd like to build your own, with your own names, start from the `dialog` primitive in `@ui-sdk/core`:

```ts title="share.ts"
"use client"

import { dialog } from "@ui-sdk/core/dialog"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: Share,
  Trigger: ShareTrigger,
  Backdrop: ShareBackdrop,
  Content: SharePanel,
  Title: ShareTitle,
  Description: ShareDescription,
  Close: ShareClose,
} = createParts(dialog, {
  trigger: "button",
  backdrop: "div",
  content: "div",
  title: "h2",
  description: "p",
  close: "button",
})

export {
  Share,
  ShareBackdrop,
  ShareClose,
  ShareDescription,
  SharePanel,
  ShareTitle,
  ShareTrigger,
}
```

```tsx
<Share>
  <ShareTrigger>Share</ShareTrigger>
  <ShareBackdrop />
  <SharePanel>
    <ShareTitle>Share this page</ShareTitle>
    <ShareDescription>Anyone with the link can view it.</ShareDescription>
    <ShareClose>Done</ShareClose>
  </SharePanel>
</Share>
```

Each part keeps the behavior, state and data attributes of its ready-made counterpart: the content opens in the top layer, traps focus and makes the page inert. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Scrollable Content

Keep the header and actions outside the scrolling area. A viewport height limit, a shrinking middle grid row, and `overflow-y: auto` keep long content usable. `initialFocus="content"` focuses the dialog itself so reading starts at the top.

```tsx title="scrollable.tsx"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"

const paragraphs = [
  "These terms govern your use of the service. By creating an account, you agree to them and to the privacy policy that explains how we handle your data.",
  "You're responsible for the content you upload and for keeping your password safe. Tell us right away if you think someone else has used your account.",
  "We may change the service, and these terms, as the product grows. When a change affects you, we'll let you know by email at least 30 days before it takes effect.",
  "You can stop using the service at any time. We'll keep your data for 30 days after you close your account, so you can export it, and then delete it.",
  "The service is provided as is. To the extent the law allows, we aren't liable for indirect damages, lost profits or lost data.",
  "If you have questions about these terms, write to us. We read every message and reply within two working days.",
]

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Scrollable Content</DialogTrigger>
      <DialogBackdrop />
      <DialogContent initialFocus="content">
        <div data-slot="stack">
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>
            Please read before you continue.
          </DialogDescription>
        </div>
        <div data-slot="scroll">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div data-slot="row">
          <DialogClose>Decline</DialogClose>
          <DialogClose data-variant="solid" value="accept">
            Accept
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Open Scrollable Content in a short window. Scroll the terms while the title and Decline/Accept buttons stay in view.

## Forms

A form with `method="dialog"` closes the dialog on a valid submission. The submit button’s `value` becomes the `returnValue`, just like a Close part’s `value`. An ordinary form stays open until you close the dialog yourself.

```tsx title="form.tsx"
"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  return (
    <Dialog
      onOpenChange={(open, details) => {
        if (!open) {
          log(
            details.returnValue
              ? `Saved as ${details.returnValue}`
              : `Closed (${details.reason})`
          )
        }
      }}
    >
      <DialogTrigger>New Article</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>New article</DialogTitle>
          <DialogDescription>
            Save it as a draft or publish it now.
          </DialogDescription>
        </div>
        <form data-slot="stack" method="dialog">
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input required defaultValue="Shipping updates for spring" />
          </Field>
          <div data-slot="row">
            <button type="submit" value="draft">
              Save Draft
            </button>
            <button data-variant="solid" type="submit" value="published">
              Publish
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Open New Article and choose Save Draft or Publish. The console logs the submitted button's value. An empty title prevents submission.

## Focus

Use `initialFocus` to pick where focus starts, and `finalFocus` to choose where it goes after closing. Each takes a selector, an element or a function returning one. The default returns to the trigger, or to the element focused before a controller opened the dialog. See [popup focus](../popups.md#focus) for the shared focus rules.

```tsx
<DialogContent
  initialFocus="#invite-email"
  finalFocus={() => nextStep.current}
/>
```

## Controlled

Pass `open` and update it in `onOpenChange`. Cancel a proposed change with `details.cancel()`. `onOpenChangeComplete` reports when opening or closing has finished; see [state and events](../state-and-events.md) for the common change contract.

```tsx title="controlled.tsx"
"use client"

import * as React from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const topics = [
  { label: "Product updates", checked: true },
  { label: "Security alerts", checked: true },
  { label: "Weekly digest", checked: false },
]

function Example() {
  const log = useLog()
  const [open, setOpen] = React.useState(false)
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <Checkbox
            checked={open}
            onCheckedChange={(next) => setOpen(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Open
        </label>
      </div>
      <Dialog
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next)
          log(`${next ? "Opened" : "Closed"} (${details.reason})`)
        }}
        onOpenChangeComplete={(next) =>
          log(next ? "Finished opening" : "Finished closing")
        }
      >
        <DialogTrigger>Notification Settings</DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <div data-slot="stack">
            <DialogTitle>Notification settings</DialogTitle>
            <DialogDescription>
              Choose what we email you about.
            </DialogDescription>
          </div>
          <div data-slot="stack">
            {topics.map((topic) => (
              <label data-slot="label" key={topic.label}>
                <Checkbox defaultChecked={topic.checked}>
                  <CheckboxIndicator>
                    <CheckIcon aria-hidden="true" />
                  </CheckboxIndicator>
                </Checkbox>
                {topic.label}
              </label>
            ))}
          </div>
          <div data-slot="row">
            <DialogClose data-variant="solid">Done</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
```

Check Open or press Notification Settings, then close the dialog. The console logs each change, its reason and when it finishes.

## Keyboard Shortcut

A trigger’s `shortcut` opens it from the keyboard. `mod+j` means Command+J on Apple platforms and Control+J elsewhere. The Shortcut part displays the right keys and the trigger exposes `aria-keyshortcuts`.

```tsx title="shortcut.tsx"
"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { PlusIcon } from "lucide-react"

function Example() {
  return (
    <Dialog>
      <DialogTrigger shortcut="mod+j">
        <PlusIcon aria-hidden="true" />
        New Contact
        <DialogShortcut />
      </DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>
            Add someone to your address book.
          </DialogDescription>
        </div>
        <form data-slot="stack" method="dialog">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input name="name" required placeholder="Kofi Mensah" />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input name="email" type="email" required placeholder="kofi@example.com" />
          </Field>
          <div data-slot="row">
            <DialogClose>Cancel</DialogClose>
            <button data-variant="solid" type="submit" value="save">
              Save Contact
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Press Command+J or Control+J to open New contact. The button shows the keys, and Escape returns focus to it.

## Animation

The content and backdrop have `data-starting-style` while they open and `data-ending-style` while they close. Transition from those states, and the dialog stays mounted until the exit finishes. `onOpenChangeComplete` runs after the transition, and `keepMounted` keeps the content in the page while closed.

```css
[data-slot="dialog-content"] {
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
"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  return (
    <Dialog
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <DialogTrigger>Slide In</DialogTrigger>
      <DialogBackdrop />
      <DialogContent keepMounted>
        <div data-slot="stack">
          <DialogTitle>Slide and fade</DialogTitle>
          <DialogDescription>
            300ms in and out. Focus returns as soon as it starts closing.
          </DialogDescription>
        </div>
        <div data-slot="row">
          <DialogClose data-variant="solid">Close</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Open the dialog and close it. The console logs when each animation finishes; focus returns as closing starts.

## Modal

`modal` controls how the dialog shares the page:

- `true`, the default, makes the page inert, locks scrolling, and keeps Tab inside.
- `"trap-focus"` keeps Tab inside while the page can still scroll and receive clicks. A click on the page also closes the dialog, unless `closeOnOutsidePress` is false.
- `false` puts the dialog beside the page and lets focus leave it. Escape closes it while focus is inside; outside presses close it only when `closeOnOutsidePress` is enabled.

To keep a small part of the page usable while a modal dialog is open, like a chat launcher, pass it to `persistentElements`: an array of elements or selectors, or a function returning elements when the dialog opens. Persistent elements don't change stacking on their own.

Dialogs render where you put them and use the browser's top layer. Set `container` when their DOM needs to live elsewhere, like a shadow root. The [popup guide](../popups.md#mounting-and-containers) covers containers and iframes.

```tsx title="modal.tsx"
"use client"

import * as React from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const modes = [
  { value: "true", label: "Modal" },
  { value: "trap-focus", label: "Trap focus" },
  { value: "false", label: "Non-modal" },
]

type Mode = "true" | "trap-focus" | "false"

const notes = {
  true: "The rest of the page is inert and doesn't scroll.",
  "trap-focus":
    "Tab stays inside, and the page still scrolls and takes clicks.",
  false:
    "The page stays usable. Tab leaves the notes, and Escape closes them while focus is inside.",
}

function Example() {
  const [mode, setMode] = React.useState<Mode>("false")
  const [outside, setOutside] = React.useState(false)
  const modal = mode === "true" ? true : mode === "false" ? false : "trap-focus"
  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={modes}
          value={mode}
          onValueChange={(next) => next && setMode(next as Mode)}
        >
          <SelectLabel>Modal</SelectLabel>
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
        <label data-slot="label">
          <Checkbox
            checked={outside}
            onCheckedChange={(next) => setOutside(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Close on outside press
        </label>
      </div>
      <Dialog modal={modal} closeOnOutsidePress={outside}>
        <DialogTrigger>Open Notes</DialogTrigger>
        {modal === true && <DialogBackdrop />}
        <DialogContent>
          <div data-slot="stack">
            <DialogTitle>Notes</DialogTitle>
            <DialogDescription>{notes[mode]}</DialogDescription>
          </div>
          <textarea aria-label="Notes" defaultValue="Call the printer about the proofs." />
          <div data-slot="row">
            <DialogClose data-variant="solid">Done</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
```

Choose a mode, open Notes, and try Tab or clicking the page. Check Close on outside press to compare dismissal.

## Inside a Frame

A dialog opens above the whole page. Set `inline` on the content to keep it and its backdrop where they are in the page, like inside an app preview. Your CSS sizes and places them in their frame. Pair it with `modal="trap-focus"` so the page around the frame stays usable.

```tsx title="inline.tsx"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"

function Example() {
  return (
    <div data-slot="dialog-frame">
      <Dialog modal="trap-focus" closeOnOutsidePress={false}>
        <DialogTrigger>Delete Draft</DialogTrigger>
        <DialogBackdrop />
        <DialogContent inline>
          <div data-slot="stack">
            <DialogTitle>Delete this draft?</DialogTitle>
            <DialogDescription>
              The preview keeps its dialog inside the frame.
            </DialogDescription>
          </div>
          <div data-slot="row">
            <DialogClose>Cancel</DialogClose>
            <DialogClose data-variant="destructive">Delete</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
```

Open Delete Draft. The dialog and its dim cover only the frame, and Tab stays inside the dialog.

## Warn Before Closing a Dirty Form

Set `dismissible` to false while there are unsaved changes. Escape, an outside press, or a back gesture then keeps the dialog open and reports `onDismissAttempt`. Explicit Close parts and controller calls still work, so you can offer a deliberate way out.

```tsx title="dirty-form.tsx"
"use client"

import * as React from "react"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldControl, FieldLabel } from "@ui-sdk/react/field"

function Example() {
  const [open, setOpen] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)
  const [asking, setAsking] = React.useState(false)
  const post = React.useRef<HTMLTextAreaElement>(null)
  const close = () => {
    setOpen(false)
    setDirty(false)
    setAsking(false)
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
      dismissible={!dirty}
      onDismissAttempt={() => setAsking(true)}
    >
      <DialogTrigger>Write a Post</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>Share an update with your team.</DialogDescription>
        </div>
        <Field>
          <FieldLabel>Post</FieldLabel>
          <FieldControl
            render={<textarea ref={post} placeholder="What's new?" />}
            onChange={(event) => setDirty(event.currentTarget.value !== "")}
          />
        </Field>
        {asking ? (
          <div data-slot="row" role="alert">
            Discard your changes?
            <div data-slot="row">
              <button
                type="button"
                onClick={() => {
                  setAsking(false)
                  post.current?.focus()
                }}
              >
                Keep Editing
              </button>
              <button data-variant="solid" type="button" onClick={close}>
                Discard
              </button>
            </div>
          </div>
        ) : (
          <div data-slot="row">
            <DialogClose data-variant="solid" value="post">
              Post
            </DialogClose>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Type a post, then press Escape or click outside. Keep editing returns to the field; Discard closes the dialog and clears the draft.

## Nested Dialogs

A dialog opened inside another joins its stack. Escape closes the topmost dialog and returns focus to its trigger. Closing the parent also closes its children. `data-nested-open` and `--dialog-stack` let you show which layer is active.

```tsx title="nested.tsx"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Account</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>Manage how you sign in.</DialogDescription>
        </div>
        <div data-slot="card">
          <div data-slot="stack">
            <span>Password</span>
            <span data-slot="hint">Last changed 3 months ago</span>
          </div>
          <Dialog>
            <DialogTrigger>Change Password</DialogTrigger>
            <DialogBackdrop />
            <DialogContent>
              <div data-slot="stack">
                <DialogTitle>Change password</DialogTitle>
                <DialogDescription>
                  Use at least 12 characters.
                </DialogDescription>
              </div>
              <Field>
                <FieldLabel>New password</FieldLabel>
                <Input type="password" />
              </Field>
              <div data-slot="row">
                <DialogClose>Cancel</DialogClose>
                <DialogClose data-variant="solid">Update</DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div data-slot="row">
          <DialogClose data-variant="solid">Done</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Open Account, then Change Password. Press Escape once to return to Account, and again to close it.

## Opening from a Menu Item

Render the dialog outside the menu and open it with the dialog’s controller. When the item disappears, the menu’s trigger becomes the place to return focus.

```tsx title="from-menu.tsx"
"use client"

import * as React from "react"
import {
  createDialogController,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { CopyIcon, EllipsisIcon, PencilIcon } from "lucide-react"

function Example() {
  const [rename] = React.useState(() => createDialogController())
  return (
    <>
      <Menu>
        <MenuTrigger aria-label="File actions">
          <EllipsisIcon aria-hidden="true" />
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={() => rename.open()}>
            <PencilIcon aria-hidden="true" />
            Rename…
          </MenuItem>
          <MenuItem>
            <CopyIcon aria-hidden="true" />
            Duplicate
          </MenuItem>
        </MenuContent>
      </Menu>
      <Dialog controller={rename}>
        <DialogBackdrop />
        <DialogContent>
          <div data-slot="stack">
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              Names must be unique in a folder.
            </DialogDescription>
          </div>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input defaultValue="report.pdf" />
          </Field>
          <div data-slot="row">
            <DialogClose>Cancel</DialogClose>
            <DialogClose data-variant="solid" value="rename">
              Rename
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { Example }
```

Open File Actions and choose Rename. Close the dialog to return focus to the File Actions button.

## Opening from Anywhere

Connect several triggers to one `createDialogController<Payload, Result>()`. Each trigger passes a `payload`; the content reads it from its state. `controller.open({ payload })` opens it from code and returns a promise that resolves when it closes, with the reason and any `returnValue`. Each trigger remains the return-focus target for the dialog it opened. See [controllers](../controllers.md) for the shared controller pattern.

```tsx title="payload.tsx"
"use client"

import * as React from "react"
import {
  createDialogController,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { useLog } from "./log"

type Invoice = {
  id: string
  customer: string
  amount: string
  status: "Paid" | "Due"
}

const invoices: Invoice[] = [
  { id: "INV-001", customer: "Acme", amount: "$250.00", status: "Paid" },
  { id: "INV-002", customer: "Globex", amount: "$150.00", status: "Due" },
  { id: "INV-003", customer: "Initech", amount: "$350.00", status: "Due" },
]

function Example() {
  const [reminder] = React.useState(() =>
    createDialogController<Invoice, "send">()
  )
  const log = useLog()

  async function remindFromCode() {
    const { reason, returnValue } = await reminder.open({
      payload: invoices[2],
    })
    log(
      returnValue === "send" ? "Reminder sent from code" : `Closed (${reason})`
    )
  }

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={remindFromCode}>
          Open from Code
        </button>
      </div>
      <ul data-slot="list">
        {invoices.map((invoice) => (
          <li data-slot="row" key={invoice.id}>
            {invoice.customer}
            <span data-slot="hint">
              {invoice.amount} · {invoice.status}
            </span>
            <DialogTrigger
              controller={reminder}
              payload={invoice}
              disabled={invoice.status === "Paid"}
              aria-label={`Remind ${invoice.customer}`}
            >
              Remind
            </DialogTrigger>
          </li>
        ))}
      </ul>
      <Dialog
        controller={reminder}
        onOpenChange={(open, details) => {
          if (!open && details.returnValue === "send") {
            log("Reminder sent")
          }
        }}
      >
        <DialogBackdrop />
        <DialogContent<Invoice>>
          {(state) => {
            const invoice = state.payload
            return (
              <>
                <div data-slot="stack">
                  <DialogTitle>Remind {invoice?.customer}</DialogTitle>
                  <DialogDescription>
                    {invoice?.id} for {invoice?.amount} is due. We'll email the
                    billing contact.
                  </DialogDescription>
                </div>
                <div data-slot="row">
                  <DialogClose>Cancel</DialogClose>
                  <DialogClose data-variant="solid" value="send">
                    Send reminder
                  </DialogClose>
                </div>
              </>
            )
          }}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Example }
```

Open a reminder from either unpaid invoice, or press Open from Code. The same dialog shows that invoice, and the console logs how it closed.

## Presentation

`presentation="sheet"` presents the same task as a sheet. Use `"auto"` to choose a sheet on small touch screens and a centered dialog elsewhere, decided each time it opens. A swipe down closes a dismissible sheet; a protected one springs back and reports a dismissal attempt.

Style `data-presentation` to support both layouts. The sheet manages its own position and movement, so do not apply the centered dialog’s translation to it. `--sheet-backdrop` styles the dimmed page when no Backdrop part is present.

```tsx title="presentation.tsx"
"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"

function Example() {
  return (
    <Dialog presentation="sheet">
      <DialogTrigger>Edit Profile</DialogTrigger>
      <DialogContent>
        <div data-slot="stack">
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Save when you're done.
          </DialogDescription>
        </div>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input defaultValue="Hollis Grant" />
        </Field>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input defaultValue="@hollis" />
        </Field>
        <div data-slot="row">
          <DialogClose>Cancel</DialogClose>
          <DialogClose data-variant="solid" value="save">
            Save Changes
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Open Edit Profile as a sheet. On a touch screen, drag it down to dismiss it, or use Cancel or Save Changes.

## Custom Rendering

Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state.

```tsx title="custom-rendering.tsx"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"

function Example() {
  return (
    <Dialog>
      <DialogTrigger
        shortcut="mod+i"
        render={(props, state) => (
          <button {...props}>
            {state.open ? "Viewing" : "View Details"}
            <DialogShortcut>{(shortcut) => shortcut.text}</DialogShortcut>
          </button>
        )}
      />
      <DialogBackdrop />
      <DialogContent>
        {(state) => (
          <>
            <div data-slot="stack">
              <DialogTitle render={<h3 />}>Details</DialogTitle>
              <DialogDescription>
                {state.nested
                  ? "Opened from another dialog."
                  : "Quarterly report, updated today."}
              </DialogDescription>
            </div>
            <div data-slot="row">
              <DialogClose>Close</DialogClose>
              <DialogClose
                data-variant="solid"
                render={<a href="https://example.com/details" />}
              >
                Open the Full Page
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { Example }
```

Open View Details. The trigger's label and the description come from their state, and Close renders as a link.

## Styling

Each part has a `data-slot`, such as `dialog-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes). Use `data-open` and `data-closed` for each state, and `data-starting-style` and `data-ending-style` for transitions.

### DialogContent
- `--dialog-stack`: How many dialogs are open above this one, nested inside it. 0 for the topmost.
- `--keyboard-inset`: Unless it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: Unless it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: Unless it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: Unless it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.
- `--drawer-progress`: While it presents as a sheet: how far open the sheet is, from 0 closed to 1 at its largest snap point. Never past 1.
- `--drawer-dim`: While it presents as a sheet: how dim the page behind is, from 0 to 1. The backdrop's opacity follows it.
- `--drawer-expand`: While it presents as a sheet: 0 at the second-largest snap point and below, 1 at the largest. With one snap point, the whole travel.
- `--drawer-stack`: While it presents as a sheet: how many sheets opened from inside this one are open above it, rising smoothly as each one opens. Push it back with it.
- `--sheet-backdrop`: Set it yourself: the color the page dims to while it presents as a sheet. Black at 0.2 by default.

### Viewport
- `--keyboard-inset`: While it presents as a sheet: how many pixels of the page the on-screen keyboard covers, 0 without one.
- `--visual-viewport-width`: While it presents as a sheet: the width of the part of the page you can see.
- `--visual-viewport-height`: While it presents as a sheet: the height of the part of the page you can see, above the keyboard.
- `--visual-viewport-top`: While it presents as a sheet: how far the part of the page you can see is scrolled from the top of the layout, as when the keyboard pushes it up.

## Data Attributes

### DialogTrigger
`[data-slot="dialog-trigger"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-disabled`: Present when the trigger is disabled.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.

### DialogBackdrop
`[data-slot="dialog-backdrop"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the dialog animates out. Style the state you animate to.

### DialogContent
`[data-slot="dialog-content"]`

- `data-closed`: Present while the dialog is closed, including while it animates out.
- `data-presentation` (`dialog`, `sheet`): How the dialog presents this time it's open.
- `data-open`: Present while the dialog is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the dialog animates out. Style the state you animate to.
- `data-keyboard`: Present while the on-screen keyboard covers part of the page.

### DialogClose
`[data-slot="dialog-close"]`

- `data-disabled`
- `data-pending`: Present on a Close part while its action runs.

## API Reference

Props and callbacks are the same as below, as React props.

### Dialog

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the dialog is open. Pass it to control the dialog.
- `defaultOpen?` (`boolean`): Whether the dialog starts open, when uncontrolled. Focus moves into it once it's on the page.
- `onOpenChangeComplete?` (`((open: boolean) => void)`): Runs once the dialog has finished opening or closing, after any animation.
- `dismissible?` (`boolean`): Whether Escape, an outside press and Android's back gesture can close the dialog. Close parts, triggers and the controller always can. Pass `false` while a form has unsaved changes, and ask in `onDismissAttempt`.
- `onDismissAttempt?` (`((details: DialogDismissAttemptDetails) => void)`): Runs when a dismissal was refused, because `dismissible` is false, an outside press doesn't close it, or a Close part's action is running. Ask "Discard changes?" here.
- `persistentElements?` (`(string | Element)[] | (() => Element[])`): Elements that stay usable while the dialog makes the page inert, like a chat launcher or a password manager's button. Elements, CSS selectors, or a function that returns elements, read when the dialog opens. Presses on them never close it.
- `pendingAnnouncement?` (`string`): What screen readers hear once a Close part's action has been running for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `onOpenChange?` (`((open: boolean, details: DialogOpenChangeDetails) => void)`): Runs when the dialog wants to open or close. `details.reason` says why, `details.cancel()` stops it, and `details.returnValue` carries what closed it.
- `onPayloadChange?` (`((payload: unknown, details: ChangeDetails<DialogPayloadChangeReason>) => void)`): Runs when the payload the content shows changes: a trigger with another payload opens the dialog, or takes a non-modal dialog over while it's open, which fires no `onOpenChange`, and so does a controller's `open({ payload })` on the open dialog. `details.cancel()` keeps the previous payload.
- `modal?` (`"trap-focus" | boolean`): `true`: the rest of the page is inert and doesn't scroll, focus is trapped, and an outside press only closes the dialog. `"trap-focus"`: traps focus, and leaves the page scrollable and clickable. `false`: a dialog beside the page, which Tab can leave and outside presses don't close.
- `closeOnOutsidePress?` (`boolean`): Whether pressing outside the dialog, like on its backdrop, closes it. The press counts once it's released outside too, so dragging a text selection out of a field doesn't close it.
- `presentation?` (`PresentationSetting<"dialog">`): How the dialog presents. `"sheet"` slides it up from the bottom of the screen, where it can be swiped away, and `"auto"` does that on small touch screens. Decided each time it opens; the server renders `"dialog"` for `"auto"`.
- `controller?` (`PopupController<any, DialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Opens, closes and inspects the dialog from anywhere, and connects triggers outside it. Create one with `createDialogController()`.

### DialogTrigger

A trigger outside the dialog also takes `controller`.

- `disabled?` (`boolean`): Stops the trigger from opening the dialog. A native button can't be focused or pressed, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled trigger in the tab order with `aria-disabled` instead of the native attribute, so it can host a tooltip that says why. Presses still do nothing.
- `payload?` (`unknown`): Data for the content to render when this trigger opens the dialog, like the row it belongs to.
- `shortcut?` (`string`): A keyboard shortcut that presses the trigger, like `"mod+k"`. `mod` is Command on Apple platforms and Control elsewhere. Sets `aria-keyshortcuts`, and a Shortcut part inside shows it. A modal dialog pauses the page's shortcuts while it's open.
- `controller?` (`PopupController<any, DialogOpenChangeReason, {}, any, DialogPayloadChangeReason>`): Connects a trigger outside the dialog, like one per table row, to the dialog with this controller.

### DialogBackdrop

Dims the page behind a modal dialog. Renders a `div`.

### DialogContent

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `initialFocus?` (`DialogInitialFocus`): Where focus goes when the dialog opens. Opening with touch focuses the dialog itself, so no on-screen keyboard appears.
- `finalFocus?` (`PopupFocusTarget`): Where focus goes when the dialog closes while focus is inside it.
- `keepMounted?` (`boolean`): Whether the dialog stays in the page, hidden, while closed. Its content keeps its state between opens.
- `inline?` (`boolean`): Renders the dialog and its backdrop where they are in the page instead of above it, so it can stay inside a frame, like an app preview. Pair it with `modal="trap-focus"` to keep the rest of the page usable. A `container` on the dialog still moves its backdrop, so leave it off.

### DialogTitle

Names the dialog. Renders an `h2`.

### DialogDescription

Describes the dialog while it's rendered. Renders a `p`.

### DialogClose

Its `action` receives the event and `{ source }`, how the part was pressed, as [Button](./button.md#changes-after-an-await) describes.

- `value?` (`string`): Reported as `returnValue` in `onOpenChange` and by the controller's `open()`. `createConfirm()` resolves `true` for `"confirm"`.
- `action?` (`((event: Event | undefined, details: ActionDetails) => unknown)`): Runs when the part is pressed, before the dialog closes. A returned Promise keeps the dialog open while it runs: the part gets `data-pending`, `aria-busy` and `aria-disabled`, screen readers hear the dialog's `pendingAnnouncement` after a second, and nothing but the controller closes the dialog. It closes with reason `"action"` once the Promise resolves. A rejection keeps it open and puts the reason in the part's `error` state until the next press, or until the dialog opens again. `details.source` says how the part was pressed, for changes made after an `await`.

### DialogShortcut

- `shortcut?` (`string`): The keys to show. Inside a trigger, its `shortcut`.

### State

What render functions, state-based class names and slots receive, per part.

`DialogTrigger`:

- `open` (`boolean`): Whether the dialog is open from this trigger.
- `disabled` (`boolean`): Set by the trigger's `disabled` prop, which stops it opening the dialog.

`DialogBackdrop`:

- `open` (`boolean`): Whether the dialog is open. False while it animates out.
- `nested` (`boolean`): Whether the dialog was opened from inside another dialog.
- `nestedOpen` (`boolean`): Whether a dialog opened from inside this one is open.

`DialogContent`:

- `open` (`boolean`): Whether the dialog is open. False while it animates out.
- `modal` (`boolean | "trap-focus"`): The `modal` setting. Always true for an alert dialog.
- `nested` (`boolean`): Whether the dialog was opened from inside another dialog.
- `nestedOpen` (`boolean`): Whether a dialog opened from inside this one is open.
- `stack` (`number`): How many dialogs are open above this one, nested inside it.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.
- `pending` (`boolean`): Whether a Close part's action is running.
- `presentation` (`"dialog" | "sheet"`): How it presents this time it's open.

`DialogClose`:

- `pending` (`boolean`): Whether this part's action is running.
- `error` (`unknown`): Why this part's last action failed, until it's pressed again or the dialog opens again.

`DialogShortcut`:

- `text` (`string`): The shortcut formatted for this platform: `⌘K` on Apple platforms and `Ctrl+K` elsewhere. Empty without one.

### Reasons

`details.reason` says why the dialog opened or closed.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `parent-close` (`none`): The parent layer closed.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `action` (`MouseEvent | KeyboardEvent`): A Close part's `action` finished.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a payload change, it says what opened the dialog or took it over.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `shortcut` (`KeyboardEvent`): A keyboard shortcut, like a trigger's `shortcut`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

The dismissals `dismissible` can refuse:

- `outside-press` (`MouseEvent`): A press outside the layer.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

### Controller

Create one with `createDialogController<Payload, Result>()` and pass it as `controller`, to the dialog and to any
triggers outside it.

Every write method takes an optional `{ reason, event }`, passed to `onOpenChange`. Closing with a controller always works, even when the dialog isn't dismissible or an action is running.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<DialogOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<DialogPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<DialogOpenChangeReason> & { returnValue?: Result | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<DialogOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.

### Events

Callbacks get the new state first, then the details.

| Prop                   | On       | Receives                                                                       |
| ---------------------- | -------- | ------------------------------------------------------------------------------ |
| `onOpenChange`         | `Dialog` | `(open, details)`: the new state, the [reason](#reasons) and any `returnValue` |
| `onOpenChangeComplete` | `Dialog` | `(open)`, after the animation                                                  |
| `onPayloadChange`      | `Dialog` | `(payload, details)`: the content's new payload, and the [reason](#reasons)    |
| `onDismissAttempt`     | `Dialog` | `({ reason, event })`, when a dismissal was refused                            |

## Accessibility

The trigger is a button that opens a dialog, and the dialog follows the [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): `aria-modal` while it's modal, labelled by its title, described by its description only while one is rendered. Every line below is an automated test.

### Keyboard

| Key                  | Does                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| Enter, Space         | On the trigger, opens the dialog                                     |
| Tab, Shift+Tab       | Moves through the dialog's controls, staying inside while it's modal |
| Escape               | Closes the topmost dialog and returns focus to its trigger           |
| A trigger's shortcut | Opens its dialog from anywhere on the page                           |

### Tested Behavior

**Trigger**

- Advertises a dialog.
- Click opens the dialog.
- Enter opens the dialog.
- Space opens the dialog.

**Focus**

- Opening moves focus to the first focusable element.
- Each time focus moves in, the dialog is named by its title and described by its description.
- Tab moves through the dialog in order.
- Tab from the last element wraps to the first.
- Tab keeps focus inside where the browser's Tab skips the buttons.
- Shift+Tab from the first element wraps to the last.
- … from inside an iframe that is the … element wraps around the dialog.
- Shift+Tab from the first element wraps to the checked radio of a group outside a form.
- Tab reaches radios whose group's checked radio is behind the dialog.
- Tab visits a positive tabindex first, like the browser.
- A positive tabindex keeps Tab inside a dialog that leaves the page usable.
- A positive tabindex slotted into a custom element keeps its host's place.
- With a positive tabindex in the dialog, Tab still moves through a shadow root and slots.
- With a positive tabindex in the dialog, Tab from a focused element outside the tab order goes to the next stop.
- Tab from a custom element with a positive tabindex enters its shadow root.
- Tab from a last control inside a shadow root wraps to the first, and Shift+Tab comes back to it.
- Tab wraps past a shadow root that Tab skips, under an inert or tabindex -1 host.
- Tab wraps from the last stop of a shadow root that orders a positive tabindex first.
- Opening focuses the first field even when a later one has a positive tabindex.
- Escape closes the dialog and returns focus to the trigger.
- An ancestor hears Escape already handled.
- Escape after a click returns focus to the trigger.
- The close button closes the dialog and returns focus to the trigger.
- A virtual click from a screen reader moves focus into the dialog.
- A touch press focuses the dialog itself, so no on-screen keyboard appears.
- Pressing a button inside keeps the dialog open.

**Dismissal**

- Pressing the backdrop closes the dialog.
- Pressing the backdrop returns focus to the trigger.
- After pressing the backdrop, Space on the trigger opens it again.
- Clicking inside the dialog keeps it open.
- An outside press doesn't reach the page.

**Presses**

- Selecting text in a field and releasing over the backdrop keeps the dialog open.
- Pressing the backdrop and releasing inside the dialog keeps it open.
- A right click on the backdrop keeps the dialog open.
- A dialog styled only with ::backdrop closes when the backdrop is pressed.
- With closeOnOutsidePress false, pressing the backdrop keeps the dialog open.
- Pressing a nested dialog's backdrop closes only the nested dialog.
- While the dialog animates out, a press on its backdrop doesn't reach the page.
- Escape right after opening a nested dialog closes only the nested one.

**Modal**

- Tab never leaves the dialog.
- The page doesn't scroll while the dialog is open.
- The rest of the page is hidden from assistive technology.
- With modal false, the page stays usable.

**Nested dialogs**

- Escape closes only the nested dialog and returns focus to its trigger.
- The nested dialog's close button closes only it.
- The outer dialog's open change hears only the outer dialog.
- Tab stays inside the nested dialog.
- A second Escape closes the outer dialog.

Runs in React, Vue and web components.

Additional behaviors:

**Escape that closes exactly one thing**

- Escape while an input method is composing text keeps the dialog open.
- Escape closes a non-modal dialog only while focus is inside it.

**Focus that always lands somewhere useful**

- Closing returns focus to the trigger before the exit animation finishes.
- Closing after the trigger is gone moves focus to the element after where it was.
- Closing after the trigger is gone skips past a later positive tabindex.
- A dialog open from the start moves focus inside.
- With initial focus on the content, the dialog itself takes focus.

**The outside is inert, except what must stay live**

- The page outside is inert while open and restored exactly after.
- A live region outside the dialog keeps announcing while it's open.

**Non-modal dialogs that behave like the APG**

- Tab leaves a non-modal dialog and the dialog stays open.
- A non-modal dialog stays open when the page is clicked.

**Nested and stacked**

- A dialog opened inside a dialog marks both, for styling.
- Closing the parent closes the nested dialog with reason parent-close.

**Opening from anywhere**

- A controller opens the dialog, moves focus in, and resolves with how it closed.
- Aborting the signal closes the dialog, and the promise resolves once.
- A pending open() resolves with reason unmount when the dialog leaves the page. Web components only.
- A form with method dialog closes the dialog and reports the submitter's value.
- A confirm helper resolves true for the action and false otherwise.
- A confirm opened from inside a modal dialog takes focus and stays usable.
- A confirm opened over a modal dialog with nothing focused stays usable.
- A confirm opened as a modal dialog shows, before the page freezes, stays usable.
- Closing reports why, for every way a dialog closes.

**Shortcuts**

- A trigger connected through a controller shows its shortcut in a Shortcut part, and binds it.

**Web components**

- The open property and attribute open and close the dialog. Web components only.

Runs in React, Vue and web components.

**Opening a dialog from a menu item**

- Choosing the item closes the menu and moves focus into the dialog.
- Choosing the item with the keyboard moves focus into the dialog.

**The page and focus around a dialog opened from a menu item**

- The page around the dialog is inert, the menu's trigger included.
- Closing the dialog returns focus to the menu's trigger.
- A dialog the item opens through its open prop returns focus to the menu's trigger. React and Vue only.

**Shortcuts**

- A trigger's shortcut opens the dialog.
- The trigger advertises its shortcut, and shows it to sighted users only.
- A modal dialog pauses the page's shortcuts and keeps its own.
- A dialog's own shortcut doesn't run while the dialog is closed.
- Menu and popover triggers take shortcuts too.
- Plain keys typed in a text field are text, and modifier shortcuts still run.
- A plain-key shortcut runs outside text fields.

**A dirty form**

- Refuses Escape and outside presses, and reports each attempt.
- A clean form closes on Escape.

**Persistent elements**

- Stay usable while a modal dialog is open, and pressing them keeps it open.

**Async actions**

- Keep the alert dialog open and pending, then close with reason action.
- A failed action keeps the alert dialog open and stops pending.

**Popups inside a portaled popover**

- A menu and a dialog inside it render into the popover's container.

**Android's back gesture**

- Closes the topmost dialog with reason back.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the dialog with a keyboard.
- Announcements while using the alert dialog with a keyboard.

Runs in React, Vue and web components.
