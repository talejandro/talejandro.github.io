# Accordion

Show and hide sections of content from their headings.

Use an Accordion for content people can explore one section at a time, such as answers, settings, or a course outline. Each heading is a button that opens its panel.

```tsx title="basic.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "shipping",
    label: "What are your shipping options?",
    content: [
      "We offer standard (5 to 7 days), express (2 to 3 days) and overnight shipping.",
      "Every order ships with tracking, and orders over $50 ship free.",
    ],
  },
  {
    value: "returns",
    label: "What is your return policy?",
    content: [
      "Return any unused item in its original packaging within 30 days. Refunds arrive within 5 to 7 business days.",
    ],
  },
  {
    value: "support",
    label: "How can I reach support?",
    content: [
      "Write to us by email or chat, or call us. We answer within 24 hours on business days.",
    ],
  },
]

function Example() {
  return (
    <Accordion defaultValue={["shipping"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            {item.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
```

Press “What is your return policy?”. Its answer opens and the shipping answer closes. Press the same heading again to close it.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build an `Accordion`:

```text
Accordion
├── AccordionItem
│   ├── AccordionHeader
│   │   └── AccordionTrigger
│   └── AccordionPanel
└── AccordionItem
    ├── AccordionHeader
    │   └── AccordionTrigger
    └── AccordionPanel
```

Give every item a unique `value`. Put its trigger inside a heading, then add the panel it opens. The accordion's value is always an array of open item values, even when only one can be open.

`AccordionHeader` renders an `h3` by default. Use a heading level that fits the surrounding document. Tab moves between triggers; Enter or Space opens and closes their panels. Arrow keys, Home and End do nothing here: the APG removed them from the pattern, and a screen reader’s heading navigation already reaches each trigger.

## Usage

Import the parts and put them together:

```tsx
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"

function Example() {
  return (
    <Accordion>
      <AccordionItem value="shipping">
        <AccordionHeader>
          <AccordionTrigger>Shipping</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Orders arrive in five to seven days.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export { Example }
```

## Build Your Own

`@ui-sdk/react/accordion` comes with a ready-made Accordion. If you'd like to build your own, with your own names, start from the `accordion` primitive in `@ui-sdk/core`:

```ts title="faq.ts"
"use client"

import { accordion } from "@ui-sdk/core/accordion"
import { createParts } from "@ui-sdk/react/primitive"

const {
  Root: FaqList,
  Item: FaqItem,
  Header: FaqHeading,
  Trigger: FaqQuestion,
  Panel: FaqAnswer,
} = createParts(accordion, {
  root: "div",
  item: "div",
  header: "h3",
  trigger: "button",
  panel: "div",
})

export { FaqAnswer, FaqHeading, FaqItem, FaqList, FaqQuestion }
```

```tsx
<FaqList>
  <FaqItem value="shipping">
    <FaqHeading>
      <FaqQuestion>What are your shipping options?</FaqQuestion>
    </FaqHeading>
    <FaqAnswer>Standard, express and overnight.</FaqAnswer>
  </FaqItem>
</FaqList>
```

Each part keeps the behavior, state and data attributes of its ready-made counterpart. See [Rendering](../rendering.md) and [Custom Parts](../custom-parts.md) for more.

## Multiple

Add `multiple` to let several items stay open. Opening one then leaves the others as they are.

```tsx title="multiple.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "notifications",
    label: "Notification settings",
    content: "Choose what we email you about, and how often.",
  },
  {
    value: "privacy",
    label: "Privacy and security",
    content: "Turn on two-factor authentication and review signed-in devices.",
  },
  {
    value: "billing",
    label: "Billing and subscription",
    content: "Update your payment method and download past invoices.",
  },
]

function Example() {
  return (
    <Accordion multiple defaultValue={["notifications"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
```

Open Privacy and security. Notification settings stays open; close either section independently.

## Disabled

