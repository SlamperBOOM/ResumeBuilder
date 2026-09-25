import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResumeCard } from '../../renderer/components/ResumeCard';
import { SimpleResume } from '../../renderer/utils/backendTypes';
import MainScreenResponse from '../../renderer/DTO/MainScreenResponse';
import { makeAppActions } from '../../testUtils/appActions';

jest.mock('../../renderer/components/ResumePDFPreview');

const schema: MainScreenResponse = {
  schema: {
    resume_menu: {
      rename: { key: 'rename_key', action: 'rename' },
      delete: { key: 'delete_key', action: 'delete' },
    },
    edit_button: { key: 'edit_key', action: 'load' },
    duplicate_button: { key: 'duplicate_key', action: 'duplicate' },
    export_button: { key: 'export_key', action: 'export' },
    resume_menu_tooltip_title: 'menu_tooltip_key',
    create_new: { key: 'create_new_key', action: 'create_new' },
    import_button: { key: 'import_key', action: 'import' },
    search_placeholder: 'search_key',
    no_search_results: 'no_results_key',
    card_tags: [],
    empty_state: { title: 'empty_title_key', subtitle: 'empty_subtitle_key' },
  },
  translations: {
    rename_key: 'Rename',
    delete_key: 'Delete',
    edit_key: 'Edit',
    duplicate_key: 'Duplicate',
    export_key: 'Export',
    menu_tooltip_key: 'More options',
    locales_ru_key: 'Russian',
    template_key: 'Modern template',
  },
  payload: { resumes: [], on_load_action: undefined },
};

const resume: SimpleResume = {
  resume_id: 'r1',
  resume_name: 'My resume',
  last_modification_date: '2024-01-01T00:00:00.000Z',
  modified_label: '3 days ago',
  html_preview: '',
  pdf_preview: 'preview.pdf',
  tags: ['locales_ru_key', 'template_key'],
};

describe('ResumeCard', () => {
  it('renders the name and the label the backend formatted', () => {
    render(
      <ResumeCard
        resume={resume}
        schema={schema}
        appActions={makeAppActions()}
      />,
    );

    expect(screen.getByText('My resume')).toBeInTheDocument();
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('renders the preview when pdf_preview is set', () => {
    render(
      <ResumeCard
        resume={resume}
        schema={schema}
        appActions={makeAppActions()}
      />,
    );

    expect(screen.getByTestId('mock-pdf-preview')).toBeInTheDocument();
  });

  it('skips the preview when pdf_preview is empty', () => {
    render(
      <ResumeCard
        resume={{ ...resume, pdf_preview: '' }}
        schema={schema}
        appActions={makeAppActions()}
      />,
    );

    expect(screen.queryByTestId('mock-pdf-preview')).toBeNull();
  });

  it('opens the menu with one translated item per resume_menu entry', () => {
    render(
      <ResumeCard
        resume={resume}
        schema={schema}
        appActions={makeAppActions()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'More options' }));

    expect(
      screen.getByRole('menuitem', { name: 'Rename' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Delete' }),
    ).toBeInTheDocument();
  });

  it('dispatches a menu action with the resume id and closes the menu', async () => {
    const appActions = makeAppActions();
    render(
      <ResumeCard resume={resume} schema={schema} appActions={appActions} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('delete', {
      payload: { resume_id: 'r1' },
    });
    await waitFor(() =>
      expect(screen.queryByRole('menuitem', { name: 'Delete' })).toBeNull(),
    );
  });

  it('renders one chip per tag', () => {
    render(
      <ResumeCard
        resume={resume}
        schema={schema}
        appActions={makeAppActions()}
      />,
    );

    expect(screen.getByText('Russian')).toBeInTheDocument();
    expect(screen.getByText('Modern template')).toBeInTheDocument();
  });

  it('renders no chips when the resume has no tags', () => {
    render(
      <ResumeCard
        resume={{ ...resume, tags: [] }}
        schema={schema}
        appActions={makeAppActions()}
      />,
    );

    expect(screen.queryByText('Russian')).toBeNull();
  });

  it('opens the resume when the sheet itself is clicked', () => {
    const appActions = makeAppActions();
    render(
      <ResumeCard resume={resume} schema={schema} appActions={appActions} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'My resume' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('load', {
      payload: { resume_id: 'r1' },
    });
  });

  it('dispatches the edit action from the sheet action bar, not the menu', () => {
    const appActions = makeAppActions();
    render(
      <ResumeCard resume={resume} schema={schema} appActions={appActions} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('load', {
      payload: { resume_id: 'r1' },
    });
  });

  it('dispatches the duplicate action from the sheet action bar', () => {
    const appActions = makeAppActions();
    render(
      <ResumeCard resume={resume} schema={schema} appActions={appActions} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('duplicate', {
      payload: { resume_id: 'r1' },
    });
  });

  it('dispatches the export action with the resume id and name', () => {
    const appActions = makeAppActions();
    render(
      <ResumeCard resume={resume} schema={schema} appActions={appActions} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('export', {
      payload: { resume_id: 'r1', resume_name: 'My resume' },
    });
  });
});
