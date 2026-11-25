# Controllers

Read and change a component from outside its parts.

A controller connects code to a mounted component. Use one when the button or action that changes a component lives somewhere else.

## Connect a Controller

Create the controller once and pass it to the root:

```tsx
"use client"

import { createToggleController, Toggle } from "@ui-sdk/react/toggle"
import { useState } from "react"

function Example() {
  const [toggle] = useState(() => createToggleController())

  return (
    <>
      <button onClick={() => toggle.toggle()}>Toggle Bold</button>
      <Toggle controller={toggle}>Bold</Toggle>
    </>
  )
}

export { Example }
```

Controller methods go through the component's change callbacks. They follow the same controlled state and cancellation rules as user input.

Each component lists the methods it supports, such as `open()`, `close()`, `setValue()`, or `focus()`. Methods that change state accept an optional reason for the callback.

A read like `toggle.isPressed()` answers when you call it, so call it from an event handler or async code. It returns `undefined` until the component mounts, and a render doesn't update when the state changes. To render the state, keep it in state with `pressed` and `onPressedChange`.

## Share a Popup

A trigger outside a popup can use its controller. Pass a `payload` to tell the content which item was opened:

```tsx
"use client"

import {
  createPopoverController,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"
import { useState } from "react"

function Example() {
  const [editor] = useState(() => createPopoverController<string>())

  return (
    <>
      <PopoverTrigger controller={editor} payload="Notes">
        Edit Notes
      </PopoverTrigger>
      <PopoverTrigger controller={editor} payload="Tasks">
        Edit Tasks
      </PopoverTrigger>
      <Popover controller={editor}>
        <PopoverContent>
          {(state) => (
            <PopoverTitle>Edit {String(state.payload ?? "")}</PopoverTitle>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}

export { Example }
```

Both triggers open the same popover. This is useful for a table with an edit button on each row.

## Wait for a Popup to Close

A popup controller's `open()` returns a promise. It settles when the popup closes, with its reason and return value:

```ts
const result = await editor.open({ payload: "Notes" })
console.log(result.reason, result.returnValue)
```

For a confirmation dialog, [Alert Dialog](./components/alert-dialog.md) provides `createConfirm()`, which gives you a function you can await.