Set `disabled` on an item or on a single trigger to prevent changes, or on the accordion to disable every item. Disabled triggers stay in the tab order so people can still discover them. A disabled `<fieldset>` around the accordion disables it too.

```tsx title="disabled.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "access",
    label: "Can I access my account history?",
    content:
      "Yes. Every order and payment from the last five years is in your account.",
  },
  {
    value: "premium",
    label: "Premium feature information",
    content:
      "Premium includes priority support and early access to new features.",
    disabled: true,
  },
  {
    value: "email",
    label: "How do I update my email address?",
    content:
      "Open Settings, then Account, and change it there. We'll send a confirmation link.",
  },
]

function Example() {
  return (
    <Accordion>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} disabled={item.disabled}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
```

Tab to Premium feature information. It stays focusable, and pressing it leaves its panel closed. Try “How do I update my email address?” instead.

<span id="behavior-and-options" />

## Collapsible

Set `collapsible={false}` when the open item should stay open until another item replaces it. Pair it with `defaultValue={["overview"]}` so a panel starts open.

The open trigger reports `aria-disabled="true"` because pressing it leaves its panel open.

```tsx
<Accordion collapsible={false} defaultValue={["overview"]} />
```

```tsx title="collapsible.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "overview",
    label: "Overview",
    content: "A summary of the project, its goals and its owners.",
  },
  {
    value: "timeline",
    label: "Timeline",
    content: "Kickoff in March, beta in June and launch in September.",
  },
  {
    value: "budget",
    label: "Budget",
    content: "Approved for two engineers and one designer for six months.",
  },
]

function Example() {
  return (
    <Accordion collapsible={false} defaultValue={["overview"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
```

Open Timeline, then press it again. It stays open until you choose another heading.

## Controlled

Use `value` and `onValueChange` to own the open items. [State and Events](../state-and-events.md) covers the shared pattern.

An item can refuse a change: call `details.cancel()` in its `onOpenChange` callback. Item callbacks run before the accordion's `onValueChange`, including the item that would close when another opens. Canceling any one of them cancels the whole change. `onValueChange` also gets the [reason](#reasons) for the change.

```tsx title="controlled.tsx"
"use client"

import { createAccordionController } from "@ui-sdk/core/accordion"
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

const items = [
  {
    value: "account",
    label: "Account",
    content: "Your name, email address and profile photo.",
  },
  {
    value: "security",
    label: "Security",
    content: "Your password, passkeys and two-factor authentication.",
  },
  {
    value: "sessions",
    label: "Sessions",
    content: "Devices signed in to your account in the last 30 days.",
  },
]

function Example() {
  const [accordion] = React.useState(() => createAccordionController())
  const [value, setValue] = React.useState(["account"])

  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => accordion.open("security")}>
          Review security
        </button>
      </div>
      <Accordion multiple value={value} onValueChange={setValue} controller={accordion}>
        {items.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            onOpenChange={(open, details) => {
              if (
                !open &&
                item.value === "security" &&
                !window.confirm("Close the security settings?")
              ) {
                details.cancel()
              }
            }}
          >
            <AccordionHeader>
              <AccordionTrigger>
                {item.label}
                <ChevronDownIcon aria-hidden="true" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>{item.content}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export { Example }
```

Press Security to open it, then press it again. Cancel the confirmation and Security stays open; accept it and the section closes.

## Keep Mounted

A closed panel normally unmounts. Add `keepMounted` to one panel or the whole accordion to keep its content hidden in the page. This preserves local state, such as a draft in a field.

```tsx title="keep-mounted.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Textarea } from "@ui-sdk/react/textarea"
import { ChevronDownIcon } from "lucide-react"

function Example() {
  return (
    <Accordion defaultValue={["reply"]}>
      <AccordionItem value="reply">
        <AccordionHeader>
          <AccordionTrigger>
            Reply to this thread
            <ChevronDownIcon aria-hidden="true" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel keepMounted>
          <Field>
            <FieldLabel>Message</FieldLabel>
            <Textarea rows={3} placeholder="Write a reply…" />
          </Field>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="formatting">
        <AccordionHeader>
          <AccordionTrigger>
            Formatting
            <ChevronDownIcon aria-hidden="true" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          <p>Use **bold**, _italics_ and `code`. Links paste as previews.</p>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}

export { Example }
```

