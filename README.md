# 📄 Resume Builder

#### A local-first, block-based resume builder for Windows, macOS, and Linux — built with Electron and Quarkus.

![License](https://img.shields.io/badge/license-MIT%20%2B%20Commons%20Clause-blue)
![Platforms](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

[Key Features](#key-features) • [How to Use](#how-to-use) • [Development](#development) • [Tech Stack](#tech-stack) • [License](#license)

<!-- TODO: add a GIF of the app in action -->
<!-- ![demo](docs/demo.gif) -->

```text
Resume
├── About
├── Contacts
├── Experience
├── Education
├── Skills
├── Languages
└── Additional
```

## Key Features

- **Local-first**
  - Every resume is stored on your own machine — no account, no cloud sync required.
- **Block-based resumes**
  - A resume is a set of independent blocks (experience, education, skills, ...), so new block types don't require rebuilding the editor.
- **Backend-driven UI**
  - Forms are generated from a schema the backend provides, so extending a block doesn't mean hardcoding new UI.
- **PDF export**
  - FreeMarker templates turn your resume data into a polished document.
- **No Java install needed**
  - A portable JRE ships with every installer.
- **Cross-platform**
  - Windows, macOS, and Linux.

## How to Use

Pre-built installers for Windows, macOS, and Linux are published on the [Releases](https://github.com/SlamperBOOM/ResumeBuilder/releases) page. Want to build your own installer instead? Run `package.bat` (Windows) or `package.sh` (macOS/Linux) from the repository root.

## Development

To clone and run the app in development mode, you'll need [Git](https://git-scm.com), [Node.js](https://nodejs.org) 18+, and a [JDK](https://adoptium.net) 17 installed. From your terminal:

```bash
# Clone this repository
$ git clone https://github.com/SlamperBOOM/ResumeBuilder.git
$ cd ResumeBuilder

# Start the backend (Quarkus dev mode)
$ cd backend
$ ./gradlew quarkusDev

# In a second terminal, start the frontend
$ cd frontend/resume-builder-frontend
$ npm install
$ npm start
```

To run tests use

```bash
# backend tests
$ gradlew test

# frontend tests
$
```

Some tests check correct HTML and PDF generation. If you add new template or change existing one, run
```bash
$ gradlew test -Dgolden.update=true
```
This command will update reference HTML and PDF files for test.

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

- `feature request`[Link](https://github.com/SlamperBOOM/ResumeBuilder/issues/new?labels=feature%20request) — if you want to suggest or implement new functionality
- `template request`[Link](https://github.com/SlamperBOOM/ResumeBuilder/issues/new?labels=template%20request) — if you want to add new template
- `bug`[Link](https://github.com/SlamperBOOM/ResumeBuilder/issues/new?labels=bug) — you noticed some functionality not working as intended or just seems strange to you
- `question`[Link](https://github.com/SlamperBOOM/ResumeBuilder/issues/new?labels=question) — if you have any kind of questions about app

## License

MIT + [Commons Clause](https://commonsclause.com/) — see [`LICENSE`](./LICENSE). The code is free to use, modify, and distribute, including commercially; the product itself just can't be resold as-is.

---

GitHub [@SlamperBOOM](https://github.com/SlamperBOOM) · Project: [ResumeBuilder](https://github.com/SlamperBOOM/ResumeBuilder)
