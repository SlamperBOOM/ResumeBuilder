---
name: Resume Builder
description: A quiet desktop surface whose only job is to hold a document steady while you work on it.
colors:
  teal-ink: "#117a80"
  teal-mint: "#94e2d5"
  paper-white: "#ffffff"
  desk-light: "#eff1f5"
  editor-light: "#e6e9ef"
  card-well-light: "#dce0e8"
  backdrop-light: "#ccd0da"
  ink-light: "#4c4f69"
  ink-muted-light: "#5c5f77"
  ink-faint-light: "#9ca0b0"
  rule-light: "#dce0e8"
  alarm-light: "#d20f39"
  desk-dark: "#181825"
  paper-dark: "#1e1e2e"
  editor-dark: "#11111b"
  card-well-dark: "#313244"
  backdrop-dark: "#45475a"
  ink-dark: "#cdd6f4"
  ink-muted-dark: "#a6adc8"
  ink-faint-dark: "#6c7086"
  rule-dark: "#313244"
  alarm-dark: "#f38ba8"
typography:
  display:
    fontFamily: "Inter Variable, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter Variable, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.016em"
  title:
    fontFamily: "Inter Variable, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Inter Variable, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.008em"
  body-small:
    fontFamily: "Inter Variable, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.004em"
    fontVariant: "tabular-nums"
  label:
    fontFamily: "Inter Variable, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 550
    lineHeight: 1.4
    letterSpacing: "0"
  eyebrow:
    fontFamily: "Inter Variable, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "0.09em"
  caption:
    fontFamily: "Inter Variable, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 450
    lineHeight: 1.5
    letterSpacing: "0"
    fontVariant: "tabular-nums"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.teal-ink}"
    textColor: "{colors.paper-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "6px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.teal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "5px 15px"
  button-bar:
    backgroundColor: "transparent"
    textColor: "{colors.paper-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "6px 8px"
  sheet:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-light}"
    rounded: "0"
    padding: "0"
    width: "100%"
  sheet-hover:
    backgroundColor: "{colors.paper-white}"
    rounded: "0"
  sheet-actions:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-muted-light}"
    rounded: "0"
    padding: "4px 8px"
  chip-tag:
    backgroundColor: "transparent"
    textColor: "{colors.ink-light}"
    typography: "{typography.caption}"
    rounded: "16px"
    padding: "0 8px"
    height: "24px"
  input-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink-light}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "16.5px 14px"
  rail-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-light}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "4px 16px"
    height: "44px"
  panel-editor:
    backgroundColor: "{colors.editor-light}"
    textColor: "{colors.ink-light}"
    padding: "12px"
  panel-backdrop:
    backgroundColor: "{colors.backdrop-light}"
    padding: "0"
---

# Design System: Resume Builder

## Overview

**Creative North Star: "The Quiet Desk"**

The hero of every screen is the document, not the application. The interface is
the desk surface underneath a sheet of paper: level, matte, unhurried, and
deliberately less interesting than the thing lying on it. Every screen in this
app exists to hold a resume steady while someone works on it, and the
screen that competes with the resume for attention has failed at its only job.

This is why the color system is built as a graded stack of desk tones rather
than a single background: `desk` under everything, `paper` for the surfaces that
carry content, `editor` for the working panel, `card-well` and `backdrop` for the
recesses a PDF sits in. Depth in this system is a change in tone, not a shadow.
The palette is Catppuccin-derived (Latte in light, Mocha in dark) and its accent
is a muted teal chosen pragmatically, not a trademark. That accent is
replaceable; the *restraint* is not. A future palette setting may swap every hue
in this file, and the system must survive that swap without redesign, which is
only true if no rule here depends on the hue itself.

The product's users arrive after long absences, often years, and never to admire
the app. They are mid-application, switching between a vacancy posting and this
window. The system therefore prizes legibility, a stable spatial model between
visits, and the absence of anything that must be learned twice. Ornament is not
suppressed because ornament is bad; it is suppressed because it would be aimed at
the wrong object.

**Key Characteristics:**

- Tonal depth, not shadow depth: surfaces separate by lightness step and a 1px rule.
- One accent, used sparingly, on the action the user came to take.
- Material Design as substrate, not as personality — the app reads as quiet,
  not as a Material demo.
- The PDF is the only element allowed to look like a physical object.
- Every string is a translation key; no layout may assume the width of English.

## Colors

