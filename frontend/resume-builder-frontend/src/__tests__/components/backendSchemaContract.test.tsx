import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import useActionApi, {
  BDU_ACTION_UPDATE,
} from '../../renderer/api/useActionApi';
import { EditArea } from '../../renderer/components/resume_edit/EditArea';
import ResumeFormProvider from '../../renderer/components/resume_edit/ResumeFormProvider';
import HeaderWrapper from '../../renderer/components/HeaderWrapper';
import EditScreenResponse from '../../renderer/DTO/EditScreenResponse';
import MainScreenResponse from '../../renderer/DTO/MainScreenResponse';
import MainScreen from '../../renderer/screens/MainScreen';
import {
  AppActions,
  ScreenSource,
  UpdateScreenPayload,
} from '../../renderer/utils/appActions';
import { UpdatePayload } from '../../renderer/utils/backendTypes';
import { Translations } from '../../renderer/utils/translations';
import { makeAppActions } from '../../testUtils/appActions';

// Contract tests: components get the JSON the backend really serves (screen
// schemas, translations, a sample resume) instead of hand-written fixtures,
// so a shape or key drift between the two sides fails here.

jest.mock('../../renderer/components/ResumePDFPreview');

const mockSchemaApi = { getHeader: jest.fn() };
jest.mock('../../renderer/api/useSchemaApi', () => ({
  __esModule: true,
  default: () => mockSchemaApi,
}));

const BACKEND_SRC = path.resolve(__dirname, '../../../../../backend/src');

function readBackendJson(relativePath: string) {
  return JSON.parse(
    fs.readFileSync(path.join(BACKEND_SRC, relativePath), 'utf8'),
  );
}

function readScreen(name: string) {
  return readBackendJson(`main/resources/screens/${name}.json`);
}

const APP_TRANSLATIONS = 'main/resources/translations/app_translations';
const LOCALES = fs
  .readdirSync(path.join(BACKEND_SRC, APP_TRANSLATIONS))
  .filter((file) => file.endsWith('.json') && !file.startsWith('_'))
  .map((file) => path.basename(file, '.json'));
const appTranslations = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    readBackendJson(`${APP_TRANSLATIONS}/${locale}.json`),
  ]),
);

// Screen schema file -> translations section BDUIBuilder serves it with.
const SCREENS: Record<string, string> = {
  main_schema: 'main_screen',
  edit_schema: 'edit_screen',
  header_schema: 'header',
  language_dialog_schema: 'language_dialog',
  templates_schema: 'edit_screen',
};

// Mirrors TranslationsManager.flattenNode: { a: { b: 'x' } } -> { 'a.b': 'x' }
function flatten(node: object, prefix = ''): Translations {
  const result: Translations = {};
  Object.entries(node).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  });
  return result;
}

function translationsFor(section: string, locale = 'en') {
  return {
    ...flatten(appTranslations[locale].common),
    ...flatten(appTranslations[locale][section]),
  };
}

// Every [prop, value] pair of a JSON tree, at any depth.
function entriesDeep(node: unknown): [string, unknown][] {
  if (Array.isArray(node)) return node.flatMap(entriesDeep);
  if (node === null || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) => [
    [key, value] as [string, unknown],
    ...entriesDeep(value),
  ]);
}

// Schema props whose values the frontend passes through translate().
// header_schema.app_title is rendered as-is, so it is not listed.
const TRANSLATED_PROPS = new Set([
  'key',
  'title',
  'subtitle',
  'block_title',
  'display_name',
  'resume_menu_tooltip_title',
  'search_placeholder',
  'no_search_results',
  'to_main_screen_title',
  'blocks_title',
  'pin_blocks_title',
  'unpin_blocks_title',
  'block_hint',
  'template_choose_title',
  'load_error_key',
  'add_button_title',
  'change_button_title',
  'delete_button_title',
  'empty_text_key',
  'scale_title',
  'full_width_option_key',
  'full_height_option_key',
  'custom_option_key',
  'cancel_key',
  'save_key',
]);

function translationKeys(schema: unknown): string[] {
  return entriesDeep(schema)
    .flatMap(([prop, value]) => {
      if (prop === 'values' && value !== null && typeof value === 'object') {
        return Object.values(value); // drop-down option titles
      }
      return TRANSLATED_PROPS.has(prop) && typeof value === 'string'
        ? [value]
        : [];
    })
    .filter((key) => key !== '');
}

