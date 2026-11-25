# Hover Card

Preview a link on hover or keyboard focus while keeping its normal navigation.

A hover card shows a preview of where a link goes, like a person's profile, to someone who pauses on it. The link still works as a link.

```tsx title="basic.tsx"
"use client"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@ui-sdk/react/hover-card"

function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="https://example.com/people/hollis">
        @hollis
      </HoverCardTrigger>
      <HoverCardContent>
        <div data-slot="row">
          <span data-slot="initials" aria-hidden="true">
            HG
          </span>
          <div data-slot="stack">
            <p>Hollis Grant</p>
            <p>
              Design engineer on the payments team. Writes about forms and
              motion.
            </p>
            <p data-slot="hint">Joined March 2021</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export { Example }
```

Hover @hollis, or Tab to it and wait, to open Hollis Grant's profile preview. Move the pointer away or press Escape to close it.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `HoverCard`:

```text
HoverCard
├── HoverCardTrigger
└── HoverCardContent
    └── HoverCardArrow
```

The trigger is a link (an `<a>`, so give it an `href`), and pressing it follows the link. The content is the preview, and the arrow is optional.

The card only adds a preview for people who pause on the link: everything in it should be reachable from the page the link goes to, since touch and screen reader users may never open it. For a tip on a button, use a [Tooltip](./tooltip.md). For content that opens with a press, use a [Popover](./popover.md).

## Usage

Import the parts and put them together:

```tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@ui-sdk/react/hover-card"

function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="/people/hollis">@hollis</HoverCardTrigger>
      <HoverCardContent>
        <p>Hollis Grant</p>
        <p>Design engineer on the payments team.</p>
      </HoverCardContent>
    </HoverCard>
  )
}

export { Example }
```

## Positioning

`side` picks where the card opens, `bottom` by default, and `align` lines it up with the start, center or end of the link. The card flips to the other side when there isn't room and shifts along the link to stay on screen.

`HoverCardArrow` follows the side the card actually lands on, including after a flip, and gets the same `data-side`. It points at the middle of the link and keeps `arrowPadding` away from the corners; `data-arrow-clamped` tells you when it can't reach the middle.

```tsx title="side.tsx"
"use client"

import {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardTrigger,
} from "@ui-sdk/react/hover-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

const sides = [
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
]
const aligns = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
]
type Side = "top" | "right" | "bottom" | "left"
type Align = "start" | "center" | "end"

function Example() {
  const [side, setSide] = React.useState<Side>("bottom")
  const [align, setAlign] = React.useState<Align>("center")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={sides}
          value={side}
          onValueChange={(next) => next && setSide(next as Side)}
        >
          <SelectLabel>Side</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon aria-hidden="true" />
          </SelectTrigger>
          <SelectContent>
            {sides.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={aligns}
          value={align}
          onValueChange={(next) => next && setAlign(next as Align)}
        >
          <SelectLabel>Align</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon aria-hidden="true" />
          </SelectTrigger>
          <SelectContent>
            {aligns.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <HoverCard>
        <HoverCardTrigger href="https://example.com/people/ines">
          @ines
        </HoverCardTrigger>
        <HoverCardContent side={side} align={align} sideOffset={10}>
          <HoverCardArrow />
          <p>Inès Moreau</p>
          <p>Product designer. Leads the checkout redesign.</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}

export { Example }
```

Choose a side and an alignment, then hover @ines. The card opens there and its arrow points at the link.

`sideOffset` is the gap to the link, 4 pixels by default. `alignOffset` shifts the card along it, and `collisionPadding` is the space kept from the edges of the window. `anchor` positions the card against something other than the link: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`.

```tsx
<HoverCardContent
  side="right"
  align="start"
  sideOffset={8}
  collisionPadding={16}
  anchor={row}
/>
```

## Delays

`delay` is how long the pointer rests on the link, or keyboard focus stays on it, before the card opens: 600 milliseconds by default. `closeDelay` is how long it stays open once the pointer leaves the link and the card: 300 milliseconds by default. The pointer can cross the gap between the link and the card without closing it.

`disabled` stops the card from opening and leaves a plain link.

```tsx
<HoverCard delay={300} closeDelay={150} disabled={!previews}>
```

## Controlled

Pass `open` and update it in `onOpenChange`. Every change carries a [reason](#reasons), like `trigger-hover`, `trigger-focus`, `focus-out`, `escape-key` or `outside-press`. Call `details.cancel()` to stop it.

```tsx
const [open, setOpen] = React.useState(false)

<HoverCard open={open} onOpenChange={setOpen}>
```

## One Card for Many Links

A feed or a list can share one card instead of rendering one per link. Connect the links and the card to one `createHoverCardController<Payload>()`. Each link passes a `payload`, like its person, and the content reads it from its state. Only the link that opened the card gets `data-open`. `controller.open({ payload })` opens the card from code.

```tsx
const profile = createHoverCardController<Person>()

