# Popups

Place popup content, control dismissal, and choose when it stays mounted.

Popovers, menus, selects, and dialogs use the browser's top layer. They render in place, above the page, so you don't need a Portal or Positioner part. Their events bubble through the elements around them like any other child's, so a click handler or a link wrapped around a popup also gets the clicks inside it. Keep popups outside clickable cards and links.

## Place the Content

Set placement on the content part:

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@ui-sdk/react/popover"

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Details</PopoverTrigger>
      <PopoverContent side="bottom" align="start" sideOffset={8}>
        Last updated today.
      </PopoverContent>
    </Popover>
  )
}

export { Example }
```

The popup flips or shifts when there isn't enough room.

| Prop               | What It Does                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `side`             | Chooses `top`, `bottom`, `left`, `right`, `start`, or `end`. Start and end follow reading direction. |
| `align`            | Aligns the popup to the `start`, `center`, or `end` of that side.                                    |
| `sideOffset`       | Sets the gap from the anchor, in pixels.                                                             |
| `alignOffset`      | Shifts the popup along its side, in pixels.                                                          |
| `collisionPadding` | Leaves space from the window's edges.                                                                |
| `arrowPadding`     | Keeps an arrow away from the popup's corners.                                                        |

An `anchor` can position the popup against another element. The component's page lists the anchors it accepts.

## Control Dismissal

Set `dismissible={false}` to stop Escape, outside presses, focus leaving, Back, and sheet swipes from closing a popup. Its trigger, Close part, and controller can still close it.

```tsx
<Popover
  dismissible={false}
  onDismissAttempt={(details) => console.log(details.reason)}
>
  {/* Trigger, content, and a Close part. */}
</Popover>
```

Use [State and Events](./state-and-events.md) when you want to cancel only a particular reason, such as an outside press while a form has unsaved changes.

## Modals and Sheets

`modal` makes the rest of the page inert and locks scrolling. Each component documents its default.

Menu, Select, Combobox, Autocomplete, Popover, and Dialog support `presentation="auto"` to become a sheet on small touch screens. Use `presentation="sheet"` to always show a sheet.

```tsx
<Popover presentation="auto">{/* Trigger and content. */}</Popover>
```

## Focus

Dialogs, alert dialogs, drawers, and popovers move focus into their content when they open. Where it lands depends on how they opened:

| Opened With                                  | Focus Goes To                                                |
| -------------------------------------------- | ------------------------------------------------------------ |
| Keyboard, screen reader, mouse, pen, or code | The element `initialFocus` picks.                            |
| Touch                                        | The content itself, so no on-screen keyboard appears.        |
| Hover                                        | Nowhere. Focus stays where it is.                            |
| Rendered open                                | Nowhere, except in a dialog, which takes focus as it mounts. |

`initialFocus` defaults to `"auto"`: the first focusable element, or the content when it has none. A dialog tries an element with `autofocus` first, and an alert dialog tries its first Close part. Pass `"content"` to focus the content itself, `"none"` to leave focus alone, or a CSS selector, an element, or a function that returns one. When focus lands on a text field that already holds a value, its text is selected, so typing replaces it.

`modal` decides whether Tab can leave. With `true` or `"trap-focus"`, Tab and Shift+Tab wrap inside the content. With `false`, Tab moves from the trigger into a popover and on to the page after it, and focus leaving closes the popover. A non-modal dialog stays open.

When a popup closes while focus is inside it, focus returns to the trigger. If the trigger is gone or can't take focus, focus goes to the element focused before the popup opened, then where the popup it was opened from would return focus, then to the nearest focusable element after where the trigger was. A popup a controller opened returns to the element focused before it first. Set `finalFocus` to `"none"` to leave focus alone, or to a selector, an element, or a function to send it somewhere else. Closing because focus moved away never moves it back, and neither does pressing something focusable outside a non-modal popup.

Menus, selects, and comboboxes handle focus within their own lists, and tooltips never move it. Each component's page covers its own.

## Mounting and Containers

Closed content unmounts after its exit animation. `keepMounted` leaves it in the page, hidden. `onOpenChangeComplete` runs when opening or closing finishes, including animations.

Use `container` to render into another element, a shadow root, or an element in an iframe. Focus, Escape, and scroll locking then work in the document and shadow root the content renders in. Keep a dialog containing a form outside any surrounding form, or move its content with `container`, to avoid nested forms.

In a tree a hidden `<Activity>` or a Suspense fallback hides, an open popup hides with it, from its `container` too, and comes back open when the tree shows, with focus in it if it's modal.

[Styling and Animation](./styling-and-animation.md) shows how to animate the content.

## Toasts and Confirms

Mount `OverlayHost` once near your app's root, then call `toast()` from event handlers:

```tsx
"use client"

import { OverlayHost } from "@ui-sdk/react/overlays"
import { toast } from "@ui-sdk/react/toast"

function Example() {
  return (
    <>
      <OverlayHost />
      <button onClick={() => toast.success("Saved")}>Save</button>
    </>
  )
}

export { Example }
```

See [Toast](./components/toast.md) and [Alert Dialog](./components/alert-dialog.md) for the complete APIs.
