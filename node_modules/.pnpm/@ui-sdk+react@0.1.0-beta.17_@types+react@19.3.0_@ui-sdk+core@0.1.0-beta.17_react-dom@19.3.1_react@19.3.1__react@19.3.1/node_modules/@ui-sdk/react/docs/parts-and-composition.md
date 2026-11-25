# Parts and Composition

Put a component's parts together and choose what each one renders.

A component can have several parts. A Popover has a root to hold its state, a trigger to open it, and content to show.

## Put Parts Together

Import the parts you need and nest them as shown in the component's Composition:

```tsx
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover"

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Details</PopoverTrigger>
      <PopoverContent sideOffset={8}>
        <PopoverTitle>Project Details</PopoverTitle>
        <p>Last updated today.</p>
        <PopoverClose>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  )
}

export { Example }
```

`Popover` shares state with its parts without adding an element. Other roots, such as `Tabs`, do render an element. Each component's page shows its structure.

Parts find their root through React context. You can put your own components or layout elements between them.

## Choose the Element

Use `render` to replace a part's default element. For example, render a menu item as a link:

```tsx
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"

function Example() {
  return (
    <Menu>
      <MenuTrigger>Account</MenuTrigger>
      <MenuContent>
        <MenuItem render={<a href="/settings" />}>Settings</MenuItem>
      </MenuContent>
    </Menu>
  )
}

export { Example }
```

The part passes its attributes, handlers, and ref to the element. A custom component used here needs to forward those props and the ref to its DOM element.

Your event handler runs first. Calling `event.preventDefault()` skips the part's built-in handler. Class names, styles, and refs combine.

## Read the State

Pass a function to `children` when the content depends on state:

```tsx
"use client"

import { Toggle } from "@ui-sdk/react/toggle"

function Example() {
  return (
    <Toggle aria-label="Mute">
      {(state) => (state.pressed ? "Mute on" : "Mute off")}
    </Toggle>
  )
}

export { Example }
```

Keep the accessible name stable when the content changes. Here, `aria-label="Mute"` names the toggle and `aria-pressed` reports its state.

`render` can also be a function of the props and state. [Custom Parts](./custom-parts.md) covers writing a part with logic of its own.

## Name the Control

Use the component's label or title part, such as `FieldLabel` or `DialogTitle`. For a control without visible text, give it an `aria-label`.

Parts manage their own roles, IDs, and ARIA state. Those attributes take precedence over conflicting props passed directly to the part. Props on the element passed to `render` can override them, so leave the managed attributes intact. If you use a render function, forward the supplied props to its element. A name or typing hint you pass replaces the part's own: `aria-label`, `aria-labelledby`, `aria-description`, `title`, `autoComplete`, `autoCapitalize`, `autoCorrect`, `inputMode` and `spellCheck`. Roles, `tabindex`, references like `aria-controls` and `aria-describedby`, state attributes and `data-slot` stay the part's, since its behavior reads them.
