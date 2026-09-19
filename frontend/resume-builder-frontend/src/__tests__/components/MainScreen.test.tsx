import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainScreen from '../../renderer/screens/MainScreen';
import {
  ScreenSource,
  UpdateScreenPayload,
} from '../../renderer/utils/appActions';
import MainScreenResponse from '../../renderer/DTO/MainScreenResponse';
import {
  MainScreenSchema,
  SimpleResume,
} from '../../renderer/utils/backendTypes';
import { makeAppActions } from '../../testUtils/appActions';

jest.mock('../../renderer/components/ResumeCard', () => ({
  __esModule: true,
  ResumeCard: ({ resume }: { resume: SimpleResume }) => (
    <div data-testid={`mock-resume-card-${resume.resume_id}`}>
      {resume.resume_name}
    </div>
  ),
}));

const schema: MainScreenSchema = {
  resume_menu: {},
  export_button: { key: 'export_key', action: 'export' },
  resume_menu_tooltip_title: 'menu_title',
  create_new: { key: 'create_new_key', action: 'create_new' },
  import_button: { key: 'import_key', action: 'import' },
  empty_state: { title: 'empty_title_key', subtitle: 'empty_subtitle_key' },
};

const translations = {
  create_new_key: 'New resume',
  import_key: 'Import',
  empty_title_key: 'No resumes yet',
  empty_subtitle_key: 'Create your first resume to get started.',
};

const emptyResponse: MainScreenResponse = {
  schema,
  translations,
  payload: { resumes: [], on_load_action: undefined },
};

const withResumesResponse: MainScreenResponse = {
  schema,
  translations,
  payload: {
    on_load_action: undefined,
    resumes: [
      {
        resume_id: 'r1',
        resume_name: 'Resume One',
        last_modification_date: '2024-01-01',
        html_preview: '',
        pdf_preview: '',
      },
      {
        resume_id: 'r2',
        resume_name: 'Resume Two',
        last_modification_date: '2024-01-02',
        html_preview: '',
        pdf_preview: '',
      },
    ],
  },
};

function respondingWith(response: MainScreenResponse) {
  return async (payload: UpdateScreenPayload) => {
    if (payload.source === ScreenSource.MAIN) {
      payload.screenUpdateFunction(response);
    }
  };
}

describe('MainScreen', () => {
  it('shows a loading skeleton before the schema resolves', () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(() => new Promise<void>(() => {})),
    });

    render(<MainScreen appActions={appActions} />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows an error state with a Retry button on a rejected load', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(() =>
        Promise.reject(new Error('network down')),
      ),
    });

    render(<MainScreen appActions={appActions} />);

    expect(
      await screen.findByText('Failed to load resumes.'),
    ).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: 'Retry' });

    fireEvent.click(retryButton);

    await waitFor(() =>
      expect(appActions.updateCurrentScreen).toHaveBeenCalledTimes(2),
    );
  });

  it('shows an empty state when the schema has no resumes', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(emptyResponse)),
    });

    render(<MainScreen appActions={appActions} />);

    expect(await screen.findByText('No resumes yet')).toBeInTheDocument();
  });

  it('renders a grid of resume cards when the schema has resumes', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(withResumesResponse)),
    });

    render(<MainScreen appActions={appActions} />);

    expect(
      await screen.findByTestId('mock-resume-card-r1'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-resume-card-r2')).toBeInTheDocument();
  });
});
