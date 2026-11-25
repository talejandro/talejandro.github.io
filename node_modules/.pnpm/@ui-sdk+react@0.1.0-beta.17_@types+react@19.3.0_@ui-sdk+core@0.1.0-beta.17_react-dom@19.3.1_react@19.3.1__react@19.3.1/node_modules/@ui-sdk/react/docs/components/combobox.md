# Combobox

Search a list of options and choose one or several values.

Use a Combobox when people need to find a choice by typing. Start with an input and a list, then add chips, server results, or the option to create something new as you need them.

```tsx title="demo.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Framework</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem
              key={framework.value}
              value={framework.value}
              label={framework.label}
            >
              {framework.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Type “sv” to find SvelteKit. Press Down Arrow to highlight it, then Enter to choose it.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `Combobox`:

```text
Combobox
├── ComboboxLabel
├── ComboboxInput
└── ComboboxContent
    └── ComboboxList
        ├── ComboboxItem
        └── ComboboxItem
```

Name the input, give each option a unique value, and put the options in a list inside the popup. The label names the input; choosing an option puts its label in the input.

## Usage

Import the parts and put them together:

```tsx
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@ui-sdk/react/combobox"

function Example() {
  return (
    <Combobox>
      <ComboboxLabel>Fruit</ComboboxLabel>
      <ComboboxInput placeholder="Search fruits…" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="apple">Apple</ComboboxItem>
          <ComboboxItem value="banana">Banana</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

## Autocomplete vs Combobox

Both filter a list as you type. They differ in what the value is.

- **Combobox**: the value is an option from the list, or several with `multiple`. The text is only a query; closing without choosing restores the selected label, and a form submits the value, not the text. Use it for a country, an assignee or a set of labels.
- **[Autocomplete](./autocomplete.md)**: the value is the text. Suggestions help fill it in, and anything typed is valid. Use it for a search box, an address or a free-form field.

`allowCustomValue` lets a combobox accept text that matches no option, like a datalist. Reach for it when choosing from the list is the main path; use an autocomplete when free text is.

## Build Your Own

`@ui-sdk/react/combobox` comes with a ready-made Combobox. If you'd like to build your own, with your own names, start from the `combobox` primitive in `@ui-sdk/core`:

```ts title="country-picker.ts"
"use client"

import { combobox } from "@ui-sdk/core/combobox"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: CountryPicker,
  Label: CountryLabel,
  Input: CountryInput,
  Content: CountryPopup,
  List: CountryList,
  Item: CountryOption,
  Empty: CountryEmpty,
} = createParts(combobox, {
  label: "label",
  input: "input",
  content: "div",
  list: "div",
  item: "div",
  empty: "div",
})

export {
  CountryEmpty,
  CountryInput,
  CountryLabel,
  CountryList,
  CountryOption,
  CountryPicker,
  CountryPopup,
}
```

```tsx
<CountryPicker>
  <CountryLabel>Country</CountryLabel>
  <CountryInput />
  <CountryPopup>
    <CountryEmpty>No countries found.</CountryEmpty>
    <CountryList>
      <CountryOption value="fr" label="France">
        France
      </CountryOption>
      <CountryOption value="jp" label="Japan">
        Japan
      </CountryOption>
    </CountryList>
  </CountryPopup>
</CountryPicker>
```

Each part keeps the behavior, state and data attributes of its ready-made counterpart: typing filters the options, arrow keys move the highlight and the popup opens in the top layer. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Disabled

A disabled combobox cannot be focused or changed and submits nothing. A read-only one remains focusable and submits its value, but does not open or accept changes. Keyboard navigation skips a disabled option, and it cannot be chosen.

```tsx title="disabled.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function Example() {
  return (
    <div data-slot="stack">
      {(["disabled", "readOnly", "item"] as const).map((variant) => (
        <Combobox
          key={variant}
          defaultValue={variant === "item" ? null : "fr"}
          itemToLabel={countryLabel}
          disabled={variant === "disabled"}
          readOnly={variant === "readOnly"}
        >
          <div data-slot="stack">
            <ComboboxLabel>
              {variant === "disabled"
                ? "Billing country"
                : variant === "readOnly"
                  ? "Shipping from"
                  : "Shipping to"}
            </ComboboxLabel>
            <div data-slot="row">
              <ComboboxInput placeholder="Search countries…" />
              <ComboboxTrigger aria-label="Show countries">
                <ChevronDownIcon aria-hidden="true" />
              </ComboboxTrigger>
            </div>
          </div>
          <ComboboxContent>
            <ComboboxEmpty>No countries found.</ComboboxEmpty>
            <ComboboxList>
              {countries.map((country) => (
                <ComboboxItem
                  key={country.value}
                  value={country.value}
                  label={country.label}
                  disabled={country.value === "dk"}
                >
                  {country.label}
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ))}
    </div>
  )
}

export { Example }
```

Billing country is disabled and Shipping from is read-only. Open Shipping to: arrow keys skip Denmark, which can't be chosen.

## Clear and Trigger

`ComboboxClear` clears both the selection and the query, then keeps focus in the input. It appears while either has a value. When someone deletes all the text, a single selection clears right away instead of when the list closes. Escape brings the selection back while the list is still open; closing it any other way leaves it cleared.

```tsx title="clear.tsx"
"use client"

import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { useLog } from "./log"
import * as React from "react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

const frameworkLabel = (value: string) =>
  frameworks.find((framework) => framework.value === value)?.label ?? value

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState<string | null>("sveltekit")

  return (
    <Combobox
      value={value}
      onValueChange={(next, details) => {
        setValue(next)
        log(`${next ? frameworkLabel(next) : "Cleared"} (${details.reason})`)
      }}
      itemToLabel={frameworkLabel}
    >
      <div data-slot="stack">
        <ComboboxLabel>Framework</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxClear aria-label="Clear framework">
            <XIcon aria-hidden="true" />
          </ComboboxClear>
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem key={framework.value} value={framework.value} label={framework.label}>
              {framework.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Choose a framework, then press the clear button. The selection and text clear, focus stays in the input, and the console logs each change.

## Auto Highlight

Add `autoHighlight` to highlight the first match while typing, so Enter can choose it immediately. With `autoHighlight="always"`, opening the list also highlights the selected item, or the first, so the arrow keys move from there. `autoHighlight="selected"` highlights only the selected item when the list opens, and nothing when none is. A highlight it placed follows the list as items arrive, and one the user moved stays while its item is there.

```tsx title="auto-highlight.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

function Example() {
  return (
    <Combobox autoHighlight>
      <div data-slot="stack">
        <ComboboxLabel>Country</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Type “sw” and press Enter" />
          <ComboboxTrigger aria-label="Show countries">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {countries.map((country) => (
            <ComboboxItem key={country.value} value={country.value} label={country.label}>
              {country.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Type “sw” and press Enter. The first matching country is already highlighted.

## Highlight Matches

`ComboboxItemText` marks the matching text. Matching ignores case and accents using the current locale, while the label keeps its original spelling. Its state also exposes segments if you want to render the marks yourself.

```tsx title="highlight.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Country</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search countries…" />
          <ComboboxTrigger aria-label="Show countries">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {countries.map((country) => (
            <ComboboxItem
              key={country.value}
              value={country.value}
              label={country.label}
              keywords={country.keywords}
            >
              <ComboboxItemText>
                {(state) =>
                  state.segments.map((segment, index) =>
                    segment.match ? (
                      <mark key={index}>{segment.text}</mark>
                    ) : (
                      segment.text
                    )
                  )
                }
              </ComboboxItemText>
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Type “an”. Matching letters are marked while each country keeps its original spelling.

## Filter and Keywords

`filter` accepts `"contains"` (the default), `"startsWith"`, a function of the item and query, or `false` for results already filtered by a server. A function can return a score instead of `true` or `false`, and items you pass as `items` then sort by it, best first. `fuzzyScore` from `@ui-sdk/core/text-match` scores an exact match above a prefix, and a prefix above a match inside the label.

Use `keywords` for text that should match without appearing in the label, such as a username or a country’s local name.

```tsx title="filter.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
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

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

function fuzzy(item: { label: string }, query: string) {
  let at = 0
  for (const char of item.label.toLowerCase()) {
    if (char === query[at]?.toLowerCase()) {
      at++
    }
  }
  return at === query.length
}

const filters = {
  contains: "contains",
  startsWith: "startsWith",
  fuzzy,
} as const
const modes = [
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "fuzzy", label: "Fuzzy" },
]
type Mode = keyof typeof filters

function Example() {
  const [mode, setMode] = React.useState<Mode>("contains")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={modes}
          value={mode}
          onValueChange={(next) => next && setMode(next as Mode)}
        >
          <SelectLabel>Filter</SelectLabel>
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
      </div>
      <Combobox filter={filters[mode]}>
        <div data-slot="stack">
          <ComboboxLabel>Country</ComboboxLabel>
          <div data-slot="row">
            <ComboboxInput placeholder="Try “an”, “swd” or “deutschland”" />
            <ComboboxTrigger aria-label="Show countries">
              <ChevronDownIcon aria-hidden="true" />
            </ComboboxTrigger>
          </div>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {countries.map((country) => (
              <ComboboxItem
                key={country.value}
                value={country.value}
                label={country.label}
                keywords={country.keywords}
              >
                {country.label}
                <ComboboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export { Example }
```

Type “an” and switch Filter between Contains and Starts with. Choose Fuzzy and type “swd” for Sweden, or type “deutschland” to find Germany through a keyword.

## Groups

Use `ComboboxGroup` and `ComboboxGroupLabel` to name groups. Filtering hides empty groups and separators as their items disappear.

```tsx title="groups.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"

const timezones = [
  {
    label: "Americas",
    items: [
      { value: "America/New_York", label: "New York" },
      { value: "America/Chicago", label: "Chicago" },
      { value: "America/Denver", label: "Denver" },
      { value: "America/Los_Angeles", label: "Los Angeles" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Madrid", label: "Madrid" },
    ],
  },
  {
    label: "Asia & Pacific",
    items: [
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Kolkata", label: "Kolkata" },
      { value: "Australia/Sydney", label: "Sydney" },
    ],
  },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Timezone</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search cities…" />
          <ComboboxTrigger aria-label="Show timezones">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No cities found.</ComboboxEmpty>
        <ComboboxList>
          {timezones.map((group, index) => (
            <React.Fragment key={group.label}>
              {index > 0 && <ComboboxSeparator />}
              <ComboboxGroup>
                <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
                {group.items.map((item) => (
                  <ComboboxItem key={item.value} value={item.value} label={item.label}>
                    {item.label}
                    <ComboboxItemIndicator>
                      <CheckIcon aria-hidden="true" />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </React.Fragment>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Type “chic”. Chicago remains in Americas; groups with no matches disappear.

## Icons

`ComboboxItemIcon` keeps decorative icons out of accessible names, filtering, and match marks. `ComboboxValueIcon` projects the selected item’s icon next to the input; it takes no children and is only for a single selection.

Wrap the input and icon together, then use that wrapper as the popup’s `anchor`. Add `mirror` for directional icons. An icon-only option still needs an `aria-label`.

```tsx title="icons.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIcon,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValueIcon,
} from "@ui-sdk/react/combobox"
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  CircleCheckIcon,
  CircleXIcon,
} from "lucide-react"
import * as React from "react"

function Example() {
  const [field, setField] = React.useState<HTMLDivElement | null>(null)

  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Status</ComboboxLabel>
        <div ref={setField} data-slot="row">
          <ComboboxValueIcon />
          <ComboboxInput placeholder="Select a status" />
          <ComboboxTrigger aria-label="Show statuses">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent anchor={field}>
        <ComboboxEmpty>No statuses found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxItem value="backlog" label="Backlog">
            <ComboboxItemIcon>
              <CircleIcon />
            </ComboboxItemIcon>
            <ComboboxItemText />
            <ComboboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ComboboxItemIndicator>
          </ComboboxItem>
          <ComboboxItem value="in-progress" label="In progress">
            <ComboboxItemIcon mirror>
              <ArrowRightIcon />
            </ComboboxItemIcon>
            <ComboboxItemText />
            <ComboboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ComboboxItemIndicator>
          </ComboboxItem>
          <ComboboxItem value="done" label="Done">
            <ComboboxItemIcon>
              <CircleCheckIcon />
            </ComboboxItemIcon>
            <ComboboxItemText />
            <ComboboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ComboboxItemIndicator>
          </ComboboxItem>
          <ComboboxItem value="canceled" label="Canceled">
            <ComboboxItemIcon>
              <CircleXIcon />
            </ComboboxItemIcon>
            <ComboboxItemText />
            <ComboboxItemIndicator>
              <CheckIcon aria-hidden="true" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Choose Done. Its icon appears next to the input as well as in the list.

## Custom Items

Show useful context beside a label, such as a username or role. Set `label` explicitly so filtering and the input use the intended text, and put extra search terms in `keywords`.

```tsx title="custom-items.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const users = [
  { id: 1, name: "Hollis Grant", username: "hollis", role: "Owner" },
  { id: 2, name: "Inès Moreau", username: "ines", role: "Admin" },
  { id: 3, name: "Kofi Mensah", username: "kofi", role: "Member" },
  { id: 4, name: "Wren Takahashi", username: "wren", role: "Member" },
  { id: 5, name: "Tomasz Wójcik", username: "tomasz", role: "Guest" },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Owner</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search people…" />
          <ComboboxTrigger aria-label="Show people">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No people found.</ComboboxEmpty>
        <ComboboxList>
          {users.map((user) => (
            <ComboboxItem key={user.id} value={user.username} label={user.name} keywords={[user.username]}>
              <span data-slot="badge">{user.name.slice(0, 1)}</span>
              <span data-slot="stack">
                <span>{user.name}</span>
                <span data-slot="hint">@{user.username}</span>
              </span>
              <span data-slot="hint">{user.role}</span>
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Search for a person’s name or username. Choose a result to put that person’s name in the input.

## Items as Data

Pass `items` when the combobox needs the whole collection, such as recent items, server results, or virtualization. It can render bare parts for you, or you can render the parts yourself from the list's `state.items`. Each item's `label` supplies the text for filtering and the input; `keywords` and `disabled` work the same as with items you render yourself. [Lists and Menus](../lists-and-menus.md) covers the `ListData` format.

```tsx
const fruits = [
  { value: "apple", label: "Apple" },
  { value: "cherry", label: "Cherry", keywords: ["red"] },
  { type: "group", label: "Citrus", items: [{ value: "lemon", label: "Lemon" }] },
]

<Combobox items={fruits}>
  <ComboboxInput aria-label="Fruit" />
</Combobox>
```

Items can change while the list is open. Selection and highlight stay on their items; removing the highlighted item clears the highlight.

## Recent Items

`emptyItems` supplies suggestions while the query is empty. Pair it with `items` for the full searchable collection. Render the list from `state.items` so it follows the active collection.

```tsx title="recent.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

const recentCountries = [
  {
    type: "group" as const,
    label: "Recent",
    items: [countries[9], countries[12], countries[15]],
  },
]

function Example() {
  return (
    <Combobox
      items={countries}
      emptyItems={recentCountries}
      announcement={(change) =>
        change.type === "results" ? `${change.count} countries match` : null
      }
    >
      <div data-slot="stack">
        <ComboboxLabel>Country</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search countries…" />
          <ComboboxTrigger aria-label="Show countries">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {(state) =>
            (
              state.items as (
                (typeof countries)[number] | (typeof recentCountries)[number]
              )[]
            ).map((entry) =>
              "items" in entry ? (
                <ComboboxGroup key={entry.label}>
                  <ComboboxGroupLabel>{entry.label}</ComboboxGroupLabel>
                  {entry.items.map((country) => (
                    <ComboboxItem key={country.value} value={country.value} label={country.label}>
                      <ComboboxItemText />
                      <ComboboxItemIndicator>
                        <CheckIcon aria-hidden="true" />
                      </ComboboxItemIndicator>
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              ) : (
                <ComboboxItem key={entry.value} value={entry.value} label={entry.label}>
                  <ComboboxItemText />
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              )
            )
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Open the empty input to see Recent. Start typing to search all countries; clear the text to return to Recent.

## Object Values

Use `itemToValue` for an object’s string identity and form value, `itemToLabel` for its displayed text, and `isItemEqualToValue` when two different objects can represent the same option.

Choose a reviewer. The displayed selection retains the person’s object, while the form value uses their ID.

```tsx
<Combobox
  name="reviewer"
  itemToValue={(person) => String(person.id)}
  itemToLabel={(person) => person.name}
  isItemEqualToValue={(person, value) => person.id === value.id}
/>
```

## Multiple

Add `multiple` to make the value an array. Choosing an option toggles it, keeps the list open, and clears the query. Put `ComboboxValue` and the input inside `ComboboxChips`, then render each value as a chip with a removal button.

Backspace in an empty input removes the last chip in one press. Unlike [Token Input](./token-input.md#deleting-tokens), there is no `tokenDeletion` option to select it first. Arrow keys move between chips. Supply `itemToLabel` when starting with values whose labels are not yet known from rendered items.

Add `keepQuery` to choose several matches without retyping the query.

```tsx title="multiple.tsx"
"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

const frameworkLabel = (value: string) =>
  frameworks.find((framework) => framework.value === value)?.label ?? value

function Example() {
  return (
    <Combobox multiple defaultValue={["next", "astro"]} itemToLabel={frameworkLabel}>
      <div data-slot="stack">
        <ComboboxLabel>Frameworks</ComboboxLabel>
        <div data-slot="row">
          <ComboboxChips>
            <ComboboxValue>
              {(state) =>
                (state.value as string[]).map((value, index) => (
                  <ComboboxChip key={value} value={value}>
                    {state.labels[index]}
                    <ComboboxChipRemove aria-label={`Remove ${state.labels[index]}`}>
                      <XIcon aria-hidden="true" />
                    </ComboboxChipRemove>
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxInput placeholder="Add a framework…" />
          </ComboboxChips>
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem key={framework.value} value={framework.value} label={framework.label}>
              {framework.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Choose several frameworks. Remove one with its chip button, or press Backspace in the empty input to remove the last chip.

## Select All

`ComboboxSelectAll` toggles every matching, enabled option. Inside a group, it affects only that group. It joins keyboard navigation and reports a mixed state while some of its options are selected.

```tsx title="select-all.tsx"
"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSelectAll,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, MinusIcon, XIcon } from "lucide-react"

const timezones = [
  {
    label: "Americas",
    items: [
      { value: "America/New_York", label: "New York" },
      { value: "America/Chicago", label: "Chicago" },
      { value: "America/Denver", label: "Denver" },
      { value: "America/Los_Angeles", label: "Los Angeles" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Madrid", label: "Madrid" },
    ],
  },
  {
    label: "Asia & Pacific",
    items: [
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Kolkata", label: "Kolkata" },
      { value: "Australia/Sydney", label: "Sydney" },
    ],
  },
]

function Example() {
  return (
    <Combobox multiple defaultValue={["Europe/Paris"]}>
      <div data-slot="stack">
        <ComboboxLabel>Timezones</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((value, index) => (
                <ComboboxChip key={value} value={value}>
                  {state.labels[index]}
                  <ComboboxChipRemove aria-label={`Remove ${state.labels[index]}`}>
                    <XIcon aria-hidden="true" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput placeholder="Add timezones…" />
        </ComboboxChips>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No timezones found.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxSelectAll>
            <span>
              <CheckIcon aria-hidden="true" />
              <MinusIcon aria-hidden="true" />
            </span>
            Select all
          </ComboboxSelectAll>
          {timezones.map((group) => (
            <ComboboxGroup key={group.label}>
              <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
              <ComboboxSelectAll>
                {(state) =>
                  state.checked
                    ? `Clear ${group.label}`
                    : `Select all in ${group.label}`
                }
              </ComboboxSelectAll>
              {group.items.map((zone) => (
                <ComboboxItem key={zone.value} value={zone.value} label={zone.label}>
                  <span>
                    <ComboboxItemIndicator>
                      <CheckIcon aria-hidden="true" />
                    </ComboboxItemIndicator>
                  </span>
                  {zone.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Open the list and choose a group’s select-all option. Type to narrow the matches, then use the main select-all option on those results.

## Chips That Collapse

Add `ComboboxChipsOverflow` to keep chips on one line. It measures which chips fit, hides the rest, and exposes their count and labels. Separately, `ComboboxValue` can use `max` to show a short text summary of the selection.

```tsx title="chips-overflow.tsx"
"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsOverflow,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, XIcon } from "lucide-react"

const countries = [
  { value: "ar", label: "Argentina", keywords: ["república argentina"] },
  { value: "au", label: "Australia", keywords: ["oz"] },
  { value: "at", label: "Austria", keywords: ["österreich"] },
  { value: "be", label: "Belgium", keywords: ["belgië", "belgique"] },
  { value: "br", label: "Brazil", keywords: ["brasil"] },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark", keywords: ["danmark"] },
  { value: "fi", label: "Finland", keywords: ["suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["deutschland"] },
  { value: "gr", label: "Greece", keywords: ["hellas", "ελλάδα"] },
  { value: "jp", label: "Japan", keywords: ["nippon", "日本"] },
  { value: "nl", label: "Netherlands", keywords: ["holland", "nederland"] },
  { value: "es", label: "Spain", keywords: ["españa"] },
  { value: "se", label: "Sweden", keywords: ["sverige"] },
  {
    value: "ch",
    label: "Switzerland",
    keywords: ["schweiz", "suisse", "svizzera"],
  },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function Example() {
  return (
    <Combobox multiple defaultValue={["fr", "jp", "se", "de", "ch"]} itemToLabel={countryLabel}>
      <div data-slot="stack">
        <ComboboxLabel>Countries</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((value, index) => (
                <ComboboxChip key={value} value={value}>
                  {state.labels[index]}
                  <ComboboxChipRemove aria-label={`Remove ${state.labels[index]}`}>
                    <XIcon aria-hidden="true" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsOverflow
            render={(props, state) => (
              <span {...props} title={state.labels.join(", ")}>
                +{state.count}
              </span>
            )}
          />
          <ComboboxInput placeholder="Add…" />
        </ComboboxChips>
        <p data-slot="hint">
          <ComboboxValue
            maxLabels={2}
            getMoreLabel={(count) => `${count} more`}
          />
        </p>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {countries.map((country) => (
            <ComboboxItem key={country.value} value={country.value} label={country.label}>
              {country.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Add or remove countries. Chips that no longer fit are replaced by an overflow count; the summary below lists the first two.

## Max Selected

`maxSelected` limits a multiple selection. Once the limit is reached, other options become disabled; their `maxReached` state explains why.

```tsx title="max-selected.tsx"
"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, XIcon } from "lucide-react"

const labels = [
  "Bug",
  "Feature",
  "Documentation",
  "Design",
  "Performance",
  "Security",
  "Testing",
]

function Example() {
  return (
    <Combobox multiple maxSelected={3} defaultValue={["Bug", "Design"]}>
      <div data-slot="stack">
        <ComboboxLabel>Labels (up to 3)</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((label) => (
                <ComboboxChip key={label} value={label}>
                  {label}
                  <ComboboxChipRemove aria-label={`Remove ${label}`}>
                    <XIcon aria-hidden="true" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput placeholder="Add labels…" />
        </ComboboxChips>
      </div>
      <ComboboxContent>
        <ComboboxList>
          {labels.map((label) => (
            <ComboboxItem key={label} value={label}>
              {(state) => (
                <>
                  {label}
                  {state.maxReached && (
                    <span data-slot="hint">Limit reached</span>
                  )}
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Choose a third label. Other unselected labels become unavailable until you remove one.

## Create Option

`ComboboxCreate` offers the query when no label matches it exactly and it meets `minLength`. Use `onCreate` to save it; return a promise for asynchronous work. Creation does not change the selection itself: add the new item and select it after saving.

While saving, the option reports `data-pending`, `aria-busy` and `aria-disabled`. A rejected promise is available through its error state.

```tsx title="create.tsx"
"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxCreate,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, LoaderCircleIcon, PlusIcon, XIcon } from "lucide-react"
import * as React from "react"

const initialLabels = [
  "Bug",
  "Feature",
  "Documentation",
  "Design",
  "Performance",
  "Security",
  "Testing",
]

function saveLabel(name: string) {
  return new Promise<void>((resolve, reject) =>
    setTimeout(
      () =>
        name.length > 20
          ? reject(new Error("Labels are 20 characters at most."))
          : resolve(),
      800
    )
  )
}

function Example() {
  const [labels, setLabels] = React.useState(initialLabels)
  const [value, setValue] = React.useState<string[]>(["Bug"])

  return (
    <Combobox multiple value={value} onValueChange={setValue}>
      <div data-slot="stack">
        <ComboboxLabel>Labels</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((label) => (
                <ComboboxChip key={label} value={label}>
                  {label}
                  <ComboboxChipRemove aria-label={`Remove ${label}`}>
                    <XIcon aria-hidden="true" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput placeholder="Add or create a label…" />
        </ComboboxChips>
      </div>
      <ComboboxContent>
        <ComboboxList>
          {labels.map((label) => (
            <ComboboxItem key={label} value={label}>
              {label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
          <ComboboxCreate
            minLength={2}
            onCreate={async (query) => {
              await saveLabel(query)
              setLabels((list) => [...list, query])
              setValue((list) => [...list, query])
            }}
          >
            {(state) =>
              state.pending ? (
                <>
                  <LoaderCircleIcon aria-hidden="true" data-slot="spinner" />
                  Creating “{state.query}”…
                </>
              ) : (
                <>
                  <PlusIcon aria-hidden="true" />
                  <span data-slot="stack">
                    Create “{state.query}”
                    {state.error ? (
                      <span data-slot="hint">
                        {(state.error as Error).message}
                      </span>
                    ) : null}
                  </span>
                </>
              )
            }
          </ComboboxCreate>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Type a new label and choose Create. It becomes a selected chip after saving; a label longer than 20 characters shows an error.

## Custom Value

Use `allowCustomValue` when suggestions are optional, like a datalist. Unmatched text becomes the value on Enter with nothing highlighted, or when the list closes. This does not create a new item in the collection.

```tsx title="custom-value.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
} from "@ui-sdk/react/combobox"
import { CheckIcon } from "lucide-react"
import { useLog } from "./log"
import * as React from "react"

const titles = [
  "Designer",
  "Engineer",
  "Engineering manager",
  "Product manager",
  "Researcher",
]

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <Combobox
      allowCustomValue
      value={value}
      onValueChange={(next, details) => {
        setValue(next)
        log(`${next ? `“${next}”` : "No title"} (${details.reason})`)
      }}
    >
      <div data-slot="stack">
        <ComboboxLabel>Job title</ComboboxLabel>
        <ComboboxInput placeholder="Type any title…" />
      </div>
      <ComboboxContent>
        <ComboboxEmpty>
          {(state) =>
            state.empty ? `Press Enter to use “${state.query}”.` : null
          }
        </ComboboxEmpty>
        <ComboboxList>
          {titles.map((title) => (
            <ComboboxItem key={title} value={title}>
              {title}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Type a job title that isn't suggested, then press Enter without a highlighted option or leave the field. The text becomes the value, and the console logs it.

## Input in the Popup

The input can live inside the popup, opened by a button showing the current value. The button then stays in the tab order. Anchor the content to it, clear the query when opening, and return focus to it after closing, as this example does.

```tsx title="popup.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
import * as React from "react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function Example() {
  const [button, setButton] = React.useState<HTMLButtonElement | null>(null)
  const [query, setQuery] = React.useState("")

  return (
    <Combobox
      defaultValue="jp"
      itemToLabel={countryLabel}
      query={query}
      onQueryChange={setQuery}
      onOpenChange={(open) => open && setQuery("")}
      onOpenChangeComplete={(open) => !open && button?.focus()}
    >
      <ComboboxTrigger ref={setButton} aria-label="Country">
        <span>
          <ComboboxValue>
            {(state) => state.label || "Select a country"}
          </ComboboxValue>
        </span>
        <ChevronDownIcon aria-hidden="true" />
      </ComboboxTrigger>
      <ComboboxContent anchor={button}>
        <div data-slot="row">
          <SearchIcon aria-hidden="true" />
          <ComboboxInput autoFocus aria-label="Search countries" placeholder="Search…" />
        </div>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {countries.map((country) => (
            <ComboboxItem key={country.value} value={country.value} label={country.label}>
              {country.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Press Country to open the search field inside the popup. Choose a country; closing the popup returns focus to the button.

## Async Search

Use [useAsyncOptions](../hooks/async-options.md) to debounce a search and discard stale results. Pass its `items` and `status` to the combobox, set `filter` to `false`, and send query changes to the loader.

`ComboboxStatus` and `ComboboxEmpty` provide loading, error, and empty messages. Without a custom status, the combobox announces the result count once typing pauses.

```tsx title="async.tsx"
"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMovies(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(
        movieTitles
          .filter((title) => title.toLowerCase().includes(needle))
          .map((title) => ({
            value: title.toLowerCase().replace(/\W+/g, "-"),
            label: title,
          }))
      )
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function Example() {
  const movies = useAsyncOptions(searchMovies, {
    debounce: 300,
    query: "the",
    immediate: true,
  })

  return (
    <Combobox
      items={movies.items}
      defaultQuery="the"
      filter={false}
      status={movies.status}
      onQueryChange={(query) => movies.setQuery(query)}
    >
      <div data-slot="stack">
        <ComboboxLabel>Movie</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search movies…" />
          <ComboboxTrigger aria-label="Show movies">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxStatus>
          {(state) =>
            state.status === "error"
              ? "Couldn't load movies."
              : state.loading
                ? "Searching…"
                : `${state.count} ${state.count === 1 ? "movie" : "movies"}`
          }
        </ComboboxStatus>
        <ComboboxEmpty>
          {(state) =>
            state.empty && !state.loading
              ? `No movies match “${state.query}”.`
              : null
          }
        </ComboboxEmpty>
        <ComboboxList>
          {(state) =>
            (
              state.items as {
                value: string
                label: string
                disabled?: boolean
              }[]
            ).map((item) => (
              <ComboboxItem key={item.value} value={item.value} label={item.label} disabled={item.disabled}>
                {item.label}
                <ComboboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Replace “the” with another movie title. The status shows the pending search, then the latest results.

## Load More

`onLoadMore` runs when scrolling or highlighting reaches the last option, once per page and not while a page loads. Connect it to the async loader’s `loadMore()`; return `{ items, hasMore }` from each page.

```tsx title="infinite.tsx"
"use client"

import { useAsyncOptions } from "@ui-sdk/react/async-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMoviePages(
  query: string,
  { signal, page }: { signal: AbortSignal; page: number }
) {
  return new Promise<{
    items: { value: string; label: string }[]
    hasMore: boolean
  }>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      const found = movieTitles
        .filter((title) => title.toLowerCase().includes(needle))
        .map((title) => ({
          value: title.toLowerCase().replace(/\W+/g, "-"),
          label: title,
        }))
      resolve({
        items: found.slice(page * 5, page * 5 + 5),
        hasMore: found.length > page * 5 + 5,
      })
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function Example() {
  const movies = useAsyncOptions(searchMoviePages, { immediate: true })

  return (
    <Combobox
      items={movies.items}
      filter={false}
      status={movies.status}
      onQueryChange={(query) => movies.setQuery(query)}
      onLoadMore={movies.loadMore}
    >
      <div data-slot="stack">
        <ComboboxLabel>Movie</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search movies…" />
          <ComboboxTrigger aria-label="Show movies">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>
          {(state) =>
            state.empty && !state.loading ? "No movies found." : null
          }
        </ComboboxEmpty>
        <ComboboxList>
          {(state) =>
            (
              state.items as {
                value: string
                label: string
                disabled?: boolean
              }[]
            ).map((item) => (
              <ComboboxItem key={item.value} value={item.value} label={item.label} disabled={item.disabled}>
                {item.label}
                <ComboboxItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))
          }
        </ComboboxList>
        <ComboboxStatus>
          {(state) =>
            state.loading
              ? "Loading more…"
              : movies.hasMore
                ? `${state.count} loaded`
                : `All ${state.count}`
          }
        </ComboboxStatus>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Open the movies and scroll or arrow to the last result. Another page loads while the existing results stay available.

## Virtualized

Supply `items` so filtering and keyboard navigation know about every option, even when only a few rows render. The list’s `state.items` contains matches, `onHighlight` reports the row to reveal, and each rendered item’s `index` gives its position in the full list to screen readers.

This example windows 10,000 items. Keep the actual row height aligned with your virtualizer’s measurement, and use the scroller’s visible height when revealing a row.

```tsx title="virtualized.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

const manyItems = Array.from({ length: 10_000 }, (_, index) => ({
  value: `item-${index + 1}`,
  label: `Item ${index + 1}`,
}))

function visibleRows(
  scrollTop: number,
  height: number,
  count: number,
  row: number
) {
  const start = Math.max(0, Math.floor(scrollTop / row) - 4)
  const end = Math.min(count, Math.ceil((scrollTop + height) / row) + 4)
  return { start, end }
}

function scrollForRow(
  index: number,
  scrollTop: number,
  height: number,
  row: number
) {
  const top = index * row
  if (top < scrollTop) {
    return top
  }
  if (top + row > scrollTop + height) {
    return top + row - height
  }
  return scrollTop
}

const row = 32
const height = 288

function Example() {
  const scroller = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)

  return (
    <Combobox
      items={manyItems}
      onHighlight={(value, { index }) => {
        const el = scroller.current
        if (el && index >= 0) {
          el.scrollTop = scrollForRow(index, el.scrollTop, el.clientHeight, row)
        }
      }}
    >
      <div data-slot="stack">
        <ComboboxLabel>Item</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Search 10,000 items…" />
          <ComboboxTrigger aria-label="Show items">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <div
          ref={scroller}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <ComboboxList>
            {(state) => {
              const items = state.items as { value: string; label: string }[]
              const { start, end } = visibleRows(
                scrollTop,
                height,
                items.length,
                row
              )
              return (
                <div style={{ height: items.length * row }}>
                  {items.slice(start, end).map((item, offset) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.value}
                      label={item.label}
                      index={start + offset}
                      style={{ top: (start + offset) * row, height: row }}
                    >
                      {item.label}
                    </ComboboxItem>
                  ))}
                </div>
              )
            }}
          </ComboboxList>
        </div>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Search 10,000 items or move through them with the arrow keys. Only the nearby rows render.

## Controlled

The selection, text, and popup have separate values:

| Value   | Change notification | Meaning                                        |
| ------- | ------------------- | ---------------------------------------------- |
| `value` | `onValueChange`     | One value or `null`; an array with `multiple`. |
| `query` | `onQueryChange`     | The input’s text.                              |
| `open`  | `onOpenChange`      | Whether the popup is open.                     |

Control only the values you need. Change callbacks include a reason and `details.cancel()` to reject the request. Choosing an item writes its label into the input, and a canceled choice keeps the current one. Closing without choosing restores the value’s label unless custom values are allowed. [State and Events](../state-and-events.md) covers the binding pattern.

Focus leaving the input closes the popup with the reason `focus-out`, even when code moves it, like a notice that takes focus. To keep the popup open, cancel that close in `onOpenChange`.

```tsx title="controlled.tsx"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "./log"
import * as React from "react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

function Example() {
  const [value, setValue] = React.useState<string | null>("fr")
  const [query, setQuery] = React.useState("France")
  const [open, setOpen] = React.useState(false)
  const log = useLog()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button type="button" onClick={() => setValue("jp")}>
          Choose Japan
        </button>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
      </div>
      <Combobox
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          log(`value: ${next} (${details.reason})`)
        }}
        query={query}
        onQueryChange={(next, details) => {
          setQuery(next)
          log(`query: “${next}” (${details.reason})`)
        }}
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next)
          log(`open: ${next} (${details.reason})`)
        }}
        itemToLabel={countryLabel}
        debug
      >
        <div data-slot="stack">
          <ComboboxLabel>Country</ComboboxLabel>
          <div data-slot="row">
            <ComboboxInput placeholder="Search countries…" />
            <ComboboxTrigger aria-label="Show countries">
              <ChevronDownIcon />
            </ComboboxTrigger>
          </div>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {countries.map((country) => (
              <ComboboxItem key={country.value} value={country.value} label={country.label}>
                {country.label}
                <ComboboxItemIndicator>
                  <CheckIcon />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export { Example }
```

Type, choose, or use the buttons. The console logs each value, query and open change with its reason.

## Controller

Pass a controller from `createComboboxController()`. It can read or set the value and query, open or close the list, and focus the input. `open()` resolves when the list closes with its reason and source, including `unmount`; pass an abort signal to close it on cancellation. [Controllers](../controllers.md) covers lifetime and setup.

```tsx title="controller.tsx"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  createComboboxController,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "./log"
import * as React from "react"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

const country = createComboboxController<string>()

function Example() {
  const log = useLog()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <button
          type="button"
          onClick={async () => {
            const { reason } = await country.open()
            log(`Closed by ${reason}, with ${country.getValue() ?? "nothing"}`)
          }}
        >
          Open and Wait
        </button>
        <button
          type="button"
          onClick={() => {
            country.focus()
            country.setQuery("sw")
            country.open()
          }}
        >
          Search “sw”
        </button>
        <button type="button" onClick={() => country.setValue("de")}>
          Choose Germany
        </button>
        <button type="button" onClick={() => country.clear()}>
          Clear
        </button>
      </div>
      <Combobox controller={country} itemToLabel={countryLabel}>
        <div data-slot="stack">
          <ComboboxLabel>Country</ComboboxLabel>
          <div data-slot="row">
            <ComboboxInput placeholder="Search countries…" />
            <ComboboxTrigger aria-label="Show countries">
              <ChevronDownIcon />
            </ComboboxTrigger>
          </div>
        </div>
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {countries.map((item) => (
              <ComboboxItem key={item.value} value={item.value} label={item.label}>
                {item.label}
                <ComboboxItemIndicator>
                  <CheckIcon />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export { Example }
```

Use the buttons to drive the combobox from outside. Open and Wait logs how the list closed and what was chosen.

## Positioning

`side` and `align` place the popup around the input or chips. `anchor` can use a different element, and `ComboboxArrow` follows the side chosen after collision handling. [Popups](../popups.md#place-the-content) covers offsets and available space.

The page stays usable by default. `modal="pointer"` makes an outside press only dismiss the list; `modal` also locks scrolling and makes the rest of the page inert. The popup uses the top layer and renders in place; use `container` when its DOM belongs elsewhere, such as a shadow root.

```tsx title="positioning.tsx"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from "@ui-sdk/react/combobox"
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
import * as React from "react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

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
  const [align, setAlign] = React.useState<Align>("start")
  const [box, setBox] = React.useState<HTMLDivElement | null>(null)
  const [anchored, setAnchored] = React.useState(false)

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
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {sides.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                <SelectItemIndicator>
                  <CheckIcon />
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
            <ChevronDownIcon />
          </SelectTrigger>
          <SelectContent>
            {aligns.map((option) => (
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
            checked={anchored}
            onCheckedChange={(next) => setAnchored(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Anchor to the box
        </label>
      </div>
      <div ref={setBox} data-slot="card">
        <Combobox>
          <ComboboxInput aria-label="Framework" placeholder="Framework" />
          <ComboboxContent
            side={side}
            align={align}
            sideOffset={10}
            alignOffset={0}
            collisionPadding={16}
            anchor={anchored ? box : null}
          >
            <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
            <ComboboxList>
              {frameworks.map((framework) => (
                <ComboboxItem key={framework.value} value={framework.value} label={framework.label}>
                  {framework.label}
                  <ComboboxItemIndicator>
                    <CheckIcon />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  )
}

export { Example }
```

Pick a side and an alignment, then open the list. Check Anchor to the Box to place it against the box instead of the input.

## Animation

The content has `data-starting-style` while it opens and `data-ending-style` while it closes. Transition from those states, and the popup stays mounted until the exit finishes. `onOpenChangeComplete` runs after opening or closing finishes, and `keepMounted` on an item indicator keeps it in the page for a selection animation.

```css
[data-slot="combobox-content"] {
  transition:
    opacity 0.15s,
    translate 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &:is([data-starting-style], [data-ending-style]) {
    opacity: 0;
    translate: 0 -6px;
  }
}
```

```tsx title="animation.tsx"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { useLog } from "./log"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function Example() {
  const log = useLog()

  return (
    <Combobox
      onOpenChangeComplete={(open) =>
        log(open ? "Finished opening" : "Finished closing")
      }
    >
      <div data-slot="stack">
        <ComboboxLabel>Framework</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem key={framework.value} value={framework.value} label={framework.label}>
              {framework.label}
              <ComboboxItemIndicator keepMounted>
                <CheckIcon />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Open and close the list. The console logs when each animation finishes.

## Presentation

Use `presentation="sheet"` for a sheet, or `"auto"` to choose a sheet on small touch screens each time the list opens. The input moves into the sheet’s header; there is still one input and one query.

A touch opening leaves the keyboard closed. Tapping the header input opens the keyboard and grows the sheet; closing the keyboard keeps the query. Choosing an item closes the sheet unless `multiple` is set. Swiping down closes it with the reason `swipe`.

Keep the options inside `ComboboxList` so the header stays outside the listbox. Give sheet content a height, style it with `data-presentation`, and leave its `translate` for the sheet behavior. `--sheet-backdrop` controls the backdrop. The sheet is modal unless you set `modal` to false; mouse and keyboard openings keep input focus as it moves.

```tsx title="presentation.tsx"
"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "solidstart", label: "SolidStart" },
  { value: "qwik", label: "Qwik City" },
]

function Example() {
  return (
    <Combobox presentation="sheet">
      <div data-slot="stack">
        <ComboboxLabel>Framework</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxTrigger aria-label="Show frameworks">
            <ChevronDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {frameworks.map((framework) => (
            <ComboboxItem key={framework.value} value={framework.value} label={framework.label}>
              {framework.label}
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Open the field to see a sheet. On touch, tap the search field in its header to bring up the keyboard, or swipe down to close it.

## Forms

A combobox submits the selected value under `name`, rather than the query text. Multiple values submit as separate entries. `required` prevents empty submissions, reset restores the default selection and its label, and `form` joins a form from elsewhere on the page.

The server HTML includes the hidden inputs for the selection, so their values can submit before hydration. [Forms](../forms.md) covers the shared integration.

In a [Field](./field.md), the field supplies the input's accessible name, description and error. Submitting a required field without a selection sets `aria-invalid` and `data-invalid`.

```tsx title="form.tsx"
"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { useLog } from "./log"

const countries = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "at", label: "Austria" },
  { value: "be", label: "Belgium" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "dk", label: "Denmark" },
  { value: "fi", label: "Finland" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "gr", label: "Greece" },
  { value: "jp", label: "Japan" },
  { value: "nl", label: "Netherlands" },
  { value: "es", label: "Spain" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
]

const countryLabel = (value: string) =>
  countries.find((country) => country.value === value)?.label ?? value

const interests = ["Design", "Engineering", "Marketing", "Research", "Sales"]

function Example() {
  const log = useLog()

  return (
    <form
      data-slot="stack"
      onSubmit={(event) => {
        event.preventDefault()
        const entries = [...new FormData(event.currentTarget)].map(
          ([name, value]) => `${name}=${value}`
        )
        log(`Submitted ${entries.join("&")}`)
      }}
    >
      <Field name="country">
        <FieldLabel>Country</FieldLabel>
        <Combobox required itemToLabel={countryLabel}>
          <div data-slot="row">
            <ComboboxInput placeholder="Search countries…" />
            <ComboboxTrigger aria-label="Show countries">
              <ChevronDownIcon aria-hidden="true" />
            </ComboboxTrigger>
          </div>
          <ComboboxContent>
            <ComboboxEmpty>No countries found.</ComboboxEmpty>
            <ComboboxList>
              {countries.map((country) => (
                <ComboboxItem key={country.value} value={country.value} label={country.label}>
                  {country.label}
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>Where we ship your order.</FieldDescription>
        <div>
          <FieldError match="valueMissing">Choose a country.</FieldError>
        </div>
      </Field>
      <Field name="interests">
        <FieldLabel>Interests</FieldLabel>
        <Combobox multiple defaultValue={["Design"]}>
          <ComboboxChips>
            <ComboboxValue>
              {(state) =>
                (state.value as string[]).map((interest) => (
                  <ComboboxChip key={interest} value={interest}>
                    {interest}
                    <ComboboxChipRemove aria-label={`Remove ${interest}`}>
                      <XIcon aria-hidden="true" />
                    </ComboboxChipRemove>
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxInput placeholder="Add interests…" />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              {interests.map((interest) => (
                <ComboboxItem key={interest} value={interest}>
                  {interest}
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <div data-slot="row">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  )
}

export { Example }
```

Submit without a country to see the inline error. Choose one and submit; the console logs the values, and Reset restores the defaults.

## Custom Rendering

Every part takes `render`. Pass an element and its props merge with the part's, or a function that receives the props and the part's state. Each part's state is listed [below](#state).

```tsx title="custom-rendering.tsx"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from "lucide-react"

const users = [
  { id: 1, name: "Hollis Grant", username: "hollis", role: "Owner" },
  { id: 2, name: "Inès Moreau", username: "ines", role: "Admin" },
  { id: 3, name: "Kofi Mensah", username: "kofi", role: "Member" },
  { id: 4, name: "Wren Takahashi", username: "wren", role: "Member" },
  { id: 5, name: "Tomasz Wójcik", username: "tomasz", role: "Guest" },
]

function Example() {
  return (
    <Combobox>
      <div data-slot="stack">
        <ComboboxLabel>Assignee</ComboboxLabel>
        <div data-slot="row">
          <ComboboxInput
            placeholder="Search people…"
            render={(props) => (
              <div data-slot="row">
                <SearchIcon aria-hidden="true" />
                <input {...props} />
              </div>
            )}
          />
          <ComboboxTrigger aria-label="Show people">
            {(state) =>
              state.open ? (
                <ChevronUpIcon aria-hidden="true" />
              ) : (
                <ChevronDownIcon aria-hidden="true" />
              )
            }
          </ComboboxTrigger>
        </div>
      </div>
      <ComboboxContent>
        <ComboboxEmpty>No one by that name.</ComboboxEmpty>
        <ComboboxList>
          {users.map((user) => (
            <ComboboxItem key={user.id} value={user.username} label={user.name} keywords={[user.username]}>
              {(state) => (
                <>
                  <span data-slot="badge">{user.name.slice(0, 1)}</span>
                  <span data-slot="stack">
                    {user.name}
                    <span data-slot="hint">@{user.username}</span>
                  </span>
                  {state.selected ? (
                    <CheckIcon aria-hidden="true" />
                  ) : state.highlighted ? (
                    <kbd data-slot="kbd">Enter</kbd>
                  ) : null}
                </>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { Example }
```

Open the list and move through it. The chevron flips while it's open, the highlighted person shows Enter, and the chosen one shows a check.

## Styling

Each part has a `data-slot`, such as `combobox-content`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

Use `data-highlighted` for the active option and `data-selected` for chosen values. Because the keyboard highlight usually moves without focus leaving the input, use the content's `data-modality="keyboard"` to style it. Real focus can move into the list for touch screen readers or into the sheet.

`--anchor-width` follows the input or chips. `--available-height` doesn't inherit: when a nested scroller needs it, copy it to a custom property on the content, such as `--list-height: var(--available-height)`, then use that property on the scroller.

### ComboboxContent
- `--anchor-width`: Width of the anchor, usually the trigger. Use it to match widths.
- `--anchor-height`: Height of the anchor.
- `--available-width`: Space beside the popup, up to the viewport edge. Not inherited either.
- `--available-height`: Space between the anchor and the viewport edge. Use it for max-height. Not inherited, so a child that needs it copies it on the popup, like `[--list-height:var(--available-height)]`, and reads `max-h-(--list-height)`. The first popup registers both names for the whole page with `CSS.registerProperty`, so they don't inherit anywhere. A page that needs them to inherit calls it first, with `inherits: true`. An `@property` rule can't, since a registration in script wins.
- `--transform-origin`: The point on the anchor the popup opens from. Use it to scale from the right place.
- `--arrow-offset`: Where the anchor's center falls along the popup's edge, kept `arrowPadding` from the corners. Position a ::before arrow with it.
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

### ComboboxLabel
`[data-slot="combobox-label"]`

- `data-disabled`: Present when the combobox is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the combobox is read-only.
- `data-required`: Present when the combobox is required.

### ComboboxInput
`[data-slot="combobox-input"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.
- `data-disabled`: Present when the combobox is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the combobox is read-only.
- `data-required`: Present when the combobox is required.

### ComboboxTrigger
`[data-slot="combobox-trigger"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.
- `data-disabled`: Present when the combobox is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the combobox is read-only.
- `data-required`: Present when the combobox is required.

### ComboboxClear
`[data-slot="combobox-clear"]`

- `data-disabled`: Present when the combobox is disabled or read-only.

### ComboboxChips
`[data-slot="combobox-chips"]`

- `data-disabled`: Present when the combobox is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the combobox is read-only.
- `data-required`: Present when the combobox is required.

### ComboboxContent
`[data-slot="combobox-content"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-presentation` (`popover`, `sheet`): How the list presents this time it's open.
- `data-open`: Present while the list is open.
- `data-starting-style`: Present for the first frame. Style the state you animate from.
- `data-ending-style`: Present while the list animates out. Style the state you animate to.
- `data-side` (`top`, `right`, `bottom`, `left`): Where the list ended up, after flipping away from edges.
- `data-align` (`start`, `center`, `end`): How the list lines up with the input.
- `data-modality` (`keyboard`, `pointer`): Whether the keyboard or a pointer moves the highlight. Style a focus ring for the keyboard only.
- `data-has-icons`: Present while any item inside holds an icon part, so items without one can line up.

### ComboboxItem
`[data-slot="combobox-item"]`

- `data-selected`: Present on selected items, and on the check inside them.
- `data-disabled`: Present when the item can't be chosen, or `maxSelected` is reached.
- `data-highlighted`: Present on the highlighted item. Focus stays in the input.
- `data-has-icon`: Present on an item while it holds an icon part.

### ComboboxItemText
`[data-slot="combobox-item-text"]`

- `data-matched`: Present on an item's text while the input's text matched part of it, which is marked.

### ComboboxItemIndicator
`[data-slot="combobox-item-indicator"]`

- `data-selected`: Present on selected items, and on the check inside them.

### ComboboxEmpty
`[data-slot="combobox-empty"]`

- `data-loading`: Present while results load, with `status="loading"`.
- `data-empty`: Present while no item matches.

### ComboboxStatus
`[data-slot="combobox-status"]`

- `data-loading`: Present while results load, with `status="loading"`.

### ComboboxArrow
`[data-slot="combobox-arrow"]`

- `data-closed`: Present while the list is closed, including while it animates out.
- `data-open`: Present while the list is open.
- `data-side` (`top`, `right`, `bottom`, `left`): Where the list ended up, after flipping away from edges.
- `data-align` (`start`, `center`, `end`): How the list lines up with the input.
- `data-arrow-clamped`: Present on the arrow when it stops short of the middle of the input, held back by `arrowPadding`.

### ComboboxItemIcon
`[data-slot="combobox-item-icon"]`

- `data-mirror`: Present on an icon that flips in right-to-left text, with `mirror`.

### ComboboxChip
`[data-slot="combobox-chip"]`

- `data-value` (`a`): The chip's value, as the string it submits as.
- `data-disabled`: Present when the combobox is disabled or read-only, so the chip can't be removed.

### ComboboxChipRemove
`[data-slot="combobox-chip-remove"]`

- `data-disabled`: Present when the combobox is disabled or read-only.

### ComboboxSelectAll
`[data-slot="combobox-select-all"]`

- `data-disabled`: Present when nothing the select-all option covers can be chosen, or choosing them all would pass `maxSelected`.
- `data-unchecked`: Present on a select-all option while none of its items is selected.
- `data-highlighted`: Present on the highlighted item. Focus stays in the input.

### ComboboxCreate
`[data-slot="combobox-create"]`

- `data-highlighted`: Present while the create option is highlighted.
- `data-pending`: Present while the Promise `onCreate` returned is running.

## API Reference

Props and callbacks are the same as below, as React props.

### Combobox

- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `query?` (`string`): The input's text, which filters the list. Pass it to control it. Choosing an item sets it to the item's label, or empties it with `multiple`.
- `defaultQuery?` (`string`): The input's text at first, when uncontrolled. Defaults to the selected item's label.
- `onQueryChange?` (`((query: string, details: ChangeDetails<ComboboxQueryChangeReason>) => void)`): Runs when the input's text wants to change: typing, choosing an item, or closing with text that wasn't chosen.
- `open?` (`boolean`): Whether the list is open. Pass it to control it.
- `defaultOpen?` (`boolean`): Whether the list starts open, when uncontrolled.
- `onOpenChange?` (`((open: boolean, details: ChangeDetails<ComboboxOpenChangeReason>) => void)`): Runs when the list wants to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `onOpenChangeComplete?` (`((open: boolean) => void)`): Runs once the list has finished opening or closing, after any animation.
- `maxSelected?` (`number`): With `multiple`, how many items can be selected. Once reached, the other items are disabled.
- `items?` (`ListData<T>`): The items as data. Renders the list for you, and filters it without rendering every item.
- `emptyItems?` (`ListData<T>`): Items shown instead of `items` while the input is empty, like recent choices or suggestions. Groups work, like `{ type: "group", label: "Recent", items }`. Needs `items`.
- `filter?` (`ListFilter<T>`): How typing narrows the list: `"contains"`, `"startsWith"`, a function of the item and the text, whose numeric result also sorts data items, or `false` to keep every item, for results a server already filtered.
- `itemToValue?` (`((value: T) => string)`): The string an item's value submits as and is identified by, for object values. Strings pass through, and objects use their `value` or `id`.
- `itemToLabel?` (`((value: T) => string)`): The text a value shows, for values whose item isn't rendered, like async results.
- `isItemEqualToValue?` (`((itemValue: T, value: T) => boolean)`): Whether an item's value is the selected value, for object values that aren't the same object.
- `autoHighlight?` (`"always" | "selected" | boolean`): Whether the first matching item is highlighted while typing, so Enter chooses it. `"always"` also highlights the selected item, or the first, when the list opens, so arrows move from there. `"selected"` highlights only the selected item when the list opens, and nothing when none is.
- `keepQuery?` (`boolean`): With `multiple`, whether the input keeps its text after an item is chosen.
- `pendingAnnouncement?` (`string`): What screen readers hear once the Create part's `onCreate` has been pending for a second, so a slow action doesn't pass in silence. Set it in the page's language. An empty string says nothing.
- `allowCustomValue?` (`boolean`): Whether text that matches no item becomes the value, when Enter is pressed with nothing highlighted, or, without `multiple`, when the list closes. The value is the text itself.
- `status?` (`AsyncOptionsStatus`): Whether results are loading or failed, for the status and empty parts. Sets `aria-busy` on the list while loading.
- `onHighlight?` (`((value: T | null, details: ListHighlightDetails) => void)`): Runs when the highlight moves, with the item's index among the visible items, so a virtualized list can scroll to it.
- `onLoadMore?` (`(() => void)`): Runs when the highlight or scrolling reaches the last item, so the next page can load, like `createAsyncOptions`'s `loadMore`. Not again for the same items, unless the last load failed.
- `announcement?` (`((change: ListAnnouncement) => string | null | undefined)`): What screen readers hear after typing pauses, when no `ComboboxStatus` is rendered, and when a chip is removed. Return null for nothing.
- `loop?` (`boolean`): Whether arrow keys wrap from the last item to the first.
- `modal?` (`"pointer" | boolean`): `false`: the page stays usable while the list is open. `"pointer"`: an outside press only closes the list. `true`: also locks scroll and makes the rest of the page inert.
- `presentation?` (`PresentationSetting<"popover">`): How the list presents. `"sheet"` slides it up from the bottom of the screen with the input in its header, where it can be swiped away, and `"auto"` does that on small touch screens. A tap that opens a sheet leaves the keyboard closed until the input in the header is tapped. Decided each time it opens; the server renders `"popover"` for `"auto"`.
- `disabled?` (`boolean`): Disables the combobox like a native input: it can't be focused or changed, and the value isn't submitted.
- `readOnly?` (`boolean`): Keeps the combobox focusable and its value submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission until a value is selected, with the browser's own message.
- `name?` (`string`): The name the value submits under. Without one, the combobox submits nothing.
- `form?` (`string`): The id of a form to belong to, when the combobox isn't inside that form.
- `controller?` (`object`): Opens, closes, reads and sets the combobox from anywhere. Create one with `createComboboxController()`.
- `dismissible?` (`boolean`): Whether Escape, an outside press, focus or the window leaving, Android's back gesture and a sheet's swipe can close it. Triggers, Close parts and the controller always can. Pass `false` while it holds unsaved work, and ask in `onDismissAttempt`.
- `onDismissAttempt?` (`function`): Runs when `dismissible` refused a dismissal made on purpose: Escape, an outside press, back or a swipe. Focus or the window leaving is refused without it. Ask "Discard changes?" here.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.
- `multiple?` (`boolean`): Whether several items can be selected. The value is then a list, the list stays open as items toggle, and the input empties after each choice. Whether several items can be selected.
- `value?` (`T | T[] | null`): The selected value. Pass it to control the combobox. `null` selects nothing. The selected values. Pass it to control the combobox. The selected value, or values with `multiple`. Pass it to control the combobox.
- `defaultValue?` (`T | T[] | null`): The value selected at first, when uncontrolled. A form reset returns to it. The values selected at first, when uncontrolled. A form reset returns to them. The value or values selected at first, when uncontrolled. A form reset returns to it.
- `onValueChange?` (`union`): Runs when a user, a form reset or a controller wants to change the value. `details.reason` says why, and `details.cancel()` stops it.

`announcement` receives `{ type: "results", count, query, loading }` or `{ type: "removed", label }` and returns the words, or `null` for silence. The default is English: "3 results", "No results", "Loading" or "France removed".

### ComboboxLabel

The input's visible label. Renders a `label`.

### ComboboxInput

The text field that filters the list and shows the chosen label. Renders an `input`.

### ComboboxTrigger

Opens and closes the list. Renders a `button`, kept out of the tab order while the input sits beside it.

### ComboboxClear

- `keepMounted?` (`boolean`): Whether the clear button stays in the page while there's nothing to clear.

### ComboboxChips

Holds the chips and the input for a multiple selection. Renders a `div`.

### ComboboxValue

- `maxLabels?` (`number`): With `multiple`, how many labels the `label` in its state shows before the rest are counted, as in "France, Chile and 2 more", joined the way the page's language joins lists, or in English with the default `getMoreLabel`.
- `getMoreLabel?` (`((count: number) => string)`): The words for the labels past `maxLabels`.

### ComboboxChip

- `value` (`T`): The selected value this chip shows.

### ComboboxChipRemove

Removes its chip's value. Renders a `button`. Takes the same props as `ComboboxChip`.

### ComboboxChipsOverflow

Turns collapsing on for the chips around it, and shows how many are hidden. Renders a `span`.

### ComboboxValueIcon

Shows the selected item's icon beside the input. It takes no props of its own, and no children.

### ComboboxContent

- `side?` (`Side`): Which side of the anchor the popup opens on. Flips to the other side when there isn't room. Which side of the input the list opens on.
- `align?` (`Align`): How the popup lines up with the anchor along that side. `start` and `end` follow the reading direction. How the list lines up with the input along that side.
- `sideOffset?` (`number`): Gap between the anchor and the popup, in pixels. Gap between the input and the list, in pixels.
- `alignOffset?` (`number`): Shift along the anchor, in pixels. Shift along the input, in pixels.
- `collisionPadding?` (`number`): Space to keep from the viewport edges, in pixels.
- `arrowPadding?` (`number`): Space to keep between the arrow and the popup's corners, in pixels.
- `anchor?` (`string | Anchor | null`): Positions the popup against this instead of its trigger: an element, a CSS selector, a point like `{ x, y }`, or anything with `getBoundingClientRect()`. It's read on every check, so it can move. A controller's `open({ anchor })` wins for that open.
- `container?` (`DocumentFragment | Element | null`): Renders the popup into this element instead of in place, like a container inside a shadow root or an iframe. On web components, a CSS selector. Nested popups stay inside their parent.
- `keepMounted?` (`boolean`): Whether the list stays in the page, hidden, while closed.

### ComboboxArrow

Points from the popup to its anchor, following the side chosen after collision handling. Renders a `div`.

### ComboboxStatus

Announces loading, errors and result counts. Renders a `div` with the status role.

### ComboboxEmpty

Shows while no option matches. Renders a `div`.

### ComboboxList

Holds the options. Renders a `div` with the listbox role.

### ComboboxSelectAll

Toggles every matching, enabled option in its group, or outside a group. Renders a `div` with the option role.

### ComboboxGroup

Groups options under a label. Renders a `div` with the group role.

### ComboboxGroupLabel

Names its group. Renders a `div`.

### ComboboxItem

- `label?` (`string`): The text the input shows once chosen, and filtering matches, when the content isn't plain text. Not the accessible name: use `aria-label` for that.
- `keywords?` (`string[]`): More words filtering matches.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard and the pointer skip it. Sets `data-disabled` and `aria-disabled`.
- `index?` (`number`): The item's position among all visible items, for virtualized lists that render only some. Sets `aria-posinset` and `aria-setsize`.
- `value` (`T`): What the value becomes when the item is chosen. A string, or any value with `itemToValue`.

### ComboboxItemIcon

- `mirror?` (`boolean`): Flips the icon horizontally in right-to-left text, for icons that point a way, like arrows and chevrons. Icons that picture a thing, like a clock or a check, stay as they are.

### ComboboxItemText

Shows its item's label, and marks what matched the query. Renders a `span`.

### ComboboxItemIndicator

- `keepMounted?` (`boolean`): Whether the indicator stays in the page while its item isn't selected.

### ComboboxSeparator

Separates options or groups. Renders a `div` with the separator role.

### ComboboxCreate

- `onCreate?` (`((query: string) => unknown)`): Runs with the input's text when the create option is chosen. It doesn't change the value by itself. Return a Promise to mark the option pending until it settles; the list closes (or the input empties, with `multiple`) once it resolves.
- `minLength?` (`number`): How many characters the text needs before the option shows.

### Items as Data

Each item in `items`. Groups are `{ type: "group", label, items }` and separators `{ type: "separator" }`.

- `value` (`T`): Identifies the item, and is what choosing it reports. A string, or any value with `itemToValue`.
- `label` (`string`): The text shown and matched by typeahead and filtering. A select's trigger shows it once chosen.
- `keywords?` (`string[]`): More words filtering matches, like `["team"]` for a plan called Pro.
- `disabled?` (`boolean`): Keeps the item from being chosen. The keyboard skips it, like in a native select.

### Async Options

[Async Options](../hooks/async-options.md) covers loading, paging, and retries.

### State

What render functions, state-based class names and slots receive, per part.

`ComboboxInput`:

- `open` (`boolean`): Whether the list is open.
- `disabled` (`boolean`): Whether the combobox is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the combobox keeps its value but refuses changes, from its `readOnly` option.
- `required` (`boolean`): Whether a value must be selected before the form submits, from its `required` option.

`ComboboxTrigger`:

- `open` (`boolean`): Whether the list is open.
- `disabled` (`boolean`): Whether the combobox is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the combobox keeps its value but refuses changes, from its `readOnly` option.
- `required` (`boolean`): Whether a value must be selected before the form submits, from its `required` option.

`ComboboxContent` and `ComboboxList`:

- `open` (`boolean`): Whether the list is open. False while it animates out.
- `presentation` (`"popover" | "sheet"`): How it presents this time it's open.
- `multiple` (`boolean | undefined`): Whether several items can be selected.
- `status` (`AsyncOptionsStatus`): Whether results are loading or failed.
- `items` (`ListData<unknown>`): The visible items, for rendering a virtualized list yourself.

`ComboboxItem`:

- `highlighted` (`boolean`): Whether the item is highlighted, by the keyboard or the pointer.
- `selected` (`boolean`): Whether its value is in the combobox's value, compared with `isItemEqualToValue` when you pass one.
- `disabled` (`boolean`): Whether the item can't be chosen, by itself or because `maxSelected` is reached.
- `maxReached` (`boolean`): Whether `maxSelected` is reached and the item isn't selected, which is why it's disabled.

`ComboboxItemIndicator`:

- `selected` (`boolean`): Whether its item is selected. While false, the indicator isn't shown unless `keepMounted` is set.

`ComboboxItemIcon`:

- `mirror` (`boolean`): Whether it flips in right-to-left text.

`ComboboxCreate`:

- `query` (`string`): The text the option would create.
- `highlighted` (`boolean`): Whether the option is highlighted.
- `pending` (`boolean`): Whether `onCreate`'s Promise is running.
- `error` (`unknown`): Why the last `onCreate` failed, until the next try.

`ComboboxEmpty`:

- `loading` (`boolean`): Whether results are loading.
- `empty` (`boolean`): Whether no item matches.
- `query` (`string`): The text the list is filtered by.

`ComboboxStatus`:

- `status` (`"idle" | "loading" | "error"`): Whether results are loading or failed.
- `loading` (`boolean`): Whether results are loading.
- `count` (`number`): How many items are visible.

`ComboboxValue`:

- `value` (`unknown`): The selected value: one, `null`, or a list with `multiple`.
- `labels` (`string[]`): Each selected item's label, in the order they were selected.
- `label` (`string`): The labels joined with commas, or with `maxLabels`, as a list in the page's language, like "France, Chile and 2 more". An empty string for none.

`ComboboxChip`:

- `value` (`unknown`): The selected value the chip stands for, from its `value` prop.
- `label` (`string`): The text for the value: from `itemToLabel`, its item's label, or the value itself.
- `disabled` (`boolean`): Whether the combobox is disabled or read-only, so the chip can't be removed.

`ComboboxClear` and `ComboboxChipRemove`:

- `disabled` (`boolean`): Whether the combobox is disabled or read-only.

`ComboboxArrow`:

- `open` (`boolean`): Whether the list is open.

`ComboboxItemText`:

- `segments` (`MatchSegment[]`): The text in pieces, each marked when it matched. Joined, they're the whole text.
- `matched` (`boolean`): Whether any piece matched.

`ComboboxSelectAll`:

- `checked` (`boolean`): Whether every item it covers is selected.
- `indeterminate` (`boolean`): Whether some of its items are selected, but not all.
- `highlighted` (`boolean`): Whether it's highlighted, by the keyboard or the pointer.
- `disabled` (`boolean`): Whether it can't be used: nothing it covers can be chosen, or choosing them all would pass `maxSelected`.

`ComboboxChipsOverflow`:

- `count` (`number`): How many chips don't fit and are hidden.
- `labels` (`string[]`): The labels of the hidden chips.

### Reasons

`details.reason` says why the value changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `remove-press` (`MouseEvent | KeyboardEvent`): A chip's remove part was pressed, or Backspace or Delete removed a chip or a span.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Why the text changed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `clear-press` (`MouseEvent | KeyboardEvent`): A Clear part was pressed, like on an input, a select or a combobox.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

And why the list opened or closed:

- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.
- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `close-press` (`MouseEvent | KeyboardEvent | SubmitEvent`): A Close part was pressed, or a form with `method="dialog"` was submitted.
- `outside-press` (`MouseEvent`): A press outside the layer.
- `focus-out` (`KeyboardEvent | FocusEvent`): Focus left the layer, or Tab moved it out.
- `window-blur` (`FocusEvent`): The window lost focus.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

With `dismissible` false, the refused dismissals `onDismissAttempt` reports:

- `escape-key` (`KeyboardEvent`): Escape, or a submenu's close key (ArrowLeft in left-to-right layouts).
- `outside-press` (`MouseEvent`): A press outside the layer.
- `back` (`Event`): Going back: the Android back button or gesture, or Backspace in an empty command input, which returns to the previous page.
- `swipe` (`TouchEvent | PointerEvent`): A swipe gesture: a finger, mouse or pen dragged it.

### Controller

Create one with `createComboboxController<Value, Multiple>()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, passed to the change callback.

- `isOpen()` (`() => boolean`): Whether the list is open.
- `setOpen(open, options?)` (`(open: boolean, options?: ComboboxChangeOptions<ComboboxOpenChangeReason> | undefined) => boolean`): Opens or closes the list. Returns false when the change was canceled or it was already open or closed.
- `open(options?)` (`(options?: (ComboboxChangeOptions<ComboboxOpenChangeReason> & { signal?: AbortSignal | undefined; }) | undefined) => Promise<...>`): Opens the list, and resolves once it closes, with why and how. Resolves exactly once and never rejects: on the next close from any source, when `signal` aborts, or with reason `"unmount"` when the combobox leaves the page.
- `close(options?)` (`(options?: ComboboxChangeOptions<ComboboxOpenChangeReason> | undefined) => boolean`): Closes the list. Returns false when the close was canceled or it was already closed.
- `toggle(options?)` (`(options?: ComboboxChangeOptions<ComboboxOpenChangeReason> | undefined) => boolean`): Opens the list when it's closed, and closes it when it's open. Returns false when the change was canceled.
- `getValue()` (`() => ComboboxValue<T, Multiple>`): The selected value.
- `setValue(value, options?)` (`(value: ComboboxValue<T, Multiple>, options?: ComboboxChangeOptions<ComboboxValueChangeReason> | undefined) => boolean`): Selects a value, as a user would. A disabled or read-only combobox ignores it. Returns false when the change was canceled or nothing changed.
- `clear(options?)` (`(options?: ComboboxChangeOptions<ComboboxValueChangeReason> | undefined) => boolean`): Selects nothing and empties the input. Returns false when the change was canceled or nothing changed.
- `getQuery()` (`() => string`): The input's text.
- `setQuery(query, options?)` (`(query: string, options?: ComboboxChangeOptions<ComboboxQueryChangeReason> | undefined) => boolean`): Changes the input's text, which filters the list. Returns false when the change was canceled or nothing changed.
- `getHighlighted()` (`() => T | null`): The value of the highlighted item, or null when none is.
- `highlight(value)` (`(value: T | null) => boolean`): Highlights the item with this value in the open list, scrolled into view, or none with null. Returns false when the list is closed, or no enabled item has the value.
- `focus()` (`() => void`): Moves focus to the input.

### Events

Callbacks get the new state first, then the details.

| Prop                   | On               | Receives                                                      |
| ---------------------- | ---------------- | ------------------------------------------------------------- |
| `onValueChange`        | `Combobox`       | `(value, details)`: the new value, and the [reason](#reasons) |
| `onQueryChange`        | `Combobox`       | `(query, details)`: the new text, and the [reason](#reasons)  |
| `onOpenChange`         | `Combobox`       | `(open, details)`: the new state, and the [reason](#reasons)  |
| `onOpenChangeComplete` | `Combobox`       | `(open)`, after the animation                                 |
| `onHighlight`          | `Combobox`       | `(value, { index, event })`: the highlighted item and its row |
| `onLoadMore`           | `Combobox`       | `()`, when the last item is reached                           |
| `onDismissAttempt`     | `Combobox`       | `({ reason, event })`, when a dismissal was refused           |
| `onCreate`             | `ComboboxCreate` | `(query)`: the text. Return a Promise to mark it pending      |

## Accessibility

The combobox follows the [WAI-ARIA combobox pattern with list autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/). Focus usually stays in the input while `aria-activedescendant` identifies the highlighted option. A touch screen-reader trigger can move real focus into the list, and a sheet has its own [focus behavior](#presentation). Every line below is an automated test.

### Keyboard

| Key                   | Does                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| Typing                | Filters the options and opens the list                                |
| ArrowDown, ArrowUp    | Opens the list, then moves the highlight. Wraps unless `loop={false}` |
| Enter                 | Chooses the highlighted option                                        |
| Escape                | Closes the list, then restores the selection's label                  |
| Backspace             | In an empty input with chips, removes the last chip                   |
| ArrowLeft, ArrowRight | Moves between chips, reversed in right-to-left text                   |

### Tested Behavior

**Input**

- Is a combobox named by its label, with list autocomplete.
- Typing opens the list with the items that match.
- Matching ignores case and accents.
- ArrowDown opens the list.
- Choosing with the keyboard leaves the caret after the text.
- Points to the list it controls while open.

**Highlight**

- Arrow keys move the highlight while focus stays in the input.
- Arrow keys skip disabled items.
- Moving over a disabled item leaves the highlight where it was.
- The highlighted option has the id aria-activedescendant names.

**AutoHighlight**

- The first match is highlighted from the first keystroke, so Enter chooses it.
- A disabled match is passed over.

**Choosing**

- Enter chooses the highlighted item, puts its label in the input and closes.
- Clicking an item chooses it and keeps focus in the input.
- A disabled item can't be chosen.
- After choosing, opening again shows every item with the chosen one selected.
- A canceled choice closes the list and keeps the value's label in the input.
- Text that matches nothing shows the empty message.

**Closing**

- Escape closes the list and keeps focus in the input.
- Escape after deleting the text brings back the value and its label.
- Leaving after deleting the text keeps the value empty.
- Clicking outside closes the list.
- Tab closes the list and moves on.

**Trigger and clear**

- The trigger button opens and closes the list.
- Clear empties the input and the value.

**Default value**

- Shows its label in the input.
- Typing inside the label keeps the caret where it is.

**Multiple**

- Choosing adds a chip and empties the input.
- A canceled choice adds no chip and keeps the text.
- Backspace in an empty input removes the last chip.
- A chip's remove button removes its value.

**Groups**

- Items sit in groups named by their labels, and empty groups hide while filtering.

**Forms**

- The form submits the value under the combobox's name.
- Several values submit under one name.
- A required combobox blocks submission until a value is chosen.
- A disabled combobox can't be focused.
- A disabled fieldset disables the combobox and leaves it out of the form.

**Async**

- Results load for the text, with the list kept while loading.
- The chosen item's label survives results that don't include it.

Runs in React, Vue and web components.

Long lists stay fast and announce their size:

**Virtualized**

- Renders only the rows in view, each with its place in the whole list.
- Arrow keys reach items that weren't rendered, and the active descendant follows.
- Filtering covers every item, rendered or not.

Runs in React.

Also tested:

**Enhancements**

- The list is named by the combobox's label.
- A click on the label focuses the input and leaves the list closed.
- Filtering matches an item's keywords as well as its label.
- A create option offers the text, and hides when an item's label matches it exactly.
- Enter on the create option calls onCreate with the text.
- A create option is pending while onCreate's Promise runs.
- With multiple, the list stays open after choosing.
- MaxSelected disables the other items once reached.
- Arrow keys move between chips, and Backspace on one removes it.
- The chips are a toolbar named by the combobox's label.
- Web chips follow a label that changes after they rendered. Web components only.
- Enter on the trigger opens the list as the keyboard did.
- ArrowDown on the trigger opens the list at its first item.
- The content says whether the keyboard or a pointer is in use, while focus stays in the input.
- A form reset returns the combobox to its default value and label.
- Arrow keys keep the highlighted item in view when the … scrolls.

Runs in React, Vue and web components.

Rows people rebuild, here and in Select:

**Items shown while nothing is typed**

- A combobox shows its recent items, as a group, until the user types.
- An autocomplete shows recent searches while the field is empty.

**Select all**

- Selects every item that can be chosen, then clears them, and says which with aria-checked.
- Is mixed while some are selected.
- Covers only the items the text matches.
- Is reached with the arrow keys and chosen with Enter.
- In a group, it covers that group.
- A select's works the same, with real focus.

**Chips that collapse**

- Chips past the line hide, and a count says how many.
- Removing chips brings the hidden ones back, and the count goes.
- A value text lists two labels and counts the rest, in the page's language. React and Vue only.
- A select's value lists two labels and counts the rest.
- A web select value takes getMoreLabel as a property. Web components only.

**Loading more**

- Reaching the last item with the keyboard loads the next page.
- Scrolling to the end loads the next page, with a status while it does.
- The last page loads no more.

**Rows**

- A recent item is chosen like any other.
- Typing on a select never lands on it.

Runs in React, Vue and web components.

Match highlighting, here and in Autocomplete and Command:

**Combobox**

- Marks the part of each label the text matched.
- Marks keep the label's own case and accents while matching without them.
- An item matched by a keyword has nothing to mark.
- Marks go away when the text is cleared, and the label reads whole.

**Autocomplete**

- Marks the part of each suggestion the text matched.

**Command**

- Marks each letter a fuzzy match found, joining neighbours.
- Marks a whole match at a word start.

**Highlighting**

- The chosen label in the input shows every item unmarked.

Runs in React, Vue and web components.

Touch screen readers and announcements:

**A screen reader's tap moves real focus into the list**

- Autocomplete: tapping the trigger focuses the first suggestion, and Escape returns.
- Searchable select: tapping the trigger focuses the selected item, not the search field.

**Combobox**

- Tapping the trigger focuses the selected item, with no aria-activedescendant.
- Arrow keys move real focus, and choosing returns focus to the input.
- Escape closes the list and focus returns to the input.

**Announcements**

- How many items match is announced once typing pauses.
- Autocomplete and searchable select announce counts too.
- Removing a chip announces which.

**Touch screen readers and announcements**

- A tap on the input is for typing: focus stays there.
- A status part says it instead, so nothing is announced twice.

Runs in React, Vue and web components.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while filtering and choosing with a keyboard.

Runs in React, Vue and web components.
