# Token Input

Mix editable text with tokens for files, people, tags, and other references.

A token input is a text field that holds tokens alongside the text, like the people mentioned in a message or the files attached to a prompt. Each token moves, deletes and copies as one piece.

```tsx title="demo.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
} from "@ui-sdk/react/token-input"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import { XIcon } from "lucide-react"

const people = [
  { value: "hollis", label: "Hollis Grant" },
  { value: "ines", label: "Inès Moreau" },
  { value: "kofi", label: "Kofi Mensah" },
  { value: "wren", label: "Wren Takahashi" },
  { value: "tomasz", label: "Tomasz Wójcik" },
]

function Example() {
  return (
    <Field>
      <FieldLabel>Message</FieldLabel>
      <TokenInput
        renderToken={(token) => (
          <TokenInputToken>
            {token.label}
            <TokenInputTokenRemove>
              <XIcon aria-hidden="true" />
            </TokenInputTokenRemove>
          </TokenInputToken>
        )}
      >
        <TokenInputEditor placeholder="Type @ to mention someone…" />
        <TriggerMenu triggers={[{ char: "@", type: "mention", items: people }]}>
          <TriggerMenuContent>
            <TriggerMenuList>
              {(state) =>
                (state.items as TriggerMenuDataItem[]).map((item) => (
                  <TriggerMenuItem
                    key={item.value}
                    value={item.value}
                    label={item.label}
                  >
                    {item.label}
                  </TriggerMenuItem>
                ))
              }
            </TriggerMenuList>
          </TriggerMenuContent>
        </TriggerMenu>
      </TokenInput>
    </Field>
  )
}

export { Example }
```

Type @ and choose a person with the arrow keys and Enter. Remove a token with Backspace, or press its remove button.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `TokenInput`:

```text
TokenInput
├── TokenInputEditor
└── TriggerMenu
```

And for each token, inside `renderToken`:

```text
TokenInputToken
└── TokenInputTokenRemove
```

`TokenInput` holds the value, and `TokenInputEditor` is the text people edit. A [Trigger Menu](./trigger-menu.md) inside it suggests tokens when someone types `@`, `/`, or another trigger. Pass `renderToken` to give each token your own markup.

## Usage

Import the parts and put them together:

```tsx
import {
  TokenInput,
  TokenInputEditor,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"

const draft: TokenInputValue = [
  "Explain ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
]

function Example() {
  return (
    <TokenInput defaultValue={draft}>
      <TokenInputEditor aria-label="Prompt" />
    </TokenInput>
  )
}

export { Example }
```

A value is an array of text and tokens. Each token has a type, a value for your app, and a label for the reader. The editor manages its own content, including tokens, selection, and undo, so let it render that content and use `renderToken` for custom token markup.

## Token Input or Trigger Menu

Token Input holds the text and tokens. [Trigger Menu](./trigger-menu.md) suggests what to insert when someone types a trigger character.

Use Token Input on its own when your code supplies the tokens. Add a Trigger Menu for suggestions, as in the demo above. Trigger Menu also works with ordinary inputs and textareas.

## Prompt Input

Combine file suggestions, skills, and a send action. This example marks files as pending while they load, then uses `updateToken()` to show a skill running. Enter sends; Shift+Enter adds a line. An open suggestion menu or an active input method takes precedence over sending.

