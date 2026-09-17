# Translations

Backend translations. Every language has its own file named after the locale code.

```
translations/
├── app_translations/       # app interface: screens, header, dialogs, error messages
│   ├── _schema.json        # every key with an empty value
│   ├── en.json
│   └── ru.json
├── resume_translations/    # text rendered inside the resume: block titles, levels, ...
│   ├── _schema.json
│   ├── en.json
│   └── ru.json
└── help_translations/      # help page and first-run onboarding slides
    ├── _schema.json
    ├── en.json
    └── ru.json
```

`resume_translations` and `help_translations` are passed on as nested JSON (the help page template and the onboarding dialog iterate over their sections), `app_translations` are flattened into `a.b.c` keys. A new help section or onboarding slide is a new key in `_schema.json`, it shows up in the order of the file.

A help section always has `heading` and `body`. On top of that it may have `steps` (numbered list), `items` (bulleted list) and `tip` (highlighted note) — the template renders whichever of them the section has, so a section only gets the ones it needs.

- `_schema.json` is the list of keys every file in its folder must have.
- `TranslationsManager` loads every other `*.json` at startup, so a new file needs no code changes. Files starting with `_` and this README are not packaged into the app.
- If a locale has no file, `en` is used.

Commands below are run from the `backend` folder. On Windows use `.\gradlew.bat` instead of `./gradlew`.

## Adding a new language

Example for German, locale code `de`:

1. Add keys that name the new language to `app_translations/_schema.json`, with empty values:
   - `language_dialog.locale_de` for the app language dialog;
   - `edit_screen.locales.de` for the resume language drop-down.
2. Copy `app_translations/_schema.json` to `app_translations/de.json` and `resume_translations/_schema.json` to `resume_translations/de.json`.
3. Run `./gradlew syncTranslations`. It adds the keys from step 1 to every existing language file.
4. Fill in every empty value: all of `de.json` in both folders, and the new keys in the other languages (`"German"` in `en.json`, `"Немецкий"` in `ru.json`). `git diff` shows where the empty values were added.
5. So the language can be chosen for a resume, add `"de": "locales.de"` to `edit_area.resume_locale.values` in `../screens/edit_schema.json`. The app language dialog lists every language that has a file, so it needs nothing.
6. Run `./gradlew test`. `TranslationsSchemaTest` fails if some file doesn't match its schema.

## Adding a key

1. Add the key to `_schema.json` with an empty value `""`.
2. Run `./gradlew syncTranslations`. Every file in that folder gets the key with `""`; existing values are kept and keys are ordered like the schema.
3. Fill in the new values, `git diff` shows the added keys.

`syncTranslations` never deletes anything. When a file has a key that isn't in the schema (or a value where the schema has an object), it prints a warning with the file and line:

```
WARN: app_translations/ru.json:42 key "edit_screen.foo" is not in the schema. Remove it if it is not needed, or add it to _schema.json and run syncTranslations again.
```

To rename or remove a key, change `_schema.json`, run `./gradlew syncTranslations`, and fix the files the warnings point to.
