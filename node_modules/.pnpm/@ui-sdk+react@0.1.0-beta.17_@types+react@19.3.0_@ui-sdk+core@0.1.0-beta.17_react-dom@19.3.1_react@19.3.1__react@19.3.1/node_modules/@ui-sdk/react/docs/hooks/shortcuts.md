# Shortcuts

Register keyboard shortcuts and show the right keys for the user's platform.

`useShortcut` registers a keyboard shortcut while your component is mounted. Use it for actions outside a particular control. For a component that already accepts `shortcut`, such as a dialog trigger, use that prop directly.

```tsx title="basic.tsx"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import * as React from "react"

export function Example() {
  const [status, setStatus] = React.useState("Press N or the keys to save.")
  const newNote = () => setStatus("Note created")
  const save = () => setStatus("Saved")

  useShortcut("n", newNote, { description: "New note" })
  useShortcut("mod+s", save, { description: "Save" })
  const saveHint = useShortcutHint("mod+s")

  return (
    <div data-slot="stack">
      <div data-slot="row">
        <button type="button" onClick={newNote} aria-keyshortcuts="N">
          New note
          <kbd aria-hidden="true" data-slot="kbd">
            N
          </kbd>
        </button>
        <button
          type="button"
          onClick={save}
          aria-keyshortcuts={saveHint.ariaKeyshortcuts}
        >
          Save
          <kbd aria-hidden="true" data-slot="kbd">
            {saveHint.text}
          </kbd>
        </button>
      </div>
      <output data-slot="output">{status}</output>
    </div>
  )
}
```

Press N to create a note. Press Command+S on Mac or Control+S elsewhere to save. The buttons run the same actions.

## Register a Shortcut

Keys are joined with `+`. `mod` means Command on Apple platforms and Control elsewhere:

```tsx
"use client"

import { useShortcut } from "@ui-sdk/react/shortcuts"
import { useState } from "react"

function NewNote() {
  const [count, setCount] = useState(0)
  const addNote = () => setCount((count) => count + 1)
  useShortcut("mod+enter", addNote, { description: "New note" })

  return <button onClick={addNote}>New note ({count})</button>
}

export { NewNote }
```

The hook uses your latest handler and unregisters on unmount. You don't need `useCallback`. Pass `null` instead of keys to leave a shortcut unregistered.

## Show the Keys

`useShortcutHint` formats keys for the current platform and supplies `aria-keyshortcuts` for the control:

```tsx
"use client"

import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"

function SaveButton({ onSave }: { onSave: () => void }) {
  useShortcut("mod+s", onSave, { description: "Save" })
  const hint = useShortcutHint("mod+s")

  return (
    <button onClick={onSave} aria-keyshortcuts={hint.ariaKeyshortcuts}>
      Save <kbd aria-hidden="true">{hint.text}</kbd>
    </button>
  )
}

export { SaveButton }
```

This shows `⌘S` on Apple platforms and `Ctrl+S` elsewhere. The hook keeps the server and first client render consistent, then updates after mount.

Outside rendering, use `formatShortcut` for display text or `ariaKeyshortcuts` for the ARIA value. Both are exported from the same entry. The hint's text and `formatShortcut` both keep their left-to-right order on a right-to-left page, because two invisible characters wrap the text. Compare the original keys, not the formatted hint.

## While Someone Is Typing

Shortcuts with Command, Control, or Option can run in a text field. Plain letters and other keys stay available for typing.

Set `allowInInput: true` when the shortcut should work there too, such as Escape to clear a search. `when` checks a condition each time the keys are pressed; it can keep a Save shortcut inactive until there's text. A shortcut runs once per press. Set `repeat: true` to keep it running while the keys are held, like `j` moving down a list.

```tsx title="scope.tsx"
import { shortcuts, useShortcut } from "@ui-sdk/react/shortcuts"
import * as React from "react"

export function Example() {
  const [text, setText] = React.useState("")
  const [status, setStatus] = React.useState(
    "Focus the note to turn on its shortcuts."
  )

  useShortcut(
    "mod+enter",
    () => setStatus(`Characters saved: ${text.trim().length}`),
    {
      scope: "note",
      when: () => text.trim() !== "",
      description: "Save the note",
    }
  )
  useShortcut(
    "escape",
    () => {
      setText("")
      setStatus("Cleared")
    },
    { scope: "note", allowInInput: true, description: "Clear the note" }
  )

  return (
    <div data-slot="stack">
      <textarea
        aria-label="Note"
        placeholder="Write a note…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onFocus={() => shortcuts.setScope("note", true)}
        onBlur={() => shortcuts.setScope("note", false)}
      />
      <output data-slot="output">{status}</output>
    </div>
  )
}
```

Focus the note and type some text. Press Command+Enter on Mac or Control+Enter elsewhere to save it, or Escape to clear it. Move focus outside the note to turn off its shortcuts.

## Limit a Shortcut to an Area

Use a named `scope` for an editor or another part of the app. Turn it on while that area has focus:

```tsx
"use client"

import { shortcuts, useShortcut } from "@ui-sdk/react/shortcuts"
import { useEffect, useState } from "react"

function Note() {
  const [text, setText] = useState("")
  useEffect(() => () => shortcuts.setScope("note", false), [])
  useShortcut("escape", () => setText(""), {
    scope: "note",
    allowInInput: true,
  })

  return (
    <textarea
      aria-label="Note"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onFocus={() => shortcuts.setScope("note", true)}
      onBlur={() => shortcuts.setScope("note", false)}
    />
  )
}

export { Note }
```

A `when: () => text.length > 0` option can further limit when it runs. Scope names are shared, so choose one for each area you want to enable together.

## Inside a Popup

Page shortcuts pause while a modal is open. Pass `layer` to make a shortcut belong to a popup instead:

```tsx
"use client"

import { DialogContent } from "@ui-sdk/react/dialog"
import { useShortcut } from "@ui-sdk/react/shortcuts"
import { useRef } from "react"

function EditorContent({ onSave }: { onSave: () => void }) {
  const content = useRef<HTMLDivElement>(null)
  useShortcut("mod+enter", onSave, { layer: content, description: "Save" })

  return <DialogContent ref={content}>Edit your note here.</DialogContent>
}

export { EditorContent }
```

Render this part inside a Dialog. Its shortcut runs only while that dialog is open. `layer` also accepts an element or a function that returns one.

When shortcuts share the same keys, the topmost open layer wins, then the most recently registered shortcut. Development builds warn about duplicate keys in the same place.

## List Available Shortcuts

Call `shortcuts.list()` when a help screen opens. It returns the shortcuts that can run now, with their `keys`, formatted `hint`, and `description`:

```ts
import { shortcuts } from "@ui-sdk/react/shortcuts"

const labels = shortcuts
  .list()
  .map(({ hint, description }) => `${hint} ${description ?? ""}`)
```

Add descriptions when registering shortcuts so the help screen can explain each action.
