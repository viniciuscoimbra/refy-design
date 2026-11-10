# Choosing and using the Refy families

How to use each family on a screen, what to pick instead and the keys it answers to. Props and complete examples are in each family's API file (`ai/components/<Id>.json`), which also ships inside the installed package:

```bash
npm exec --offline -- refy-agent component Button
```

See also [installation](../README.md#usar-em-um-projeto-novo), [control choices](CONTROL_CHOICES.md), [theme](THEMING.md), [Templates](BLOCKS.md) and [Charts](CHARTS.md).

Keys that a family's table does not list follow the browser: Tab and Shift+Tab move focus, Enter follows a link. An action you pass in a slot or callback belongs to your application, including its waiting state, its error and its effect.

## Atoms

### Actions

#### Button

[API and examples](../ai/components/Button.json)

How to use:

- Write the label as the action it performs, with a verb: "Save changes", "Send invite".
- Keep one `primary` button per area. Other actions in the same area use `secondary` or `ghost`.
- Use `danger` only for an action that deletes or cannot be undone, and confirm it first with AlertDialog.
- While the action runs, set `loading` (or `status="loading"`): the button shows progress and ignores new clicks. Use `status="success"` or `"error"` to show the result in the button itself.
- Use `block` in narrow columns and on mobile, where the button takes the full width.

Choose something else:

- Going to another page: Button with `href`, which renders a link, or NavCard.
- An action with only an icon: IconButton.
- Several actions grouped under one: SplitButton or Menu.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the button. A disabled button is skipped. |
| `Enter` or `Space` | Runs the action. Nothing happens while it is loading. |
#### IconButton

[API and examples](../ai/components/IconButton.json)

How to use:

- Use it for a frequent action that a known icon already says: close, edit, delete, more options.
- Always pass `aria-label` with the action ("Delete invoice"); it is what a screen reader announces.
- Put it next to what it acts on, such as the end of a row or the corner of a card.
- Pair it with Tooltip when the icon is not obvious to everyone.

Choose something else:

- The icon alone does not say the action: Button with text, with `leadingIcon` if you want the icon.
- Main floating action on mobile: Fab.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the button. A disabled button is skipped. |
| `Enter` or `Space` | Runs the action. |
#### GoogleButton

[API and examples](../ai/components/GoogleButton.json)

How to use:

- Use it for "Sign in with Google" when Google is the only provider, or the main one.
- Start the sign-in in `onClick` and keep `loading` on until Google answers.
- Use `block` on narrow screens, where it takes the full width like the other sign-in buttons.

Choose something else:

- Several providers on the same screen: OAuthButton.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the button. |
| `Enter` or `Space` | Starts the sign-in. Nothing happens while it is loading. |
#### Fab

[API and examples](../ai/components/Fab.json)

How to use:

- Use it for the one action people take most on a mobile screen: new message, new task, add photo.
- Keep one per screen, in the lower corner, above the content.
- Pass an `icon` and an `aria-label`. Use `extended` with `label` when the icon alone is not clear.

Choose something else:

- Several related actions from the same corner: FabMenu.
- Desktop screens, where the action fits in the header: Button.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the button. |
| `Enter` or `Space` | Runs the action. |
### Forms and choices

#### Input

[API and examples](../ai/components/Input.json)

How to use:

- Use it for one line of free text: name, e-mail, link, amount.
- Always give it a `label`. Use `hint` for the format expected ("Only numbers"), and `error` to say what is wrong and how to fix it.
- Set the right `type` (`email`, `url`, `tel`, `number`): the mobile keyboard changes with it.
- Use `prefix` and `suffix` for fixed parts, such as a currency symbol or a domain.

Choose something else:

- Several lines of text: Textarea.
- Picking from known options: Select or Combobox.
- Phone, postal code or verification code: PhoneInput, PostalCodeInput or Otp.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the field. |
| `Enter` | Submits the form the field is in, as in any browser field. |
#### Textarea

[API and examples](../ai/components/Textarea.json)

How to use:

- Use it for text that can take more than one line: description, comment, message.
- Give it a `label`, and a `hint` with the limit or the tone expected ("Up to 500 characters").
- Show `error` below the field, saying how to fix it.

Choose something else:

- One line: Input.
- A message in a chat, with send and attachments: IntentComposer.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the field. |
| `Enter` | Starts a new line. |
#### Select

[API and examples](../ai/components/Select.json)

How to use:

- Use it to pick one option from a short, known list: country, size, sort order.
- Give it a `label` and start with the most common option selected, or with an empty option that asks for a choice.
- Group long lists with `optgroup`.
- The list that opens is the browser's own; on mobile it is the phone's picker.

Choose something else:

- Long list where typing helps: Combobox.
- Two to five options that should all stay visible: Segmented or RadioGroup.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the field. |
| `↓` or `↑` | Changes the option, or opens the list, depending on the browser and the system. |
| `Enter` or `Space` | Opens the list or confirms the option. |
| `Escape` | Closes the list without changing the value. |
#### Checkbox

[API and examples](../ai/components/Checkbox.json)

How to use:

- Use it for an option that can be on or off regardless of the others: accept terms, receive news, one item of a list.
- Write the `label` as the statement that becomes true when marked ("Send me the weekly summary").
- Use `description` for the consequence, and `boxed` when each option is a row the person compares.
- The change only takes effect when the form is saved.

Choose something else:

- Only one option of the group can be chosen: RadioGroup.
- A setting that takes effect right away: Switch.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the box. |
| `Space` | Marks or clears the box. |
#### RadioGroup

[API and examples](../ai/components/RadioGroup.json)

How to use:

- Use it when only one of a few options can be chosen and the person needs to see all of them to decide: plan, delivery method, visibility.
- Give the group a `label` with the question, and each option a short label, with a description when the difference is not obvious.
- Start with the safest or most common option selected.

Choose something else:

- Several options can be on at once: Checkbox.
- Seven or more options: Select or Combobox.
- Choices with image or price that work like cards: ChoiceCard.

| Key | What it does |
|---|---|
| `Tab` | Enters the group on the selected option, and leaves it on the next Tab. |
| `↓` or `↑` | Selects the next or previous option. |
| `Space` | Selects the option in focus. |
#### Switch

[API and examples](../ai/components/Switch.json)

How to use:

- Use it for a setting that takes effect as soon as it changes: notifications, dark mode, auto-save.
- Write the `label` as the thing being turned on ("E-mail notifications"), not as a question.
- Save the change in `onChange`. If saving fails, switch it back and say why.

Choose something else:

- The change only counts after the person saves the form: Checkbox.
- An action that deletes or cannot be undone: Button with confirmation.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the switch. |
| `Space` | Turns it on or off. |
#### Segmented

[API and examples](../ai/components/Segmented.json)

How to use:

- Use it to switch between two to five views or modes of the same content: day, week and month; list and grid.
- Keep labels short and of similar length. With `iconOnly`, the labels become the accessible names and tooltips.
- Give the group a `label` that names what changes ("Period").

Choose something else:

- More than five options: Select.
- Several options on at once: ToggleGroup.
- Separate sections with different content: Tabs.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the selected option. |
| `←` or `→` | Selects the previous or next option. |
| `Enter` or `Space` | Selects the option in focus. |
#### ToggleGroup

[API and examples](../ai/components/ToggleGroup.json)

How to use:

- Use it to turn on several filters or formats that stay visible: bold, italic and underline; critical, warnings and info.
- Each button shows whether it is on; the value is the list of options on.
- Give the group a `label` that names the set ("Severity").

Choose something else:

- Only one option at a time: Segmented or RadioGroup.
- Many options: Multiselect.

| Key | What it does |
|---|---|
| `Tab` | Moves from one button to the next. |
| `Enter` or `Space` | Turns the option in focus on or off. |
#### Range

[API and examples](../ai/components/Range.json)

How to use:

- Use it to pick a range between two values: price, distance, area.
- Give it a `label` and format the values with `formatValue` ("R$ 200", "5 km").
- Add `histogram` to show how many results fall in each part of the range, and `ticks` for reference marks.
- Use `fixedMinimum` when only the upper end changes, such as a radius from zero.

Choose something else:

- One value: Slider.
- An exact number that people type: Input with `type="number"`.

| Key | What it does |
|---|---|
| `Tab` | Moves from the lower handle to the upper handle. |
| `←` `→` `↓` `↑` | Moves the handle in focus by one step. With `Shift`, by ten steps. |
| `PageUp` or `PageDown` | Moves by ten steps. |
| `Home` or `End` | Goes to the lowest or highest allowed value. The two handles never cross. |
#### Slider

[API and examples](../ai/components/Slider.json)

How to use:

- Use it for a value where the position matters more than the exact number: volume, opacity, intensity.
- Give it a `label`; use `hideLabel` in compact bars, where the name stays only for screen readers.
- Use `marks` when only a few steps are valid (1 to 5), and `ticks` to name the ends ("Shallow", "Deep").

Choose something else:

- Two ends: Range.
- An exact number: Input with `type="number"`.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the handle. |
| `←` `→` `↓` `↑` | Moves one step. With `Shift`, ten steps. |
| `PageUp` or `PageDown` | Moves by ten steps. |
| `Home` or `End` | Goes to the lowest or highest value. |
#### Otp

[API and examples](../ai/components/Otp.json)

How to use:

- Use it for the code sent by SMS, e-mail or an authenticator app.
- Set `length` to the size of the code, and `groupSize` to split long codes ("392 114").
- Verify in `onComplete`, which fires when the last digit is filled. Show `error` when the code is wrong, and a resend link below.
- Your application sends and checks the code, and controls expiry and attempts.

Choose something else:

- A password or any free text: Input.

| Key | What it does |
|---|---|
| Typing or pasting | Fills the boxes in order; a pasted code fills all of them. |
| `←` or `→` | Moves to the previous or next box. |
| `Backspace` | Deletes the digit and goes back one box. |
#### Label

[API and examples](../ai/components/Label.json)

How to use:

- Use it to name a field when you build your own control and it does not have a `label` prop.
- Point `htmlFor` to the `id` of the field: clicking the label focuses the field, and screen readers read the name.

Choose something else:

- Input, Select and the other fields already have `label`: use it.
- A label with an explanation: HelpField.

| Key | What it does |
|---|---|
| — | The label does not receive focus. Clicking it focuses the field. |
### Navigation

#### Pagination

[API and examples](../ai/components/Pagination.json)

How to use:

- Use it below a list or table that shows one page of results at a time.
- Pass the current `page` and the total `pageCount`, and load the new page in `onPageChange`.
- After changing page, take the person back to the top of the list.

Choose something else:

- A feed people scroll without counting pages: a "Load more" Button.
- A table with built-in pages: the `pagination` of Table.

| Key | What it does |
|---|---|
| `Tab` | Moves through previous, the page numbers and next. |
| `Enter` or `Space` | Goes to the page in focus. |
### Feedback and states

#### Badge

[API and examples](../ai/components/Badge.json)

How to use:

- Use it for a short label next to something: state ("Paid"), category ("Design"), count ("12").
- Choose the `tone` by meaning: success, warning, danger, info or neutral. Write the state in the text too, not only in the color.
- Add `dot` for a state that changes, such as online or offline.

Choose something else:

- Something people click to filter or remove: Chip.
- A message that needs a sentence: Callout.

| Key | What it does |
|---|---|
| — | The badge does not receive focus. Screen readers read its text with the content around it. |
#### Chip

[API and examples](../ai/components/Chip.json)

How to use:

- Use it for filters people turn on and off above a list, and for choices shown inside a field.
- Mark the active filter with `selected` and show how many items it has with `count`.
- Use `removable` with `onRemove` for a choice that can be taken out, and update your list in it.
- When only one chip of the row can be on, put the row in `ChipGroup` with `mode="single"` and a `label`: the group gives the arrow keys and one Tab stop.
- For a row of independent filters with a name, use `ChipGroup` with `mode="multiple"`. Give each chip a `value`.

Choose something else:

- A label people do not click: Badge.
- The main action of the screen: Button.

| Key | What it does |
|---|---|
| `Tab` | Moves from one chip to the next. In a single-choice ChipGroup, enters the selected chip and leaves the group. |
| `Enter` or `Space` | Turns the chip on or off. On the ×, removes it. |
| `ArrowRight` or `ArrowLeft` | In a single-choice ChipGroup, moves focus and selection to the next or previous chip, skipping disabled ones. |
| `Home` or `End` | In a single-choice ChipGroup, selects the first or last chip. |
#### StatusDot

[API and examples](../ai/components/StatusDot.json)

How to use:

- Use it for a live state in little space: online, syncing, error, in a list or next to a name.
- Always write the state next to it or in `aria-label`: the color alone does not say it.
- Turn on `pulse` only for something happening now. It stops when the system asks for reduced motion.

Choose something else:

- A state with a word: Badge with `dot`.

| Key | What it does |
|---|---|
| — | The dot does not receive focus. Screen readers read its label. |
#### Skeleton

[API and examples](../ai/components/Skeleton.json)

How to use:

- Use it in place of content that is loading, with the shape of what will appear: text lines, an avatar, a card.
- Set `width` and `height` close to the real content, and `circle` for avatars, so the page does not jump when it arrives.
- Mark the area that is loading with `aria-busy`.

Choose something else:

- An action people are waiting for: `loading` on the Button, or Spinner.
- Loading ended with no data or with an error: EmptyState or Callout.

| Key | What it does |
|---|---|
| — | Skeleton does not receive focus. |
#### ProgressBar

[API and examples](../ai/components/ProgressBar.json)

How to use:

- Use it to show how much of a task is done: upload, import, steps of a sign-up.
- Pass `value` from 0 to 100, and write the number or the step next to it ("3 of 5").
- Use `indeterminate` when the end is unknown. Use `tone="warning"` or `"danger"` when the value means trouble.

Choose something else:

- Usage of a plan against its limit: UsageMeter.
- A short wait inside a button or small area: Spinner.

| Key | What it does |
|---|---|
| — | The bar does not receive focus. Screen readers read the value. |
#### Spinner

[API and examples](../ai/components/Spinner.json)

How to use:

- Use it for a short wait with no known end, in a small place: a button, a field, a card loading.
- Give it an `aria-label` that says what is happening ("Loading invoices").

Choose something else:

- Content with a known shape loading: Skeleton.
- A known percentage: ProgressBar.

| Key | What it does |
|---|---|
| — | The spinner does not receive focus. |
### Content and identity

#### Avatar

[API and examples](../ai/components/Avatar.json)

How to use:

- Use it to show who: the author of a comment, the owner of a task, the account signed in.
- Pass `src` with the photo and `initials` as fallback; `alt` with the name when the name is not next to it.
- Use `shape="square"` for companies and projects, and `seed` for a fixed color per name.

Choose something else:

- Avatar with name and detail in a row: PersonCell.
- Several people at once: AvatarGroup.

| Key | What it does |
|---|---|
| — | The avatar does not receive focus. Wrap it in a link or button when it opens a profile. |
#### BrandLogo

[API and examples](../ai/components/BrandLogo.json)

How to use:

- Use it for the refy brand in headers, footers and splash screens.
- Use `markOnly` where only the symbol fits, and `tone` for dark or light backgrounds. The symbol takes the main color of the theme.
- For your product's brand, pass it in `brand` with an `aria-label` that names it.

Choose something else:

- A person or company in a list: Avatar.

| Key | What it does |
|---|---|
| — | The logo does not receive focus. When it links to the home page, the link receives it. |
#### Kbd

[API and examples](../ai/components/Kbd.json)

How to use:

- Use it to write a key or a shortcut in text, menus and tooltips: ⌘K, Esc, Enter.
- One Kbd per key; join combinations with "+" between them.
- It only shows the key: your application listens for the shortcut.

Choose something else:

- Code people copy: CodeBlock.

| Key | What it does |
|---|---|
| — | Kbd does not receive focus. |
#### Bubble

[API and examples](../ai/components/Bubble.json)

How to use:

- Use it for one piece of a conversation: a message, a quick reply, a system notice in a chat.
- Set `side` to tell who speaks: the person on one side, the other party on the other.

Choose something else:

- A message with author, time and state: Message.

| Key | What it does |
|---|---|
| — | The bubble does not receive focus. Links inside it do. |
#### Marker

[API and examples](../ai/components/Marker.json)

How to use:

- Use it to highlight a word or a short passage in a text: the term searched, the key part of a title.
- The color and the shape come from the theme.

Choose something else:

- A state that must be read: Badge.

| Key | What it does |
|---|---|
| — | The marker does not receive focus. |
#### Prose

[API and examples](../ai/components/Prose.json)

How to use:

- Use it around long text written by people: articles, documentation, terms, release notes.
- Headings, paragraphs, lists, links, quotes and tables inside it take the theme's type. Use `measure="text"` to limit the line to a comfortable reading width.
- Clean HTML that comes from outside before showing it.

Choose something else:

- Text people edit: Textarea.

| Key | What it does |
|---|---|
| — | Prose does not receive focus. Its links do. |
### Structure and composition

#### Divider

[API and examples](../ai/components/Divider.json)

How to use:

- Use it to separate groups of content that have no title of their own, such as blocks in a menu or a form.
- Use `label` for a choice between paths ("or"), and `orientation="vertical"` between items on one line.

Choose something else:

- A group with a name: SectionHeader.
- Space alone separates well enough: no divider.

| Key | What it does |
|---|---|
| — | The divider does not receive focus. |
#### AspectRatio

[API and examples](../ai/components/AspectRatio.json)

How to use:

- Use it to keep the shape of an image, video or map while it loads and on every screen width: 16:9 video, square cover.
- Pass `ratio` (16/9, 1, 4/3) and the media as children.

Choose something else:

- Several photos with navigation: MediaGallery.

| Key | What it does |
|---|---|
| — | The box does not receive focus. |
#### Direction

[API and examples](../ai/components/Direction.json)

How to use:

- Use it around content in languages written right to left, such as Arabic and Hebrew.
- Set `dir="rtl"`: the refy components inside flip. In your own layout, use start and end instead of left and right.

Choose something else:

- The whole app in one language: set `dir` on the `<html>` tag.

| Key | What it does |
|---|---|
| — | Direction does not receive focus. Arrows inside it follow the reading direction. |
#### ScrollArea

[API and examples](../ai/components/ScrollArea.json)

How to use:

- Use it for a part of the page with its own scroll and a fixed height: a long list in a panel, a log, terms of use.
- Set `maxHeight` and an `aria-label` that names the area. Avoid one scroll inside another.

Choose something else:

- Messages of a conversation: MessageScroller.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the area. |
| `↓` `↑` `PageDown` `PageUp` | Scroll the content. |
## Molecules

### Actions

#### ButtonGroup

[API and examples](../ai/components/ButtonGroup.json)

How to use:

- Use it to join buttons that act on the same thing, such as align left, center and right, or zoom out and zoom in.
- Give the group a `label` that names the set ("Text alignment").
- When one button stays marked as active, control it with `activeIndex` and `onActiveIndexChange`.
- Use `orientation="vertical"` in toolbars on the side of the screen.

Choose something else:

- Choosing one value for a form: Segmented or RadioGroup.
- Turning several options on and off: ToggleGroup.

| Key | What it does |
|---|---|
| `Tab` | Moves from one button of the group to the next. |
| `Enter` or `Space` | Runs the button in focus. |
#### SplitButton

[API and examples](../ai/components/SplitButton.json)

How to use:

- Use it when one action is the usual one and a few variants of it are occasional: "Save" with "Save as draft" and "Save and close".
- List the variants in `options`; the main side runs `defaultOptionId`, or the first enabled option.
- Keep `loading` on while the action runs, as in Button.

Choose something else:

- The options are equally common: Menu, or separate buttons.
- Choosing a value, not running an action: Select or Combobox.

| Key | What it does |
|---|---|
| `Tab` | Moves from the main action to the arrow that opens the menu. |
| `Enter` or `Space` | On the main side, runs the action. On the arrow, opens the menu. |
| `↓` or `↑` | Moves between the options of the open menu. |
| `Home` or `End` | Goes to the first or last option. |
| `Escape` | Closes the menu and returns focus to the arrow. |
#### OAuthButton

[API and examples](../ai/components/OAuthButton.json)

How to use:

- Use it on sign-in and sign-up screens, one button per provider, stacked with the same width.
- Pick the provider with `provider`; the label and the logo come with it.
- Start the sign-in in `onClick` and keep `loading` on until the provider answers. Show the cancel or the error next to the buttons.
- The button does not authenticate: your application runs the OAuth flow.

Choose something else:

- Only Google: GoogleButton.
- Connecting an account to an integration after sign-in: ConnectorCard.

| Key | What it does |
|---|---|
| `Tab` | Moves from one provider to the next. |
| `Enter` or `Space` | Starts the sign-in. Nothing happens while it is loading. |
#### FabMenu

[API and examples](../ai/components/FabMenu.json)

How to use:

- Use it when the main action of the screen has three to five variants: new note, new photo, new list.
- List them in `actions` with short labels, and give the closed button a `label` ("Create").
- Handle the choice in `onSelect`.

Choose something else:

- Only one action: Fab.
- Places people visit, not actions: Sidebar or NavigationMenu.

| Key | What it does |
|---|---|
| `Enter` or `Space` | Opens the menu. |
| `↓` or `↑` | Moves between the actions. |
| `Home` or `End` | Goes to the first or last action. |
| `Escape` | Closes the menu and returns focus to the button. |
#### PropertyActionGroup

[API and examples](../ai/components/PropertyActionGroup.json)

How to use:

- Use it for the decision on one item: accept or decline, approve or reject, save or skip.
- Handle the choice in `onAction`. While your server answers, set `state` to processing; when it confirms, to done.
- Turn off an action that does not apply with `disabledActions`, and say why in `statusMessage`.

Choose something else:

- Deciding item after item by swiping cards: DecisionDeck.
- A single action: Button.

| Key | What it does |
|---|---|
| `Tab` | Moves between the available actions. |
| `Enter` or `Space` | Runs the action in focus. Nothing happens while it is processing. |
### Forms and choices

#### Combobox

[API and examples](../ai/components/Combobox.json)

How to use:

- Use it to pick one option from a long list, where typing a few letters is faster than scrolling: city, customer, product.
- Give it a `label` and, when it helps, a `hint` saying what can be searched ("Name or tax ID").
- Group long lists with `group` on each option, and add `description` or `avatar` when the label alone does not tell two options apart.
- Turn on `clearable` when "no choice" is a valid answer.
- Set `emptyMessage` to say what to do when nothing matches.

Choose something else:

- Fewer than about seven options: Select or RadioGroup.
- More than one choice: Multiselect.
- A list of actions, not values: Menu or Command.

| Key | What it does |
|---|---|
| `↓` or `↑` | Opens the list. With the list open, moves to the next or previous option. |
| `Home` or `End` | With the list open, goes to the first or last option. |
| `Enter` | Picks the highlighted option. |
| `Escape` | Closes the list and keeps the typed text. |
| `Tab` | Closes the list and moves on to the next field. |
#### Multiselect

[API and examples](../ai/components/Multiselect.json)

How to use:

- Use it to pick several options from a long list: tags, people, cities.
- Each choice becomes a chip in the field, with its own remove button. Limit how many show with `maxVisibleChips`; the rest becomes a "+N" count.
- Use `listPlacement="overlay"` when the list must not push the content below.
- Set `emptyMessage` to say what to do when nothing matches.

Choose something else:

- Only one choice: Combobox.
- Up to about six options that fit on screen: Checkbox list or ToggleGroup.

| Key | What it does |
|---|---|
| `↓` or `↑` | Opens the list and moves between options. |
| `Home` or `End` | With the list open, goes to the first or last option. |
| `Enter` | Selects or clears the highlighted option. |
| `Backspace` | With the search empty, removes the last choice. |
| `Escape` or `Tab` | Closes the list. |
#### PhoneInput

[API and examples](../ai/components/PhoneInput.json)

How to use:

- Use it for phone numbers that can come from more than one country.
- Start with the country most people use in `country`, and limit the list with `countries` when only some apply.
- The Brazilian format is applied as people type. Validate other countries in your application.

Choose something else:

- A phone that is always from the same country, with no selector: Input with `type="tel"`.

| Key | What it does |
|---|---|
| `Tab` | Moves from the country to the number. |
| `↓` or `↑` on the country | Changes the country, as in a browser select. |
#### PostalCodeInput

[API and examples](../ai/components/PostalCodeInput.json)

How to use:

- Use it on address forms, so the street, district and city fill in from the postal code (CEP).
- Pass your lookup service in `lookup` and fill the other fields in `onAddressFound`.
- The search runs when the CEP is complete and the field loses focus, or on the Search button. If it fails, people can still type the address.

Choose something else:

- An address outside Brazil, or a free search for places: Input or Combobox.
- Picking an area on a map: GeoAreaPicker.

| Key | What it does |
|---|---|
| `Tab` | Moves from the field to the Search button. Leaving a complete CEP also starts the search. |
| `Enter` or `Space` on Search | Searches the CEP. |
#### Calendar

[API and examples](../ai/components/Calendar.json)

How to use:

- Use it when the calendar stays open on the screen: booking, availability, a period for a report.
- Use `mode="range"` for start and end, with `numberOfMonths={2}` so both fit side by side.
- Block the days that cannot be chosen with `min` and `max`.
- Set `weekStartsOn` and `locale` for the country of the people using it.

Choose something else:

- A date inside a form, where the calendar opens from a field: DatePicker.
- Days with available times: SchedulePicker.

| Key | What it does |
|---|---|
| `←` or `→` | Moves one day. |
| `↑` or `↓` | Moves one week. |
| `PageUp` or `PageDown` | Goes to the previous or next month. |
| `Enter` or `Space` | Selects the day in focus. |
#### ChoiceCard

[API and examples](../ai/components/ChoiceCard.json)

How to use:

- Use it for choices that need more than a label to decide: plans with price, delivery options with deadline, templates with a preview.
- Put the cards inside ChoiceCardGroup and give the group a `label` with the question.
- Use `mode="single"` when only one can be chosen, and `mode="multiple"` when several can.
- Set `columns` by how many fit side by side; `columns={1}` stacks them on mobile.

Choose something else:

- Short options that a label explains: RadioGroup or Checkbox.

| Key | What it does |
|---|---|
| `Tab` | Enters the group and leaves it on the next Tab. |
| `←` `→` `↑` `↓` | Moves between the cards. With `mode="single"`, also selects. |
| `Home` or `End` | Goes to the first or last card. |
| `Enter` or `Space` | Selects the card in focus, or clears it with `mode="multiple"`. |
#### FileUpload

[API and examples](../ai/components/FileUpload.json)

How to use:

- Use it to attach files to a form: documents, photos, spreadsheets.
- Say what is accepted in `accept` and `maxSize`, and repeat it in `hint` ("PDF or JPG, up to 10 MB").
- Turn on `multiple` when more than one file makes sense.
- Your application uploads the files. While it does, pass `state` and `progress`; if it fails, show `errorMessage` with what to do.

Choose something else:

- A voice message: VoiceRecorder.
- Showing photos already uploaded: MediaGallery.

| Key | What it does |
|---|---|
| `Tab` | Moves to the choose button, then to the remove button of each file. |
| `Enter` or `Space` | Opens the system's file window, or removes the file in focus. |
#### DatePicker

[API and examples](../ai/components/DatePicker.json)

How to use:

- Use it for a date inside a form: birth date, due date, start of a booking.
- Give it a `label` and block the days out of range with `min` and `max`.
- People pick the date in the calendar; there is no typing. For dates far away, such as birth dates, offer separate fields.

Choose something else:

- A calendar always open on screen: Calendar.
- Day and time of a booking: SchedulePicker.

| Key | What it does |
|---|---|
| `Enter` or `Space` | Opens the calendar. |
| Calendar keys | Same as Calendar. Choosing a day closes it and returns focus to the field. |
| `Escape` | Closes the calendar without changing the date. |
### Navigation

#### Breadcrumb

[API and examples](../ai/components/Breadcrumb.json)

How to use:

- Use it at the top of a page that sits deep in a hierarchy, so people see where they are and go back up: Projects / Refy / Settings.
- Each level except the last is a link; the last one is the current page.
- Long paths fold the middle into a menu after `collapseAfter` levels.

Choose something else:

- Switching between sections at the same level: Tabs or NavigationMenu.
- Steps of a flow: WizardStepper.

| Key | What it does |
|---|---|
| `Tab` | Moves from one level to the next. |
| `Enter` | Opens the level in focus. On the folded part, opens the menu with the hidden levels. |
#### Tabs

[API and examples](../ai/components/Tabs.json)

How to use:

- Use it to split related content of the same page into parts that people see one at a time: Overview, Activity, Settings.
- Keep the labels short, in two or three words, and start with the tab most people need.
- Use `variant="pill"` inside cards and panels, and `wrap` when the tabs do not fit on one line.

Choose something else:

- Switching the view of the same data (list, grid): Segmented.
- Going to another page of the app: NavigationMenu or Sidebar.

| Key | What it does |
|---|---|
| `Tab` | Enters the tab list on the active tab, and the next Tab goes to the content. |
| `←` or `→` | Opens the previous or next tab. With `orientation="vertical"`, use `↑` or `↓`. |
| `Home` or `End` | Opens the first or last tab. |
#### NavCard

[API and examples](../ai/components/NavCard.json)

How to use:

- Use it for a destination that needs a line of context: a project, a settings area, the next page of a guide.
- With `href` it is a link; without it, a button that runs `onClick`.
- Mark the page people are on with `current`. Use `variant="dashed"` for "Create new…" at the end of a list.
- Put an `Avatar` or icon in `leading`, and a count or role in `meta`.

Choose something else:

- An action that changes data: Button.
- Content with image to read, not a destination: ContentCard.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the card. A disabled card is skipped. |
| `Enter` | Opens the destination. Without `href`, `Space` also works. |
#### SettingsSubnav

[API and examples](../ai/components/SettingsSubnav.json)

How to use:

- Use it on the left of a settings screen, to move between its areas: Profile, Team, Billing, Security.
- Split long lists with `groups`, and mark the area open with `activeHref`.
- Pass your router's link in `renderLink`, so the navigation does not reload the page.

Choose something else:

- Steps that must be followed in order: WizardStepper.
- Sections of the same long page: TableOfContents.

| Key | What it does |
|---|---|
| `Tab` | Moves from one area to the next. |
| `Enter` | Opens the area in focus. |
#### TableOfContents

[API and examples](../ai/components/TableOfContents.json)

How to use:

- Use it next to a long page, such as documentation or terms, to jump between its sections.
- List the sections in `items`, in the order of the page, with the `id` of each heading.
- Turn on `scrollSpy` to mark the section being read, and `sticky` to keep the list on screen while scrolling.

Choose something else:

- Going to other pages: SettingsSubnav or Sidebar.

| Key | What it does |
|---|---|
| `Tab` | Moves from one section to the next. |
| `Enter` | Jumps to the section. |
#### WorkspaceSwitcher

[API and examples](../ai/components/WorkspaceSwitcher.json)

How to use:

- Use it at the top of the sidebar when the same person works in several workspaces or companies.
- Pass the list in `workspaces` and switch the data of the app in `onChange`; show an error if the switch fails.
- Use `compact` when the sidebar is collapsed: only the avatar shows.

Choose something else:

- The account of the person, with profile and sign out: UserMenu.

| Key | What it does |
|---|---|
| `Enter` or `Space` | Opens the list. |
| Typing | Filters the workspaces by name. |
| `↓` or `↑` | Moves between the results. |
| `Enter` | Switches to the highlighted workspace. |
| `Escape` | Closes the list and returns focus to the button. |
#### UserMenu

[API and examples](../ai/components/UserMenu.json)

How to use:

- Use it for the account of the person signed in: profile, settings and sign out.
- Put it at the end of the top bar with `compact` (avatar only), or at the foot of the sidebar with `side="top"`, showing name and e-mail.
- Change the items in `entries` and handle them in `onSelect`. Signing out is your application's job.

Choose something else:

- Switching company or workspace: WorkspaceSwitcher.

| Key | What it does |
|---|---|
| `Enter` or `Space` | Opens the menu. |
| `↓` or `↑` | Moves between the items. |
| `Home` or `End` | Goes to the first or last item. |
| `Escape` | Closes the menu and returns focus to the button. |
#### HelpMenu

[API and examples](../ai/components/HelpMenu.json)

How to use:

- Use it in the top bar to gather help: documentation, keyboard shortcuts, contact support.
- Change the items in `entries` and open each one in `onSelect`.

Choose something else:

- Help about one field: HelpField.
- A guided first visit: GuidedTour.

| Key | What it does |
|---|---|
| `Enter` or `Space` | Opens the menu. |
| `↓` or `↑` | Moves between the items. |
| `Escape` | Closes the menu and returns focus to the button. |
#### WizardStepper

[API and examples](../ai/components/WizardStepper.json)

How to use:

- Use it at the top of a flow split into steps that follow an order: sign-up, checkout, onboarding.
- Pass the `steps` and the `current` one. By default people can go back to done steps but not skip ahead; `allowFutureNavigation` lets them.
- Give the flow a `label` ("Create account"), which is announced with the progress. On narrow screens it turns compact by itself.
- Check the fields of a step before moving on: the stepper does not validate.

Choose something else:

- Questions asked one at a time: Questionnaire.
- Areas with no order: SettingsSubnav or Tabs.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the steps people can open. |
| `←` or `→` | Moves between those steps. |
| `Home` or `End` | Goes to the first or last of them. |
| `Enter` or `Space` | Opens the step in focus. |
#### Menu

[API and examples](../ai/components/Menu.json)

How to use:

- Use it for actions about one thing that do not fit on screen: the "more" of a row, of a card or of a header.
- Write each item as a verb ("Rename", "Duplicate"), separate groups with a separator, and leave the action that deletes for last.
- Open it from an IconButton or Button and handle the choice in `onSelect`.
- It has one level only: no submenus.

Choose something else:

- Choosing a value for a form: Select or Combobox.
- Right-click on an area: ContextMenu.
- Searching among many commands: Command.

| Key | What it does |
|---|---|
| `↓` or `↑` | Moves between the items. |
| `Home` or `End` | Goes to the first or last item. |
| A letter | Goes to the next item that starts with it. |
| `Enter` or `Space` | Runs the item. |
| `Escape` or `Tab` | Closes the menu. |
#### Menubar

[API and examples](../ai/components/Menubar.json)

How to use:

- Use it for a toolbar of menus in a tool-like app: File, Edit, View.
- Pass the menus in `items` and handle the commands in `onSelect`. Name the bar with `label`.

Choose something else:

- Navigation of a site: NavigationMenu.
- One menu of actions: Menu.

| Key | What it does |
|---|---|
| `←` or `→` | Moves between the menus of the bar. |
| `Home` or `End` | Goes to the first or last menu. |
| `Enter` or `Space` | Opens the menu. Inside it, the keys of Menu apply. |
#### NavigationMenu

[API and examples](../ai/components/NavigationMenu.json)

How to use:

- Use it for the main navigation of a site or a simple app, at the top: Product, Docs, Pricing.
- Pass the `items` and mark the page open with `activeId`. Group related pages under one item with a panel.

Choose something else:

- An app with many areas: Sidebar.
- Actions, not places: Menu.

| Key | What it does |
|---|---|
| `Tab` | Moves from one item to the next. |
| `Enter` | Opens the page, or the panel of a group. On a group, `Space` also works. |
### Feedback and states

#### Callout

[API and examples](../ai/components/Callout.json)

How to use:

- Use it for a message about the page or the section it sits in: a limit about to end, a change of rules, a tip.
- Choose the `tone` by meaning, write a short `title`, and say what to do in the text.
- Put the action in `action` ("Upgrade plan"). Use `dismissible` only when the message can really be ignored.

Choose something else:

- A short result after an action ("Saved"): Toast or Snackbar.
- A decision people must take before going on: AlertDialog.
- The error of one field: the `error` of the field.

| Key | What it does |
|---|---|
| `Tab` | Moves to the action and to the close button, when there are. |
| `Enter` or `Space` | Runs the action in focus, or closes the message. |
#### EmptyState

[API and examples](../ai/components/EmptyState.json)

How to use:

- Use it where a list or area has nothing to show: first visit, a search with no results, a finished queue.
- Say why it is empty in the `title` and what to do in the `message`: "No invoices yet" / "Invoices show up here after the first sale".
- Offer the next step in `action`: create the first item, or clear the filters.

Choose something else:

- Content still loading: Skeleton.
- Something failed: Callout with `tone="danger"`.

| Key | What it does |
|---|---|
| `Tab` | Moves to the action, when there is one. The message does not receive focus. |
#### UsageMeter

[API and examples](../ai/components/UsageMeter.json)

How to use:

- Use it in plan and billing screens to show what was used of a limit: credits, storage, seats.
- Pass `label`, `used`, `limit` and `unit`. Put the detail in `meta` ("8 analyses this month").
- The color changes by itself at `warnAt` and `criticalAt`. Next to it, offer what to do when it is about to run out.

Choose something else:

- Progress of a task: ProgressBar.
- A number with a trend, with no limit: Stat.

| Key | What it does |
|---|---|
| — | The meter does not receive focus. Screen readers read the name, the value and the limit. |
#### Toast

[API and examples](../ai/components/Toast.json)

How to use:

- Use it for the result of an action that does not need a decision: "Invoice sent", "Copied".
- Put ToastRegion once in the app and keep the list of toasts in your state; remove them in `onDismiss`.
- Add an action when it helps, such as "Undo". The toast stays while the pointer or the focus is on it.

Choose something else:

- An error in a field: the `error` of the field.
- A message that must stay on the page: Callout.
- A decision: AlertDialog.

| Key | What it does |
|---|---|
| `Tab` | Moves to the action and to the close button of the toast. |
| `Enter` or `Space` | Runs the action or closes the toast. |
#### Snackbar

[API and examples](../ai/components/Snackbar.json)

How to use:

- Use it for a short result at the edge of the screen, with an optional action such as "Undo" or "View".
- Your application decides where it appears and when it leaves; it does not close by itself.
- Keep the text to one line and the action to one verb.

Choose something else:

- Several messages that stack and close by time: Toast.
- A message tied to a section of the page: Callout.

| Key | What it does |
|---|---|
| `Tab` | Moves to the action, when there is one. |
| `Enter` or `Space` | Runs the action. |
#### NotificationBell

[API and examples](../ai/components/NotificationBell.json)

How to use:

- Use it in the top bar to show what is new for the person, with the count of unread items on the bell.
- Pass the `items` from your server. Open the related page in `onItemClick` and mark everything read in `onMarkAllRead`, updating the items and the count.
- Set `emptyMessage` for when there is nothing new.

Choose something else:

- The result of an action just taken: Toast.
- A full history of what happened: ActivityTimeline.

| Key | What it does |
|---|---|
| `Enter` or `Space` | Opens the panel and moves focus into it. |
| `Tab` | Moves through the notifications and the panel actions. |
| `Escape` | Closes the panel and returns focus to the bell. |
#### Tooltip

[API and examples](../ai/components/Tooltip.json)

How to use:

- Use it to name an icon button or explain a control in a few words, shown on hover and on focus.
- Keep `label` short. Add `shortcut` when the action has one ("⌘K").
- Turn on `portalled` when the tooltip is cut by a container with scroll.
- Nothing in it can be clicked, and on touch screens it may never show: keep important information visible.

Choose something else:

- Content with links or buttons: Popover.
- A preview of a person or item on hover: HoverCard.
- Help for a form field: HelpField.

| Key | What it does |
|---|---|
| `Tab` | Focusing the control shows the tooltip; leaving hides it. |
| `Escape` | Hides the tooltip and keeps the focus. |
#### Popover

[API and examples](../ai/components/Popover.json)

How to use:

- Use it for a small task attached to a button, that does not need the whole screen: filters, a short form, a color picker.
- Control it with `open` and `onOpenChange`, and put the content in `content`. Give it a `label` that names the task.
- The rest of the screen stays usable while it is open.

Choose something else:

- A task that blocks everything until it is done: Modal.
- A list of actions: Menu.
- Text only, with no controls: Tooltip.

| Key | What it does |
|---|---|
| `Enter` or `Space` on the button | Opens the popover and moves focus to its first control. |
| `Tab` | Moves through the controls inside. |
| `Escape` | Closes it and returns focus to the button. |
#### HoverCard

[API and examples](../ai/components/HoverCard.json)

How to use:

- Use it for a preview of a person, link or item when the pointer rests on it: profile, page summary, product.
- Put the preview in `content`. Adjust `openDelay` so it does not open when the pointer just passes by.
- The element that opens it must also work alone, such as a link to the full profile: touch screens have no hover.

Choose something else:

- Content people need to act on: Popover.
- A short label: Tooltip.

| Key | What it does |
|---|---|
| `Tab` | Focusing the element opens the card. |
| `Escape` | Closes the card. |
#### HelpField

[API and examples](../ai/components/HelpField.json)

How to use:

- Use it as the label of a form field that needs an explanation: a tax term, a rule, a field people often get wrong.
- Write `label` in the person's words and `helpText` in one or two sentences. Link the field with `htmlFor`.
- When the topic needs more, use `onLearnMore` to open a Drawer with the full explanation.

Choose something else:

- Help for the whole app: HelpMenu.
- Telling what is wrong with the value: the `error` of the field.

| Key | What it does |
|---|---|
| `Tab` | Focusing the help icon shows the explanation. |
| `Escape` | Hides the explanation. |
| `Enter` on "Learn more" | Runs `onLearnMore`. |
#### ContextMenu

[API and examples](../ai/components/ContextMenu.json)

How to use:

- Use it for the actions of an item that people open with a right-click or a long press: a file, a card, a table row.
- Pass the actions in `entries`, handle them in `onSelect`, and name the area with `label`.
- Offer the same actions in a visible place too, such as a Menu on the item: many people never right-click.

Choose something else:

- A visible "more" button: Menu.

| Key | What it does |
|---|---|
| `Shift` + `F10` or the menu key | Opens the menu in the area in focus. |
| `↓` `↑` `Enter` `Escape` | Same as Menu: move, run, close. |
### Data

#### Stat

[API and examples](../ai/components/Stat.json)

How to use:

- Use it for the main numbers of a dashboard or plan: revenue, active users, limit per minute.
- Write the name in `label`, the number in `value` and the unit in `unit`. Explain the number in `description` when it is not obvious.
- Show the change with `delta` and a small trend in `chart`. Your application calculates both.

Choose something else:

- Usage against a limit: UsageMeter.
- A score from 0 to 100: ScoreGauge.

| Key | What it does |
|---|---|
| — | The number does not receive focus. Screen readers read the name, the value and the change. |
#### ScoreGauge

[API and examples](../ai/components/ScoreGauge.json)

How to use:

- Use it for a score from 0 to 100 shown at a glance: quality, health, match.
- Pick `size` by place: `sm` in table rows, `md` in cards, `lg` at the top of a page.
- Set the bands with `okAt` and `warnAt`, and say next to it what the score measures.

Choose something else:

- A number with unit and trend: Stat.
- Progress of a task: ProgressBar.

| Key | What it does |
|---|---|
| — | The gauge does not receive focus. Screen readers read the score and its label. |
#### ActivityItem

[API and examples](../ai/components/ActivityItem.json)

How to use:

- Use it for one event: who did what and when, such as "Ana approved the invoice, 2 h ago".
- Fill `actor`, `title` and `timestamp`; add `description`, `badge` or `status` only when they change what the person reads.
- Use `density="compact"` in side panels and small widgets.

Choose something else:

- A list of events grouped by day: ActivityTimeline.
- Milestones of a project: Timeline.

| Key | What it does |
|---|---|
| `Tab` | Moves to the author link and to the action, when there are. |
| `Enter` | Opens the link or runs the action. |
#### KanbanCard

[API and examples](../ai/components/KanbanCard.json)

How to use:

- Use it for one work item on a board: title, owner, due date, tags.
- Open the detail in `onOpen`, usually in a Drawer. Put quick actions in `actions`.
- Inside KanbanBoard the drag handle comes from the board; alone, the card only shows the item.

Choose something else:

- A full board with columns: KanbanBoard.
- Content to read, with image: ContentCard.

| Key | What it does |
|---|---|
| `Tab` | Moves to the title, which opens the card, and to the actions. |
| `Enter` or `Space` | Opens the card or runs the action in focus. |
### Content and identity

#### AvatarGroup

[API and examples](../ai/components/AvatarGroup.json)

How to use:

- Use it to show who takes part in something in little space: members of a project, people in a conversation.
- Pass the `items` in a stable order and limit with `max`; the rest becomes "+N".
- Use `onOverflowClick` to open the full list, and `onItemClick` to open a person.

Choose something else:

- One person: Avatar.
- A list of people with name and role: PersonCell in a list or Table.

| Key | What it does |
|---|---|
| `Tab` | With `onItemClick` or `onOverflowClick`, moves through the avatars and the "+N". |
| `Enter` or `Space` | Opens the person or the full list. |
#### PersonCell

[API and examples](../ai/components/PersonCell.json)

How to use:

- Use it to identify a person or company in a table cell or list row: avatar, name and one line of detail.
- Put the e-mail or the role in `secondary`, and a short mark such as "you" in `tag`.
- Use `size="sm"` in table cells and `md` in lists.

Choose something else:

- Only the picture: Avatar.
- A row that opens something or holds a setting: SettingRow or NavCard.

| Key | What it does |
|---|---|
| — | The cell does not receive focus. Wrap the name in a link when it opens a profile. |
#### Card

[API and examples](../ai/components/Card.json)

How to use:

- Use it to group content about one subject on a surface: a summary, a form section, a chart with its title.
- Open it with CardHeader for title, description and action. Use `elevation` 0 or 1 on pages and higher values only for things floating above.
- When the whole card opens something, put a link or button inside it: the card itself is not clickable.

Choose something else:

- A destination in a list: NavCard.
- Content with image, facts and actions: ContentCard.

| Key | What it does |
|---|---|
| — | The card does not receive focus. The links and buttons inside it do. |
#### Accordion

[API and examples](../ai/components/Accordion.json)

How to use:

- Use it for content people read in parts and seldom all at once: FAQ, filters by group, sections of a long form.
- Write titles that say what is inside, so people find the part without opening all of them.
- Use `type="multiple"` when people compare parts, and `defaultValue` to open the most read one.
- Use `variant="plain"` inside cards, where the outer border would repeat.

Choose something else:

- Sections people switch between often: Tabs.
- A single block that opens and closes: Collapsible.

| Key | What it does |
|---|---|
| `Tab` | Moves from one title to the next. |
| `Enter` or `Space` | Opens or closes the section. |
#### CodeBlock

[API and examples](../ai/components/CodeBlock.json)

How to use:

- Use it for code people copy: install commands, examples, API keys.
- Set `language` for the colors and `label` for the file name or the purpose ("Production API key").
- Use `secret` for keys: the value stays hidden, shows only the last characters, and the copy button copies the full value.

Choose something else:

- A word of code inside a sentence: `<code>`.
- Text people edit: Textarea.

| Key | What it does |
|---|---|
| `Tab` | Moves to the copy button and, with `secret`, to the show button. |
| `Enter` or `Space` | Copies the code, or shows and hides the secret. |
#### PropertyMedia

[API and examples](../ai/components/PropertyMedia.json)

How to use:

- Use it for the photos of one item: a listing, a product, a place.
- Set `aspectRatio` so the area keeps its size while loading, and `fit` to crop or show the whole picture.
- Show `loading` while the photos arrive, and `errorMessage` with `onRetry` when they fail. In new code, import it as MediaGallery.

Choose something else:

- Different content in slides: Carousel.
- One fixed image: AspectRatio with an `<img>`.

| Key | What it does |
|---|---|
| `Tab` | Moves to the gallery, the previous and next buttons and the thumbnails. |
| `←` or `→` | Shows the previous or next photo. |
#### VoiceRecorder

[API and examples](../ai/components/VoiceRecorder.json)

How to use:

- Use it where people can speak instead of typing: a voice note, a search by voice, a message.
- Your application records, asks for the microphone and transcribes. Pass the `state`, the `duration` and the `level` it reads.
- Show the `transcript` for review before sending, and offer typing with `onUseFallback` when the microphone fails.

Choose something else:

- Attaching an existing audio file: FileUpload.
- A request with text and voice together: IntentComposer.

| Key | What it does |
|---|---|
| `Tab` | Moves through start, pause, resume, cancel and finish. |
| `Enter` or `Space` | Runs the button in focus. |
#### Carousel

[API and examples](../ai/components/Carousel.json)

How to use:

- Use it for a few slides that people go through in order: highlights, onboarding screens, testimonials.
- Give it a `label` and keep each slide readable on its own. It does not move by itself.
- Control the position with `index` and `onIndexChange` when the page needs to know it.

Choose something else:

- Deciding on each item: DecisionDeck.
- Photos of one item: MediaGallery.
- Content people compare: a grid.

| Key | What it does |
|---|---|
| `Tab` | Moves to the carousel and to the previous and next buttons. |
| `←` or `→` | Shows the previous or next slide. |
#### Collapsible

[API and examples](../ai/components/Collapsible.json)

How to use:

- Use it for one block that people open only when they need it: advanced options, details of an order, the rest of a long text.
- Write a `title` that says what is inside ("Advanced options"). Start it open with `defaultOpen` when most people need it.

Choose something else:

- Several blocks of the same kind: Accordion.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the title. |
| `Enter` or `Space` | Opens or closes the block. |
#### Item

[API and examples](../ai/components/Item.json)

How to use:

- Use it for a row of a list: a file, a contact, a result, with title, description, picture and actions.
- Pass `onClick` when the row opens something; mark the chosen one with `selected`.
- Use `variant` without surface when the row sits inside a Card.

Choose something else:

- Data compared in columns: Table.
- A settings row: SettingRow.

| Key | What it does |
|---|---|
| `Tab` | With `onClick`, moves to the row; then to the actions. |
| `Enter` or `Space` | Opens the row. |
#### Message

[API and examples](../ai/components/Message.json)

How to use:

- Use it for a message of a conversation with author and time: support chat, comments, an assistant.
- Fill `author`, `initials` and `time`; set `side` to tell who speaks.
- Your application sends and receives the messages.

Choose something else:

- Only the bubble, without author: Bubble.
- The list of messages with scroll: MessageScroller.

| Key | What it does |
|---|---|
| — | The message does not receive focus. Its links and actions do. |
#### MessageScroller

[API and examples](../ai/components/MessageScroller.json)

How to use:

- Use it for the area that holds the messages of a conversation and scrolls on its own.
- Set `maxHeight` and a `label` ("Conversation with support"). When people scroll up, a button takes them back to the latest messages.

Choose something else:

- Any content with its own scroll: ScrollArea.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the area. |
| `↓` `↑` `PageDown` `PageUp` | Scroll the messages. |
| `Enter` or `Space` on the button | Goes back to the latest messages. |
### Structure and composition

#### PageHeader

[API and examples](../ai/components/PageHeader.json)

How to use:

- Use it at the top of each page: the title, a line that says what the page is for, and the main actions.
- The `title` becomes the page's only `<h1>`. Put the description in `lead` and the actions in `actions`, with at most one primary.
- Pass a Breadcrumb in `breadcrumb` on deep pages, and context in `eyebrow` ("Team · Settings").

Choose something else:

- A section inside the page: SectionHeader.
- The opening of a public site: Hero.

| Key | What it does |
|---|---|
| `Tab` | Moves through the path and the actions. The title does not receive focus. |
#### SectionHeader

[API and examples](../ai/components/SectionHeader.json)

How to use:

- Use it to open each section of a page: "Members", "Recent invoices", "API keys".
- The `title` becomes an `<h2>`. Show how many items there are in `count` and put a link or small button in `action` ("Manage").
- Give it an `id` when the page has a TableOfContents. Use `rule` on dashboards.

Choose something else:

- The top of the page: PageHeader.

| Key | What it does |
|---|---|
| `Tab` | Moves to the action, when there is one. |
#### DeviceFrame

[API and examples](../ai/components/DeviceFrame.json)

How to use:

- Use it to show a page working inside a browser window or a phone, at the real width of the device.
- Pass the page in `src` with a `frameTitle`, and the device size in `viewport`; it scales to fit.
- The page inside does not react to clicks. Offer a link to open it for real.

Choose something else:

- A plain screenshot with no frame: an `<img>` in AspectRatio.

| Key | What it does |
|---|---|
| — | The page inside does not receive focus. |
#### StickyBar

[API and examples](../ai/components/StickyBar.json)

How to use:

- Use it to keep the context and the actions of a long page in view while scrolling: the item open, its state, Save.
- Show it with `visible` once the original header leaves the screen. Fill `title`, `status` and `actions`.

Choose something else:

- Save and cancel at the end of a form: StickyFooter.

| Key | What it does |
|---|---|
| `Tab` | Moves through the actions of the bar. |
#### StickyFooter

[API and examples](../ai/components/StickyFooter.json)

How to use:

- Use it at the bottom of long forms, so Save and Cancel stay in reach.
- Put the state in `start` ("Unsaved changes", "2 errors"), and the buttons on the right.
- Your form validates and blocks Save when needed.

Choose something else:

- Context and actions at the top: StickyBar.

| Key | What it does |
|---|---|
| `Tab` | Moves through the actions of the footer. |
#### SettingRow

[API and examples](../ai/components/SettingRow.json)

How to use:

- Use it for each item of a settings page: a preference, a connected account, a session, an API key.
- Write the `title` and a short `description`; put the detail (e-mail, date, masked key) in `meta`.
- Put the control in `actions` (Switch, Button). Or make the whole row a link with `href`, with no controls inside.

Choose something else:

- A destination card in a list: NavCard.
- An integration with connect and disconnect: ConnectorCard.

| Key | What it does |
|---|---|
| `Tab` | Moves to the row, when it is a link, or to its controls. |
| `Enter` | Opens the row link. Controls keep their own keys. |
#### PlanCard

[API and examples](../ai/components/PlanCard.json)

How to use:

- Use it side by side to compare plans on a pricing or upgrade page.
- Fill `name`, `price`, `period` and the `features`, in the same order in every card.
- Mark the recommended plan with `highlighted` and the current one with `current`, which turns off its button.
- Choosing only starts the change: your application confirms and charges.

Choose something else:

- The payment method and next charge: BillingCard.
- Usage against the plan limit: UsageMeter.

| Key | What it does |
|---|---|
| `Tab` | Moves to the button of each plan. |
| `Enter` or `Space` | Chooses the plan. |
#### BillingCard

[API and examples](../ai/components/BillingCard.json)

How to use:

- Use it on the billing page: the payment method, the state of the subscription and the next charge.
- Show only the last digits in `lastDigits`, never the full card. Put the state in `status` with a Badge.
- Put "Change card" and "View invoices" in `actions`. The card data is collected by your payment provider.

Choose something else:

- Comparing plans: PlanCard.

| Key | What it does |
|---|---|
| `Tab` | Moves through the actions of the card. |
| `Enter` or `Space` | Runs the action in focus. |
#### ConnectorCard

[API and examples](../ai/components/ConnectorCard.json)

How to use:

- Use it on integrations pages: one card per service, with its state and what it does.
- Put the service logo in `logo`, the state in `status`, and "Connect" or "Configure" in `actions`.
- Use `locked` with `lockHint` when the plan does not include the integration; keep the upgrade button working.
- Your application runs the sign-in with the service.

Choose something else:

- Signing in to the app with an account: OAuthButton.

| Key | What it does |
|---|---|
| `Tab` | Moves through the actions of the card. |
| `Enter` or `Space` | Runs the action in focus. |
#### DangerZone

[API and examples](../ai/components/DangerZone.json)

How to use:

- Use it at the end of a settings page for actions that delete or cannot be undone: delete project, transfer ownership.
- Say what is lost in each action, in plain words.
- Each button opens an AlertDialog before running: the zone does not confirm by itself.

Choose something else:

- The confirmation itself: AlertDialog.

| Key | What it does |
|---|---|
| `Tab` | Moves through the actions of the zone. |
| `Enter` or `Space` | Opens the confirmation of the action. |
#### Resizable

[API and examples](../ai/components/Resizable.json)

How to use:

- Use it for two panels side by side whose width people adjust: list and detail, code and preview.
- Pass the panels in `first` and `second`, the start size in `defaultSize`, and limits in `min` and `max`. Save the size in `onSizeChange` to keep it.
- On mobile, show one panel at a time.

Choose something else:

- A fixed split: a CSS grid.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the divider. |
| `←` or `→` | Moves the divider by 2%. |
| `Home` or `End` | Moves it to the minimum or the maximum. |
## Organisms

### Forms and choices

#### VisitSchedulePicker

[API and examples](../ai/components/VisitSchedulePicker.json)

How to use:

- Use it to book a time: a visit, an appointment, a call. The person picks a day, then one of the times available that day.
- Pass the free times your server computed, and mark the busy ones with `unavailable`. Limit the days with `minDate` and `maxDate`.
- Set `timezone` whenever the person and the place can be in different time zones; the summary shows it.
- Confirm the booking on your server before saying it is done: the time can be taken in the meantime.

Choose something else:

- Only a date, with no time: DatePicker or Calendar.

| Key | What it does |
|---|---|
| `Tab` | Moves from the calendar to the times and then to the summary. |
| `←` `→` `↑` `↓` in the calendar | Moves one day or one week, as in Calendar. |
| `Enter` or `Space` | Selects the day or the time in focus. |
#### GeoAreaPicker

[API and examples](../ai/components/GeoAreaPicker.json)

How to use:

- Use it when people choose where a search applies: a radius around a point, or a list of neighborhoods.
- Pass the regions in `neighborhoods` and the center in `baseId`. Limit the radius with `minRadius`, `maxRadius` and `radiusStep`.
- The map is optional: pass your map provider in `map`. Without it, the choice works by text and the slider.

Choose something else:

- A full address: PostalCodeInput and Input.
- Picking a few cities from a list, without radius: Multiselect.

| Key | What it does |
|---|---|
| `Tab` | Moves through the radius, the region search and the chosen regions. |
| `←` or `→` on the radius | Changes the radius by one step, as in Range. |
| Search keys | Same as Multiselect: `↓` `↑` move, `Enter` adds or removes, `Escape` closes. |
#### Questionnaire

[API and examples](../ai/components/Questionnaire.json)

How to use:

- Use it for questions asked one at a time: onboarding, a short survey, a quiz to recommend something.
- Pass the `questions` with their answers, and save the result in `onSubmit`. Keep it short: five to seven questions.

Choose something else:

- A long form with sections: WizardStepper with fields.

| Key | What it does |
|---|---|
| `Tab` | Moves through the answers and the back and next buttons. |
| `↓` or `↑` | Changes the answer, as in RadioGroup. |
| `Enter` | Goes to the next question. |
### Feedback and states

#### GuidedTour

[API and examples](../ai/components/GuidedTour.json)

How to use:

- Use it to present a new screen or feature in three to five steps, each one pointing at a part of the interface.
- Open it on the first visit and save in `onComplete` that the person has seen it. Let people close it at any step.
- Point each step only at elements already on screen.

Choose something else:

- Help that stays available: HelpMenu or HelpField.
- A first-use flow that collects data: Questionnaire or WizardStepper.

| Key | What it does |
|---|---|
| `Tab` | Moves through previous, next and close. |
| `Enter` or `Space` | Runs the button in focus. |
| `Escape` | Closes the tour. |
#### Modal

[API and examples](../ai/components/Modal.json)

How to use:

- Use it for a short task that must be finished or cancelled before going on: edit a record, invite a person, confirm details.
- Give it a `title` that says the task, and put the actions in `footer`, with the main one last.
- Control it with `open` and `onClose`. Use `width` for wider content, up to a form with two columns.
- When it closes, focus goes back to the button that opened it.

Choose something else:

- Confirming an action that deletes or cannot be undone: AlertDialog.
- Details people consult while still seeing the page: Drawer.
- A long task with several steps: a page with WizardStepper.

| Key | What it does |
|---|---|
| `Tab` or `Shift` + `Tab` | Moves between the controls of the modal, without leaving it. |
| `Escape` | Closes the modal and returns focus to where it was. |
#### Drawer

[API and examples](../ai/components/Drawer.json)

How to use:

- Use it for details or editing that people do while keeping the page in sight: the record of a table row, filters, a cart.
- Choose `side`: `right` for details, `left` for navigation, `bottom` on mobile, `full` for a screen of its own.
- By default the page behind is blocked. Set `modal={false}` when people need to keep using it.
- Put the actions in `footer`, which stays fixed while the content scrolls.

Choose something else:

- A short task that interrupts everything: Modal.
- A few controls attached to a button: Popover.

| Key | What it does |
|---|---|
| `Tab` | With `modal`, moves only inside the panel. Without it, the page behind joins the order. |
| `Escape` | Closes the panel and returns focus to where it was. |
#### Command

[API and examples](../ai/components/Command.json)

How to use:

- Use it as a search box for actions and pages of the app, opened by a shortcut such as ⌘K.
- Group the `items` (Pages, Actions, Recent) and show the shortcut of each one when there is.
- Run the choice in `onSelect`. Listen for the opening shortcut in your app and keep the normal navigation visible: not everybody knows the shortcut.

Choose something else:

- Few actions about one item: Menu.
- Picking a value in a form: Combobox.

| Key | What it does |
|---|---|
| Typing | Filters the results. |
| `↓` or `↑` | Moves between the results. |
| `Enter` | Runs the highlighted result. |
| `Escape` | Closes the palette and returns focus to where it was. |
#### AlertDialog

[API and examples](../ai/components/AlertDialog.json)

How to use:

- Use it to confirm an action that deletes, charges or cannot be undone.
- Write the `title` as a question with the object ("Delete project Refy?") and say what is lost in the text.
- Name the button with the action (`confirmLabel` "Delete"), never "OK". Use `destructive` for deletion.
- While your server runs the action, set `pending`; show the error in the dialog if it fails.

Choose something else:

- A task with a form: Modal.
- An action that can be undone: run it and offer "Undo" in a Toast.

| Key | What it does |
|---|---|
| `Tab` or `Shift` + `Tab` | Moves between cancel and confirm, without leaving the dialog. |
| `Enter` or `Space` | Runs the button in focus. |
| `Escape` | Cancels and returns focus to where it was. |
### Data

#### Table

[API and examples](../ai/components/Table.json)

How to use:

- Use it when people compare the same fields across many records: each column is a field and each row is one record.
- Align numbers and amounts with `align="num"`, so digits line up on the right.
- Turn on `searchable` for long lists, and `filterable` on columns with a few repeated values, such as status or owner.
- Mark `sortable` only on the columns people sort by, such as date or amount.
- When a row opens a detail, pass `onRowClick` and `rowLabel`, which names the row for screen readers.
- Show `loading`, `error` and `empty` in place of the rows instead of hiding the table.
- On mobile, set `minTableWidth`: the table scrolls sideways instead of squeezing the columns.

Choose something else:

- Records that move between stages: KanbanBoard.
- A few items with image and text: ContentCard in a grid.
- Thousands of rows on a server: search and paginate on the server, and pass only the current page to the table.

| Key | What it does |
|---|---|
| `Tab` | Moves through search, filters, sortable headers, rows and pagination, in that order. Rows receive focus only when `onRowClick` is set. |
| `Enter` or `Space` on a header | Sorts the column: ascending, descending, then back to the original order. |
| `Enter` or `Space` on a row | Runs `onRowClick` for that row. |
| `Enter` or `Space` on a filter value | Selects or clears that value. |
| `Escape` | Closes the open filter list. |
#### Charts

[API and examples](../ai/components/Charts.json)

How to use:

- Use it to show numbers that change or compare: sales by month, share by channel, distribution of values.
- Choose the chart by the question: line for time, bars to compare, pie only for parts of a whole with few slices.
- Always set `title`, the axis titles (`yTitle`, `xTitle`) and `formatY` with the unit.
- Offer the data as a table next to it when people need the exact values.

Choose something else:

- One number with its trend: Stat.
- A score from 0 to 100: ScoreGauge.
- Exact values to look up: Table.

| Key | What it does |
|---|---|
| `Tab` | Moves focus to the chart. |
| `←` or `→` | Moves between the points or bars, and reads the value. |
| `Home` or `End` | Goes to the first or last point. |
| `Enter` or `Space` | Highlights the point in focus. |
| `Escape` | Clears the highlight. |
#### Matrix2x2

[API and examples](../ai/components/Matrix2x2.json)

How to use:

- Use it to place items by two criteria and see which quadrant each one falls in: impact and effort, risk and likelihood.
- Name the axes with `xLabel` and `yLabel`, and each quadrant in `quadrants` ("Do now", "Plan").
- Pass the `points` in order of priority; open the detail of the chosen point in `onPointClick`.

Choose something else:

- Values over time: Charts.
- A ranked list: Table with sorting.

| Key | What it does |
|---|---|
| `Tab` | Moves from one point to the next, in order of priority. |
| `Enter` or `Space` | Selects the point in focus, or clears it. |
#### Timeline

[API and examples](../ai/components/Timeline.json)

How to use:

- Use it for the milestones of a journey: an order from purchase to delivery, a project from kick-off to launch.
- Pass the `items` in the order they happen, each with date and title; add media or an action when a milestone needs them.
- Use `orientation="horizontal"` for few milestones in a wide area; vertical works on mobile.

Choose something else:

- Many events by people and systems: ActivityTimeline.
- Steps the person still has to do: WizardStepper.

| Key | What it does |
|---|---|
| `Tab` | In horizontal, moves focus to the timeline. |
| `←` or `→` | In horizontal, scrolls to the previous or next milestones. |
| `Home` or `End` | In horizontal, goes to the first or last milestone. |
#### EventTimeline

[API and examples](../ai/components/EventTimeline.json)

How to use:

- Use it for the history of a record: comments, changes and system events, grouped by day.
- Pass the `events` with author and time; set `locale` and `timezone` of the people reading.
- Show loading failures with `error` and `onRetry`, and an empty history with `emptyTitle` and `emptyMessage`.
- For a small widget, use `density="compact"` and `groupByDate={false}`. In new code, import it as ActivityTimeline.

Choose something else:

- Milestones of a journey: Timeline.
- A single event: ActivityItem.

| Key | What it does |
|---|---|
| `Tab` | Moves through links, actions and "Load more", in reading order. |
| `Enter` | Opens the link or runs the action. |
#### KanbanBoard

[API and examples](../ai/components/KanbanBoard.json)

How to use:

- Use it for work that moves through stages: sales pipeline, tasks, hiring.
- Pass the `columns` with their cards and save the moves in `onColumnsChange`. Open a card in `onCardClick`.
- Set a limit per column with `wipLimit` and the allowed moves with `allowedTransitions`. Check them on your server too: two people can move the same card.
- Each card can also be moved by its menu, without dragging.

Choose something else:

- Comparing many fields of each item: Table.
- Dates and deadlines: Calendar or Timeline.

| Key | What it does |
|---|---|
| `Enter` or `Space` on the handle | Picks up the card, and drops it again. |
| `←` or `→` | With the card picked up, chooses the column. |
| `Escape` | Cancels the move and puts the card back. |
#### ApprovalWorkbench

[API and examples](../ai/components/ApprovalWorkbench.json)

How to use:

- Use it for a queue of items reviewed one by one: documents to approve, submissions to check, claims to analyse.
- Pass the `items`; the list stays on one side and the item in `activeId` opens in the panel. Change it in `onActiveChange`.
- Your application decides and saves the outcome of each item.

Choose something else:

- A decision on a single item: DecisionActions.
- A list to browse, with no decision: Table.

| Key | What it does |
|---|---|
| `Tab` | Moves through the list items and the panel actions. |
| `Enter` or `Space` | Opens the item in focus, or runs the action. |
#### Trace

[API and examples](../ai/components/Trace.json)

How to use:

- Use it to show the steps of a process people want to follow or audit: what an assistant did, a deploy, an import.
- Pass the `steps` with their state and result; each one opens to show the details and the code.

Choose something else:

- A history of what people did: ActivityTimeline.

| Key | What it does |
|---|---|
| `Tab` | Moves from one step to the next, and to the copy buttons. |
| `Enter` or `Space` | Opens or closes the step, or copies the code. |
### Content and identity

#### Coverflow

[API and examples](../ai/components/Coverflow.json)

How to use:

- Use it to browse a finite set of covers or visual references and pick one: albums, themes, templates.
- Draw each item with `renderItem` using only image and text: links and buttons inside it do not work.
- Selecting moves the item to the center (`onSelectionChange`); opening it is a separate step (`onActivate`).

Choose something else:

- A long list to read: a list or a grid of ContentCard.
- Slides that people only go through: Carousel.

| Key | What it does |
|---|---|
| `Tab` | Moves to the item in the center and to the controls. |
| `←` or `→` | Selects the previous or next item. |
| `Home` or `End` | Selects the first or last item. |
| `Enter` or `Space` | Opens the item in the center. |
#### PropertyCard

[API and examples](../ai/components/PropertyCard.json)

How to use:

- Use it for items people browse and compare by picture and facts: listings, products, places, courses.
- Fill `title`, `media` and a few `facts`; add `badges`, `summary` or `matchScore` when they help decide.
- Choose `layout` by place: vertical in grids, horizontal in lists. Put the actions in `actions`.
- In new code, import it as ContentCard.

Choose something else:

- A destination with one line of context: NavCard.
- Deciding on items one at a time: DecisionDeck.

| Key | What it does |
|---|---|
| `Tab` | Moves through the media controls and the actions of the card. |
| `←` or `→` on the media | Shows the previous or next photo, as in MediaGallery. |
#### SwipeDeck

[API and examples](../ai/components/SwipeDeck.json)

How to use:

- Use it to decide on items one at a time, like or skip: candidates, listings, suggestions.
- Save each decision in `onAction`. The buttons do the same as the gesture, so people who do not swipe can decide too.
- Offer to start over in `onReset` when the cards end. In new code, import it as DecisionDeck.

Choose something else:

- Slides with no decision: Carousel.
- Comparing several items side by side: a grid of ContentCard.

| Key | What it does |
|---|---|
| `←` | Skips the card. |
| `→` | Keeps the card. |
| `Tab` | Moves to the action buttons. |
#### IntentComposer

[API and examples](../ai/components/IntentComposer.json)

How to use:

- Use it as the box where people describe what they want in their own words, by text or voice: a search, an order, a question to an assistant.
- Offer `examples` of good requests and the `filters` that narrow it. Handle the request in `onSubmit`.
- While your service processes, set `state`; then show what was understood in `understoodSummary`, with a way to edit.
- The component does not run AI: your application interprets the text.

Choose something else:

- A plain form field: Input or Textarea.
- Messages of a conversation: Message and MessageScroller.

| Key | What it does |
|---|---|
| `Tab` | Moves through the filters, the text, the voice button and Continue. |
| `Enter` | In the text, starts a new line. Sending is on the Continue button. |
### Structure and composition

#### AppShell

[API and examples](../ai/components/AppShell.json)

How to use:

- Use it as the frame of an app: sidebar on the left, top bar and the content of the page.
- Configure the sidebar in `sidebar` and the top bar in `topbar`; the page goes in `children`.
- Turn on `responsiveSidebar` so the sidebar becomes a drawer on mobile. Limit the reading width with `contentMaxWidth`.

Choose something else:

- A public site page: Hero, Section and SiteFooter.

| Key | What it does |
|---|---|
| `Tab` | Goes through the sidebar, then the top bar, then the page. |
| Other keys | Each part keeps its own: see Sidebar, Topbar and WorkspaceSwitcher. |
#### Sidebar

[API and examples](../ai/components/Sidebar.json)

How to use:

- Use it for the main places of an app, always visible on the side: Home, Projects, Reports, Settings.
- Split items into `groups`, mark the page open with `activeId`, and put the main creation action in `cta` ("New project").
- Use `workspaces` to switch companies at the top, and `account` for the person at the foot.

Choose something else:

- Areas inside a settings page: SettingsSubnav.
- A site with few pages: NavigationMenu.

| Key | What it does |
|---|---|
| `Tab` | Moves through the items, in reading order. |
| `Enter` | Opens the item in focus. |
| Menus | The workspace and account menus use the keys of WorkspaceSwitcher and Menu. |
#### Topbar

[API and examples](../ai/components/Topbar.json)

How to use:

- Use it at the top of each app page: where the person is, search, and the global actions.
- Show the path in `crumbs`, open the search in `onSearchClick`, and switch views with `tabs` or `segments`.
- Put NotificationBell, HelpMenu and UserMenu in `actions`.

Choose something else:

- The title and actions of one page: PageHeader.

| Key | What it does |
|---|---|
| `Tab` | Moves through the path, search, tabs and actions. |
| Other keys | Each part keeps its own: see Breadcrumb, Tabs, Segmented and Menu. |
#### Hero

[API and examples](../ai/components/Hero.json)

How to use:

- Use it for the first screen of a public page: the main title, one sentence and the main actions.
- Write the `title` as the promise of the page, the `lead` as the proof in one sentence, and put one primary and one secondary action in `actions`.
- The layout comes from the theme: switching the theme changes the hero without code.

Choose something else:

- The title of an app screen: PageHeader.

| Key | What it does |
|---|---|
| `Tab` | Moves to the actions. The title does not receive focus. |
#### Section

[API and examples](../ai/components/Section.json)

How to use:

- Use it for each block of a public page: an argument with its proof, such as text next to an image, a demo or numbers.
- Put the proof in `aside`. Use `layout="split"` for side by side, and `reverse` to alternate sides down the page.
- On mobile the parts stack, and screen readers always read the text first.

Choose something else:

- Data grids inside an app: Table or Card.

| Key | What it does |
|---|---|
| `Tab` | Moves through the links and buttons of the section, in reading order. |
#### SiteFooter

[API and examples](../ai/components/SiteFooter.json)

How to use:

- Use it at the end of public pages: brand, link columns, credits and legal notes.
- Give each column a title; each one becomes a navigation named by it. Links to other sites open in a new tab and show ↗.
- Put language and color mode in `settings`.

Choose something else:

- Navigation inside an app: Sidebar.

| Key | What it does |
|---|---|
| `Tab` | Moves through the links, column by column. |
| `Enter` | Opens the link. |
## Applying it to a real screen

1. Identify the task, data, states and flows of the existing system; preserve contracts and business rules.
2. Choose controls by the guidance above, checking "Choose something else" for each one. A page composes families; it is not a new organism family.
3. Copy the public example/API and connect your state/callback. To start from a ready composition, use Templates and their complete files.
4. Use the theme for identity and the modes for light/dark/system; validate states and real text. Do not use private CSS Modules selectors.
5. Test keyboard, focus, layers and observable effects in the application. The [agent kit](AGENT_ADOPTION.md) helps with static inspection and mapping, but does not automatically prove visual quality or that every business rule is preserved.

Legacy aliases remain available per [SKINS.md](SKINS.md). The old folder/story name does not turn the component into a domain contract: in new code prefer ContentCard, MediaGallery, DecisionActions, DecisionDeck, SchedulePicker and ActivityTimeline.
