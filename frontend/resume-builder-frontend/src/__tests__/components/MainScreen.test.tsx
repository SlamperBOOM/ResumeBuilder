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
  edit_button: { key: 'edit_key', action: 'load' },
  export_button: { key: 'export_key', action: 'export' },
  resume_menu_tooltip_title: 'menu_title',
  create_new: { key: 'create_new_key', action: 'create_new' },
  import_button: { key: 'import_key', action: 'import' },
  search_placeholder: 'search_key',
  no_search_results: 'no_results_key',
  card_tags: [],
  empty_state: { title: 'empty_title_key', subtitle: 'empty_subtitle_key' },
};

const translations = {
  create_new_key: 'New resume',
  import_key: 'Import',
  search_key: 'Search by name',
  no_results_key: 'Nothing found',
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
    // Reloads the header too, which is fetched outside this screen.
    expect(appActions.updateScreen).toHaveBeenCalledTimes(1);
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

  it('hides the search field while there are no resumes', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(emptyResponse)),
    });

    render(<MainScreen appActions={appActions} />);

    await screen.findByText('No resumes yet');
    expect(screen.queryByLabelText('Search by name')).toBeNull();
  });

  it('keeps only the resumes matching the search query', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(withResumesResponse)),
    });

    render(<MainScreen appActions={appActions} />);

    fireEvent.change(await screen.findByLabelText('Search by name'), {
      target: { value: 'Two' },
    });

    expect(screen.getByTestId('mock-resume-card-r2')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-resume-card-r1')).toBeNull();
  });

  it('still finds a resume when the query has a typo', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(withResumesResponse)),
    });

    render(<MainScreen appActions={appActions} />);

    fireEvent.change(await screen.findByLabelText('Search by name'), {
      target: { value: 'Resme One' },
    });

    expect(screen.getByTestId('mock-resume-card-r1')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-resume-card-r2')).toBeNull();
  });

  it('reports that nothing matches the search query', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(withResumesResponse)),
    });

    render(<MainScreen appActions={appActions} />);

    fireEvent.change(await screen.findByLabelText('Search by name'), {
      target: { value: 'zzzzzz' },
    });

    expect(screen.getByText('Nothing found')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-resume-card-r1')).toBeNull();
  });
});
