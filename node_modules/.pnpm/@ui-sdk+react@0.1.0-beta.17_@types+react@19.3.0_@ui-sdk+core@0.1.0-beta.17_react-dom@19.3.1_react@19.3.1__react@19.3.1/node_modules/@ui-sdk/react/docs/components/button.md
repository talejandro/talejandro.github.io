# Button

Run an action, show that it's working, and keep it reachable when disabled.

Button renders a native `button` and adds what it doesn't do on its own: it stays pending while an async action runs, so a form can't submit twice, announces slow actions to screen readers, can stay focusable while disabled, and keeps the same behavior when it renders a link. For a plain click handler, a native `button` is enough.

```tsx title="basic.tsx"
import { Button } from "@ui-sdk/react/button"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return <Button onClick={() => log("Pressed")}>Button</Button>
}

export { Example }
```

Click Button, or focus it and press Enter or Space. The console logs each press.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Usage

Use `onClick` to run an action. Button renders a native `<button>` with `type="button"` by default.

```tsx
import { Button } from "@ui-sdk/react/button"

;<Button onClick={() => save()}>Save</Button>
```

## Pending

Return a Promise from `onClick` to keep the button pending until it settles. The button keeps focus and ignores further presses while it waits.

```tsx
<Button
  onClick={() => new Promise((resolve) => setTimeout(resolve, 1500))}
  pendingAnnouncement="Saving"
>
  Save
</Button>
```

After one second, it announces "Loading" to screen readers. Set `pendingAnnouncement` to change that message, as above, or use an empty string to silence it.

```tsx title="pending.tsx"
"use client"

import { Button } from "@ui-sdk/react/button"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Example() {
  return (
    <Button onClick={() => wait(1500)} pendingAnnouncement="Saving">
      Save
    </Button>
  )
}

export { Example }
```

Press Save, then press it again while it saves. Nothing happens until the first action finishes.

## Pending Content

To change what the button shows while it waits, mark content with `data-show="idle"` or `data-show="pending"` and hide it in the other state with one CSS rule each, or use Tailwind's `in-data-pending` variant:

```css
[data-slot="button"]:not([data-pending]) [data-show="pending"],
[data-slot="button"][data-pending] [data-show="idle"] {
  display: none;
}
```

```tsx title="pending-content.tsx"
"use client"

import { Button } from "@ui-sdk/react/button"
import { ArrowDownToLineIcon, LoaderCircleIcon } from "lucide-react"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Example() {
  return (
    <Button onClick={() => wait(1500)} pendingAnnouncement="Saving">
      <ArrowDownToLineIcon data-show="idle" aria-hidden="true" />
      <LoaderCircleIcon data-show="pending" data-slot="spinner" aria-hidden="true" />
      Save
    </Button>
  )
}

export { Example }
```

Press Save. Its arrow turns into a spinner while it saves.

