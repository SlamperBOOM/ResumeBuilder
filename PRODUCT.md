# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a person actively looking for a job, who keeps several tailored
versions of one resume and exports a PDF before each application. They edit,
duplicate, adjust wording for a specific vacancy, and export again.

Second, overlapping: a person who refuses to hand their personal history to
hh.ru, LinkedIn, or a cloud resume builder. Privacy is the reason they chose a
desktop app, not a side benefit.

Usage rhythm is bimodal and this matters more than either audience label: a
burst of daily use during a search, then one to three years of nothing. A
returning user has forgotten the app entirely. The interface must re-explain
itself without a tutorial — hence the onboarding dialog, the in-app About guide,
and the help pages being product surface, not documentation debt.

The author is also a user; the app was built for their own search first and
published after.

## Product Purpose

Write, maintain, and export a resume as a file on your own computer. Success is
a PDF the user can send without opening anything else, produced from data they
still own and can reopen years later.

## Positioning

Four things a neighboring product cannot truthfully claim at once:

1. **Files, not an account.** A resume is a file on the user's disk. No sign-up,
   no cloud, no network. Save-file migrations guarantee a file written by an old
   version still opens in a new one.
2. **Template switching without re-entry.** Data and presentation are separate
   models. Any of the four templates can be applied to existing content at any
   time.
3. **Live PDF preview.** The preview is a real PDF from the same
   FreeMarker → openhtmltopdf pipeline as the export. What is on screen is what
   gets sent — no export-time surprises.
4. **Backend-driven UI** (internal, not a user-facing claim). Screens and forms
   are JSON schemas served by the backend; the frontend is a generic renderer.
   It is the reason a new block or field is a JSON change, and it constrains
   every future UI decision.

## Operating Context

The real scene is a job search, not a design session. The user is switching
between a vacancy posting in a browser, this app, and a mail client or job
board upload form. Sessions are short and instrumental: change three lines,
look at the preview, export, attach, move on.

Two locales run independently: the interface language and the resume content
language. A Russian speaker applying to an English-language role uses a Russian
UI to write an English resume. Neither setting may imply the other.

Distribution is a downloaded installer for Windows, macOS, and Linux, bundled
JRE included; there is no install-time setup step to lean on.

## Capabilities and Constraints

Confirmed functionality: resume list with search, create / import / duplicate /
delete, block-based editor (personal info with photo, contacts, experience,
education, advanced training, skills, languages, publications, recommendations,
hobbies, about, additional info), job-search details (desired position, salary,
employment type, schedule, relocation, business travel), Markdown in free-text
fields, four templates, live PDF preview with fit-to-width / fit-to-height /
manual zoom, PDF export, light/dark theme, EN/RU for UI and resume content.

Constraints future work must design within:

- **Offline, always.** No code path may require network access. No telemetry,
  no analytics, no update pings.
- **openhtmltopdf CSS subset.** Templates are not browser pages. Modern CSS
  (flexbox/grid behavior, custom properties, most modern selectors) is not
  reliably available. Template visuals get verified by rendering, never by
  assuming browser behavior.
- **Save-file versioning.** User files on disk are the source of truth. A change
  to the persisted shape needs a migration; the meaning of an existing field is
  never redefined in place.
- **Backend-driven UI.** New form surfaces are declared in
  `backend/src/main/resources/screens/*.json` and rendered by the registry in
  `fieldRegistry.ts`. A bespoke React component is the exception that needs a
  reason.
- **No hardcoded user-visible strings.** Every string is a translation key
  present in every locale file; `TranslationsSchemaTest` enforces it.
- **Bundled dependencies.** Each new dependency ships inside the installer, so
  it must be license-compatible and listed in `THIRD-PARTY-NOTICES.md`.

Undecided (recorded, not invented): user-changeable settings beyond theme and
locale — palette, save directory, default template, default export folder — are
drafted in `SETTINGS_PLAN.md` and not implemented.

## Brand Commitments

Name: **Resume Builder**. Existing icon and installer identity. License:
**MIT + Commons Clause** — source-available, not OSI open source; commercial
sale of the software is excluded, and this is a durable product fact, not a
placeholder.

Voice in the existing copy is plain and instructional, second person, no
marketing register.

## Evidence on Hand

- `app_preview.png` — current main screen, the shipped visual truth.
- `README.md` — feature list and license terms.
- Four real templates with golden HTML/PDF fixtures in
  `backend/src/test/resources/golden`.
- Public releases on GitHub.

No testimonials, user counts, download numbers, benchmarks, press, or case
studies exist. Future work must not fabricate any of them.

## Product Principles

1. **The file outlives the app.** Anything that risks a user's saved resume
   losing meaning is wrong, however convenient.
2. **Design for the user who forgot everything.** The return visit after two
   years is the default case, not the edge case.
3. **The preview is the contract.** Editor and export must never disagree.
4. **Declare, don't hand-build.** New UI arrives as schema and translation keys;
   bespoke components need justification.
5. **Nothing leaves the machine.** Offline is the product, not a limitation to
   be worked around later.

## Accessibility & Inclusion

No product-specific standard was established. Baseline expectation only: the
app is keyboard-navigable, MUI's semantics are not overridden away, and both
themes hold legible contrast — the Catppuccin Latte/Mocha palette in
`src/renderer/theme/colors.ts` is the single source of color truth and any
alternative palette must meet the same contrast floor.