describe('backend screen schemas', () => {
  it('reference only BDU actions that useActionApi implements', () => {
    const { result } = renderHook(() => useActionApi());

    const actions = Object.keys(SCREENS).flatMap((name) =>
      entriesDeep(readScreen(name))
        .filter(
          ([prop, value]) =>
            /(^|_)action$/.test(prop) && typeof value === 'string',
        )
        .map(([, value]) => value as string),
    );

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.filter((action) => !(action in result.current))).toEqual([]);
  });

  it.each(LOCALES)(
    'have a "%s" translation for every key they reference',
    (locale) => {
      const missing = Object.entries(SCREENS).flatMap(([name, section]) => {
        const translations = translationsFor(section, locale);
        const keys = translationKeys(readScreen(name));
        if (section === 'language_dialog') {
          // BDUIBuilder.buildLanguageDialog sends a "locale_<code>" key per locale
          keys.push(...LOCALES.map((code) => `locale_${code}`));
        }
        return keys
          .filter((key) => !(key in translations))
          .map((key) => `${section}: ${key}`);
      });

      expect(missing).toEqual([]);
    },
  );

  it.each(LOCALES)(
    'resolve every card tag of a real resume in "%s"',
    (locale) => {
      const { card_tags: cardTags } = readScreen('main_schema');
      const translations = translationsFor('main_screen', locale);
      const resume = readBackendJson(
        'test/resources/sample_resumes/data_analyst.json',
      );

      expect(cardTags.length).toBeGreaterThan(0);
      cardTags.forEach(
        ({
          resume_value: resumeValue,
          key_prefix: keyPrefix,
        }: {
          resume_value: string;
          key_prefix: string;
        }) => {
          expect(typeof resume[resumeValue]).toBe('string');
          expect(
            translations[`${keyPrefix}${resume[resumeValue]}`],
          ).toBeDefined();
        },
      );
    },
  );
});

describe('HeaderWrapper with the real header schema', () => {
  it('shows app_title as-is and a translated button per menu entry', async () => {
    const schema = readScreen('header_schema');
    const translations = translationsFor('header');
    mockSchemaApi.getHeader.mockResolvedValue({ schema, translations });

    render(
      <HeaderWrapper appActions={makeAppActions()}>
        <div />
      </HeaderWrapper>,
    );

    expect(await screen.findByText(schema.app_title)).toBeInTheDocument();
    schema.menu.forEach((button: { key: string }) => {
      expect(
        screen.getByRole('button', { name: translations[button.key] }),
      ).toBeInTheDocument();
    });
  });
});

describe('MainScreen with the real main screen schema', () => {
  // A main screen response carrying one resume, tagged the way BDUIBuilder tags it.
  function mainScreenFor(screenSchema: MainScreenResponse['schema']) {
    const response: MainScreenResponse = {
      schema: screenSchema,
      translations: translationsFor('main_screen'),
      payload: {
        resumes: [
          {
            resume_id: 'r1',
            resume_name: 'My resume',
            last_modification_date: '2024-01-01T00:00:00.000Z',
            html_preview: '',
            pdf_preview: '',
            tags: ['locales.en', 'templates.simple_template'],
          },
        ],
      },
    };
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(async (payload: UpdateScreenPayload) => {
        if (payload.source === ScreenSource.MAIN) {
          payload.screenUpdateFunction(response);
        }
      }),
    });
    return { response, appActions };
  }

  it('renders one menu item per resume_menu entry', async () => {
    const { response, appActions } = mainScreenFor(readScreen('main_schema'));
    const { schema, translations } = response;

    render(<MainScreen appActions={appActions} />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: translations[schema.resume_menu_tooltip_title],
      }),
    );

    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(
      Object.values(schema.resume_menu).map(
        (button) => translations[button.key],
      ),
    );
    expect(schema.resume_menu).not.toHaveProperty('edit');
  });

  it('offers the duplicate action as a button on the sheet', async () => {
    const { response, appActions } = mainScreenFor(readScreen('main_schema'));
    const { schema, translations } = response;
    const duplicate = schema.duplicate_button;

    render(<MainScreen appActions={appActions} />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: translations[duplicate.key],
      }),
    );

    expect(appActions.performBduAction).toHaveBeenCalledWith(duplicate.action, {
      payload: { resume_id: 'r1' },
    });
  });

  it('renders the edit button on the card and resolves the tag keys', async () => {
    const { response, appActions } = mainScreenFor(readScreen('main_schema'));
    const { schema, translations } = response;

    render(<MainScreen appActions={appActions} />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: translations[schema.edit_button.key],
      }),
    );

    expect(appActions.performBduAction).toHaveBeenCalledWith(
      schema.edit_button.action,
      { payload: { resume_id: 'r1' } },
    );
    (response.payload.resumes[0].tags ?? []).forEach((tag) => {
      expect(translations[tag]).toBeDefined();
      expect(screen.getByText(translations[tag])).toBeInTheDocument();
    });
  });
});