```tsx title="prompt-input.tsx"
import {
  createTokenInputController,
  toText,
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuHint,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import {
  ArrowUpIcon,
  CheckIcon,
  ClockIcon,
  CodeIcon,
  FileIcon,
  XIcon,
} from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const skills = [
  {
    value: "search",
    label: "search",
    arguments: [{ name: "query", hint: "<query>", required: true }],
  },
  { value: "review", label: "review" },
  { value: "summarize", label: "summarize" },
]

const loadFile = () => new Promise<void>((resolve) => setTimeout(resolve, 800))

function Example() {
  const log = useLog()
  const [prompt] = React.useState(createTokenInputController)
  const [running, setRunning] = React.useState(false)
  const sendTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  React.useEffect(() => () => clearTimeout(sendTimer.current), [])

  function send(value: TokenInputValue) {
    if (running || !prompt.getLabel().trim()) {
      return
    }
    setRunning(true)
    const skillTokens = value.filter(
      (segment) => typeof segment !== "string" && segment.type === "skill"
    )
    for (const skill of skillTokens) {
      if (typeof skill !== "string") {
        prompt.updateToken(skill.id!, {
          data: { ...skill.data, run: "running" },
        })
      }
    }
    sendTimer.current = setTimeout(() => {
      for (const skill of skillTokens) {
        if (typeof skill !== "string") {
          prompt.updateToken(skill.id!, {
            data: { ...skill.data, run: "done" },
          })
        }
      }
      log(`Sent ${toText(prompt.getValue())}`)
      prompt.clear()
      setRunning(false)
    }, 1500)
  }

  return (
    <TokenInput
      controller={prompt}
      onSubmit={send}
      renderToken={(token) => (
        <TokenInputToken>
          {token.type === "skill" ? (
            <CodeIcon aria-hidden="true" />
          ) : (
            <FileIcon aria-hidden="true" />
          )}
          {token.type === "skill" ? `/${token.label}` : token.label}
          {token.data?.run === "running" && <ClockIcon aria-hidden="true" />}
          {token.data?.run === "done" && <CheckIcon aria-hidden="true" />}
          <TokenInputTokenRemove>
            <XIcon aria-hidden="true" />
          </TokenInputTokenRemove>
        </TokenInputToken>
      )}
    >
      <div data-slot="card">
        <TokenInputEditor aria-label="Prompt" placeholder="Ask anything. Type @ or /" />
        <div data-slot="row">
          <button
            type="button"
            data-size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              prompt.insert(
                { type: "file", value: "README.md", label: "README.md" },
                { resolve: loadFile() }
              )
            }
          >
            Attach README
          </button>
          <button
            type="button"
            data-variant="solid"
            data-size="sm"
            data-shape="round"
            onClick={() => send(prompt.getValue())}
            aria-label={running ? "Running" : "Send"}
            disabled={running}
          >
            {running ? (
              <ClockIcon aria-hidden="true" />
            ) : (
              <ArrowUpIcon aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <TriggerMenu
        triggers={[
          { char: "@", type: "file", items: files },
          { char: "/", boundary: "start", type: "skill", items: skills },
        ]}
        onSelect={(value, details) =>
          details.trigger === "@" ? loadFile() : undefined
        }
      >
        <TriggerMenuHint />
        <TriggerMenuContent>
          <TriggerMenuEmpty>No matches</TriggerMenuEmpty>
          <TriggerMenuList>
            {(state) =>
              (state.items as TriggerMenuDataItem[]).map((item) => (
                <TriggerMenuItem
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  disabled={item.disabled}
                >
                  {item.label}
                </TriggerMenuItem>
              ))
            }
          </TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
    </TokenInput>
  )
}

export { Example }
```

Type @ for files or / at the start for skills. For /search, enter a query and press Enter to insert the command. Press Enter again to send, and the console logs the message.

## Deleting Tokens

Choose what Backspace does at a token with `tokenDeletion`:

- `whole` removes the token in one press.
- `select` selects it first, then removes it on the next press.
- `revert` turns it back into editable text, so the trigger menu opens on it again.

```tsx title="deletion.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import {
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  type TokenDeletion,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import { CheckIcon, ChevronDownIcon, FileIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

const modes = [
  { value: "whole", label: "Whole" },
  { value: "select", label: "Select" },
  { value: "revert", label: "Revert" },
]

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const draft: TokenInputValue = [
  "Explain ",
  {
    type: "file",
    value: "src/routes.ts",
    label: "routes.ts",
    data: { trigger: "@" },
  },
  " in two sentences.",
]

function Example() {
  const log = useLog()
  const [deletion, setDeletion] = React.useState<TokenDeletion>("whole")

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <Select
          items={modes}
          value={deletion}
          onValueChange={(next) => next && setDeletion(next as TokenDeletion)}
        >
          <SelectLabel>Backspace</SelectLabel>
          <SelectTrigger>
            <SelectValue />
            <ChevronDownIcon aria-hidden="true" />
          </SelectTrigger>
          <SelectContent>
            {modes.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
                <SelectItemIndicator>
                  <CheckIcon aria-hidden="true" />
                </SelectItemIndicator>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Field>
        <FieldLabel>Prompt</FieldLabel>
        <TokenInput
          tokenDeletion={deletion}
          defaultValue={draft}
          renderToken={(token) => (
            <TokenInputToken>
              <FileIcon aria-hidden="true" />
              {token.label}
            </TokenInputToken>
          )}
          onValueChange={(value, details) => {
            for (const token of details.removed) {
              log(`Removed ${token.label} (${deletion})`)
            }
          }}
        >
          <TokenInputEditor />
          <TriggerMenu triggers={[{ char: "@", type: "file", items: files }]}>
            <TriggerMenuContent>
              <TriggerMenuList>
                {(state) =>
                  (state.items as TriggerMenuDataItem[]).map((item) => (
                    <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                      {item.label}
                    </TriggerMenuItem>
                  ))
                }
              </TriggerMenuList>
            </TriggerMenuContent>
          </TriggerMenu>
        </TokenInput>
      </Field>
    </div>
  )
}

export { Example }
```

