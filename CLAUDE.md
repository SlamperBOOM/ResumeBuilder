# Resume Builder — guide for coding agents

Local-first desktop resume builder. Electron + React + TypeScript frontend, Quarkus (Java 17) backend
running as a local HTTP server. No cloud, no account: resumes are files on the user's machine.

Read [`README.md`](./README.md) for the user-facing feature list and the license terms
(MIT + Commons Clause — source-available, not OSI open source).

## Repository layout

```
backend/                                  Quarkus backend (Gradle)
  src/main/java/com/slamperboom/
    Main.java                             Quarkus entry point
    backend/controllers/                  REST endpoints: /check_health, /action/*, /schema/*
    backend/DTO/                          request/response payloads
    bdui/                                 backend-driven UI: builds screens, performs actions, dialogs
    managers/                             SchemaManager, TranslationsManager, TempFilesManager
    resume/blocks/                        block model: ContentType, ContentMapper, IContent, content classes
    resume/saves/                         Resume, ResumeManager, ResumeLoader
    resume/saves/migrations/              save-file schema migrations + MigrationRegistry
    htmlConvertion/                       FreeMarker rendering + openhtmltopdf HTML→PDF
    settings/, utils/, exceptions/
  src/main/resources/
    screens/*.json                        UI schemas sent to the frontend
    templates/                            FreeMarker resume templates + templates.properties + fonts
    translations/                         app_/resume_/help_ translations, one file per locale
    application.properties                Quarkus config (log file, CORS, host 127.0.0.1)
    global_settings.json                  static app settings
  src/test/                               JUnit 5 + REST Assured; golden HTML/PDF in test/resources/golden
  config/config.json                      runtime config (locale, max_response_body_length)
frontend/resume-builder-frontend/         electron-react-boilerplate app
  src/main/                               Electron main process: main.ts, backend-manager.ts, preload.ts
  src/renderer/
    api/                                  HTTP hooks (useApi, useActionApi, useSchemaApi) + schema validation
    components/resume_edit/               FieldRenderer, DynamicBlockFieldRenderer, fieldRegistry.ts
    screens/, dialogs/, DTO/, utils/
  src/__tests__/                          Jest + Testing Library
package.bat / package.sh                  build installers for Windows / macOS+Linux
log_dashboard.py                          renders backend app.log into an HTML dashboard
log_viewer.py / viewer_page.html          indexes a folder of logs into SQLite, serves a filterable UI
```

## Running it

Prerequisites: JDK 17, Node.js 22.12+.

```bash
# terminal 1 — backend
cd backend && ./gradlew quarkusDev        # Windows: .\gradlew.bat quarkusDev

# terminal 2 — frontend
cd frontend/resume-builder-frontend && npm install && npm start
```

- **Set `JAVA_HOME` to a JDK 17** before any Gradle command. The default `java` on some dev machines is
  Java 8 and Gradle fails with a toolchain error.
- In dev mode the Electron main process does **not** spawn the backend (`startBackend` returns early when
  `!app.isPackaged`). It talks to `http://localhost:8080` (`defaultBackendPort` in
  `src/renderer/utils/consts.ts`), so `quarkusDev` must already be running on 8080.
- In a packaged app the main process spawns the bundled JRE with `quarkus-run.jar`, picks a free port
  starting from 8080, and waits for `/check_health`.
- CORS only allows the `app://bundle` origin (see `application.properties`). Changing the renderer origin
  means changing that too.

## Tests

```bash
cd backend && ./gradlew test                            # JUnit
cd frontend/resume-builder-frontend && npm run build && npm test   # Jest needs the prod bundles
```

- Template tests compare rendered HTML and PDF against golden files. After an intentional template change:
  `./gradlew test -Dgolden.update=true` (PowerShell: `.\gradlew.bat test "-Dgolden.update=true"`), then
  review the golden diff before committing.
- `TranslationsSchemaTest` fails when any locale file does not match its `_schema.json`.
- `backendSchemaContract.test.tsx` checks the frontend against the backend's screen schemas — it catches
  schema changes that break rendering.

## Architecture rules to respect

- **Backend-driven UI.** Screens and forms live in `backend/src/main/resources/screens/*.json`. The frontend
  renders them with generic components registered in `fieldRegistry.ts`. Most form changes are JSON-only —
  do not add a bespoke React component when an existing field type fits.
- **Blocks.** A resume is a list of independent blocks. A new block type touches the backend only: a
  `ContentType` value, a content class registered in `ContentMapper`, an entry in `screens/edit_schema.json`,
  translation keys, and markup in each template.
- **Templates.** FreeMarker HTML in `templates/`, registered in `templates.properties` and
  `screens/templates_schema.json`, converted to PDF by openhtmltopdf. openhtmltopdf supports a limited CSS
  subset — verify visually, not by assuming browser CSS works.
- **Save-file versioning.** Every save stores a `schema_version`. A change to the persisted shape needs a new
  `IMigration` in `resume/saves/migrations/` registered in `MigrationRegistry`. Never change the meaning of
  an existing field without a migration — user files on disk are the source of truth.
- **Translations.** Never hardcode user-visible strings. Add the key to the right `_schema.json`, run
  `./gradlew syncTranslations`, fill in every locale. Details:
  [`translations/README.md`](backend/src/main/resources/translations/README.md).

## Conventions

- Backend: Java 17, Lombok, Jackson, package-per-responsibility as above. Quarkus CDI beans, no Spring.
- Frontend: TypeScript, functional React components, MUI, React Hook Form + Zod. Prettier with
  `singleQuote: true`; run `npm run lint` (or `lint:fix`) before finishing frontend work.
- Both app UI and resume content are localized in English and Russian, chosen independently by the user.
- Backend logs to `backend/logs/app.log` in dev. Use `python log_dashboard.py app.log` for a readable
  view of one file, or `python log_viewer.py backend/logs` to browse a whole folder with filters.

## Gotchas

- `backend/saves/`, `backend/files/`, `backend/temp/`, `backend/logs/` are runtime data — do not commit
  changes there. `FileSystemIsolationExtension` swaps these out during tests.
- `/jre`, `/release`, `/.tmp-node`, `/*.html` are gitignored build/output artifacts.
- The app must keep working fully offline. Do not add code paths that require network access.
- New dependencies are bundled in the installer, so each one must be license-compatible and added to
  [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md).