Two complete schemes, compiled to CSS variables and switched by
`prefers-color-scheme`, which the Electron main process drives through
`nativeTheme.themeSource`. `src/renderer/theme/colors.ts` is the single source of
truth for both — it is import-free on purpose so the main process can read the
window background color without bundling MUI. Never introduce a raw color value
in a component.

### Primary

- **Deep Teal Ink** (light): the accent, and in practice the only saturated color
  in the light interface. It carries the app bar, contained buttons, the selected
  template's 3px border, the active block's left rule, and focus. Nothing else.
- **Pale Mint** (dark): the dark-scheme accent. Inverted in weight — it is light
  against a dark field, so it reads as *illumination* rather than as ink. Use it
  for the same roles and no others.

### Neutral

- **Desk** (`desk-light` / `desk-dark`): the page under everything. The lowest
  surface; nothing sits behind it.
- **Paper** (`paper-white` / `paper-dark`): cards, dialogs, menus — any surface
  that carries content on top of the desk.
- **Editor** (`editor-light` / `editor-dark`): the working panel in the edit
  screen. Note the inversion between schemes: in light it is *darker* than the
  desk, in dark it is *darker* than the desk too. The editor always recedes.
- **Card Well** (`card-well-*`) and **Backdrop** (`backdrop-*`): the recesses a
  PDF page sits in — the card thumbnail well and the preview pane backdrop. These
  exist so a white PDF page has something to be white *against*.
- **Ink / Ink Muted / Ink Faint**: primary, secondary, and disabled text. Ink
  Faint is for disabled only; secondary text uses Ink Muted. Ink Muted is
  measured against the *desk*, not against paper: on the main screen every date
  and metadata line sits on the lowest surface, so the light value is Latte's
  subtext1 (5.53:1 there) rather than subtext0, which fell to 4.37:1.
- **Rule** (`rule-*`): the 1px divider that does the structural work shadows
  would do in a more decorative system.

### Error

- **Alarm** (`alarm-light` / `alarm-dark`): destructive confirmation and
  validation failure. Never decorative, never a highlight.

### Named Rules

**The One Accent Rule.** There is exactly one accent hue in the system, and it
never appears on a surface the user is not being asked to act on. If a screen has
two teal things competing, one of them is wrong.

**The Replaceable-Hue Rule.** No rule in this system may depend on the accent
being teal. The accent's *role* and *scarcity* are invariants; its hue is a
default. A user-selectable palette must be able to replace every value in the
frontmatter without invalidating a single line of this document.

**The Two-Scheme Rule.** Every color decision ships in both schemes or it does
not ship. A value added to `colors.light` without its `colors.dark` counterpart
is a bug, not a work in progress.

## Typography

**One family, bundled:** Inter (variable, weights 100-900), shipped with the app
at `frontend/resume-builder-frontend/assets/fonts/Inter-Variable.ttf` — the same
file the resume templates already use. Fallbacks: Segoe UI, Roboto, Helvetica
Neue, Arial. No webfont is ever fetched; the app renders identically with the
network unplugged.

**Character:** a neutral UI face with a tall x-height that stays legible at 11px
in a dense form and takes negative tracking well at heading sizes. Its Cyrillic
is a full cut, not a fallback, which matters because half this product's strings
are Russian. The file carries the `opsz` axis and the interface sets
`font-optical-sizing: auto`, so small text opens up and large text tightens
without a second file. `font-feature-settings: 'cv05'` gives lowercase `l` a
tail, because this app is mostly people typing names, URLs and job titles into
fields where `Il1` must not collide.

The type does the hierarchy work alone: size, weight (400 / 450 / 500 / 550 /
600) and color (Ink vs Ink Muted). There is no second family and no italic — a
UI that never sets prose has nothing to emphasize that weight cannot carry.

### Hierarchy

The ramp is 48 / 40 / 32 / 28 / 22 / 18 / 16 / 14 / 12 / 11, with tracking
tightening as size grows.

- **Display** (600, 1.75rem/28px, -0.02em): the rare large moment — never chrome.
- **Headline** (600, 1.375rem/22px, -0.016em): dialog titles, empty-state headings.
- **Title** (600, 1.125rem/18px, -0.012em): the workhorse — resume names, screen
  and section headings, the app bar title.
- **Body** (400, 1rem/16px, 1.55, -0.008em): form values and dialog prose, held to
  a 68ch measure.
- **Body Small** (400, 0.875rem/14px, -0.004em, tabular figures): supporting text
  and every timestamp in the app.
- **Label** (550, 0.875rem/14px, 0, sentence case): every button.
- **Eyebrow** (600, 0.6875rem/11px, 0.09em, uppercase): section labels in the
  block rail.