{
  people.map((person) => (
    <HoverCardTrigger
      key={person.handle}
      controller={profile}
      payload={person}
      href={person.url}
    >
      {person.name}
    </HoverCardTrigger>
  ))
}

;<HoverCard controller={profile}>
  <HoverCardContent<Person>>
    {(state) => <p>{state.payload?.bio}</p>}
  </HoverCardContent>
</HoverCard>
```

A card can have links of its own. Tab from a link with an open card moves into the card, and Tab past its end moves on to the page after the link. Focus leaving the card closes it.

## Container

Cards render in place and show in the top layer, so no ancestor clips or covers them. `container` renders the card somewhere else, for iframes, shadow roots or a specific stacking context. See the shared [popup guide](../popups.md).

```tsx
<HoverCardContent container={shadowRoot} />
```

## Animation

The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the card stays mounted until the exit finishes. `onOpenChangeComplete` runs after the transition, and `keepMounted` keeps the closed card in the page, hidden, for animation libraries that drive the exit from state.

```css
[data-slot="hover-card-content"] {
  transition:
    opacity 150ms,
    scale 150ms;

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    scale: 0.96;
  }
}
```

## Custom Rendering

Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state.

```tsx
<HoverCardTrigger
  href="/people/hollis"
  render={(props) => (
    <a {...props}>
      <span aria-hidden="true">HG</span>
      Hollis Grant
    </a>
  )}
/>
```

## Styling

Each part has a `data-slot`, such as `hover-card-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes). Use `data-open` on the trigger to mark the link whose card is showing, and `data-side` to style the content and arrow for the side they landed on. Put `transform-origin: var(--transform-origin)` on the content so it scales from the link.

Keep overflow visible around an arrow that extends outside the card. If the body needs to scroll, put scrolling on an inner element.

### HoverCardContent
- `--anchor-width`: Width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Height of the anchor.
- `--available-width`: Space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: The point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.

## Data Attributes

### HoverCardTrigger
`[data-slot="hover-card-trigger"]`

- `data-closed`: Present while the card is closed, including while it animates out.
- `data-open`: Present while the card is open. On a trigger, while it's open from that trigger.

### HoverCardContent
`[data-slot="hover-card-content"]`

- `data-closed`: Present while the card is closed, including while it animates out.
- `data-open`: Present while the card is open. On a trigger, while it's open from that trigger.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the card animates out. Style the state you animate to.
- `data-side` (`top`, `right`, `bottom`, `left`): Where the card ended up, after flipping away from edges. Set on the arrow too.
- `data-align` (`start`, `center`, `end`): How the card lines up with its trigger.

### HoverCardArrow
`[data-slot="hover-card-arrow"]`

- `data-closed`: Present while the card is closed, including while it animates out.
- `data-open`: Present while the card is open. On a trigger, while it's open from that trigger.
- `data-side` (`top`, `right`, `bottom`, `left`): Where the card ended up, after flipping away from edges. Set on the arrow too.
- `data-align` (`start`, `center`, `end`): How the card lines up with its trigger.
- `data-arrow-clamped`: Present on the arrow when it stops short of the middle of the trigger, held back by `arrowPadding`.

## API Reference

Props and callbacks are the same as below, as React props.

### HoverCard

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `open?` (`boolean`): Whether the card is open. Pass it to control the card.
- `defaultOpen?` (`boolean`): Whether the card starts open, when uncontrolled.
- `onOpenChange?` (`((open: boolean, details: ChangeDetails<HoverCardOpenChangeReason>) => void)`): Runs when the card wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `onOpenChangeComplete?` (`((open: boolean) => void)`): Runs once the card has finished opening or closing, after any animation.
- `onPayloadChange?` (`((payload: unknown, details: ChangeDetails<HoverCardPayloadChangeReason>) => void)`): Runs when the payload the content shows changes: a trigger with another payload opens the card, or takes the open card over, which fires no `onOpenChange`, and so does a controller's `open({ payload })` on the open card. `details.cancel()` keeps the previous payload.
- `delay?` (`number`): Milliseconds the pointer rests on the trigger, or keyboard focus stays on it, before the card opens.
- `closeDelay?` (`number`): Milliseconds before the card closes once the pointer leaves the trigger and the card.
- `disabled?` (`boolean`): Stops the card from opening. The trigger keeps working as a link.
- `controller?` (`PopupController<any, HoverCardOpenChangeReason, {}, string, HoverCardPayloadChangeReason>`): Opens, closes and inspects the card from anywhere, and connects triggers outside it. Create one with `createHoverCardController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### HoverCardTrigger

A trigger outside the card also takes `controller`.

- `payload?` (`unknown`): Data for the content to render when this trigger opens the card, like the profile it links to.
- `controller?` (`PopupController<any, HoverCardOpenChangeReason, {}, string, HoverCardPayloadChangeReason>`): Connects a trigger outside the card, like every author link in a feed, to the card with this controller.

### HoverCardContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the trigger the card opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the card lines up with the trigger along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the trigger and the card, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the trigger, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `keepMounted?` (`boolean`): Whether the card stays in the page, hidden, while closed. Its content keeps its state between opens.

### HoverCardArrow

Points at the link from the side the card landed on. Renders a `div`.

### State

What render functions, state-based class names and slots receive, per part.

`HoverCardTrigger`:

- `open` (`boolean`): Whether the card is open from this trigger.

`HoverCardContent`:

- `open` (`boolean`): Whether the card is open. False while it animates out.
- `payload` (`Payload | undefined`): The payload of the last open, from the trigger that opened it or a controller, typed as the controller's `Payload`.

`HoverCardArrow`:

- `open` (`boolean`): Whether the card is open. False as soon as it starts closing, while it still animates out.

### Reasons

`details.reason` says why the card opened or closed.

- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `trigger-focus` (`FocusEvent`): Keyboard focus reached a trigger that opens on focus, like a tooltip's.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `window-blur` (`FocusEvent`): The window lost focus.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

For a payload change, it says what opened the card or took it over.

- `trigger-hover` (`PointerEvent`): The pointer rested on a trigger, or left it, with hover opening.
- `trigger-focus` (`FocusEvent`): Keyboard focus reached a trigger that opens on focus, like a tooltip's.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createHoverCardController<Payload>()` and pass it as `controller`, to the card and to any
triggers outside it. `Payload` is the type of the data triggers and `open()` pass.