Choose a Backspace behavior, click just after routes.ts, and press Backspace. Undo to try another behavior.

## Codec

A codec converts tokens to text for the clipboard, forms, and saved drafts. The default writes `[@label](type:value)`. Copy that text into another app and paste it back to restore the token.

Use `toText`, `fromText`, and `toLabel` to convert values yourself. Supply a custom codec for another format, as this example does for `<@hollis>`. With `copy="label"`, copying writes what people read, and pasting back into a token input still restores the tokens. The default parser accepts letters, digits, `_`, and `-` in token types; other types need a custom codec.

```tsx title="codec.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  fromText,
  toText,
  TokenInput,
  TokenInputEditor,
  type TokenCodec,
} from "@ui-sdk/react/token-input"
import { useLog } from "./log"

const chat: TokenCodec = {
  format: (token) => `<@${token.value}>`,
  parse: (text) =>
    text.split(/(<@[\w.-]+>)/).map((part) => {
      const id = /^<@([\w.-]+)>$/.exec(part)?.[1]
      return id ? { type: "mention", value: id, label: `@${id}` } : part
    }),
}

const draft = fromText("Ping <@hollis> and <@ines> about the launch", chat)

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Message</FieldLabel>
      <TokenInput
        codec={chat}
        copy="label"
        defaultValue={draft}
        onValueChange={(value) => log(toText(value, chat))}
      >
        <TokenInputEditor />
      </TokenInput>
    </Field>
  )
}

export { Example }
```

Edit the message. The console logs it in the custom format, with each mention as <@id>.

## Form

Give the input a `name` to submit its serialized text. `required`, `disabled`, and `readOnly` control form behavior. The `form` option associates it with a form elsewhere on the page, as shown here.

```tsx title="form.tsx"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  TokenInput,
  TokenInputEditor,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import { CheckIcon } from "lucide-react"
import * as React from "react"
import { useLog } from "./log"

const draft: TokenInputValue = [
  "Explain ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " in two sentences.",
]

function Example() {
  const log = useLog()
  const [disabled, setDisabled] = React.useState(false)
  const [readOnly, setReadOnly] = React.useState(false)
  const formId = React.useId()

  return (
    <div data-slot="stack">
      <div data-slot="controls">
        <label data-slot="label">
          <Checkbox
            checked={disabled}
            onCheckedChange={(next) => setDisabled(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Disabled
        </label>
        <label data-slot="label">
          <Checkbox
            checked={readOnly}
            onCheckedChange={(next) => setReadOnly(next === true)}
          >
            <CheckboxIndicator>
              <CheckIcon aria-hidden="true" />
            </CheckboxIndicator>
          </Checkbox>
          Read-only
        </label>
      </div>
      <div data-slot="stack">
        <Field disabled={disabled}>
          <FieldLabel>Prompt</FieldLabel>
          <TokenInput form={formId} name="prompt" required defaultValue={draft} readOnly={readOnly}>
            <TokenInputEditor />
          </TokenInput>
        </Field>
        <form
          id={formId}
          data-slot="row"
          onSubmit={(event) => {
            event.preventDefault()
            log(
              `Submitted ${new FormData(event.currentTarget).get("prompt") ?? ""}`
            )
          }}
        >
          <button type="submit" data-variant="solid">
            Submit
          </button>
          <button type="reset">Reset</button>
        </form>
      </div>
    </div>
  )
}

export { Example }
```

Press Submit to log the prompt's serialized value. Try Disabled and Read-only, then Reset.

## Controlled

Pass `value` and update it in `onValueChange`. The change details include the reason, input type, and removed tokens. The input still manages its editing history.