Write a message, switch to Formatting, then return to Reply to this thread. Your draft is still there.

## Find in Page

Add `hiddenUntilFound` to keep closed panels available to the browser's Find command. A match opens the item immediately, without an animation, with the [reason](#reasons) `find-in-page`.

```tsx title="find-in-page.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "fruit",
    label: "Which fruit do you stock?",
    content: "Apples, pears, mangoes and, in summer, pineapple.",
  },
  {
    value: "organic",
    label: "Is it organic?",
    content: "Everything we stock is certified organic.",
  },
  {
    value: "delivery",
    label: "When do you deliver?",
    content: "Every weekday morning before 10.",
  },
]

function Example() {
  return (
    <Accordion hiddenUntilFound>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
```

Use your browser’s Find command to search for “pineapple”. The closed “Which fruit do you stock?” panel opens to reveal the match.

<span id="deep-links" />

A link to an element inside a closed panel can reveal it too. Give the target an `id` and link to it with a hash, such as `href="#refund-timeline"`.

```tsx title="deep-link.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

function Example() {
  return (
    <div>
      <nav data-slot="controls" aria-label="Jump to">
        <a href="#refund-timeline">Jump to the refund timeline</a>
        <a href="#return-label">Print a return label</a>
      </nav>
      <Accordion hiddenUntilFound>
        <AccordionItem value="returns">
          <AccordionHeader>
            <AccordionTrigger>
              Returns
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <div data-slot="stack">
              <p>
                Return any unused item in its original packaging within 30 days.
              </p>
              <p id="return-label">
                To print a return label, open the order and choose Return. The
                label is free.
              </p>
            </div>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="refunds">
          <AccordionHeader>
            <AccordionTrigger>
              Refunds
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <div data-slot="stack">
              <p>Refunds go back to the card you paid with.</p>
              <p id="refund-timeline">
                Timeline: we inspect the item within 2 days of receiving it, and
                your bank shows the refund 5 to 7 business days later.
              </p>
            </div>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="exchanges">
          <AccordionHeader>
            <AccordionTrigger>
              Exchanges
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <div data-slot="stack">
              <p>
                Start a return, choose Exchange and pick the new size. Shipping
                both ways is free.
              </p>
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export { Example }
```

Press Jump to the refund timeline. The closed Refunds panel opens and the browser moves to the linked paragraph.

With `hiddenUntilFound`, React's server render writes `hidden=""`, so closed panels become findable after hydration. Vue and Svelte render `hidden="until-found"` from the start. For an initial URL hash, [open the item explicitly](#url-hash).

## Animation

Each part has a `data-slot`, such as `accordion-panel`. The panel exposes its measured height as `--accordion-panel-height`. Animate that height to or from zero with `data-starting-style` and `data-ending-style`:

```css
[data-slot="accordion-panel"] {
  height: var(--accordion-panel-height);
  overflow: hidden;
  transition: height 0.15s;

  &:is([data-starting-style], [data-ending-style]) {
    height: 0;
  }
}
```

The panel stays mounted until its exit animation finishes. An item's `onOpenChangeComplete` runs afterward with the open state. A panel that starts open appears right away, with no animation and no completion callback.

```tsx title="animation.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const items = [
  {
    value: "one",
    label: "Why animate the height?",
    content: "So the content below slides instead of jumping.",
  },
  {
    value: "two",
    label: "Where does the height come from?",
    content:
      "The panel measures itself and writes the result to a CSS variable while it animates.",
  },
  {
    value: "three",
    label: "Does it animate on first paint?",
    content: "No. Panels open on the server or on mount show at once.",
  },
]

function Example() {
  return (
    <Accordion defaultValue={["one"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {item.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{item.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
```