- **Caption** (450, 0.75rem/12px, tabular figures): counts and positional readouts.

`h1`-`h3` (48 / 40 / 32) exist to keep the ramp complete and are unused; nothing
in a desktop tool needs them yet.

### Named Rules

**The Bundled-Face Rule.** The interface font ships inside the app and loads from
disk with `font-display: block`. A local file resolves in milliseconds, so
blocking costs nothing and avoids a flash of fallback metrics; a webfont URL
would break the product's offline promise outright.

**The Sentence-Case Rule.** Buttons and menu items are sentence case. Uppercase
labels were the framework default, not a decision — and they cost Russian words
their shape, since Cyrillic has less ascender/descender variety to survive the
flattening.

**The Tabular Numbers Rule.** Any number that changes in place while the user
watches — the zoom percentage, block position, entry counts — and any timestamp
that sits in a column of other timestamps uses tabular figures. This is carried
by the `body-small` and `caption` roles, so it is inherited rather than
remembered.

**The Translated-Width Rule.** No heading, label, or button may be sized on the
assumption that its English string is the longest one. Russian runs longer;
headings truncate with ellipsis and `noWrap` rather than wrapping the layout.

**The Dark-Bloom Rule.** Light text on the dark scheme is rendered with
`-webkit-font-smoothing: antialiased`. Identical weights bloom on a dark field
and read a step heavier than they are; the thinner rasterization takes that step
back off.

## Layout

**Two spatial models, one per screen.**

The **main screen** is a fluid card grid:
`repeat(auto-fill, minmax(340px, 1fr))` with a 24px gap. It reflows by available
width with no breakpoints — this is a resizable desktop window, not a set of
device classes, so the layout answers to the window, never to a media query.

The **edit screen** is one band of resume-wide controls over a split of block
rail | form beside the PDF preview, built on `react-resizable-panels`. Pane sizes
are user property: they are persisted to `electron-store` (debounced 100ms) and
restored on the next visit. Both separators are 6px `divider`-colored bars with
`col-resize`. Minimum sizes (rail 10%, form 30%) exist so a pane can be pushed
aside but never destroyed.

The rail has two states, and which one the user left it in is persisted next to
the pane sizes. **Pinned** (the default) is the resizable pane described above.
**Collapsed** replaces it with a 56px strip carrying each block's state and no
names, which opens to 260px *over* the form on hover or focus, Esc to close —
the strip's width is the only width the rail then costs. A returning user finds
it pinned and named; a daily user collapses it once and keeps the width.

**Spacing rhythm** is MUI's 8px base. In use: 6px (`0.75`) for chip clusters, 8px
(`1`) for tight element pairs, 12px (`1.5`) for rail padding and toolbar
clusters, 16px (`2`) for panel padding and card content, 24px (`3`) for grid
gaps, 32px (`4`) for screen-level top margin.

**Density** is comfortable, not compact, with one exception: the block rail uses
`List dense` with a 44px minimum row height — dense typography, but a full
pointer target.

### Named Rules

**The Window-Not-Device Rule.** This is a desktop app. Layout responds to
container width through fluid grids and resizable panels; it does not branch on
device breakpoints, and there is no mobile layout to maintain.

**The Persisted-Geometry Rule.** Anything the user physically drags — window
size, splitter positions, preview zoom — is saved and restored. Returning to a
layout you left is part of the product's promise of ownership.

## Elevation & Depth

**Target: flat by default.** Surfaces separate through tone and a 1px rule.
Shadow is reserved as a *response to state* — hover, an open menu, a modal —
never as a resting decoration. The Quiet Desk has no floating furniture.

**The main screen now meets the target.** Sheets rest flat and answer hover and
focus with a border color change, which is equally readable in both schemes. The
elevation-2 card, its elevation-6 hover lift and the dark-mode accent ring that
compensated for an invisible shadow are all gone from that surface.

**Incumbent state elsewhere:** the app bar still carries MUI's default elevation
4, and the template-picker cards still lift to `elevation={6}` on hover. Both are
drift, not doctrine; new surfaces follow the target.

### Shadow Vocabulary

- **Hover Lift** (`box-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)`, MUI elevation 6):
  survives only in the template picker. Not available to new work — a border or a
  tone change says the same thing in both schemes.
- **Overlay** (MUI dialog and menu defaults): dialogs, menus, tooltips. Not a
  token this system tunes; framework default is correct for transient overlays.

### Named Rules

**The Flat-At-Rest Rule.** A surface that is not hovered, dragged, open, or
focused casts no shadow. If a new component needs a shadow to be findable, its
tone or its rule is wrong.

