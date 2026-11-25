# State and Events

Set an initial value, control it from React, and respond to changes.

Components manage their own state unless you pass a controlled value. A change callback lets you respond in either case.

## Set the Starting Value

Use a default prop to choose the starting state. Here, Bold starts pressed and changes when you click it:

```tsx
import { Toggle } from "@ui-sdk/react/toggle"

function Example() {
  return <Toggle defaultPressed>Bold</Toggle>
}

export { Example }
```

The prop depends on the component: `defaultPressed`, `defaultChecked`, `defaultOpen`, or `defaultValue`.

## Control the Value

Pass the value and its change callback to keep it in React state:

```tsx
"use client"

import { Toggle } from "@ui-sdk/react/toggle"
import { useState } from "react"

function Example() {
  const [pressed, setPressed] = useState(false)

  return (
    <>
      <Toggle pressed={pressed} onPressedChange={setPressed}>
        Bold
      </Toggle>
      <output>{pressed ? "On" : "Off"}</output>
    </>
  )
}

export { Example }
```

Other components use pairs such as `open` and `onOpenChange`, or `value` and `onValueChange`. The component requests the next value; your callback updates the state you pass back. If you keep passing `false`, the toggle stays off.

To keep a value in the URL, still update your state in the callback, then navigate. A value that changes only when the navigation finishes leaves the component showing the old one until then, and logs a warning in development.

## Understand a Change

The first callback argument is the requested value. The second, `details`, tells you where the request came from and lets you cancel it:

| Detail     | What It Tells You                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `reason`   | What requested the change, such as `trigger-press` or `escape-key`. Each component lists its reasons. |
| `event`    | The DOM event, when the change came from one.                                                         |
| `source`   | `keyboard`, `mouse`, `touch`, `pen`, `virtual`, `programmatic`, or `agent`.                           |
| `cancel()` | Stops the requested change.                                                                           |

For example, keep a popover open when someone clicks outside it:

```tsx
"use client"

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <Popover
      onOpenChange={(open, details) => {
        if (!open && details.reason === "outside-press") {
          details.cancel()
        }
      }}
    >
      <PopoverTrigger>Details</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Project Details</PopoverTitle>
        <p>Last updated today.</p>
        <PopoverClose>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
```

The Done button and Escape still close the popover. Cancellation works for controlled and uncontrolled state. Add `debug` to a root to log changes and their reasons while you work.

## Empty and Multiple Values

Select, Tabs, and Radio Group report `null` when nothing is selected. A multiple Select or Combobox uses an array. Accordion and Toggle Group always use arrays.

To change a component from outside its React tree, use a [Controller](./controllers.md).
