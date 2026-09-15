import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../renderer/App';

const mockGetHeader = jest.fn();
const mockGetLanguageDialog = jest.fn();
const mockGetMainScreen = jest.fn();
const mockGetEditScreen = jest.fn();
const mockGetTemplates = jest.fn();

const mockSchemaApi = {
  getHeader: mockGetHeader,
  getLanguageDialog: mockGetLanguageDialog,
  getMainScreen: mockGetMainScreen,
  getEditScreen: mockGetEditScreen,
  getTemplates: mockGetTemplates,
};
jest.mock('../../renderer/api/useSchemaApi', () => ({
  __esModule: true,
  default: () => mockSchemaApi,
}));

jest.mock('../../renderer/components/ResumePDFPreview');

beforeEach(() => {
  mockGetHeader.mockReset().mockResolvedValue({
    schema: { app_title: 'Resume Builder', menu: [] },
    translations: {},
  });

  mockGetLanguageDialog.mockReset().mockResolvedValue({
    schema: {
      title: 'title_key',
      cancel_key: 'cancel_key',
      save_key: 'save_key',
      save_action: 'set_locale',
    },
    translations: {
      title_key: 'Choose language',
      cancel_key: 'Cancel',
      save_key: 'Save',
    },
    payload: { locales: [], current_locale: 'en' },
  });

  mockGetMainScreen.mockReset().mockResolvedValue({
    schema: {
      resume_menu: {},
      export_button: { key: 'export_key', action: 'export' },
      resume_menu_tooltip_title: 'menu_title',
      create_new: { key: 'create_new_key', action: 'create_new' },
      import_button: { key: 'import_key', action: 'import' },
      empty_state: {
        title: 'empty_title_key',
        subtitle: 'empty_subtitle_key',
      },
    },
    translations: {
      create_new_key: 'New resume',
      import_key: 'Import',
      empty_title_key: 'No resumes yet',
      empty_subtitle_key: 'Create your first resume to get started.',
    },
    payload: [],
  });

  mockGetEditScreen.mockReset();
  mockGetTemplates.mockReset();
});

describe('App', () => {
  it('loads the header and renders the main screen route on start', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Resume Builder')).toBeInTheDocument();
    expect(await screen.findByText('No resumes yet')).toBeInTheDocument();
    expect(mockGetMainScreen).toHaveBeenCalledTimes(1);
  });

  it('keeps every dialog closed on start', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await screen.findByText('No resumes yet');

    expect(screen.queryByText('Choose language')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
