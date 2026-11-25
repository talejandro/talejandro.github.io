# Listbox

Choose one or several options from an always-visible list.

Use a Listbox when the choices should stay in view. It works like a native select with several visible rows, with keyboard navigation, typeahead, and optional range selection.

```tsx title="basic.tsx"
"use client"

import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"

const topics = [
  { value: "comments", label: "Comments" },
  { value: "mentions", label: "Mentions" },
  { value: "reactions", label: "Reactions" },
  { value: "sign-ins", label: "New sign-ins" },
  { value: "billing", label: "Billing" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Email me about</FieldLabel>
      <Listbox multiple activation="automatic" defaultValue={["mentions"]}>
        {topics.map((topic) => (
          <ListboxItem key={topic.value} value={topic.value}>
            {topic.label}
            <ListboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ListboxItemIndicator>
          </ListboxItem>
        ))}
      </Listbox>
      <FieldDescription>
        Hold Shift to select a range, or Ctrl or ⌘ to add one.
      </FieldDescription>
    </Field>
  )
}

export { Example }
```

Choose Comments, then hold Shift and choose New sign-ins to select the range. A click replaces the selection; Ctrl or ⌘ adds one option.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Listbox`:

```text
Listbox
├── ListboxItem
│   └── ListboxItemIndicator
└── ListboxItem
    └── ListboxItemIndicator
```

Give the list an accessible name and each option a unique value. `ListboxItemIndicator` shows its content when that option is selected.

You can also name the list with a [Field label](./field.md) or `aria-labelledby`. Keep buttons, search fields, and empty messages outside the list: its contents should be options, groups, and separators.

## Usage

Import the parts and put them together:

```tsx
import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"

function Example() {
  return (
    <Listbox aria-label="Toppings" defaultValue="basil">
      <ListboxItem value="basil">
        Basil
        <ListboxItemIndicator>✓</ListboxItemIndicator>
      </ListboxItem>
      <ListboxItem value="olive">
        Olive
        <ListboxItemIndicator>✓</ListboxItemIndicator>
      </ListboxItem>
    </Listbox>
  )
}