**The Both-Schemes-Visible Rule.** Every state change must be perceptible in both
light and dark. A shadow alone never satisfies this, because shadow is nearly
invisible on a dark field — pair it with a tone or border change, or use tone
alone.

**The Paper Exception.** The rendered PDF page is the one element permitted to
read as a physical object sitting above its surface. It earns this because it is
literally the document. Nothing else in the interface may borrow the treatment.

## Shapes

Gently rounded rectangles throughout, on a three-step scale built from MUI's 4px
base unit: **4px** (`rounded.sm`) for controls that sit inline — buttons, inputs,
rail items; **8px** (`rounded.md`) for grouped field containers such as the
repeating blocks in `ResumeDynamicBlock`; **12px** (`rounded.lg`) for cards, the
largest containers on screen. Chips are fully rounded (pill) by framework
default, which is correct — they are labels, not containers.

The form language is orthogonal and quiet: no rotation, no clipping shapes, no
decorative geometry, no illustration. The only non-rectangular elements in the
app are the icon glyphs and the chip pills.

Borders carry structure. The 1px `rule` divider appears under the edit screen's
toolbar, down the right edge of the block rail, and as dialog content dividers.
Two borders are load-bearing and deliberately thicker: the **3px left rule** on
the active block in the rail, and the **3px full border** on the selected
template card. Both use the accent; both mark "this is the one you chose".

### Named Rules

**The Radius-Tracks-Size Rule.** Radius scales with the element: 4px inline, 8px
grouped, 12px container. A 12px radius on a button or a 4px radius on a card is
a mistake, not a variant.

**The Square-Paper Exception.** The resume sheet on the main screen has no radius
at all. It is the one element that is a document rather than a container, and
paper does not have rounded corners. The exception is the sheet only; every
container around it still follows the rule above.

## Components

### Buttons

- **Shape:** softly rounded (4px), uppercase label, no shadow.
- **Primary (contained):** accent fill, paper-colored text, 6px × 16px padding.
  One per screen region — the action the user came for. `EDIT` on a card,
  `CREATE RESUME` on the main screen, the confirming action in a dialog.
- **Secondary (outlined):** 1px accent border, accent text, transparent fill,
  5px × 15px padding. Pairs with primary at equal width (`flex: 1`) when two
  actions are genuinely equal in likelihood, as on a resume card.
- **Bar (text, inherit):** transparent, inherits the app bar's contrast text.
  Used only in the app bar. Carries no accent because the bar *is* accent.
- **Hover / Focus:** framework default tint. Focus-visible rings are MUI's and
  must not be removed.

### Chips

- **Style:** small, outlined, pill, `rule`-colored 1px border, Ink text,
  transparent fill.
- **Role:** read-only metadata only — a resume's locale and template name. Chips
  in this system are never interactive, never filters, never dismissible. If
  something needs to be clicked, it is not a chip.

### Sheets

The resume list is made of sheets, not cards. A sheet is the page itself at true
A4 proportion (`aspect-ratio: 1 / 1.414`), paper-colored, square-cornered, with a
1px `rule` border and no resting shadow. There is no well, no inner padding and
no container around it: the PDF renders flush to the border.

- **Caption:** below the sheet, never on it — name (Title, `noWrap`, ellipsis,
  full name in `title`), the date phrase the backend formatted (Body Small, Ink
  Muted), then locale and
  template as one Caption line separated by `·`. Chips are not used here; two
  outlined pills around two words were louder than the words.
- **Open:** the sheet is the target. A `ButtonBase` covers it, labeled with the
  resume name, so clicking the document opens the document.
- **Action bar:** revealed on `:hover` and `:focus-within`, a paper band across
  the bottom edge with a 1px top rule, carrying Edit, Duplicate, Export and the
  overflow menu as small icon buttons with tooltips. It fades in over 0.2s and is
  `pointer-events: none` at rest; `prefers-reduced-motion` drops the transition.
- **Overflow menu:** whatever remains of the backend's `resume_menu` after the
  promoted entry, anchored bottom-right → top-right. Destructive items live here.
- **State:** the border turns accent on hover and focus. That is the whole state
  vocabulary — no lift, no shadow, no scale.

### Inputs / Fields

- **Style:** MUI outlined `TextField`, full width, `margin="normal"`, floating
  label. Labels are translation keys, never literals.
- **Composition:** inputs are never hand-placed. They are rendered from backend
  JSON schema through `fieldRegistry.ts`. A new field type is a registry entry,
  not a bespoke layout.