```tsx title="controlled.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  toText,
  TokenInput,
  TokenInputEditor,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import {
  type TriggerMenuDataItem,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"
import { useLog } from "./log"

const files = [
  { value: "src/app.tsx", label: "app.tsx", keywords: ["src"] },
  { value: "src/routes.ts", label: "routes.ts", keywords: ["src"] },
  { value: "src/styles.css", label: "styles.css", keywords: ["src"] },
  { value: "README.md", label: "README.md" },
  { value: "package.json", label: "package.json" },
]

const draft: TokenInputValue = [
  "Explain ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " in two sentences.",
]

function Example() {
  const log = useLog()
  const [value, setValue] = React.useState<TokenInputValue>(draft)

  return (
    <Field>
      <FieldLabel>Prompt</FieldLabel>
      <TokenInput
        value={value}
        onValueChange={(next, details) => {
          setValue(next)
          const removed = details.removed.map((token) => token.label).join(", ")
          log(
            `${toText(next)} (${details.reason}${removed ? `, removed ${removed}` : ""})`
          )
        }}
        history={{ limit: 50, groupDelay: 1000 }}
        getTokenDescription={(token) =>
          token.type === "file" ? "attached file" : token.type
        }
      >
        <TokenInputEditor />
        <TriggerMenu triggers={[{ char: "@", type: "file", items: files }]}>
          <TriggerMenuContent>
            <TriggerMenuList>
              {(state) =>
                (state.items as TriggerMenuDataItem[]).map((item) => (
                  <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                    {item.label}
                  </TriggerMenuItem>
                ))
              }
            </TriggerMenuList>
          </TriggerMenuContent>
        </TriggerMenu>
      </TokenInput>
    </Field>
  )
}

export { Example }
```

Type, add a file with @, or remove a token. The console logs the value and the reason for each change.

## Controller

Use `createTokenInputController()` to insert, update, or remove tokens from code. Pass a promise as `resolve` to mark an inserted token as pending until its data is ready. Updating a token doesn't add an undo step.

```tsx title="controller.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  createTokenInputController,
  TokenInput,
  TokenInputEditor,
  type Token,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import * as React from "react"

const draft: TokenInputValue = [
  "Compare ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
  " with ",
]

const loadFile = () => new Promise<void>((resolve) => setTimeout(resolve, 800))

function Example() {
  const [prompt] = React.useState(createTokenInputController)
  const firstToken = () =>
    prompt
      .getValue()
      .find((segment): segment is Token => typeof segment !== "string")

  return (
    <div data-slot="stack">
      <div data-slot="controls" onMouseDown={(event) => event.preventDefault()}>
        <button
          type="button"
          onClick={() =>
            prompt.insert(
              { type: "file", value: "package.json", label: "package.json" },
              { at: "end", resolve: loadFile() }
            )
          }
        >
          Attach File
        </button>
        <button
          type="button"
          onClick={() => {
            const token = firstToken()
            if (token) {
              prompt.updateToken(token.id!, { label: token.value })
            }
          }}
        >
          Show Path
        </button>
        <button
          type="button"
          onClick={() => {
            const token = firstToken()
            if (token) {
              prompt.removeToken(token.id!)
            }
          }}
        >
          Remove First
        </button>
        <button type="button" onClick={() => prompt.undo()}>
          Undo
        </button>
        <button type="button" onClick={() => prompt.clear()}>
          Clear
        </button>
      </div>
      <Field>
        <FieldLabel>Prompt</FieldLabel>
        <TokenInput controller={prompt} defaultValue={draft}>
          <TokenInputEditor />
        </TokenInput>
      </Field>
    </div>
  )
}

export { Example }
```

Attach a file and watch it load. Show the first token's full path or remove it, then use Undo or Clear.

## Submit Shortcut

Set `submitShortcut` to `mod+enter` for a multiline message. Enter then inserts a line, and Command or Control+Enter submits.

```tsx title="submit-shortcut.tsx"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import {
  toLabel,
  TokenInput,
  TokenInputEditor,
} from "@ui-sdk/react/token-input"
import { useLog } from "./log"

function Example() {
  const log = useLog()

  return (
    <Field>
      <FieldLabel>Message</FieldLabel>
      <TokenInput
        submitShortcut="mod+enter"
        onSubmit={(value) => log(`Sent ${toLabel(value)}`)}
      >
        <TokenInputEditor placeholder="Write a message…" />
      </TokenInput>
    </Field>
  )
}

export { Example }
```

