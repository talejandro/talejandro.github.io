# File Input

Choose, drop, or paste files, validate them, and submit them with a form.

A file input holds the files someone chooses, drops, or pastes, checks them against your rules, and submits them with a form. Uploading them to a server is up to your app.

```tsx title="basic.tsx"
import {
  FileInput,
  FileInputDropzone,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from "@ui-sdk/react/file-input"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

function Example() {
  return (
    <FileInput multiple>
      <FileInputDropzone>
        <UploadIcon aria-hidden="true" />
        <p>Drag and drop files here</p>
        <p data-slot="hint">Or paste them from your clipboard.</p>
        <FileInputTrigger>Browse Files</FileInputTrigger>
      </FileInputDropzone>
      <FileInputList aria-label="Files">
        <FileInputItem>
          {({ file }) => (
            <>
              <FileIcon aria-hidden="true" />
              <span>{file.name}</span>
              <span data-slot="hint">{formatFileSize(file.size)}</span>
              <FileInputItemRemove>
                <XIcon aria-hidden="true" />
              </FileInputItemRemove>
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  )
}

export { Example }
```

Browse Files or drop a few files on the zone, then remove one. Tab to the list to move between files with the arrow keys, and press Delete to remove the focused one.

## Installation

```bash
npm install @ui-sdk/react @ui-sdk/core
```

## Composition

Use the following composition to build a `FileInput`:

```text
FileInput
├── FileInputTrigger
├── FileInputDropzone
└── FileInputList
    └── FileInputItem
        └── FileInputItemRemove
```

The trigger opens the system file picker. The drop zone takes files that are dropped on it or pasted while focus is inside it; keep a trigger beside it for people using a keyboard. The list renders its item once for each file, and an item's state has its `file` and `index`. A remove button removes its item's file.

## Usage

Import the parts and put them together:

```tsx
import {
  FileInput,
  FileInputDropzone,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from "@ui-sdk/react/file-input"
import { XIcon } from "lucide-react"

function Example() {
  return (
    <FileInput name="attachments" multiple>
      <FileInputDropzone>
        <p>Drag and drop files here</p>
        <FileInputTrigger>Browse Files</FileInputTrigger>
      </FileInputDropzone>
      <FileInputList aria-label="Files">
        <FileInputItem>
          {({ file }) => (
            <>
              <span>{file.name}</span>
              <span>{formatFileSize(file.size)}</span>
              <FileInputItemRemove>
                <XIcon aria-hidden="true" />
              </FileInputItemRemove>
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  )
}

export { Example }
```

## Upload Button

A trigger is enough when you only need the system file picker. Read the chosen file from the root's state to show its name beside the button.

```tsx
<FileInput name="resume">
  {(state) => (
    <>
      <FileInputTrigger>Upload Resume</FileInputTrigger>
      <span>{state.value[0]?.name ?? "No file chosen"}</span>
    </>
  )}
</FileInput>
```

## Accepted Types

`accept` takes MIME types, wildcards, and extensions, such as `image/*` and `.pdf`. It checks files from the picker, drops, and pastes. An extension matches the filename, even when the operating system reports an unexpected MIME type.

A rejected file never joins the value. `onReject` receives each one with its `reasons`, such as `file-type`, so you can say why it was left out. While files are dragged over a drop zone, `data-drag-reject` shows when their types won't be accepted.

```tsx
<FileInput multiple accept={["image/*", ".pdf"]} onReject={(rejected) => setRejected(rejected)}>
```

## Limits

Use `maxFiles` to limit the total count, and `minSize` or `maxSize` for bytes per file. When too many files arrive, the component accepts the first ones that pass the other checks until the list is full, and rejects the rest with `too-many-files`.

```tsx
<FileInput multiple maxFiles={3} minSize={1} maxSize={5_000_000}>
```

## One File

Without `multiple`, a new file replaces the current one. A rejected file leaves the current value unchanged. With `multiple`, accepted files join the list.

```tsx
<FileInput accept=".pdf">
  {({ value: [file] }) => (
    <FileInputTrigger>{file ? "Replace PDF" : "Choose a PDF"}</FileInputTrigger>
  )}
</FileInput>
```

## Validation

Add `validate` for checks of your own. Return a reason string to reject a file, or `null` to accept it. Its second argument's `accepted` holds the files of the same drop accepted before this one, so a duplicate check catches two files with one name in a single drop. It runs after the built-in type and size checks, and its reason reaches `onReject` like theirs. Validate uploads on your server too.