export { Example }
```

## Multiple

Add `multiple` to select several options. The value becomes an array; a single list uses one value or `null`. By default, arrow keys move focus without changing a multiple selection.

| Action                             | Result                                                 |
| ---------------------------------- | ------------------------------------------------------ |
| Press an option or Space           | Toggle that option.                                    |
| Shift + press, arrow key, or Space | Select a range from the last chosen option.            |
| Ctrl/Cmd + Shift + Home or End     | Extend the range to the first or last option.          |
| Ctrl/Cmd + A                       | Select every enabled option, then clear the selection. |

Changing a Shift range preserves the options selected before that range began.

```tsx title="multiple.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      multiple
      defaultValue={["cheese", "onion"]}
      onValueChange={(value, details) =>
        log(`${value.join(", ") || "Nothing"} (${details.reason})`)
      }
      aria-label="Toppings"
    >
      {toppings.map((topping) => (
        <ListboxItem key={topping.value} value={topping.value}>
          {topping.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Choose Basil, then hold Shift and choose Pepper to select a range. Use Ctrl+A or ⌘A to select every option, then again to clear. The console logs each change.

## Selection That Follows Focus

A single list selects as arrow keys, Page Up and Page Down, Home, End, or typing move focus. Page Up and Page Down move ten options, and stop at the ends. A multiple list can do the same with `activation="automatic"`, like a file list: a press or arrow replaces the selection, Ctrl or Cmd adds to it, and Ctrl or Cmd with an arrow moves focus without selecting.

Taps and screen-reader presses toggle an option instead, since they do not have modifier keys.

```tsx
<Listbox multiple activation="automatic" aria-label="Files" />
```

```tsx title="activation.tsx"
"use client"

import { Listbox, ListboxItem, ListboxItemIcon } from "@ui-sdk/react/listbox"
import { FileIcon } from "lucide-react"
import { useLog } from "./log"

const files = [
  { value: "readme", label: "README.md" },
  { value: "package", label: "package.json" },
  { value: "tsconfig", label: "tsconfig.json" },
  { value: "index", label: "index.ts" },
  { value: "styles", label: "styles.css" },
  { value: "logo", label: "logo.svg" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      multiple
      activation="automatic"
      defaultValue={["readme"]}
      onValueChange={(value, details) =>
        log(`${value.length} selected (${details.reason})`)
      }
      aria-label="Files"
    >
      {files.map((file) => (
        <ListboxItem key={file.value} value={file.value}>
          <ListboxItemIcon>
            <FileIcon aria-hidden="true" />
          </ListboxItemIcon>
          {file.label}
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Choose index.ts to replace the selection. Hold Ctrl or Cmd while choosing another file to add it; Shift selects a range.

## Manual Activation

Set `activation="manual"` on a single list to browse without selecting. Space, Enter, or a press chooses the focused option.

```tsx title="manual.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      activation="manual"
      onValueChange={(value, details) =>
        log(`${value ?? "Nothing"} (${details.reason})`)
      }
      aria-label="Framework"
    >
      {frameworks.map((framework) => (
        <ListboxItem key={framework.value} value={framework.value}>
          {framework.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Move through the options with the arrow keys. Nothing is selected until you press Space or Enter, and the console logs the choice.

## Focus on the List

Set `virtualFocus` to keep focus on the list itself while arrow keys, Home, End, and typing move a highlight through the options. The list points at the highlighted option with `aria-activedescendant`, so screen readers still announce it. Style the highlight with `[data-highlighted]`, since the options don't take focus.

```tsx title="virtual-focus.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      activation="manual"
      virtualFocus
      onValueChange={(value, details) =>
        log(`${value ?? "Nothing"} (${details.reason})`)
      }
      aria-label="Framework"
    >
      {frameworks.map((framework) => (
        <ListboxItem key={framework.value} value={framework.value}>
          {framework.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Tab into the list and move through it with the arrow keys. Focus stays on the list, and Space or Enter chooses the highlighted option.

## Deselectable

Add `deselectable` to let pressing the selected option clear a single selection. Without it, the selection stays as it is.

```tsx title="deselectable.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  const log = useLog()

  return (
    <Listbox
      deselectable
      defaultValue="astro"
      onValueChange={(value, details) =>
        log(`${value ?? "Nothing"} (${details.reason})`)
      }
      aria-label="Framework"
    >
      {frameworks.map((framework) => (
        <ListboxItem key={framework.value} value={framework.value}>
          {framework.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Press Astro again to clear the selection, or choose another framework. The console logs each change.

## Groups

Use `ListboxGroup` and `ListboxGroupLabel` to name a group. Arrow keys and ranges continue across groups. Separators stay out of the accessibility tree.

```tsx title="groups.tsx"
"use client"

import {
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIndicator,
  ListboxSeparator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const produce = [
  {
    label: "Fruits",
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "orange", label: "Orange" },
    ],
  },
  {
    label: "Vegetables",
    items: [
      { value: "carrot", label: "Carrot" },
      { value: "broccoli", label: "Broccoli" },
      { value: "spinach", label: "Spinach" },
    ],
  },
]

function Example() {
  return (
    <Listbox multiple defaultValue={["banana"]} aria-label="Produce">
      {produce.map((group, index) => (
        <React.Fragment key={group.label}>
          {index > 0 && <ListboxSeparator />}
          <ListboxGroup>
            <ListboxGroupLabel>{group.label}</ListboxGroupLabel>
            {group.items.map((item) => (
              <ListboxItem key={item.value} value={item.value}>
                {item.label}
                <ListboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ListboxItemIndicator>
              </ListboxItem>
            ))}
          </ListboxGroup>
        </React.Fragment>
      ))}
    </Listbox>
  )
}

export { Example }
```

Move from Apple through the list with Down Arrow. Navigation continues into the Vegetables group.

## Icons

Wrap an icon in `ListboxItemIcon` so screen readers and typeahead skip it. Add `mirror` to a directional icon to flip it in right-to-left text.

```tsx title="icons.tsx"
"use client"

import { Listbox, ListboxItem, ListboxItemIcon } from "@ui-sdk/react/listbox"
import {
  ArchiveIcon,
  ArrowRightIcon,
  MailIcon,
  PencilIcon,
  StarIcon,
} from "lucide-react"

const views = [
  { value: "inbox", label: "Inbox", icon: MailIcon },
  { value: "starred", label: "Starred", icon: StarIcon },
  { value: "drafts", label: "Drafts", icon: PencilIcon },
  { value: "archive", label: "Archive", icon: ArchiveIcon },
  { value: "next", label: "Next page", icon: ArrowRightIcon },
]

function Example() {
  return (
    <Listbox defaultValue="inbox" aria-label="Mailbox">
      {views.map((view) => (
        <ListboxItem key={view.value} value={view.value}>
          <ListboxItemIcon mirror={view.icon === ArrowRightIcon}>
            <view.icon />
          </ListboxItemIcon>
          {view.label}
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Choose Drafts. The icon stays out of the option’s accessible name and the text used for typeahead.

## Horizontal

Set `orientation="horizontal"` to move with Left and Right Arrow. Arrow keys normally wrap; set `loop={false}` to stop at the ends, as this example does. Shift ranges never wrap.

The list reads `dir="rtl"` from the page or an ancestor, so Left Arrow moves to the next option in right-to-left text.

```tsx title="horizontal.tsx"
"use client"

import { Listbox, ListboxItem } from "@ui-sdk/react/listbox"

const sizes = [
  { value: "xs", label: "XS" },
  { value: "s", label: "S" },
  { value: "m", label: "M" },
  { value: "l", label: "L" },
  { value: "xl", label: "XL", disabled: true },
]

function Example() {
  return (
    <Listbox orientation="horizontal" loop={false} defaultValue="m" aria-label="Size">
      {sizes.map((size) => (
        <ListboxItem key={size.value} value={size.value} disabled={size.disabled}>
          {size.label}
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Focus M, then use Left and Right Arrow to choose a size. The list stops at its ends; XL cannot be selected.

## Disabled

A disabled option cannot be selected. Arrow keys, typeahead and ranges skip it. Disabling the whole list removes its tab stop, prevents changes, and excludes its value from the form.

```tsx title="disabled.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import * as React from "react"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function Example() {
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setDisabled(!disabled)}>
          {disabled ? "Enable the List" : "Disable the List"}
        </button>
      </div>
      <Listbox multiple disabled={disabled} defaultValue={["basil"]} aria-label="Toppings">
        {toppings.map((topping) => (
          <ListboxItem key={topping.value} value={topping.value} disabled={topping.value === "olive"}>
            {topping.label}
            <ListboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ListboxItemIndicator>
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  )
}

export { Example }
```

Try choosing Olive. Then press Disable the List to make every option unavailable until you enable it again.

## Read-Only

Use `readOnly` when people should be able to browse the list without changing its value. The list remains focusable and its value still submits.

```tsx title="read-only.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  return (
    <Listbox readOnly defaultValue="nuxt" aria-label="Framework">
      {frameworks.map((framework) => (
        <ListboxItem key={framework.value} value={framework.value}>
          {framework.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Move focus through the frameworks. Nuxt stays selected because the list is read-only.

## Form

Add `name` to submit the selection. Multiple selections submit one entry per value. Reset restores `defaultValue`, and `required` prevents submission when nothing is selected.

The server HTML includes the hidden inputs for the current selection, so those values can submit before hydration.

The list can live outside its form: set `form` to the form’s ID, as this example does. A disabled fieldset also disables the list. [Forms](../forms.md) covers the shared integration.

```tsx title="form.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <Listbox
        multiple
        name="toppings"
        form="pizza-order"
        required
        defaultValue={["cheese"]}
        aria-label="Toppings"
      >
        {toppings.map((topping) => (
          <ListboxItem key={topping.value} value={topping.value}>
            {topping.label}
            <ListboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ListboxItemIndicator>
          </ListboxItem>
        ))}
      </Listbox>
      <form
        id="pizza-order"
        data-slot="row"
        onSubmit={(event) => {
          event.preventDefault()
          log(
            `Ordered ${new FormData(event.currentTarget).getAll("toppings").join(", ")}`
          )
        }}
      >
        <button type="reset">Reset</button>
        <button data-variant="solid">Order</button>
      </form>
    </div>
  )
}

export { Example }
```

Choose Basil and press Order: the console logs both toppings. Reset restores Extra cheese; clearing every option makes the required list block the order.

## Object Values

Pass objects as item values when the selection should carry more than an ID. `itemToValue` provides the string used for identity and form submission; `isItemEqualToValue` matches objects that represent the same option but are different instances.

```tsx title="data.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
  type ListData,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const plans = [
  { value: { id: "hobby", price: 0 }, label: "Hobby" },
  { value: { id: "pro", price: 20 }, label: "Pro" },
  { value: { id: "team", price: 50 }, label: "Team" },
  {
    value: { id: "enterprise", price: 200 },
    label: "Enterprise",
    disabled: true,
  },
] satisfies ListData<{ id: string; price: number }>

function Example() {
  const log = useLog()

  return (
    <Listbox
      items={plans}
      defaultValue={plans[1].value}
      onValueChange={(plan) =>
        log(plan ? `${plan.id}, $${plan.price} a month` : "No plan")
      }
      itemToValue={(plan) => plan.id}
      isItemEqualToValue={(plan, selected) => plan.id === selected.id}
      aria-label="Plan"
    >
      {plans.map((plan) => (
        <ListboxItem key={plan.value.id} value={plan.value} disabled={plan.disabled}>
          {plan.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Choose Team. The console logs the price from the selected object, not from its string ID.

`items` supplies the collection as data and can render the options for you. To keep markup and classes explicit, map the data into parts, as the example does. Use `ListData<T>` to type object-valued data. [Lists and Menus](../lists-and-menus.md) covers the shared data format.

## Controller

A controller can select all options, clear the selection, or focus the list from another control. Create one with `createListboxController()` and pass it as `controller`. [Controllers](../controllers.md) covers setup and lifetime.

```tsx title="controller.tsx"
"use client"

import {
  createListboxController,
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

const toppings = [
  { value: "basil", label: "Basil" },
  { value: "cheese", label: "Extra cheese" },
  { value: "mushroom", label: "Mushroom" },
  { value: "olive", label: "Olive" },
  { value: "onion", label: "Onion" },
  { value: "pepper", label: "Pepper" },
]

function Example() {
  const log = useLog()
  const [controller] = React.useState(() =>
    createListboxController<string, true>()
  )

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => controller.selectAll()}>
          Select All
        </button>
        <button type="button" onClick={() => controller.clear()}>
          Clear
        </button>
        <button type="button" onClick={() => controller.focus()}>
          Focus
        </button>
      </div>
      <Listbox
        multiple
        controller={controller}
        onValueChange={(value, details) =>
          log(`${value.length} selected (${details.reason})`)
        }
        aria-label="Toppings"
      >
        {toppings.map((topping) => (
          <ListboxItem key={topping.value} value={topping.value}>
            {topping.label}
            <ListboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ListboxItemIndicator>
          </ListboxItem>
        ))}
      </Listbox>
    </div>
  )
}

export { Example }
```

Press Select All, Clear and Focus. Each button drives the same list through its controller, and the console logs the change.

## Scrollable

Give a long list a maximum height and `overflow-y: auto`. It starts scrolled to the selected option without taking focus. Keyboard navigation reveals the focused option without scrolling the page.

```tsx title="scrollable.tsx"
"use client"

import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@ui-sdk/react/listbox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"

const timezones = Array.from({ length: 27 }, (_, index) => {
  const offset = index - 12
  const label = `UTC${offset < 0 ? "−" : "+"}${String(Math.abs(offset)).padStart(2, "0")}:00`
  return { value: `utc${offset}`, label }
})

function Example() {
  const log = useLog()

  return (
    <Listbox
      defaultValue="utc9"
      onHighlight={(value, details) =>
        value &&
        log(
          `Focused ${timezones[details.index].label} (${details.index + 1} of ${timezones.length})`
        )
      }
      aria-label="Time zone"
    >
      {timezones.map((zone, index) => (
        <ListboxItem key={zone.value} value={zone.value} index={index}>
          {zone.label}
          <ListboxItemIndicator>
            <CheckIcon aria-hidden="true" />
          </ListboxItemIndicator>
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Focus the list and use the arrow keys. Options scroll into view, and the console logs the focused time zone.

For a virtualized list, supply `items` so typeahead knows about unmounted options. `onHighlight` reports the focused value and index; each rendered item’s `index` places it in the full collection for screen readers. The [Select virtualization example](./select.md#virtualized) shows the same data and scrolling approach.

Set `keepInView={false}` when something else scrolls the list, like a wheel that picks the option at its center with [`bindScrollPicker`](../core.md#wheels-you-scroll-to-pick-from). The list then leaves its scroll position alone as keys move focus.

## Custom Rendering

Render an option as a link when choosing it should navigate. A press or Enter follows the link and selects the option. This example uses manual activation so arrow keys only browse.

```tsx
<ListboxItem value="remix" render={<a href="#remix" />}>
  Remix
</ListboxItem>
```

```tsx title="render.tsx"
"use client"

import { Listbox, ListboxItem } from "@ui-sdk/react/listbox"
import { ExternalLinkIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "sveltekit", label: "SvelteKit" },
]

function Example() {
  return (
    <Listbox defaultValue="next" activation="manual" aria-label="Framework docs">
      {frameworks.map((framework) => (
        <ListboxItem
          key={framework.value}
          value={framework.value}
          label={framework.label}
          render={<a href={`#${framework.value}`} />}
        >
          {(state) => (
            <>
              <span>{framework.label}</span>
              {state.selected && <ExternalLinkIcon aria-hidden="true" />}
            </>
          )}
        </ListboxItem>
      ))}
    </Listbox>
  )
}

export { Example }
```

Focus Remix and press Enter, or choose it with the pointer. The option is selected and its link updates the URL hash.

[Parts and Composition](../parts-and-composition.md) covers the shared rendering API. Each part’s state is listed [below](#state).

## Styling

Use `data-selected` for the selection and `data-highlighted` for focus. They can describe different options when selection does not follow focus. Disabled and read-only states have their own attributes.

Each part has a `data-slot`, such as `listbox-item`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

`ListboxGroup`, `ListboxGroupLabel` and `ListboxSeparator` have no state attributes.

### Listbox
`[data-slot="listbox"]`

- `data-orientation` (`vertical`, `horizontal`): Which arrow keys move between items.
- `data-disabled`: Present when the listbox is disabled, by its own prop, a Field or a `<fieldset>`.
- `data-readonly`: Present when the listbox is read-only.
- `data-required`: Present when the listbox is required.
- `data-has-icons`: Present while any item inside holds an icon part, so items without one can line up.

### ListboxItem
`[data-slot="listbox-item"]`

- `data-selected`: Present on selected items, and on the check inside them.
- `data-disabled`: Present when the item can't be chosen. It can still be focused.
- `data-highlighted`: Present on the item that has focus.
- `data-has-icon`: Present on an item while it holds an icon part.

### ListboxItemIndicator
`[data-slot="listbox-item-indicator"]`

- `data-selected`: Present on selected items, and on the check inside them.

### ListboxItemIcon
`[data-slot="listbox-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

## API Reference

Props and callbacks are the same as below, as React props.

### Listbox

- `activation?` (`"automatic" | "manual"`): Whether the selection follows focus. `"automatic"`: arrow keys, Home, End and typing select the option they move to, and with `multiple` a press replaces the selection while Ctrl or ⌘ adds to it, like a native multiple select. `"manual"`: keys only move focus, and Space, Enter or a press selects, or toggles with `multiple`.
- `deselectable?` (`boolean`): Whether pressing the selected item of a single listbox unselects it, so nothing is selected.
- `orientation?` (`"horizontal" | "vertical"`): Which arrow keys move between items. Horizontal lists use Left and Right, swapped in right-to-left text.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first. Shift with an arrow never wraps.
- `virtualFocus?` (`boolean`): Keeps focus on the list itself, which points at the highlighted option with `aria-activedescendant`, instead of moving focus onto the options.
- `keepInView?` (`boolean`): Whether the list scrolls the option keys move to into view, and the selected option when it first shows. Turn it off when something else scrolls the list, like `bindScrollPicker`.
- `items?` (`ListData<T>`): The items as data. Renders them for you, and lets typing find items a virtualized list hasn't rendered.
- `itemToValue?` (`((value: T) => string)`): The string an item's value submits as and is identified by, for object values. Strings pass through, and objects use their `value` or `id`.
- `isItemEqualToValue?` (`((itemValue: T, value: T) => boolean)`): Whether an item's value is the selected value, for object values that aren't the same object.
- `onHighlight?` (`((value: T | null, details: ListHighlightDetails) => void)`): Runs when focus moves to another item, with its index among the items, so a virtualized list can scroll to it.
- `disabled?` (`boolean`): Disables the listbox like a native control: its items can't be focused or chosen, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the listbox focusable and its value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until a value is selected, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the listbox submits nothing.
- `form?` (`string`): The id of a form to belong to, when the listbox isn't inside that form.
- `controller?` (`object`): Reads and sets the listbox from anywhere. Create one with `createListboxController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `multiple?` (`boolean`): Whether several items can be selected. The value is then a list, Shift selects ranges, and Ctrl or ⌘ with A selects every item. Whether several items can be selected.
- `value?` (`T | T[] | null`): The selected value. Pass it to control the listbox. `null` selects nothing. The selected values. Pass it to control the listbox. The selected value, or values with `multiple`. Pass it to control the listbox.
- `defaultValue?` (`T | T[] | null`): The value selected at first, when uncontrolled. A form reset returns to it. The values selected at first, when uncontrolled. A form reset returns to them. The value or values selected at first, when uncontrolled. A form reset returns to it.
- `onValueChange?` (`union`): Runs when a user, a form reset or a controller wants to change the value. `details.reason` says why, and `details.cancel()` stops it.

### ListboxItem

- `value` (`T`): What the value becomes when the item is chosen. A string, or any value with `itemToValue`.
- `label?` (`string`): The text typing finds, when the content isn't plain text. Not the accessible name: use `aria-label` for that.
- `disabled?` (`boolean`): Keeps the item from being chosen. Arrow keys, typing and ranges skip it. Sets `data-disabled` and `aria-disabled`.
- `index?` (`number`): The item's position among all items, for virtualized lists that render only some. Sets `aria-posinset` and `aria-setsize`.

### ListboxItemIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while its item isn't selected, so it can be styled or animated in both states.

### ListboxItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

`ListboxGroup`, `ListboxGroupLabel` and `ListboxSeparator` take no props of their own.

### State

What render functions, state-based class names and slots receive, per part.

`Listbox`:

- `multiple` (`boolean | undefined`): Whether several items can be selected.
- `orientation` (`"horizontal" | "vertical"`): Which arrow keys move between items.
- `disabled` (`boolean`): Whether the listbox is disabled, by itself, a Field or a `<fieldset>`.
- `readOnly` (`boolean`): Whether the listbox keeps its value but refuses changes, from its `readOnly` option. A form reset still restores it.
- `required` (`boolean`): Whether a value is required.
- `items` (`ListData<unknown>`): The data items, for rendering a virtualized list yourself. Empty without `items`.

`ListboxItem`:

- `highlighted` (`boolean`): Whether the item has focus.
- `selected` (`boolean`): Whether its value is in the listbox's value, compared with `isItemEqualToValue` when you pass one.
- `disabled` (`boolean`): Whether the item can't be chosen, by itself or a disabled listbox.

`ListboxItemIndicator`:

- `selected` (`boolean`): Whether its item is selected. While false, the indicator isn't shown unless `keepMounted` is set.

### Reasons

`details.reason` says why the value changed: `item-press` for a press, Space or Enter, `list-navigation` for keys that select as they move, Shift ranges with arrows and Ctrl or ⌘ with A, `reset` and `restore` from the form, and `imperative` from a controller.

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `list-navigation` (`KeyboardEvent`): Arrow, Home or End keys moved the selection, typing picked an item, or Ctrl or ⌘ with A selected every item of a listbox.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createListboxController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, passed to `onValueChange`.

- `getValue()` (`() => ListboxValue<T, Multiple>`): The selected value.
- `setValue(value, options?)` (`(value: ListboxValue<T, Multiple>, options?: ListboxChangeOptions | undefined) => boolean`): Selects a value, as a user would. A disabled or read-only listbox ignores it. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ListboxChangeOptions | undefined) => boolean`): Selects nothing: `null`, or an empty list with `multiple`. Returns false when the change was canceled or nothing changed.
- `selectAll(options?)` (`(options?: ListboxChangeOptions | undefined) => boolean`): Selects every enabled item, with `multiple`. Returns false when the change was canceled or nothing changed.
- `getHighlighted()` (`() => T | null`): The value of the highlighted option, or null when none is, like while focus is outside the list.
- `highlight(value)` (`(value: T | null) => boolean`): Highlights the option with this value, scrolled into view, or none with null. While focus is outside the list, the option takes the tab stop instead, so focus lands on it next. Returns false when no enabled option has the value.
- `focus()` (`() => void`): Moves focus into the list, onto the option that holds its tab stop.

### Events

Callbacks get the new value first, then the details.

| Prop            | On        | Receives                                                      |
| --------------- | --------- | ------------------------------------------------------------- |
| `onValueChange` | `Listbox` | `(value, details)`: the new value, and the [reason](#reasons) |
| `onHighlight`   | `Listbox` | `(value, details)`: the focused option's value, and its index |

## Accessibility

Follows the [WAI-ARIA listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), with both of its keyboard models for several options. Options take real focus with one roving tab stop. Every option says whether it's selected.

### Focus

The list is one tab stop. Tab returns to the last focused option, then falls back to the first selected or enabled option. Options receive real DOM focus, so `focus-visible` works directly. With `virtualFocus`, the list is the tab stop and keeps focus instead.

The root forwards focus into the options, including when you press a Field label or the list’s padding. Escape stays available to an enclosing dialog.

### Tested Behavior

Every line below is an automated test.

**Focus**

- Tab lands on the first option when nothing is selected.
- Tab lands on the selected option.
- Tab lands on the first selected option with multiple.
- The list is one tab stop: Tab leaves it from any option.
- Shift+Tab back into the list returns to the option focused last.
- A press focuses the option.
- Arrow keys skip disabled options.
- A disabled option can't be chosen.
- Arrow keys from a pressed disabled option move to the enabled ones around it.
- Tab lands on the first enabled option when the selected one is disabled.

**Single selection**

- Arrow keys move focus and the selection follows.
- Home and End move to the first and last option.
- Arrow keys wrap from the last option to the first.
- With loop off, arrow keys stop at the ends.
- A press selects the option.
- Pressing the selected option keeps it selected.
- With deselectable, pressing the selected option unselects it.
- With manual activation, arrows only move focus and Space selects.
- Typing moves focus to the next option that starts with it, and selects it.
- Typing several letters finds the option that starts with them.
- Escape leaves the selection alone.

**Multiple selection**

- Presses and Space toggle options.
- Arrow keys move focus without changing the selection.
- Shift with a press selects the range from the last option chosen.
- Shift with an arrow passes over a disabled option.
- A range skips disabled options.
- A second Shift press changes the range, keeping what was selected before it.
- Shift with an arrow key moves focus and extends the selection.
- Shift with Space selects from the last option chosen to the focused one.
- Ctrl+Shift+End selects from the focused option to the last.
- Ctrl+Shift+Home selects from the focused option to the first.
- Ctrl+A selects every enabled option, and again unselects them.
- Ctrl+A does nothing in a single listbox.
- Typing moves focus without selecting.

**Multiple selection with automatic activation**

- A press replaces the selection.
- Ctrl or Cmd with a press adds an option, and removes it again.
- Shift with a press replaces the selection with a range.
- Arrow keys select the option they move to.
- Ctrl or Cmd with an arrow moves focus only, and with Space toggles.
- Shift with an arrow key extends the selection.

**Horizontal**

- Left and Right move between options, and Up and Down don't.

**Groups**

- Arrow keys move across groups, skipping their labels.
- A range crosses groups.

**Form**

- Submits the selected value under its name.
- Submits each value with multiple.
- A reset returns to the default value.
- Required blocks submission until a value is selected.
- A disabled listbox can't be focused or changed, and submits nothing.
- A disabled fieldset disables the listbox.
- A read-only listbox can be browsed but not changed, and submits.

**Changes**

- A canceled change keeps the selection.
- A controlled listbox shows the value it's given.
- The controller clears and selects everything.

Runs in React, Vue and web components.

Beyond the pattern:

- Keys pressed with no waits between them all land.
- Escape leaves the selection alone and reaches a dialog around the list.
- A Shift press after the selection was cleared starts a new range there.
- Shift with an arrow never wraps past the end.
- A Shift press doesn't select the page's text.
- The selected option scrolls into view without taking focus.
- Arrow keys keep the focused option clear of the list's scroll padding at both ends.
- The selected option scrolls into view clear of the list's scroll padding.
- A focused option that leaves the list hands focus back to it, so keys keep working.
- Options that all leave take the tab stop with them, and options that come back hold it again.
- Options the app reorders keep their place in the keys.
- A press on the list's padding gives focus to the option that holds the tab stop.

**Touch**

- Taps toggle where clicks replace, since touch has no modifier keys.

**Focus on the list**

- With virtualFocus, keys move the highlight while focus stays on the list, which points at it.
- With virtualFocus, a press chooses an option and keeps focus on the list.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while choosing one option with a keyboard.
- Announcements while choosing several options with a keyboard.

Runs in React, Vue and web components.