Keep the label and change only the visual, as above. If the text has to change too, swap it the same way, without an `aria-label`. [Pending Buttons](#pending-buttons) explains why:

```tsx
<Button onClick={save}>
  <span data-show="idle">Save</span>
  <span data-show="pending">Saving…</span>
</Button>
```

## Handling Errors

If the handler throws or its Promise rejects, `state.error` holds the error. Use it to show a message or a retry label. The next press clears the error and runs the handler again.

The demo uses a [render function](../parts-and-composition.md#read-the-state) to show the error beside the button.

```tsx title="render.tsx"
"use client"

import { Button } from "@ui-sdk/react/button"
import { useLog } from "./log"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <Button
        onClick={async () => {
          await wait(1000)
          log("Couldn't save. Check your connection and try again.")
          throw new Error("Couldn't save")
        }}
        render={(props, state) => (
          <button {...props}>
            {state.pending
              ? "Saving…"
              : state.error
                ? "Try Again"
                : "Save Changes"}
          </button>
        )}
      />
    </div>
  )
}

export { Example }
```

Choose Save Changes. Saving always fails here: the console shows the error and the label changes to Try Again.

## Changes After an Await

`onClick` receives the event and `{ source }`, which says how the button was pressed. If the handler changes another ui-sdk component after an `await`, wrap that change in `withSource` to keep the original source. Otherwise, the later change is reported as `"programmatic"`.

Here `save()` is your request and `status` is an Input's [controller](../controllers.md):

```tsx
"use client"

import { Button } from "@ui-sdk/react/button"
import { withSource } from "@ui-sdk/react/observe"

function SaveButton() {
  return (
    <Button
      onClick={async (event, { source }) => {
        await save()
        withSource(source, () => status.setValue("Saved"))
      }}
    >
      Save
    </Button>
  )
}

export { SaveButton }
```

[Observe](../core.md#keep-the-source-after-an-await) explains source tracking. Preserving `"agent"` lets [`undoSource("agent")`](../agents.md#undo-the-agents-changes) include that later change.

## Disabled

Set `disabled` to prevent presses and remove the button from the tab order. A disabled `<fieldset>` around the button disables it too.

```tsx
<Button disabled>Disabled</Button>
```

```tsx title="disabled.tsx"
import { Button } from "@ui-sdk/react/button"

function Example() {
  return <Button disabled>Disabled</Button>
}

export { Example }
```

Try clicking the button. It does nothing, and Tab skips it.

## Focusable When Disabled

Add `focusableWhenDisabled` when people should still be able to focus a disabled button. It uses `aria-disabled` instead of the native `disabled` attribute. Presses still do nothing.

Use `aria-describedby` to explain why the action is unavailable:

```tsx
<Button disabled focusableWhenDisabled aria-describedby="publish-hint">
  Publish
</Button>
<p id="publish-hint">Add a title to publish.</p>
```

```tsx title="focusable-when-disabled.tsx"
"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { useLog } from "./log"

function Example() {
  const log = useLog()
  const [title, setTitle] = React.useState("")
  const hint = React.useId()
  const ready = title.trim() !== ""

  return (
    <div data-slot="stack">
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input value={title} onValueChange={(value) => setTitle(value)} />
      </Field>
      <div data-slot="row">
        <Button
          disabled={!ready}
          focusableWhenDisabled
          aria-describedby={hint}
          onClick={() => log(`Published “${title}”`)}
        >
          Publish
        </Button>
        <p id={hint} data-slot="hint">
          {ready ? "Ready to publish." : "Add a title to publish."}
        </p>
      </div>
    </div>
  )
}

export { Example }
```

Focus Title, then press Tab to reach Publish while it is disabled. Enter a title to enable it, then choose Publish. The console logs what was published.

## Links

Pass an `<a>` to `render` to make a link. It keeps its `href` and link semantics, including opening in a new tab. A disabled link cannot navigate and leaves the tab order.

```tsx
<Button render={<a href="/docs/react" />}>Get started</Button>
```

A router's link works the same way, like Next.js's `Link`. The button's click runs first and stops the router when the button is disabled or pending.

```tsx
<Button render={<Link href="/settings" />}>Settings</Button>
```

```tsx title="link.tsx"
import { Button } from "@ui-sdk/react/button"

function Example() {
  return (
    <div data-slot="row">
      <Button render={<a href="#installation" />}>Get Started</Button>
      <Button disabled render={<a href="#changelog" />}>
        Changelog
      </Button>
    </div>
  )
}

export { Example }
```

Choose Get Started to jump to Installation on this page. Changelog is disabled and does not navigate.

For your own components, see [Parts and Composition](../parts-and-composition.md).

## Forms

Set `type="submit"` to submit a form or `type="reset"` to restore its default values. The default, `type="button"`, does neither.

```tsx
<Button type="submit">Subscribe</Button>
<Button type="reset">Reset</Button>
```

```tsx title="form.tsx"
"use client"

import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Button } from "@ui-sdk/react/button"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const email = String(new FormData(event.currentTarget).get("email"))
        log(`Subscribed ${email}`)
      }}
    >
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input name="email" type="email" defaultValue="ada@example.com" />
      </Field>
      <div data-slot="row">
        <Button type="submit">Subscribe</Button>
        <Button type="reset">Reset</Button>
      </div>
    </form>
  )
}

export { Example }
```

Edit the email and choose Subscribe, or press Enter in the field. The console logs each submission, and Reset restores the original email.

Button tracks the Promise returned by its own `onClick`, not one from the form’s submit handler. For an async submit handler, keep your own pending flag and set `disabled` on the button while it runs, with [`focusableWhenDisabled`](#focusable-when-disabled) so the button keeps focus while it waits.

## Styling

Use `data-pending` to show a spinner or waiting cursor, and `data-disabled` to style an unavailable action. The button's `data-slot` is `button`, and its attributes are listed under [Data Attributes](#data-attributes).

[Styling and Animation](../styling-and-animation.md) covers the styling patterns shared by all components.

## Data Attributes

### Button
`[data-slot="button"]`

- `data-pending`: Present while the Promise its press handler returned is running.
- `data-disabled`: Present when disabled.

## API Reference

Button accepts native button props and the options below. `render`, `children`, `className` and `style` can read the button's state; see [Parts and Composition](../parts-and-composition.md).

### Button

- `disabled?` (`boolean`): Stops presses. The button is natively disabled, so it leaves the tab order and its form doesn't submit through it, unless `focusableWhenDisabled` is set.
- `focusableWhenDisabled?` (`boolean`): Keeps a disabled button in the tab order with `aria-disabled` instead of the native attribute, so it can hold focus while it becomes disabled and host a tooltip that says why. Presses still do nothing.
- `type?` (`"button" | "reset" | "submit"`): What a native button does in a form: `"submit"` submits it and `"reset"` resets it. Ignored when the button renders as something else.
- `pendingAnnouncement?` (`string`): What screen readers hear once the button has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### State

- `disabled` (`boolean`): Whether it's disabled, by the `disabled` option or a disabled fieldset around it. A running press shows in `pending` instead.
- `pending` (`boolean`): Whether the Promise the last press returned is still running. Presses do nothing meanwhile.
- `error` (`unknown`): Why the last press failed: what its handler threw, or its Promise rejected with. Cleared by the next press.

### Events

| Prop      | Receives                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `onClick` | React's click event and `{ source }`, how the button was pressed. Return a Promise to keep the button pending until it settles. |

## Accessibility

Give the button a clear text label. If it contains only an icon, add an `aria-label`. Native buttons respond to Enter and Space; links respond to Enter.

### Pending Buttons

While its action runs, the button tells assistive technology it's busy, so you don't need to add anything:

- It sets `aria-busy="true"` and `aria-disabled="true"`, and ignores presses until the action settles. It keeps focus the whole time.
- After a second, it announces `pendingAnnouncement` ("Loading" by default) through a polite live region. Quick actions stay silent. This is a status message: people hear it without focus moving.

To show progress, keep the label and change only the visual, like a spinner. Changing the text renames the button while it has focus: screen readers don't reliably announce a new name on the focused element, so the change mostly helps sighted users, and the button's width shifts as the text changes length. The announcement already tells everyone it's working.

```tsx title="Do"
<Button onClick={save} pendingAnnouncement="Saving">
  <ArrowDownToLineIcon data-show="idle" aria-hidden="true" />
  <LoaderCircleIcon data-show="pending" aria-hidden="true" />
  Save
</Button>
```

```tsx title="Don't"
<Button onClick={save} aria-label="Save">
  {saving ? "Saving…" : "Save"}
  <span aria-live="polite">{saving ? "Saving" : ""}</span>
</Button>
```

The second button tracks `saving` itself, shows text its accessible name doesn't contain, and announces the same state twice. If the text has to change anyway, swap it with `data-show` and leave out `aria-label`, so the button's name always contains the text on screen. See [Pending Content](#pending-content) for the markup.

References:

- [WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
- [WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI-ARIA `aria-busy`](https://www.w3.org/TR/wai-aria-1.2/#aria-busy) and [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled)

### Tested Behavior

The following behaviors are covered by automated tests:

- Clicking a button runs its handler.
- Space presses a focused button.
- Enter presses a focused button.
- A submit button submits its form.
- A reset button resets its form.
- A disabled button can't be focused or pressed.
- A button rendered as a link stays a link.

**Focusable when disabled**

- It stays focusable and says it's disabled.
- Tab reaches it.
- Clicking it runs nothing and submits nothing.
- Space on it runs nothing and submits nothing.
- Enter on it runs nothing and submits nothing.

**Pending**

- A returned Promise makes it busy, and it keeps focus until the Promise settles.
- While pending, it says it's unavailable with aria-disabled and keeps focus.
- Still pending after a second, it tells screen readers it's loading.
- A rejected Promise ends the pending state.

Runs in React, Vue and web components.