```tsx
const [files] = React.useState(createFileInputController)

<FileInput
  multiple
  controller={files}
  validate={(file, { accepted }) => ([...files.getValue(), ...accepted].some((other) => other.name === file.name) ? "duplicate" : null)}
  onReject={(rejected) => setRejected(rejected)}
>
```

## File List

The list has one Tab stop. Arrow keys, Home, and End move between files; Delete or Backspace removes the focused file. Remove buttons are named for their file and stay outside the Tab order.

For an image preview, create an object URL for the file and revoke it when the item goes away:

```tsx
;<FileInputItem>
  {({ file }) => (
    <>
      <Preview file={file} />
      <span>{file.name}</span>
      <FileInputItemRemove>
        <XIcon aria-hidden="true" />
      </FileInputItemRemove>
    </>
  )}
</FileInputItem>

function Preview({ file }: { file: File }) {
  const [url, setUrl] = React.useState<string>()
  React.useEffect(() => {
    const next = URL.createObjectURL(file)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [file])
  return url ? <img src={url} alt="" /> : null
}
```

## Attachments

Put a textarea inside a drop zone to attach files to a message. `pasteTarget` takes file pastes from the textarea too; text pastes keep their normal behavior. It can also be another element, a CSS selector, or `"document"`.

```tsx
const message = React.useRef<HTMLTextAreaElement>(null)

<FileInput multiple>
  <FileInputDropzone pasteTarget={() => message.current}>
    <FileInputList aria-label="Attachments">
      <FileInputItem>{({ file }) => file.name}</FileInputItem>
    </FileInputList>
    <textarea ref={message} aria-label="Message" />
    <FileInputTrigger aria-label="Attach Files">
      <PlusIcon aria-hidden="true" />
    </FileInputTrigger>
  </FileInputDropzone>
</FileInput>
```

## Page-Wide Drop

Set `target="document"` to take files dropped anywhere on the page. The zone shows `data-dragging` while a file is over the window, so it can be a full-page overlay. A drop on another zone stays with that zone.

```tsx title="page.tsx"
import {
  FileInput,
  FileInputDropzone,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from "@ui-sdk/react/file-input"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

function Example() {
  return (
    <FileInput multiple>
      <div data-slot="row">
        <p data-slot="hint">Drop files anywhere.</p>
        <FileInputTrigger>Upload Files</FileInputTrigger>
      </div>
      <FileInputDropzone target="document" data-variant="overlay">
        <div data-slot="stack">
          <UploadIcon aria-hidden="true" />
          <p>Drop to attach</p>
        </div>
      </FileInputDropzone>
      <FileInputList aria-label="Attachments">
        <FileInputItem>
          {({ file }) => (
            <>
              <FileIcon aria-hidden="true" />
              <span>{file.name}</span>
              <span data-slot="hint">{formatFileSize(file.size)}</span>
              <FileInputItemRemove>
                <XIcon aria-hidden="true" />
              </FileInputItemRemove>
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  )
}

export { Example }
```

Drag a file over this page to see the overlay, then drop it. The file joins the Attachments list; a drop on the first example's zone stays there.

While a drop zone is mounted, dropping a file outside every zone doesn't navigate away from the page. Drops onto native file inputs and ordinary text drops keep their behavior.

## Folders

`directory` picks a whole folder and turns on `multiple`. Dropped folders are read recursively, up to 1,000 files, skipping system files such as `.DS_Store`. `relativePath(file)` returns the path inside the folder.

```tsx
<FileInput directory>
  <FileInputTrigger>Choose a Folder</FileInputTrigger>
  <FileInputList aria-label="Files">
    <FileInputItem>{({ file }) => relativePath(file)}</FileInputItem>
  </FileInputList>
</FileInput>
```

## Camera

Use `capture="environment"` to request the rear camera, or `"user"` for the front camera. The picker offered depends on the device and browser; a desktop browser opens a file picker.

```tsx
<FileInput accept="image/*" capture="environment">
  <FileInputTrigger>Take a Photo</FileInputTrigger>
</FileInput>
```

## Controlled

Pass `value` and update it in `onValueChange`. `details` has the `reason` and the `added`, `removed`, and `rejected` files. Call `details.cancel()` to keep the current value. `onReject` reports rejected files even when none were accepted.

```tsx
const [files, setFiles] = React.useState<File[]>([])

<FileInput multiple value={files} onValueChange={(value) => setFiles(value)}>
```

## Opening from Anywhere

