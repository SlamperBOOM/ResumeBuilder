# Third-Party Notices

Resume Builder is licensed under MIT + Commons Clause (see `LICENSE`). That
license applies only to the original source code of this project. The app
also includes third-party software, fonts and a Java runtime, each of which
remains under its own license. This file lists those components.

In the installed app, license files are located in the `resources` folder
(`Resume Builder.app/Contents/Resources` on macOS):

- `LICENSE`, `THIRD-PARTY-NOTICES.md` — this project;
- `licenses/fonts/` — font licenses;
- `jre/NOTICE`, `jre/legal/` — Java runtime;
- `backend/lib/` — backend libraries, shipped as unmodified JAR files with
  their own license and notice files inside.

On Windows and Linux, electron-builder also places Electron's license and the
Chromium licenses (`LICENSE.electron.txt`, `LICENSES.chromium.html`) next to
the app executable.

## How this list was compiled

Last reviewed on 2026-09-15.

- **Frontend:** every non-dev package in
  `frontend/resume-builder-frontend/package-lock.json` (225 packages, a
  superset of what is actually bundled). Licenses were taken from the lockfile
  or from each installed `package.json`.
- **Backend:** every JAR in `backend/build/quarkus-app/lib` (172 files), which
  is exactly what ships with the app. Licenses were taken from each JAR's POM,
  following parent POMs on Maven Central where needed.
- **Java runtime, fonts, icon:** checked manually. Font licenses were read
  from the font files themselves.

Re-check this list whenever dependencies change.

No component is under a copyleft license that extends to this project's own
code. Weak-copyleft components (LGPL, EPL) are used as unmodified libraries;
see the notes below.

## Application scaffold

This project's frontend was originally bootstrapped from
[electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate),
licensed under the MIT License. The original license and copyright notice
are preserved at `frontend/resume-builder-frontend/LICENSE`.

## Java runtime

