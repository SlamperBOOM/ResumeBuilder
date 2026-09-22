# 📄 Resume Builder

#### A local-first resume builder for Windows, macOS, and Linux.

![License](https://img.shields.io/badge/license-MIT%20%2B%20Commons%20Clause-blue)
![Platforms](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

[Key Features](#key-features) • [How to Use](#how-to-use) • [Development](#development) • [Tech Stack](#tech-stack) • [License](#license)

<!-- TODO: add a GIF of the app in action -->
<!-- ![demo](docs/demo.gif) -->

## Key Features

- **Your resumes stay on your computer**
  - Resumes are saved as files on your machine. No account, no cloud, works offline.
- **Live preview**
  - The PDF preview updates as you type. Fit it to the panel's width or height, or set the zoom yourself.
- **4 templates**
  - Simple, Simple divided, Timeline, and Modern. Switch templates at any time without re-entering your data.
- **All the sections a resume needs**
  - Personal info with a photo, contacts, experience, education, advanced training, skills, languages, publications, recommendations, hobbies, about, and additional info.
- **Job search details**
  - Desired position and salary, employment type, work schedule, readiness to relocate or travel for business.
- **Text formatting**
  - Use Markdown in free-text fields: work descriptions, about, hobbies, and additional info.
- **English and Russian**
  - For the app interface and for the resume itself, chosen independently.
- **PDF export**
  - Export your resume to a PDF file ready to send.
- **Import and duplicate**
  - Import a resume file saved by Resume Builder, or duplicate a resume to tailor it for a specific job.
- **No Java install needed**
  - Everything the app needs ships with the installer.

## How to Use

Pre-built installers for Windows, macOS, and Linux are published on the [Releases](https://github.com/SlamperBOOM/ResumeBuilder/releases) page. Want to build your own installer instead? Run `package.bat` (Windows) or `package.sh` (macOS/Linux) from the repository root. The frontend is built with the npm already installed on your system; if you don't have Node.js (or its version is incompatible), pass `--download-npm` to build with a temporary portable copy.

Don't forget to check the **About** section in the app: it provides a full guide to the app's features.

## Development

To clone and run the app in development mode, you'll need [Git](https://git-scm.com), [Node.js](https://nodejs.org) 22.12+, and a [JDK](https://adoptium.net) 17 installed. From your terminal:

```bash
# Clone this repository
git clone https://github.com/SlamperBOOM/ResumeBuilder.git
cd ResumeBuilder

# Start the backend (Quarkus dev mode)
cd backend
./gradlew quarkusDev

# In a second terminal, start the frontend
cd frontend/resume-builder-frontend
npm install
npm start
```

On Windows, use `gradlew.bat` instead of `./gradlew` (`.\gradlew.bat` in PowerShell).

To run tests use

```bash
# backend tests (from the backend folder)
./gradlew test

# frontend tests (from the frontend/resume-builder-frontend folder)
# the tests need the production bundles, so build them before the first run
npm run build
npm test
```

Some tests check correct HTML and PDF generation. If you add new template or change existing one, run from the `backend` folder

```bash
./gradlew test -Dgolden.update=true
```

This command will update reference HTML and PDF files for test. In PowerShell, put the flag in quotes: `.\gradlew.bat test "-Dgolden.update=true"`.

Backend translations are stored in a separate file per language in `backend/src/main/resources/translations/`. See its [README](backend/src/main/resources/translations/README.md) for how to add a language or a translation key.

If you want to check logs in readable format, use `log_dashboard.py`. This script generate you a dashboard from log file. The backend writes its log to `app.log`:

- in dev mode: `backend/logs/app.log`;
- in the installed app: `<resources>/backend/logs/app.log`, where `<resources>` is `<install dir>/resources` on Windows and Linux, and `Resume Builder.app/Contents/Resources` on macOS.

Usage:

```bash
# simple run. Report will be generated to "report.html"
python log_dashboard.py app.log

# provide specific output file for report
python log_dashboard.py app.log -o report.html
```

To browse many log files at once instead of generating one report per file, use `log_viewer.py`. It
indexes a whole folder into a local SQLite database and serves a filterable UI at
`http://127.0.0.1:8777` — time range, level, logger, thread, source file, substring or regex search,
HTTP status and latency. Only the Python standard library is required, nothing to install:

```bash
# index backend/logs and open the browser
python log_viewer.py backend/logs

# several folders at once, on another port
python log_viewer.py backend/logs frontend/logs --port 9000
```

On Windows you can also drag a folder onto `view_logs.bat`. The index (`log_index.db`) is reused
between runs: unchanged files are not parsed again, and the "Reindex folder" button in the UI picks
up files that grew since startup.

If you need backend to truncate less data from responses, adjust `max_response_body_length` param in config file, located at `<resources>/backend/config/config.json` (in dev mode: `backend/config/config.json`).

### Architecture

- **Backend-driven UI**
  - The backend describes screens and forms as JSON schemas (`backend/src/main/resources/screens/`). The frontend renders them with generic field components registered in `fieldRegistry.ts`, so most form changes don't require frontend code changes.
- **Block-based resumes**
  - A resume is a set of independent blocks. Adding a block type only touches the backend: a `ContentType` value, a content class registered in `ContentMapper`, an entry in `screens/edit_schema.json`, translations, and markup in the templates.
- **Templates**
  - FreeMarker HTML templates in `backend/src/main/resources/templates/` (registered in `templates.properties` and `screens/templates_schema.json`) are converted to PDF with openhtmltopdf.
- **Versioned save files**
  - Each resume file stores a `schema_version`. Files saved by older versions are upgraded by migrations in `resume/saves/migrations/`.

## Tech Stack

This software is built on top of:

- [Electron](https://electronjs.org) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) — desktop shell and UI
- [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) — frontend project base
- [MUI](https://mui.com) — component library
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) — forms and validation
- [react-pdf](https://github.com/wojtekmaj/react-pdf) — in-app PDF preview
- [Quarkus](https://quarkus.io) on Java 17 — backend
- [FreeMarker](https://freemarker.apache.org) — resume template rendering
- [openhtmltopdf](https://github.com/danfickle/openhtmltopdf) — HTML → PDF conversion
- [electron-builder](https://www.electron.build) — installers for Windows/macOS/Linux

## Feature Requests

You can create [GitHub Issue](https://github.com/SlamperBOOM/ResumeBuilder/issues) with following labels:

- [`feature request`](https://github.com/SlamperBOOM/ResumeBuilder/issues/new?labels=feature%20request) — if you want to suggest or implement new functionality
- [`template request`](https://github.com/SlamperBOOM/ResumeBuilder/issues/new?labels=template%20request) — if you want to add new template
- [`bug`](https://github.com/SlamperBOOM/ResumeBuilder/issues/new?labels=bug) — you noticed some functionality not working as intended or just seems strange to you
- [`question`](https://github.com/SlamperBOOM/ResumeBuilder/issues/new?labels=question) — if you have any kind of questions about app

## License

MIT + [Commons Clause](https://commonsclause.com/) — see [`LICENSE`](./LICENSE).

- **You can** use the app for free (including for your own job search at work), study the code, modify it, and share it, as long as you keep the license notice.
- **You can't** sell it: you may not offer, for a fee or other consideration, a product or service whose value derives entirely or substantially from this software. That includes paid hosting, paid support or consulting around it, and selling modified builds.

This is a source-available license, not an OSI-approved open-source license.

Third-party components bundled with the app keep their own licenses — see [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md).

By contributing to this project (for example, by opening a pull request), you agree that your contribution is licensed under the same terms.

---

GitHub [@SlamperBOOM](https://github.com/SlamperBOOM) · Project: [ResumeBuilder](https://github.com/SlamperBOOM/ResumeBuilder)