Create a controller with `createFileInputController()` and pass it to `FileInput`. Use it to open the picker, add or remove files, clear the value, or read the files. Open the picker from a user action, such as a button press, so the browser allows it. A `FileInputTrigger` outside the file input connects through the same `controller` prop.

```tsx
const [attachments] = React.useState(createFileInputController)

<button type="button" onClick={() => attachments.open()}>
  Choose Files
</button>
<button type="button" onClick={() => attachments.clear()}>
  Clear
</button>
<FileInput multiple controller={attachments} />
```

## Announcements

The component announces accepted, removed, and rejected files through a polite live region. Use `announcement` to change the message, or return `null` to skip it.

```tsx
<FileInput
  multiple
  announcement={({ added, removed }) =>
    added.length
      ? `Added ${added.map((file) => file.name).join(", ")}.`
      : removed.length
        ? `Removed ${removed.map((file) => file.name).join(", ")}.`
        : null
  }
>
```

## Forms

With `name`, the component submits its files through a native file input, which can submit before hydration. A form reset returns to `defaultValue`. `form` connects the file input to a form elsewhere on the page. Rejected files never submit, and `disabled` leaves the value out of the submission as well as stopping picks, drops, and pastes.

```tsx
<form method="post" encType="multipart/form-data">
  <FileInput name="attachments" multiple defaultValue={[coverLetter]}>
    <FileInputTrigger>Attach Files</FileInputTrigger>
  </FileInput>
  <button type="submit">Send</button>
  <button type="reset">Reset</button>
</form>
```

## Fields

Wrap the file input in a [Field](./field.md) to connect its label, description, and validation message. The trigger becomes the field's control, and pressing the label opens the picker. `required` stops the form from submitting with no file.

```tsx
<Field>
  <FieldLabel>Proof of address</FieldLabel>
  <FileInput name="proof" required accept={["image/*", ".pdf"]}>
    <FileInputTrigger>Choose a File</FileInputTrigger>
  </FileInput>
  <FieldDescription>
    A utility bill or bank statement from the last 3 months.
  </FieldDescription>
  <FieldError match="valueMissing">Add a scan to continue.</FieldError>
</Field>
```

## Custom Rendering

Every part takes `render`, to render a different element in its place. The root, the drop zone, and an item also take a function as children, which receives the part's state:

```tsx
<FileInputDropzone render={<section aria-label="Gallery upload" />}>
  {(state) => (state.dragReject ? "Images only" : state.dragAccept ? "Release to add" : "Drag images here")}
</FileInputDropzone>
<FileInputList render={<ul aria-label="Images" />}>
  <FileInputItem render={<li />}>{(state) => `${state.index + 1}. ${state.file.name}`}</FileInputItem>
</FileInputList>
```

See [Parts and Composition](../parts-and-composition.md) for more on `render`.

## Styling

Use `data-dragging`, `data-drag-accept`, and `data-drag-reject` on the drop zone to show what a drop would do. Drag acceptance reflects the file information the browser exposes before a drop. Inside a Field, the trigger also gets the field's attributes, such as `data-invalid`.