Write a message. Enter adds a line; Command+Enter on a Mac or Control+Enter elsewhere sends it to the console.

## Custom Rendering

Pass `renderToken` to render each token's content, usually a `TokenInputToken` with a `TokenInputTokenRemove` inside. It receives the token, so you can choose an icon by its type or show its `data`. Without it, each token shows its label.

Every part also takes `render`. [Parts and Composition](../parts-and-composition.md#choose-the-element) explains how props merge, and each part's state is listed under [State](#state).

## Styling

Style the editor, the tokens and their remove buttons. The editor shows `data-empty` while it holds nothing; show the placeholder with `content: attr(aria-placeholder)` on its `::before`. Tokens show `data-token-type`, `data-pending`, `data-unresolved` and `data-selected`. Without a custom token renderer, the element that holds each token, `token-input-host`, carries the same attributes, so you can style tokens without `renderToken`.

Each part has a `data-slot`, such as `token-input-token`, and shows its state through the attributes listed under [Data Attributes](#data-attributes).

## Data Attributes

### TokenInputEditor
`[data-slot="token-input-editor"]`

- `data-empty`: Present while the input holds nothing. Show the placeholder with it.
- `data-disabled`: Present when the input is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the input is read-only.

### TokenInputToken
`[data-slot="token-input-token"]`

- `data-token-type` (`file`): The token's type, like `file` or `mention`. Also on its host.
- `data-pending`: Present while the token loads. Also on its host.
- `data-disabled`: Present when the input is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the input is read-only.
- `data-slot`
- `data-selected`: Present while the token is in the selection, or selected for removal. Also on its host.
- `data-unresolved`: Present while the token needs the user, like an ambiguous mention. Also on its host.

### TokenInputTokenRemove
`[data-slot="token-input-token-remove"]`

- `data-disabled`: Present when the input is disabled, by its own prop, a field or a `<fieldset>`.
- `data-readonly`: Present when the input is read-only.

## API Reference

Props and callbacks are the same as below, as React props.

### TokenInput

- `value?` (`TokenInputValue`): The value. Pass it to control the input.
- `defaultValue?` (`TokenInputValue`): The value at first, when uncontrolled. A form reset returns to it.
- `onValueChange?` (`((value: TokenInputValue, details: TokenInputValueChangeDetails) => void)`): Runs when typing, pasting, a menu, undo or a controller wants to change the value. `details.reason` says why, `details.removed` lists removed tokens, and `details.cancel()` stops it.
- `onSubmit?` (`((value: TokenInputValue, details: TokenInputSubmitDetails) => void)`): Runs on the submit shortcut, unless an input method is composing or a trigger menu is open. Without it, the shortcut submits the form the input is in. With neither, the key is left alone, so Enter starts a new line.
- `submitShortcut?` (`"enter" | "mod+enter"`): Which keys submit: `"enter"`, with Shift+Enter for a new line, or `"mod+enter"`, with Enter for a new line, which many Japanese and Chinese writers prefer.
- `tokenDeletion?` (`TokenDeletion`): How Backspace and Delete treat a token next to the caret. `"whole"` removes it in one press, `"select"` selects it first and removes it on the second, and `"revert"` turns it back into its text, so a trigger menu opens on it again.
- `copy?` (`"codec" | "label"`): What copying writes as plain text: `"codec"` keeps tokens through any app that pastes text, `"label"` writes what people read.
- `codec?` (`TokenCodec`): How tokens become text and back, for the clipboard and forms.
- `getTokenDescription?` (`((token: Token) => string)`): What a token says to screen readers besides its label, like its kind and status.
- `history?` (`UndoStackOptions`): Undo history: how many steps it keeps, and how long a typing pause starts a new step.
- `disabled?` (`boolean`): Disables the input: it can't be focused or changed, and isn't submitted.
- `readOnly?` (`boolean`): Keeps the input focusable and submitted, but stops changes.
- `required?` (`boolean`): Blocks form submission while the input is empty.
- `name?` (`string`): The name the codec text submits under. Without one, the input submits nothing.
- `form?` (`string`): The id of a form to belong to, when the input isn't inside it.
- `controller?` (`object`): Reads, edits and focuses the input from anywhere. Create one with `createTokenInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

`renderToken` receives each token and returns its content, usually a `TokenInputToken`.

### TokenInputEditor

- `placeholder?` (`string`): Text shown while the input is empty, through `aria-placeholder`. Show it with `data-empty:before:content-[attr(aria-placeholder)]`.

### TokenInputToken

A token's content, inside `renderToken`, with its state for styling. Renders a `span`.

### TokenInputTokenRemove

Removes its token when pressed and keeps focus in the editor. Renders a `span`, hidden from assistive technology, since keyboard users remove tokens with Backspace.

### Token

- `type` (`string`): Kind, like `"mention"`, `"file"` or `"skill"`.
- `value` (`string`): The id it stands for.
- `label` (`string`): The text it shows, reads as and falls back to.
- `id?` (`string`): Stable identity, generated when missing.
- `status?` (`"pending" | "unresolved"`): `"pending"` while it loads, `"unresolved"` when it needs the user, like an ambiguous mention.
- `data?` (`Record<string, unknown>`): What the chip renders from, like an icon or a run state. Never serialized.

### Codec

- `format` (`(token: Token) => string`): The text a token is written as.
- `parse` (`(text: string) => TokenInputValue`): Text back into a value, with tokens wherever their text appears.
- `escape?` (`((text: string, next: Token | undefined) => string)`): How plain text is written so `parse` reads it back as text. `next` is the token that follows it, if any. Defaults to the text as is.

### State

`TokenInputEditor`:

- `empty` (`boolean`): Whether the input holds nothing.
- `disabled` (`boolean`): Whether the input is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the input is read-only: it stays focusable, but typing, pastes and drops don't change it.

`TokenInputToken`:

- `token` (`Token`): The token this part shows: the one the token input renders its content for.
- `selected` (`boolean`): Whether the token is in the selection, or selected for removal.
- `pending` (`boolean`): Whether the token is loading.
- `unresolved` (`boolean`): Whether the token needs the user, like an ambiguous mention.
- `disabled` (`boolean`): Whether the input is disabled, by itself or by a `<fieldset>`.
- `readOnly` (`boolean`): Whether the input is read-only, so the token's remove button does nothing.

### Reasons

- `input-change` (`Event`): Typing, pasting or dropping changed a text field's value; in a combobox it can also open or close it, or Enter keeps the typed text as the value.
- `paste` (`ClipboardEvent`): Files were pasted, like a screenshot, or text and tokens into a token input.
- `drop` (`DragEvent`): Files were dropped on a drop zone, or text and tokens on a token input.
- `cut` (`ClipboardEvent`): A selection was cut from a token input.
- `undo` (`KeyboardEvent | InputEvent`): Undo, from the keyboard, the Edit menu or a controller.
- `redo` (`KeyboardEvent | InputEvent`): Redo, from the keyboard, the Edit menu or a controller.
- `remove-press` (`MouseEvent | KeyboardEvent`): A chip's remove part was pressed, or Backspace or Delete removed a chip or a span.
- `item-press` (`MouseEvent | KeyboardEvent`): A member of a collection was chosen: a menu item, a tab, a radio or a checkbox item.
- `reset` (`none`): A form reset.
- `restore` (`none`): The browser restored state, like after going back, or a saved value was read back from storage.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

### Controller

Create one with `createTokenInputController()` and pass it as `controller`.

- `getValue()` (`() => TokenInputValue`): The value: text and tokens.
- `setValue(value, options?)` (`(value: TokenInputValue, options?: TokenInputChangeOptions | undefined) => boolean`): Replaces the value as one undoable step. Returns false when the change was canceled or nothing changed.
- `getText(codec?)` (`(codec?: TokenCodec | undefined) => string`): The value as codec text, like `Ask [@Ada](mention:ada)`.
- `getLabel()` (`() => string`): The value as people read it, with each token's label.
- `insert(content, options?)` (`(content: string | Token | TokenInputValue, options?: (TokenInputChangeOptions & { at?: TextRange | "caret" | "end" | undefined; resolve?: PromiseLike<...> | undefined; }) | undefined) => boolean`): Inserts text, a token or a value at the caret, the end or a range, as one undoable step. With `resolve`, a token is pending until it settles: updated with what it resolves to, removed if it rejects. Returns false when the change was canceled.
- `updateToken(id, patch)` (`(id: string, patch: Partial<Omit<Token, "id">>) => boolean`): Changes a token's status, data or label without an undo step or a caret move. Returns false when there's no such token or nothing changed.
- `removeToken(id, options?)` (`(id: string, options?: TokenInputChangeOptions | undefined) => boolean`): Removes a token as one undoable step. Returns false when the change was canceled or nothing changed.
- `undo()` (`() => boolean`): Undoes the last step. Returns false when there was none or the change was canceled.
- `redo()` (`() => boolean`): Redoes the last undone step. Returns false when there was none or the change was canceled.
- `canUndo()` (`() => boolean`): Whether there's a step to undo.
- `canRedo()` (`() => boolean`): Whether there's a step to redo.
- `clear(options?)` (`(options?: TokenInputChangeOptions | undefined) => boolean`): Empties the input as one undoable step. Returns false when the change was canceled or nothing changed.
- `focus(options?)` (`(options?: { at?: "end" | "start" | undefined; } | undefined) => void`): Focuses the editor, with the caret at its start or end.
- `editor` (`TextEditorAdapter`): The editor a TriggerMenu outside the token input reads and writes. A menu inside it finds it on its own.

### Events

Callbacks get the new state first, then the details.

| Prop            | On           | Receives                                                                         |
| --------------- | ------------ | -------------------------------------------------------------------------------- |
| `onValueChange` | `TokenInput` | `(value, details)`: the value, the [reason](#reasons), `inputType` and `removed` |
| `onSubmit`      | `TokenInput` | `(value, details)`: the value, and the key press or menu choice that submitted   |

## Accessibility

The editor is a multiline text box: it has the `textbox` role with `aria-multiline`, and a Trigger Menu inside it adds `aria-autocomplete` and `aria-haspopup` for its suggestions. Give it a visible label through a [Field](./field.md), or an `aria-label`. Each token reads as its label and its kind, like "routes.ts file", and inserting or removing one is announced. Typing keeps the browser's spelling, autocorrect, and input method support.

### Keyboard

| Key                          | Does                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Backspace, Delete            | Removes the token before or after the caret, as `tokenDeletion` says         |
| ArrowLeft, ArrowRight        | Moves the caret past a token in one press; the caret never stops inside one  |
| Enter                        | Submits. While a trigger menu is open, chooses the highlighted suggestion    |
| Shift+Enter                  | Starts a new line                                                            |
| Command+Enter, Control+Enter | Submits when `submitShortcut` is `"mod+enter"`; Enter then starts a new line |
| Command+Z, Control+Z         | Undoes the last step. Typing is grouped; pastes and token changes are steps  |
| Shift+Command+Z, Control+Y   | Redoes the last undone step                                                  |

### Tested Behavior

Every line below is an automated test.

**Value**

- Renders text and tokens, each token as one chip.
- Tokens it starts with show their rendered content once, and read as their label and kind.
- Tokens and their remove parts mark a read-only or disabled input.
- Is empty with a placeholder until something is typed.
- Typing after a token goes after it.
- Shift+Enter starts a new line.

**Tokens**

- @ opens the menu inside the input, and choosing inserts a token and a space.
- A controlled input takes tokens from its menu and keeps typing in order.
- Enter in an open menu chooses and doesn't submit.
- One Backspace removes a whole token, and says so.
- Backspace removes tokens one by one, with no keystroke spent on anchors.
- Delete removes the token after the caret.
- The caret crosses a token with one arrow press each way.
- The caret can sit between two adjacent tokens.
- Clicking past a final token and typing lands after it.
- Word deletion stops at a token.
- The remove button removes its token and keeps focus.
- With tokenDeletion select, the first Backspace selects the token and the second removes it.
- With tokenDeletion revert, Backspace turns the token back into text and the menu opens on it.

**History**

- Undo and Redo step through edits, a token insertion on its own.
- Undo brings back a removed token.
- A pending token shows loading, then settles without an undo step.
- A pending token whose load fails is removed.

**Clipboard**

- Copying tokens into plain text and back keeps them.
- Copy writes codec text and HTML with the tokens.
- Pasting codec text makes tokens.
- With copy label, plain text gets what people read.

**Submit**

- Enter submits the codec text.
- With mod+enter, Enter is a new line and Cmd or Ctrl+Enter submits.
- A form submits the codec text under the input's name.
- Enter submits the form the input's form attribute names, not the one it's in.
- Enter while an input method composes doesn't submit.

Runs in React, Vue and web components.