Open or close an item. Its panel animates its height.

## Expand All

With `multiple`, a controller's `openAll()` opens every enabled item. `closeAll()` closes every item that may close. [Controllers](../controllers.md) explains how to connect one.

```tsx title="expand-all.tsx"
"use client"

import { createAccordionController } from "@ui-sdk/core/accordion"
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

const weeks = [
  {
    value: "week-1",
    label: "Week 1: Foundations",
    content:
      "Set up your editor, meet the command line and write your first script.",
  },
  {
    value: "week-2",
    label: "Week 2: Data and types",
    content:
      "Strings, numbers, lists and objects, and how to tell them apart when a program runs.",
  },
  {
    value: "week-3",
    label: "Week 3: Control flow",
    content:
      "Conditions, loops and functions. The project this week is a small text adventure.",
  },
  {
    value: "week-4",
    label: "Week 4: Working with files",
    content:
      "Read and write files, parse CSV and JSON, and handle the errors that come with them.",
  },
  {
    value: "week-5",
    label: "Week 5: Final project",
    content:
      "Build a tool you'll use yourself, then present it to the group in a five-minute demo.",
  },
]

function Example() {
  const [syllabus] = React.useState(() => createAccordionController())
  return (
    <div>
      <div data-slot="controls">
        <button type="button" onClick={() => syllabus.openAll()}>
          Expand all
        </button>
        <button type="button" onClick={() => syllabus.closeAll()}>
          Collapse all
        </button>
      </div>
      <div data-slot="scroll">
        <Accordion multiple controller={syllabus}>
          {weeks.map((week) => (
            <Week key={week.value} week={week} />
          ))}
        </Accordion>
      </div>
    </div>
  )
}

function Week({ week }: { week: (typeof weeks)[number] }) {
  const item = React.useRef<HTMLDivElement>(null)
  const pressed = React.useRef(false)

  return (
    <AccordionItem
      ref={item}
      value={week.value}
      onOpenChange={(open, details) => {
        pressed.current = open && details.reason === "trigger-press"
      }}
      onOpenChangeComplete={(open) => {
        if (open && pressed.current) {
          item.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
        }
      }}
    >
      <AccordionHeader>
        <AccordionTrigger>
          {week.label}
          <ChevronDownIcon aria-hidden="true" />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>{week.content}</AccordionPanel>
    </AccordionItem>
  )
}

export { Example }
```

Press Expand all or Collapse all. Open an individual week near the bottom to scroll it into view after its panel opens.

## Nested

Put another accordion inside a panel when a section has its own expandable sections. Each accordion tracks its own items. Give the inner headings a lower level than the outer headings.

```tsx title="nested.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"

const sections: {
  value: string
  label: string
  content?: string
  topics?: { value: string; label: string; content: string }[]
}[] = [
  {
    value: "profile",
    label: "Profile",
    content: "Your name, photo and the email address people see.",
  },
  {
    value: "notifications",
    label: "Notifications",
    topics: [
      {
        value: "email",
        label: "Email",
        content: "A weekly digest, and mentions as they happen.",
      },
      {
        value: "push",
        label: "Push",
        content: "Direct messages and replies to your comments.",
      },
    ],
  },
  {
    value: "billing",
    label: "Billing",
    topics: [
      {
        value: "payment",
        label: "Payment methods",
        content: "A Visa card ending in 4242, used for every renewal.",
      },
      {
        value: "invoices",
        label: "Invoices",
        content: "Download a PDF of any invoice from the last two years.",
      },
    ],
  },
]

function Example() {
  return (
    <Accordion defaultValue={["notifications"]}>
      {sections.map((section) => (
        <AccordionItem key={section.value} value={section.value}>
          <AccordionHeader>
            <AccordionTrigger>
              {section.label}
              <ChevronDownIcon aria-hidden="true" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            {section.topics ? (
              <Accordion multiple>
                {section.topics.map((topic) => (
                  <AccordionItem key={topic.value} value={topic.value}>
                    <AccordionHeader render={<h4 />}>
                      <AccordionTrigger>
                        {topic.label}
                        <ChevronDownIcon aria-hidden="true" />
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionPanel>{topic.content}</AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div>{section.content}</div>
            )}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export { Example }
```