Each part has a `data-slot`, such as `file-input-dropzone`, and its state attributes are listed under [Data Attributes](#data-attributes).

## Data Attributes

### FileInput
`[data-slot="file-input"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-required`: Present when a file is required.
- `data-dragging`: Present while files are dragged over one of its drop zones.

### FileInputTrigger
`[data-slot="file-input-trigger"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-required`: Present when a file is required.

### FileInputDropzone
`[data-slot="file-input-dropzone"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-dragging`: Present while files are dragged over the zone, or the window with `target="document"`.
- `data-drag-accept`: Present while dragged files look acceptable, from their types and count.
- `data-drag-reject`: Present while a dragged file has a type `accept` rules out, or there are too many.

### FileInputList
`[data-slot="file-input-list"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.
- `data-required`: Present when a file is required.

### FileInputItem
`[data-slot="file-input-item"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.

### FileInputItemRemove
`[data-slot="file-input-item-remove"]`

- `data-disabled`: Present when disabled, by its own prop or a `<fieldset>`.

## API Reference

Props are the same as below, as React props.

### FileInput

- `accept?` (`string | readonly string[]`): The files to accept, like the `accept` attribute: MIME types (`"image/png"`), wildcards (`"image/*"`) and extensions (`".pdf"`), in a comma-separated string or an array. Without it, any file.
- `maxFiles?` (`number`): The most files accepted at a time. The first ones that pass the other checks are accepted, and the rest are rejected.
- `maxSize?` (`number`): The largest size accepted, in bytes.
- `minSize?` (`number`): The smallest size accepted, in bytes.
- `validate?` (`((file: File, batch: { accepted: readonly File[]; }) => string | null | undefined | void)`): A check of your own. Return a reason, like `"duplicate"`, to reject the file, or nothing to accept it. `accepted` holds the files of the same choice, drop or paste accepted before this one.
- `value?` (`File[]`): The files, to control the file input.
- `defaultValue?` (`File[]`): The files at first, when uncontrolled. A form reset returns to them.
- `onValueChange?` (`((value: File[], details: FileInputValueChangeDetails) => void)`): Runs when files are added or removed, with what changed in the details. `details.cancel()` stops it.
- `onReject?` (`((rejected: FileRejection[], details: CommitDetails<FileInputValueChangeReason>) => void)`): Runs when files fail the checks, after `onValueChange`, with every reason each failed, even when none were accepted.
- `multiple?` (`boolean`): Holds more than one file. New files join the ones it has, up to `maxFiles` in all. Without it, a new file replaces the one it has.
- `directory?` (`boolean`): Picks a whole folder, with every file inside it. Turns on `multiple`.
- `capture?` (`"environment" | "user" | boolean`): Opens the camera on phones instead of the files: `"user"` for the front camera, `"environment"` for the back one, or `true` for the default one.
- `name?` (`string`): The name the files submit under. Without one, nothing is submitted.
- `form?` (`string`): The id of a form to belong to, when it isn't inside that form.
- `required?` (`boolean`): Blocks form submission until it holds a file, with the browser's own message.
- `disabled?` (`boolean`): Disables it like a native control: the trigger can't be focused or used, drops and pastes are ignored, and nothing is submitted.
- `announcement?` (`((change: FileInputChange) => string | null | undefined)`): What screen readers hear after a change. Return null for nothing.
- `controller?` (`object`): Adds and removes files from anywhere. Create one with `createFileInputController()`.
- `debug?` (`boolean`): Logs every state change with its reason to the console, in development builds.

### FileInputTrigger

- `controller?` (`object`): Connects a trigger outside the file input, like one in a toolbar, to the file input with this controller.

### FileInputDropzone

- `target?` (`FileInputDropzoneTarget`): Where it takes drops. `"document"` takes files dropped anywhere on the page, and the zone shows `data-dragging` while files are over the window, so it can be a full-page overlay.
- `pasteTarget?` (`FileInputPasteTarget`): Somewhere else to take pasted files from, on top of pastes while focus is inside the zone: `"document"`, an element, a CSS selector, or a function that returns an element, like a prompt's text area. Text pastes are left alone.

### FileInputList

Renders its children once for each file.

### FileInputItem

- `file` (`File`): The file this item shows. The list passes it to the items it renders.

### FileInputItemRemove

Removes its item's file. It's named for the file and stays out of the Tab order.

### State

The root's, the trigger's and the list's state:

- `value` (`readonly File[]`): The files it holds.
- `disabled` (`boolean`): Whether it's disabled, by itself or by a `<fieldset>`.
- `required` (`boolean`): Whether a form won't submit while it holds no files.
- `dragging` (`boolean`): Whether files are being dragged over one of its drop zones.

A drop zone's:

- `dragging` (`boolean`): Whether files are being dragged over it, or over the page for a page-wide zone.
- `dragAccept` (`boolean`): Whether the dragged files look acceptable, from their types and count.
- `dragReject` (`boolean`): Whether a dragged file has a type `accept` rules out, or there are too many.
- `disabled` (`boolean`): Whether the file input is disabled, by itself or by a `<fieldset>`, so drops and pastes are ignored.

An item's:

- `file` (`File`): The file this item shows: the one its `FileInputList` renders it for, or its `file` prop.
- `index` (`number`): Where it is in the value, from 0.
- `disabled` (`boolean`): Whether the file input is disabled, so the item can't be removed.

A remove button's:

- `disabled` (`boolean`): Whether the file input is disabled, so the button can't remove its file.

### Reasons

- `picker` (`Event`): Files were chosen in the system's file picker. Its input's `change` event.
- `drop` (`DragEvent`): Files were dropped on a drop zone, or text and tokens on a token input.
- `paste` (`ClipboardEvent`): Files were pasted, like a screenshot, or text and tokens into a token input.
- `remove-press` (`MouseEvent | KeyboardEvent`): A chip's remove part was pressed, or Backspace or Delete removed a chip or a span.
- `reset` (`none`): A form reset.
- `imperative` (`none`): A controller or `api` call, or a property set on a web component.

Rejected files carry one or more of these reasons, or a reason from your `validate`: `file-type`, `file-too-large`, `file-too-small` and `too-many-files`.

### Controller

Create one with `createFileInputController()` and pass it as `controller`.

- `getValue()` (`() => readonly File[]`): The files it holds.
- `setValue(files, options?)` (`(files: readonly File[], options?: FileInputChangeOptions | undefined) => boolean`): Replaces the files, without checking them. Returns false when canceled.
- `addFiles(files, options?)` (`(files: readonly File[] | FileList, options?: FileInputChangeOptions | undefined) => boolean`): Runs files through the checks and adds the accepted ones, like a drop. Returns false when disabled or canceled.
- `removeFile(file, options?)` (`(file: File, options?: FileInputChangeOptions | undefined) => boolean`): Removes one file. Returns false when it isn't there, or the change is canceled.
- `clear(options?)` (`(options?: FileInputChangeOptions | undefined) => boolean`): Removes every file.
- `open()` (`() => boolean`): Opens the file picker. Browsers only allow it during a user action, like a click. Returns false when disabled.
- `focus()` (`() => void`): Moves focus to the trigger.
- `isDragging()` (`() => boolean`): Whether files are being dragged over a drop zone.

## Accessibility

Keep a trigger available alongside a drop zone for people using a keyboard or screen reader. Changes are announced through a polite live region, and the file list supports keyboard navigation and removal.

**Drops and pastes**

- Dropped files are reported, the rejected ones with every reason.
- Files over the zone show data-dragging and data-drag-accept until they leave.
- A type the file input doesn't accept shows data-drag-reject.
- More files than the file input takes show data-drag-reject.
- The drag state holds while the drag crosses the zone's children.
- Text dragged over the zone is ignored.
- A drag that started in the page is ignored, even with files.
- The first files up to maxFiles are accepted and the rest rejected.
- MaxFiles counts the files the file input already holds.
- Without multiple, the first file is accepted, and a new one replaces it.
- A disabled file input takes no drops and shows no drag state.
- Files dropped outside the zone don't open in the browser.
- Pasting files while focus is inside the zone reports them.
- Pasting text is left alone.
- Pasting files into the paste target reports them.
- A page-wide zone shows while files are over the window.
- A page-wide zone takes files dropped anywhere.
- A drop on a zone doesn't reach a page-wide zone.
- Render functions get the drag state. React and Vue only.

**The picker**

- A trigger alone opens the file picker, and the chosen file is reported.
- Files the accept list rules out are rejected.
- An unnamed file input empties its input after each choice, so the same file can be chosen again.
- A folder picker reports every file inside the folder.
- The input carries accept, capture, multiple and directory.
- The input stays out of the tab order and the accessibility tree.
- With multiple, chosen files join the ones dropped before.

**Forms**

- A named file input submits the chosen files with its form.
- Rejected files are never submitted.
- A named file input with no files submits an empty file, like a native input.
- Files dropped on the zone go in the form.
- Canceling a change keeps its files out of the form.
- A form reset clears the files.
- A required file input blocks submission and shows the field's error.
- Files set from script update the field even when the announcement throws. Web components only.
- The field's label and the button's text name the trigger, and its description describes it.
- A press on the field's label opens the picker.
- A disabled file input disables its trigger.

Runs in React, Vue and web components.

- Each file shows as an item in the list, in order.
- A remove button is named after its file, and removes it.
- The list is one tab stop, and arrow keys, Home and End move between items.
- Backspace on a focused item removes it and focuses the next one.
- A removal is announced politely.
- A canceled change leaves the list as it was.
- A form reset empties the list.
- A controlled file input shows the value it's given. React and Vue only.
- A removal a controlled owner ignores keeps the item and its focus. React and Vue only.
- The value property sets the files quietly on web components, and the api reports. Web components only.
- The remove buttons are out of the tab order.

Runs in React, Vue and web components.

- No axe violations at first.
- No axe violations while dragging.
- No axe violations with files in the list.
- No axe violations with the field's error showing.
- No axe violations when disabled.
- The zone isn't a control: the trigger inside it is the one tab stop.
- The accessibility tree is the same everywhere.
- Accepted and rejected counts are announced politely.
- A choice from the picker is announced too.

Runs in React, Vue and web components.
