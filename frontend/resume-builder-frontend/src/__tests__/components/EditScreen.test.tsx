import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditScreen from '../../renderer/screens/EditScreen';
import {
  AppActions,
  ScreenSource,
  UpdateScreenPayload,
} from '../../renderer/utils/appActions';
import { BDU_ACTION_OPEN_MAIN_SCREEN } from '../../renderer/api/useActionApi';
import EditScreenResponse from '../../renderer/DTO/EditScreenResponse';
import { EditScreenSchema } from '../../renderer/utils/backendTypes';
import { makeAppActions } from '../../testUtils/appActions';

jest.mock('../../renderer/components/resume_edit/EditArea', () => ({
  __esModule: true,
  EditArea: () => <div data-testid="mock-edit-area" />,
}));

jest.mock('../../renderer/components/resume_edit/FieldRenderer', () => {
  const { useFormContext } = jest.requireActual('react-hook-form');
  return {
    __esModule: true,
    default: ({ resumeField }: { resumeField: { resume_value: string } }) => {
      const { register } = useFormContext();
      return (
        <input
          aria-label={resumeField.resume_value}
          {...register(resumeField.resume_value)}
        />
      );
    },
  };
});

jest.mock('../../renderer/components/resume_edit/PreviewControls', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-preview-controls" />,
}));

jest.mock('../../renderer/components/ResumePDFPreview');

const schema: EditScreenSchema = {
  edit_area: {
    topbar: {
      to_main_screen_title: 'to_main_key',
      resume_name: {
        type: 'text_input',
        title: 'name_title',
        resume_value: 'resume_name',
      },
      resume_locale: {
        type: 'drop_down_list',
        title: 'locale_title',
        resume_value: 'resume_locale',
        values: { en: 'English' },
        default: 'en',
      },
      template: {
        type: 'template',
        title: 'template_title',
        resume_value: 'template_name',
        template_choose_title: 'choose_template_key',
        close_button_title: 'close_key',
        load_error_key: 'load_error_key',
      },
      export_button: { key: 'export_key', action: 'export' },
    },
    blocks_title: 'blocks_title_key',
    pin_blocks_title: 'pin_key',
    unpin_blocks_title: 'unpin_key',
    block_state_filled_title: 'filled_key',
    block_state_empty_title: 'empty_key',
    preview: {
      scale_title: 'scale_title_key',
      full_width_option_key: 'full_width_key',
      full_height_option_key: 'full_height_key',
      custom_option_key: 'custom_key',
      previous_page_key: 'previous_page_key',
      next_page_key: 'next_page_key',
      zoom_in_key: 'zoom_in_key',
      zoom_out_key: 'zoom_out_key',
      load_error_key: 'preview_load_error_key',
    },
    resume_blocks: {},
  },
};

const editScreenResponse: EditScreenResponse = {
  schema,
  translations: { to_main_key: 'Back to main', export_key: 'Export' },
  payload: {
    resume: {
      resume_id: 'r1',
      resume_name: 'My resume',
      resume_locale: 'en',
      template_name: 'modern',
      blocks: {},
    },
    preview: 'preview.pdf',
  },
};

function respondingWith(response: EditScreenResponse) {
  return async (payload: UpdateScreenPayload) => {
    if (payload.source === ScreenSource.EDIT) {
      payload.screenUpdateFunction(response);
    }
  };
}

function renderScreen(appActions: AppActions) {
  return render(
    <MemoryRouter initialEntries={['/edit/r1']}>
      <Routes>
        <Route
          path="/edit/:resumeId"
          element={<EditScreen appActions={appActions} />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EditScreen', () => {
  it('shows a loading skeleton before the schema resolves', () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(() => new Promise<void>(() => {})),
    });

    renderScreen(appActions);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByTestId('mock-edit-area')).toBeNull();
  });

  it('renders the shell with mocked children once the schema resolves', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(editScreenResponse)),
    });

    renderScreen(appActions);

    expect(await screen.findByTestId('mock-edit-area')).toBeInTheDocument();
    expect(screen.getByTestId('mock-preview-controls')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pdf-preview')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Back to main' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    // The resume name is the top bar's own field, not a second copy of it.
    expect(screen.getByLabelText('resume_name')).toHaveValue('My resume');
    expect(screen.getByLabelText('resume_locale')).toHaveValue('en');
    expect(screen.getByLabelText('template_name')).toHaveValue('modern');
  });

  it('navigates to the main screen when "Back to main" is clicked', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(editScreenResponse)),
    });

    renderScreen(appActions);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Back to main' }),
    );

    expect(appActions.performBduAction).toHaveBeenCalledWith(
      BDU_ACTION_OPEN_MAIN_SCREEN,
      { payload: { resume_id: 'r1' } },
    );
  });

  it('dispatches the export action with the resume id and name when "Export" is clicked', async () => {
    const appActions = makeAppActions({
      updateCurrentScreen: jest.fn(respondingWith(editScreenResponse)),
    });

    renderScreen(appActions);

    fireEvent.click(await screen.findByRole('button', { name: 'Export' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('export', {
      payload: { resume_id: 'r1', resume_name: 'My resume' },
    });
  });
});
