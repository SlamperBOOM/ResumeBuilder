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
    export_button: { key: 'export_key', action: 'export' },
    resume_menu_tooltip_title: 'menu_tooltip_key',
    create_new: { key: 'create_new_key', action: 'create_new' },
    import_button: { key: 'import_key', action: 'import' },
    empty_state: { title: 'empty_title_key', subtitle: 'empty_subtitle_key' },
  },
  translations: {
    rename_key: 'Rename',
    delete_key: 'Delete',
    export_key: 'Export',
    menu_tooltip_key: 'More options',
  },
  payload: [],
};

const resume: SimpleResume = {
  resume_id: 'r1',
  resume_name: 'My resume',
  last_modification_date: '2024-01-01T00:00:00.000Z',
  html_preview: '',
  pdf_preview: 'preview.pdf',
};

describe('ResumeCard', () => {
  it('renders the name and formatted last-modified date', () => {
    render(
      <ResumeCard resume={resume} schema={schema} appActions={makeAppActions()} />,
    );

    expect(screen.getByText('My resume')).toBeInTheDocument();
    expect(
      screen.getByText(new Date(resume.last_modification_date).toLocaleString()),
    ).toBeInTheDocument();
  });

  it('renders the preview when pdf_preview is set', () => {
    render(
      <ResumeCard resume={resume} schema={schema} appActions={makeAppActions()} />,
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
      <ResumeCard resume={resume} schema={schema} appActions={makeAppActions()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'More options' }));

    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('dispatches a menu action with the resume id and closes the menu', async () => {
    const appActions = makeAppActions();
    render(<ResumeCard resume={resume} schema={schema} appActions={appActions} />);

    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('delete', {
      payload: { resume_id: 'r1' },
    });
    await waitFor(() =>
      expect(screen.queryByRole('menuitem', { name: 'Delete' })).toBeNull(),
    );
  });

  it('dispatches the export action with the resume id and name', () => {
    const appActions = makeAppActions();
    render(<ResumeCard resume={resume} schema={schema} appActions={appActions} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('export', {
      payload: { resume_id: 'r1', resume_name: 'My resume' },
    });
  });
});