- **Focus:** framework default — border thickens to the accent, label lifts.
- **Repeating entry:** an 8px-radius box bordered with the 1px `rule` — never
  `currentColor` — opening with a row that carries the entry's position in
  Caption tabular on the left and a small error-tinted delete control on the
  right. Deleting asks first: the entry holds typed history and autosave commits
  the removal seconds later, so the confirmation is the only place to stop it.
- **Block hint:** one or two Body Small lines in Ink Muted under the block
  heading, held to the body measure, carried by the schema's `block_hint` key and
  the interface locale. Write it short enough to hold two lines at a usual window
  width, and write to the Russian string — it is the longer one. Never an `Alert`: nothing went wrong, and `severity="info"` would put a
  second accent hue on screen.

### Navigation

- **App bar:** static (never sticky-animated), accent-filled, containing the app
  icon at 64px, the Display-sized title, the theme toggle icon button, then text
  buttons generated from the backend header schema.
- **Edit-screen band:** one row under the app bar carrying back, the resume's own
  name / locale / template fields, and Export. The fields are the band's height,
  so they drop the form margin they carry elsewhere. The resume name appears here
  once, as the field — never also as a label.
- **Block rail:** the app's primary navigation surface. A dense list with a 1px
  right rule, an Eyebrow section title, and a 3px accent left border plus
  weight-600 label on the active item, which also carries `aria-current`. Each
  row names its own state — "Experience, 3", "About, empty" — because a count or
  a ring spoken alone says nothing about what it counts. Rows are 44px minimum. Each row ends in
  its state: an entry count in tabular figures for a block that holds entries, a
  filled or hollow 8px ring for one that holds text. The mark rides inside the
  row rather than over it, so a long Russian block name wraps instead of
  truncating — a rail whose names cannot be read does not navigate. A pin control
  in the rail head switches pinned and collapsed.

### Signature Component: the PDF Preview

The preview is not a screenshot or an approximation — it is the same PDF the
export produces, rendered by `react-pdf` inside a `backdrop`-toned pane. It has
three scale modes (fit width, fit height, manual zoom 10–100% in 10% steps) whose
selection and value persist across sessions. Its controls are one row: a
segmented mode control and a zoom stepper whose percentage is tabular and whose
buttons disable at the ends of the range. The same component, at
`FULL_HEIGHT`, is reused as the card thumbnail and as the template-picker
thumbnail, which is why those wells are toned rather than white: the paper needs
a field to sit against.

**This component is the product's core promise made visible.** What is on screen
is what gets sent. Nothing may be added to the preview pane that does not exist
in the exported file.

## Do's and Don'ts

### Do:

- **Do** separate surfaces with tone and a 1px `rule`, in the order desk → paper
  → editor → well/backdrop.
- **Do** keep the accent scarce and tied to the single action a region is asking
  for.
- **Do** declare new form UI in `backend/src/main/resources/screens/*.json` and
  render it through the existing registry.
- **Do** pass every user-visible string through a translation key, and size
  layout for the longer Russian string.
- **Do** persist anything the user physically drags or zooms.
- **Do** set new text from one of the eight type roles; a one-off `fontSize` in
  an `sx` prop is how a ramp dies.
- **Do** use `tabular-nums` for any numeric readout that updates in place.
- **Do** write dates the way a person would: relative inside a week ("5 минут
  назад", "вчера"), a plain calendar date after it, and never a clock time in a
  list. The backend formats the phrase and sends it ready to render, so the
  strings stay in the translation files with every other string.
- **Do** verify both schemes before calling a state change done.

### Don't:

- **Don't** write a raw hex value in a component. `colors.ts` is the only place
  color exists.
- **Don't** let a shadow be the sole signal of a state change — it disappears in
  dark mode.
- **Don't** give a resting surface a shadow.
- **Don't** introduce a second accent hue, a gradient, or a decorative
  illustration. The document supplies all the visual interest this app needs.
- **Don't** make a chip clickable.
- **Don't** wrap a document preview in a well of a different proportion. The
  container takes the page's aspect ratio or there is no container.
- **Don't** add a second type family, an italic, or a weight outside 400-600.
  Inter alone carries every role.
- **Don't** reference a font by URL, from Google Fonts or anywhere else. The face
  ships in the bundle or it does not ship.
- **Don't** add a CSS feature to a resume template because it works in the app —
  templates render through openhtmltopdf, which supports a limited CSS subset and
  must be verified by rendering.
- **Don't** build a bespoke React component when a registered field type fits.
- **Don't** write a rule that depends on the accent being teal.