- **Eclipse Temurin JRE 17** by the [Adoptium](https://adoptium.net/) project,
  built from OpenJDK. `package.sh` and `package.bat` download the latest
  Temurin 17 GA release at build time.
- License: **GNU General Public License v2.0 with the Classpath Exception**
  (GPLv2+CE). The Classpath Exception means code that merely runs on or links
  against the JRE (this app and its libraries) doesn't have to be released
  under the GPL.
- Source code: [adoptium/jdk17u](https://github.com/adoptium/jdk17u).
- The JRE ships with its own `NOTICE` file and `legal/` directory. Keep them
  as-is when building installers.
- Only the launcher binary is renamed (`resume-builder-backend`,
  `ResumeBuilderBackend.exe` on Windows); the runtime itself is not modified.

## Frontend (npm)

The app's code and its npm dependencies are bundled by webpack. License
comments from bundled packages are preserved in the `*.LICENSE.txt` files
next to the bundles.

| License        | Packages                                                                                                                  |
|----------------|---------------------------------------------------------------------------------------------------------------------------|
| MIT            | 205, including React, React DOM, MUI, Emotion, axios, dayjs, React Hook Form, react-pdf, React Router, Zod, electron-log, electron-store |
| ISC            | 9                                                                                                                         |
| BSD-3-Clause   | 7: hoist-non-react-statics, react-transition-group, source-map, sprintf-js, global-agent, roarr, fast-uri                |
| BSD-2-Clause   | 3: extract-zip, http-cache-semantics, json-schema-typed                                                                   |
| Apache-2.0     | 2: pdfjs-dist (used by react-pdf), sumchecker                                                                             |
| MIT OR CC0-1.0 | 1: type-fest (used under MIT)                                                                                             |

**Electron** (MIT) is the runtime the app ships and runs on. It is declared
in `devDependencies`, so it isn't counted above.

Build-time only, not included in the packaged app:

- **electron-builder** (MIT) — packaging.
- **@electron/notarize** (MIT) — used only by `.erb/scripts/notarize.js`
  during macOS packaging. It is declared in `dependencies`, but the app code
  doesn't import it and `release/app/package.json` has no dependencies, so it
  isn't copied into the app.

## Backend (Java)

| License                                     | Components                                                                                                                                                                                                                                   |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Apache-2.0                                  | Quarkus, SmallRye, Mutiny, Netty, Jackson, JBoss Logging / LogManager / Threads, WildFly Common, Jakarta CDI and Inject APIs, MicroProfile Config and Context Propagation APIs, Apache FreeMarker, Apache PDFBox / FontBox / XmpBox, Apache Commons Logging, brotli4j, pdfbox-graphics2d, JetBrains Annotations |
| Apache-2.0 OR EPL                           | Vert.x (used under Apache-2.0)                                                                                                                                                                                                               |
| BSD-2-Clause                                | flexmark, org-crac                                                                                                                                                                                                                           |
| MIT                                         | jsoup, autolink, SLF4J API                                                                                                                                                                                                                   |
| MIT-0                                       | Reactive Streams                                                                                                                                                                                                                             |
| EDL-1.0 (BSD-3-Clause)                      | Jakarta Activation API, Jakarta XML Binding API                                                                                                                                                                                              |
| Unicode License                             | ICU4J (used by openhtmltopdf for right-to-left text)                                                                                                                                                                                         |
| EPL-2.0 OR GPL-2.0 with Classpath Exception | Jakarta Annotations, Interceptors, Transactions, JSON Processing, Expression Language and RESTful Web Services APIs; Eclipse Parsson                                                                                                          |
| LGPL-2.1-or-later                           | openhtmltopdf (core, pdfbox, rtl-support)                                                                                                                                                                                                    |

Build-time only, not included in the packaged app: **Lombok** (MIT) —
annotation processor.

### openhtmltopdf — LGPL-2.1-or-later

- Shipped as unmodified JAR files loaded as separate libraries, so users can
  replace them with a modified version.
- Source code: [danfickle/openhtmltopdf](https://github.com/danfickle/openhtmltopdf)
  (version 1.0.10).
- Don't repackage the backend into a single uber-jar or shade this library
  without re-checking the LGPL requirements.

### Jakarta APIs and Eclipse Parsson — EPL-2.0

- Dual-licensed; used under EPL-2.0 as unmodified binaries.
- Source code: [jakartaee](https://github.com/jakartaee) and
  [eclipse-ee4j/parsson](https://github.com/eclipse-ee4j/parsson).

## Fonts

Bundled in `backend/src/main/resources/templates/fonts/`, where the resume
templates use them. Full license texts are in `templates/fonts/licenses/` (in
the installed app: `resources/licenses/fonts/`).

The app interface itself is set in Inter. The same variable font file is copied
to `frontend/resume-builder-frontend/assets/fonts/Inter-Variable.ttf` and
bundled into the renderer, so the interface never fetches a webfont and renders
identically offline. It is the same file under the same license
(`templates/fonts/licenses/Inter-OFL.txt`); only the file name differs.

| Font             | License                                                                     |
|------------------|-----------------------------------------------------------------------------|
| Fraunces         | SIL Open Font License 1.1                                                   |
| Inter            | SIL Open Font License 1.1                                                   |
| JetBrains Mono   | SIL Open Font License 1.1                                                   |
| Noto Serif       | SIL Open Font License 1.1                                                   |
| Playfair Display | SIL Open Font License 1.1, Reserved Font Name "Playfair Display"            |
| Roboto (v3)      | SIL Open Font License 1.1                                                   |
| Source Serif 4   | SIL Open Font License 1.1, Reserved Font Name "Source"                      |
| DejaVu Serif     | Bitstream Vera and Arev font licenses; DejaVu changes are in the public domain |

These licenses allow bundling the fonts with the app and embedding them in
exported PDFs. The fonts can't be sold on their own. Modified versions must
be renamed (without using a Reserved Font Name) and released under the same
license.

## Application icon (`frontend/resume-builder-frontend/assets/icon.*`, `assets/icons/*.png`)

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

*Compiled with AI assistance from the project's lockfile and packaged build
output.*