Open Billing, then Invoices inside it. The inner accordion changes without closing Billing.

## FAQ Search

<span id="faq-with-search" />

Combine a search field with a controlled accordion: filter the questions and set `value` to the matching items. The example also highlights matches and leaves the triggers usable while the search is active.

```tsx title="search.tsx"
"use client"

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"

const faq = [
  {
    value: "returns",
    question: "What is your return policy?",
    answer:
      "Return any unused item within 30 days. Once it reaches us, your refund is on its way.",
  },
  {
    value: "refunds",
    question: "How long do refunds take?",
    answer:
      "Refunds reach your card within 5 to 7 business days after we receive the item.",
  },
  {
    value: "shipping",
    question: "Do you ship internationally?",
    answer:
      "We ship to 40 countries. Duties are included in the price at checkout.",
  },
  {
    value: "tracking",
    question: "How do I track my order?",
    answer:
      "Every shipping email has a tracking link. You'll also find it under Orders.",
  },
  {
    value: "exchange",
    question: "Can I exchange an item for another size?",
    answer:
      "Yes. Start a return, choose Exchange and pick the new size. Shipping is free.",
  },
  {
    value: "gift",
    question: "Can I send an order as a gift?",
    answer:
      "Add a gift note at checkout and we'll leave the prices off the packing slip.",
  },
]

function matches(question: (typeof faq)[number], query: string) {
  const search = query.trim().toLowerCase()
  return (
    !search ||
    question.question.toLowerCase().includes(search) ||
    question.answer.toLowerCase().includes(search)
  )
}

function highlight(text: string, query: string) {
  const search = query.trim().toLowerCase()
  if (!search) {
    return [{ text, match: false }]
  }
  const parts: { text: string; match: boolean }[] = []
  let start = 0
  for (let index = text.toLowerCase().indexOf(search); index !== -1;) {
    if (index > start) {
      parts.push({ text: text.slice(start, index), match: false })
    }
    parts.push({ text: text.slice(index, index + search.length), match: true })
    start = index + search.length
    index = text.toLowerCase().indexOf(search, start)
  }
  if (start < text.length) {
    parts.push({ text: text.slice(start), match: false })
  }
  return parts
}

function Highlight({ text, query }: { text: string; query: string }) {
  return highlight(text, query).map((part, index) =>
    part.match ? <mark key={index}>{part.text}</mark> : part.text
  )
}

function Example() {
  const [query, setQuery] = React.useState("")
  const [value, setValue] = React.useState<string[]>([])
  const results = faq.filter((question) => matches(question, query))

  return (
    <div>
      <div data-slot="controls">
        <input
          type="search"
          aria-label="Search questions"
          placeholder="Search questions…"
          value={query}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setValue(
              next.trim()
                ? faq
                    .filter((question) => matches(question, next))
                    .map((question) => question.value)
                : []
            )
          }}
        />
      </div>
      <Accordion multiple value={value} onValueChange={setValue}>
        {results.map((question) => (
          <AccordionItem key={question.value} value={question.value}>
            <AccordionHeader>
              <AccordionTrigger>
                <span>
                  <Highlight text={question.question} query={query} />
                </span>
                <ChevronDownIcon aria-hidden="true" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>
              <Highlight text={question.answer} query={query} />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <p data-slot="hint" role="status">
        {results.length === 0 && `No questions match “${query}”.`}
      </p>
    </div>
  )
}

export { Example }
```

Search for “refund” to show and open matching answers. Try “zzz” for the empty result, then clear the search to restore all questions.

## URL Hash

<span id="open-the-item-in-the-url-hash" />