describe('EditArea with the real edit schema and a sample resume', () => {
  const schema = readScreen('edit_schema');
  const translations = translationsFor('edit_screen');
  const resume = readBackendJson(
    'test/resources/sample_resumes/data_analyst.json',
  );

  function renderEditArea() {
    const appActions = makeAppActions();
    const response: EditScreenResponse = {
      schema,
      translations,
      payload: { resume, preview: '' },
    };
    render(
      <ResumeFormProvider
        appActions={appActions}
        editSchemaResponse={response}
        setEditSchema={jest.fn()}
      >
        <EditArea editSchemaResponse={response} />
      </ResumeFormProvider>,
    );
    return appActions;
  }

  // The form shows one block at a time; the rail switches to the given one.
  function selectBlock(blockKey: string) {
    const blockTitle =
      translations[schema.edit_area.resume_blocks[blockKey].block_title];
    // The rail row also carries the block's entry count, so it is the start of
    // the accessible name that identifies it.
    fireEvent.click(
      screen.getByRole('button', {
        name: (accessibleName) => accessibleName.startsWith(blockTitle),
      }),
    );
  }

  // Waits out EditArea's 2s autosave debounce, returns saved blocks by name.
  async function saveAndGetBlocks(appActions: AppActions) {
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(appActions.performBduAction).toHaveBeenCalled();
    const [action, params] = (
      appActions.performBduAction as jest.Mock
    ).mock.calls.at(-1);
    expect(action).toBe(BDU_ACTION_UPDATE);
    const { content } = params.payload.update_payload as UpdatePayload;
    return Object.fromEntries(
      content.map(({ block, payload }) => [block, payload]),
    );
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lists every block in the rail and renders the selected one', () => {
    const warnSpy = jest.spyOn(console, 'warn');

    renderEditArea();

    const blocks = Object.values(schema.edit_area.resume_blocks) as {
      block_title: string;
    }[];
    blocks.forEach((block) => {
      expect(
        screen.getAllByText(translations[block.block_title]).length,
      ).toBeGreaterThan(0);
    });

    // The first block is selected by default, the others are not rendered yet.
    expect(
      screen.getByLabelText(translations['main_block.first_name']),
    ).toHaveValue(resume.blocks.MAIN_BLOCK.first_name);
    expect(
      screen.queryByDisplayValue(
        resume.blocks.EXPERIENCE.experiences[1].position,
      ),
    ).toBeNull();

    selectBlock('experience');
    expect(
      screen.getByDisplayValue(
        resume.blocks.EXPERIENCE.experiences[1].position,
      ),
    ).toBeInTheDocument();
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Unknown'),
    );

    warnSpy.mockRestore();
  });

  it('does not save when the user only switches blocks', async () => {
    const appActions = renderEditArea();

    selectBlock('experience');
    selectBlock('contacts');
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Switching registers and unregisters the fields of both blocks, which the
    // form reports like any other change - but the user edited nothing.
    expect(appActions.performBduAction).not.toHaveBeenCalled();
  });

  it('saves an edited block field and leaves the other blocks as loaded', async () => {
    const appActions = renderEditArea();

    fireEvent.change(
      screen.getByLabelText(translations['main_block.first_name']),
      { target: { value: 'Updated' } },
    );
    const blocks = await saveAndGetBlocks(appActions);

    expect(blocks.MAIN_BLOCK).toEqual({
      ...resume.blocks.MAIN_BLOCK,
      first_name: 'Updated',
    });
    expect(blocks.CONTACTS).toEqual(resume.blocks.CONTACTS);
  });

  it('saves an edited field of one dynamic block entry and leaves its siblings as loaded', async () => {
    const appActions = renderEditArea();
    const [first, second] = resume.blocks.EXPERIENCE.experiences;

    selectBlock('experience');
    fireEvent.change(screen.getByDisplayValue(second.position), {
      target: { value: 'Lead Data Analyst' },
    });
    const blocks = await saveAndGetBlocks(appActions);

    expect(blocks.EXPERIENCE).toEqual({
      ...resume.blocks.EXPERIENCE,
      experiences: [first, { ...second, position: 'Lead Data Analyst' }],
    });
  });
});