Every write method takes an optional `{ reason, event }`, passed to `onOpenChange`.

- `isOpen()` (`() => boolean`): Whether it's open. False as soon as it starts closing, while it still animates out.
- `setOpen(open, options?)` (`(open: boolean, options?: PopupChangeOptions<HoverCardOpenChangeReason> | undefined) => boolean`): Opens or closes it. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (PopupChangeOptions<HoverCardPayloadChangeReason> & { payload?: Payload | undefined; anchor?: Anchor | undefined; signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens it, and resolves once it closes, with why, how and any return value. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the component leaves the page.
- `close(options?)` (`(options?: (PopupChangeOptions<HoverCardOpenChangeReason> & { returnValue?: string | undefined; }) | undefined) => boolean`): Closes it. `returnValue` is passed to the promise `open()` returned. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: PopupChangeOptions<HoverCardOpenChangeReason> | undefined) => boolean`): Opens it when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getPayload()` (`() => Payload | undefined`): The payload of the last open, from a controller or the trigger that opened it.
- `focus()` (`() => void`): Moves focus to the trigger that opened it last, or the first trigger.

### Events

Callbacks get the new state first, then the details.

| Prop                   | On          | Receives                                                                    |
| ---------------------- | ----------- | --------------------------------------------------------------------------- |
| `onOpenChange`         | `HoverCard` | `(open, details)`: the new state, and the [reason](#reasons)                |
| `onOpenChangeComplete` | `HoverCard` | `(open)`, after the animation                                               |
| `onPayloadChange`      | `HoverCard` | `(payload, details)`: the content's new payload, and the [reason](#reasons) |

## Accessibility

The trigger stays a plain link, and the card is a preview beside it, not a dialog. Every line below is an automated test.

### Keyboard

| Key    | Does                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| Tab    | On the link, opens the card after `delay`; with the card open, moves into it |
| Enter  | Follows the link                                                             |
| Escape | Closes the card and leaves focus on the link                                 |

Keyboard focus opens the card after the same `delay` as the pointer, so tabbing through a page of links doesn't flash a card at every stop. Focus leaving the card closes it.

Touch screens have no hover, so a tap follows the link without opening the card. Anything in the card should be on the page the link goes to.

### Tested Behavior

**Pointer**

- Resting the pointer on the link opens the card.
- The card waits for its delay before opening.
- Moving the pointer away closes the card after its close delay.
- Moving the pointer into the card keeps it open.
- Opening on hover leaves focus where it was.
- Clicking the link follows it.

**Keyboard**

- Keyboard focus on the link opens the card after the delay.
- Keyboard focus on a link the pointer opened keeps the card open when the pointer leaves.
- Escape closes the card and leaves focus on the link.
- Enter follows the link.

**Positioning**

- The card opens below the link.
- The card opens on the requested side.

**Animation**

- The card animates in from its starting style.
- The card stays in the page while it animates out.

**Focus, touch and reasons**

- A click that focuses the link doesn't open the card from focus.
- Leaving the link before the delay keeps keyboard focus from opening it later.
- A tap follows the link without opening the card.
- Changes report why the card opened and closed.

Runs in React, Vue and web components.

Also tested:

**Enhancements**

- Tab from the link moves into the open card.
- Shift+Tab from the card returns to the link.
- Tab out of the card moves on past the link and closes it.
- Escape inside the card closes it and returns focus to the link.
- The card stays open while focus is in it, even when the pointer leaves.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while tabbing into the card and out.

Runs in React, Vue and web components.