A hash can name an item's `value` instead of an element inside its panel. Read it after mount and on `hashchange`, then open and focus the matching item through your controller:

```ts
const value = decodeURIComponent(location.hash.slice(1))
if (items.some((item) => item.value === value)) {
  accordion.open(value)
  accordion.focus(value)
}
```

Check the value against your items first. A controller can hold a value even when no item renders it. Remove the `hashchange` listener when the component unmounts.

## Query String

<span id="keep-open-items-in-the-query-string" />

Use `open` query parameters when several items should be shareable. Read the initial values from your router on the server, then write accepted changes back to the URL:

```ts
function saveOpenItems(value: string[]) {
  const url = new URL(location.href)
  url.searchParams.delete("open")
  for (const item of value) url.searchParams.append("open", item)
  history.replaceState(null, "", url)
}
```

Call this from `onValueChange` after updating your state. If your app already has a router, use its navigation API instead.

## Scroll into View

<span id="scroll-an-item-into-view" />

Scroll after `onOpenChangeComplete`, when the panel has its full height. Scrolling in `onOpenChange` would measure it before it opens. The [Expand All example](#expand-all) shows the full setup and scrolls only when someone opens a single item.

## Custom Rendering

<span id="render-functions" />

Use `render` to choose another heading level or element. [Parts and Composition](../parts-and-composition.md#choose-the-element) covers custom elements and part state. Accordion's states are listed under [State](#state).

```tsx title="render.tsx"
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion"

const steps = [
  {
    value: "install",
    label: "Install the package",
    content: "Add it with your package manager. It has no dependencies.",
  },
  {
    value: "import",
    label: "Import the parts",
    content: "Import the accordion parts you need from the package.",
  },
  {
    value: "style",
    label: "Style it",
    content: "Every part renders its state as data attributes you can style.",
  },
]

export function Example() {
  return (
    <Accordion multiple defaultValue={["install"]}>
      {steps.map((step) => (
        <AccordionItem key={step.value} value={step.value}>
          <AccordionHeader render={<h4 />}>
            <AccordionTrigger
              render={(props, state) => (
                <button {...props}>
                  {state.index >= 0 && (
                    <span data-slot="hint" aria-hidden>
                      {String(state.index + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span>{props.children}</span>
                  <span data-slot="hint" aria-hidden>
                    {state.open ? "Hide" : "Show"}
                  </span>
                </button>
              )}
            >
              {step.label}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>{step.content}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
```

Each step is an h4 with its number and a Show or Hide hint that follows its open state. Open Import the parts to see it update.

## Styling

Style the parts with the attributes below. This turns the chevron as its panel opens, mirrors it in right to left with `:dir(rtl)`, and dims disabled triggers:

```css
[data-slot="accordion-trigger"] {
  & > svg {
    rotate: -90deg;

    &:dir(rtl) {
      rotate: 90deg;
    }
  }

  &[data-open] > svg {
    rotate: 0deg;
  }

  &[data-disabled] {
    color: gray;
  }
}
```

### AccordionPanel
- `--accordion-panel-height`: The panel's content height in pixels while it animates, auto once open and 0px while closed.
- `--accordion-panel-width`: The panel's content width, the same way. For accordions that open sideways.

## Data Attributes

### Accordion
`[data-slot="accordion"]`

- `data-disabled`: Present when the whole accordion is disabled.

### AccordionItem
`[data-slot="accordion-item"]`

- `data-open`: Present while the item is open.
- `data-closed`: Present while the item is closed, including while its panel animates out.
- `data-disabled`: Present when the item can't open or close.

### AccordionHeader
`[data-slot="accordion-header"]`

- `data-open`: Present while the item is open.
- `data-closed`: Present while the item is closed, including while its panel animates out.
- `data-disabled`: Present when the item can't open or close.

### AccordionTrigger
`[data-slot="accordion-trigger"]`

- `data-open`: Present while the item is open.
- `data-closed`: Present while the item is closed, including while its panel animates out.
- `data-disabled`: Present when the item can't open or close.

### AccordionPanel
`[data-slot="accordion-panel"]`

- `data-open`: Present while the item is open.
- `data-closed`: Present while the item is closed, including while its panel animates out.
- `data-disabled`: Present when the item can't open or close.
- `data-starting-style`: Present for a panel's first frame. Style the state you animate from.
- `data-ending-style`: Present while a panel animates closed. Style the state you animate to.

## API Reference

Props and callbacks are the same as below, as React props. Headers, triggers and panels take their item's
value from the item.

### Accordion

- `value?` (`T[]`): The open items' values. Pass it to control the accordion.
- `defaultValue?` (`T[]`): The items open at first, when uncontrolled.
- `onValueChange?` (`((value: T[], details: ChangeDetails<AccordionValueChangeReason>) => void)`): Runs when items want to open or close. `details.reason` says why, and `details.cancel()` stops it.
- `multiple?` (`boolean`): Whether several items can be open at once. Otherwise opening one closes the others.
- `collapsible?` (`boolean`): Whether the open item can close when only one may be open. With `false`, one item always stays open and its trigger reports it can't be pressed.
- `disabled?` (`boolean`): Stops every item from opening or closing. Triggers stay focusable.
- `keepMounted?` (`boolean`): Whether closed panels stay in the page, hidden.
- `hiddenUntilFound?` (`boolean`): Keeps closed panels in the page as `hidden="until-found"`, so the browser's find in page can match their text and open them.
- `controller?` (`object`): Opens and closes items from anywhere. Create one with `createAccordionController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### AccordionItem

- `disabled?` (`boolean`): Stops the item from opening or closing. Its trigger stays focusable.
- `onOpenChange?` (`((open: boolean, details: ChangeDetails<AccordionValueChangeReason>) => void)`): Runs before the item opens or closes, before the accordion's `onValueChange`. `details.cancel()` stops it.
- `onOpenChangeComplete?` (`((open: boolean) => void)`): Runs once the item's panel has finished opening or closing, after any animation.
- `value?` (`T`): Identifies the item. The accordion's value lists the open items' values. Defaults to a generated id.

### AccordionHeader

The header takes no options of its own, only the props of the element it renders.

### AccordionTrigger

- `disabled?` (`boolean`): Stops this trigger from opening or closing the item. It stays focusable.

### AccordionPanel

- `keepMounted?` (`boolean`): Whether the panel stays in the page, hidden, while closed. Overrides the accordion's.
- `hiddenUntilFound?` (`boolean`): Whether the panel stays findable with `hidden="until-found"` while closed. Overrides the accordion's.
### State

What render functions, state-based class names and slots receive, per part.

`Accordion`:

- `value` (`T[]`): The open items' values.
- `disabled` (`boolean`): Whether the whole accordion is disabled, by its `disabled` option or a disabled fieldset around it.
- `multiple` (`boolean`): Whether several items can be open at once.

`AccordionItem`, `AccordionHeader`, `AccordionTrigger` and `AccordionPanel`:

- `open` (`boolean`): Whether the accordion's `value` holds this item's value.
- `disabled` (`boolean`): Whether the item can't open or close.
- `index` (`number`): The item's position among the accordion's items, from 0. -1 until it's in the page.

### Reasons

`details.reason` says why items opened or closed, for `onValueChange` and every item's `onOpenChange`.

- `trigger-press` (`MouseEvent | KeyboardEvent | TouchEvent`): Click, tap, Enter or Space on the part that opens, closes or toggles. Arrow keys that open a menu or submenu count too. A tap on a combobox's input that opens a sheet reports its `touchend`.
- `find-in-page` (`Event`): The browser's find in page matched hidden content.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createAccordionController()` and pass it as `controller`.

Every write method takes an optional `{ reason, event }`, runs the item and accordion callbacks like a press, and returns `false` when the change is canceled or does nothing.

- `getValue()` (`() => T[]`): The open items' values.
- `setValue(value, options?)` (`(value: T[], options?: AccordionChangeOptions | undefined) => boolean`): Sets the open items. Only the first counts unless `multiple` is set. Returns false when canceled.
- `isOpen(value)` (`(value: T) => boolean`): Whether an item is open.
- `open(value, options?)` (`(value: T, options?: AccordionChangeOptions | undefined) => boolean`): Opens an item. With one item open at a time, closes the others.
- `close(value, options?)` (`(value: T, options?: AccordionChangeOptions | undefined) => boolean`): Closes an item, unless it's the one item that must stay open.
- `toggle(value, options?)` (`(value: T, options?: AccordionChangeOptions | undefined) => boolean`): Opens a closed item, or closes an open one.
- `openAll(options?)` (`(options?: AccordionChangeOptions | undefined) => boolean`): Opens every enabled item. Only when `multiple` is set.
- `closeAll(options?)` (`(options?: AccordionChangeOptions | undefined) => boolean`): Closes every item that may close.
- `focus(value?)` (`(value?: T | undefined) => void`): Moves focus to an item's trigger, or the first trigger.

### Events

Callbacks get the new state first, then the details.

| Prop                   | On              | Receives                                                       |
| ---------------------- | --------------- | -------------------------------------------------------------- |
| `onValueChange`        | `Accordion`     | `(value, details)`: the open items, and the [reason](#reasons) |
| `onOpenChange`         | `AccordionItem` | `(open, details)`, before `onValueChange`                      |
| `onOpenChangeComplete` | `AccordionItem` | `(open)`, after the panel's animation                          |

## Accessibility

The accordion follows the [WAI-ARIA accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/). Every line below is an automated test.

**Expanding and collapsing**

- The default item is expanded and shows its panel.
- Clicking a collapsed trigger expands it and collapses the open one.
- Clicking an expanded trigger collapses it.
- Clicking a disabled trigger does nothing.
- A change can be canceled.
- Without a default value, every item starts collapsed.
- A default value can expand several items.

**Multiple**

- Items expand and collapse independently.
- Every item can be expanded at once.

**Disabled**

- A disabled item's trigger is marked disabled and stays focusable.
- A disabled accordion disables every trigger.

**Keyboard**

- Tab moves through every trigger in order, disabled ones included.
- Enter toggles the focused trigger's panel.
- Space toggles the focused trigger's panel.
- Enter on a disabled trigger does nothing.
- Tab moves from an expanded trigger into its panel.
- Keys pressed in quick succession are never lost.
- Arrow keys leave focus where it is.

**Structure**

- Each trigger sits in a heading.
- The trigger controls its panel, and the panel is labelled by its trigger.

**Mounting**

- Collapsed panels leave the page by default.
- With keepMounted, collapsed panels stay in the page, hidden.
- With keepMounted, a class that sets display doesn't show collapsed panels.
- With hiddenUntilFound, collapsed panels stay findable.
- Finding text in a collapsed panel expands it.
- Following a link into a collapsed panel expands it.
- The browser's own find expands a collapsed panel.

Runs in React, Vue and web components.

Beyond the pattern's baseline:

**Enhancements**

- With collapsible off, the open trigger is marked disabled and stays open.
- Closing a panel that holds focus moves focus to its trigger.
- A canceled find in page keeps the panel hidden until found.
- An infinite exit animation still unmounts the panel.
- A controller expands and collapses items from anywhere.
- An item's onOpenChangeComplete runs once its panel has finished animating.
- Find in page opens a panel at once, without an animation.

Runs in React, Vue and web components.

Every panel is a region labelled by its trigger, so screen readers can list open panels as landmarks. With many panels open at once, such as `multiple` with Expand all, keep the number of items modest so that list stays short.

Screen readers hear the same thing in each tested framework, recorded by a virtual screen reader:

- Announcements while using the accordion with a keyboard.

Runs in React, Vue and web components.
