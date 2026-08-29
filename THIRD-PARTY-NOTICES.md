# Third-Party Notices

Resume Builder is licensed under MIT + Commons Clause (see `LICENSE`). That
license applies only to the original source code of this project. This
project also includes, or is built on top of, third-party open-source
software and a bundled Java runtime, each of which remains under its own
license. This file lists those components as required by their respective
licenses.

## Scope and methodology

This list was compiled manually from:

- the production `dependencies` in
  `frontend/resume-builder-frontend/package.json` (the set actually bundled
  into the packaged app via the `files`/`extraResources` config);
- the `runtimeClasspath` of `backend/build.gradle` (test-only dependencies
  such as JUnit, Mockito and REST-Assured are not distributed and are
  therefore not listed);
- the bundled Eclipse Temurin JRE under `jre/<platform>-<arch>`.

**It only covers direct dependencies and has not been verified by an
automated license scanner.** Both the frontend and backend pull in
transitive dependencies that are not individually enumerated here — for
example, Quarkus's RESTEasy Reactive stack transitively bundles Vert.x,
Netty, SmallRye and Jakarta API artifacts (almost all Apache License 2.0).
Before a public release, this list **must** be cross-checked with:

- Frontend: `npx license-checker --production --summary` (run from
  `frontend/resume-builder-frontend`)
- Backend: the Gradle plugin `com.github.jk1.dependency-license-report`

The audit should cover the actual packaged application, not just the
dependency manifests.

## Application scaffold

This project's frontend was originally bootstrapped from
[electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate),
licensed under the MIT License. The original license and copyright notice
are preserved at `frontend/resume-builder-frontend/LICENSE`.

## Bundled Java Runtime

Resume Builder bundles a full Java Runtime Environment for each target
platform (`jre/win-x64`, `jre/linux-x64`, …) so end users do not need to
install Java themselves.

- **Eclipse Temurin JRE 17** (currently `17.0.20.1+1`), built by the
  [Adoptium](https://adoptium.net/) project from OpenJDK.
- License: **GNU General Public License v2.0 with the Classpath Exception**
  (GPLv2+CE). The Classpath Exception means code that merely *links
  against* the JRE (this application's own code and its other
  dependencies) is not required to be released under the GPL.
- Each platform's JRE ships with its own `NOTICE` file and a `legal/`
  directory containing per-module license and notice files
  (`jre/<platform>-<arch>/legal/...`). These are part of the official
  Adoptium/OpenJDK distribution and **must be preserved as-is** in the
  packaged output — do not strip or prune the `legal/` directory when
  building installers.

## Frontend (npm) — runtime dependencies

Production `dependencies` that ship inside the packaged application.

### MIT License

- React, React DOM
- @mui/material, @mui/icons-material, @mui/x-date-pickers (Community/MIT edition)
- @emotion/react, @emotion/styled
- axios
- dayjs
- detect-port
- electron-debug
- electron-log
- electron-router-dom
- electron-window-state
- json-diff-ts
- mui-image
- react-hook-form
- react-pdf
- react-resizable-panels
- react-router-dom
- zod

### Electron

- **Electron** — MIT License. Electron is the runtime shell the packaged
  app ships and runs on, so it is treated as a runtime component (not a
  build tool), even though it is declared as a `devDependency` in
  `package.json`.

## Frontend (npm) — build-time only

Not present in the final packaged application; listed here only because
their tooling touches the release artifacts.

- **electron-builder** (MIT License) — packaging tool only.
- **@electron/notarize** (MIT License) — invoked only by the macOS
  `afterSign` notarization script. It is currently declared under
  `dependencies` rather than `devDependencies` in `package.json`; verify it
  is actually excluded from the packaged `node_modules` (or move it to
  `devDependencies`) so this classification stays accurate.

## Backend (Gradle) — runtime dependencies

### Apache License 2.0

- Quarkus 3.7.3 (quarkus-resteasy-reactive-jackson and core artifacts,
  plus their transitive runtime stack — Vert.x, Netty, SmallRye, Jakarta
  APIs, etc.; enumerate exactly via the dependency-license-report plugin
  before release)
- Jackson (jackson-databind, jackson-datatype-jsr310)
- Apache FreeMarker

### MIT License

- jsoup

### BSD-2-Clause License

- flexmark-all

### GNU LGPL v2.1-or-later ⚠️

- **openhtmltopdf-pdfbox** — this component is licensed under the LGPL,
  which is a copyleft license and imposes obligations independent of this
  project's own license:
  - the LGPL notice and license text for this component must be preserved;
  - users must be able to obtain the source of this component and to
    replace/relink it with a modified or different version. Because it is
    consumed as an ordinary external JAR dependency (not statically linked
    or repackaged into a single fat class), this condition is satisfied by
    default — just don't shade/relocate this dependency into your own
    package namespace without re-checking this requirement.
  - **Transitive dependencies:** openhtmltopdf-pdfbox pulls in Apache
    PDFBox and Apache FontBox, both Apache License 2.0 (not LGPL
    themselves), plus their own transitive dependencies (e.g.
    commons-logging). Confirm the exact set with the
    dependency-license-report plugin, since PDFBox's transitive graph can
    change between versions.

## Backend (Gradle) — build-time only

Not present in the runtime output.

- **Lombok** (MIT License) — annotation processor only
  (`compileOnly`/`annotationProcessor`), not bundled in the built JAR.

## Bundled assets

### Fonts (`backend/src/main/resources/templates/fonts/`)

These were sourced from [Google Fonts](https://fonts.google.com/). That
holds for six of the seven families, all released under the **SIL Open
Font License 1.1**, except Roboto, which Google Fonts itself distributes
under **Apache License 2.0** rather than OFL:

- Fraunces — SIL Open Font License 1.1
- Inter — SIL Open Font License 1.1
- JetBrains Mono — SIL Open Font License 1.1
- Noto Serif — SIL Open Font License 1.1
- Playfair Display — SIL Open Font License 1.1
- Source Serif 4 — SIL Open Font License 1.1
- **Roboto — Apache License 2.0
- DejaVu — Bitstream Vera Fonts
  Copyright + Arev Fonts Copyright, with DejaVu's own additions in the
  public domain. [link](https://dejavu-fonts.github.io/License.html)

All of the OFL/Apache fonts above permit embedding in a distributed
application without a separate written agreement. For the OFL fonts
specifically: the font files must keep their names, they can't be sold
by themselves (only as part of the app), and a modified version would
need to be renamed and re-released under the OFL.

### Application icon (`frontend/resume-builder-frontend/assets/icon.*`, `assets/icons/*.png`)

Generated with an AI image-generation tool (ChatGPT). Two
things worth flagging here, rather than a conventional license entry:

- **Tool terms of service**: commercial-use and ownership terms for
  AI-generated output vary by provider and change over time. Check the
  specific tool's current ToS for commercial/redistribution rights before
  relying on this icon in a public release.
- **Copyright status of AI-generated images is unsettled** in several
  jurisdictions (e.g. the US Copyright Office has taken the position that
  purely machine-generated images without sufficient human creative
  authorship may not be copyrightable). This mainly matters if Resume
  Builder ever needs to assert exclusive ownership of the icon; it does
  not create an obligation toward a third party the way a licensed asset
  would.

---

*This file was generated with AI assistance based on a manual read of the
project's dependency manifests and bundled runtimes*
