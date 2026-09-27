import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FieldRendererProps } from '../../renderer/utils/resumeBlockTypes';
import { EditArea } from '../../renderer/components/resume_edit/EditArea';
import ResumeFormProvider from '../../renderer/components/resume_edit/ResumeFormProvider';
import { ScreenSource } from '../../renderer/utils/appActions';
import { BDU_ACTION_UPDATE } from '../../renderer/api/useActionApi';
import EditScreenResponse from '../../renderer/DTO/EditScreenResponse';
import { EditScreenSchema } from '../../renderer/utils/backendTypes';
import { makeAppActions } from '../../testUtils/appActions';

jest.mock('../../renderer/components/resume_edit/FieldRenderer', () => {
  const { useFormContext } = jest.requireActual('react-hook-form');
  return {
    __esModule: true,
    default: ({ resumeField, fieldNameOverride }: FieldRendererProps) => {
      const { register } = useFormContext();
      const name =
        fieldNameOverride ??
        (resumeField as { resume_value: string }).resume_value;
      return <input aria-label={name} {...register(name)} />;
    },
  };
});

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
    resume_blocks: {
      personal: {
        block_title: 'personal_block_title',
        block_hint: 'personal_block_hint',
        full_name: {
          type: 'text_input',
          title: 'full_name_title',
          resume_value: 'blocks.personal.full_name',
        },
      },
      experience: {
        block_title: 'experience_block_title',
        block_hint: '',
        company: {
          type: 'text_input',
          title: 'company_title',
          resume_value: 'blocks.experience.company',
        },
      },
    },
  },
};

const translations = {
  personal_block_title: 'Personal',
  filled_key: 'filled in',
  empty_key: 'empty',
  experience_block_title: 'Experience',
  personal_block_hint: 'What belongs in this block',
  blocks_title_key: 'Blocks',
  pin_key: 'Pin the block list',
  unpin_key: 'Collapse the block list',
};

const response: EditScreenResponse = {
  schema,
  translations,
  payload: {
    resume: {
      resume_id: 'r1',
      resume_name: 'My resume',
      resume_locale: 'en',
      template_name: 'modern',
      blocks: {
        personal: { '@type': 'personal', full_name: 'Jane Doe' },
        experience: { '@type': 'experience', company: 'Acme' },
      },
    },
    preview: 'preview.pdf',
  },
};

function renderEditArea(setEditSchema = jest.fn()) {
  const appActions = makeAppActions();
  const view = render(
    <ResumeFormProvider
      appActions={appActions}
      editSchemaResponse={response}
      setEditSchema={setEditSchema}
    >
      <EditArea editSchemaResponse={response} />
    </ResumeFormProvider>,
  );
  return { appActions, setEditSchema, unmount: view.unmount };
}

describe('EditArea', () => {
  it('renders only the selected block, with its hint', () => {
    renderEditArea();

    expect(
      screen.getByRole('heading', { name: 'Personal' }),
    ).toBeInTheDocument();
    expect(screen.getByText('What belongs in this block')).toBeInTheDocument();
    expect(screen.getByLabelText('blocks.personal.full_name')).toHaveValue(
      'Jane Doe',
    );
    expect(screen.queryByLabelText('blocks.experience.company')).toBeNull();
  });

  it('switches the shown block when the rail selection changes', () => {
    renderEditArea();

    fireEvent.click(
      screen.getByRole('button', { name: /experience_block_title|Experience/ }),
    );

    expect(screen.getByLabelText('blocks.experience.company')).toHaveValue(
      'Acme',
    );
    expect(screen.queryByLabelText('blocks.personal.full_name')).toBeNull();
    // The block carries no hint, so no empty line is left behind for it.
    expect(screen.queryByText('What belongs in this block')).toBeNull();
  });

  it('collapses the rail to a strip and pins it back', () => {
    renderEditArea();

    expect(screen.getByText('Blocks')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse the block list' }),
    );

    expect(screen.queryByText('Blocks')).toBeNull();
    // The row names its own state, so the accessible name is not bare.
    expect(
      screen.getByRole('button', { name: 'Personal, filled in' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pin the block list' }));

    expect(screen.getByText('Blocks')).toBeInTheDocument();
  });

  it('saves a change still inside the debounce window when the screen closes', async () => {
    const { appActions, unmount } = renderEditArea();

    fireEvent.change(screen.getByLabelText('blocks.personal.full_name'), {
      target: { value: 'Typed and left at once' },
    });

    expect(appActions.performBduAction).not.toHaveBeenCalled();

    // react-hook-form validates before it submits, so the write lands a
    // microtask after the screen is gone.
    await act(async () => {
      unmount();
    });

    expect(appActions.performBduAction).toHaveBeenCalledWith(
      BDU_ACTION_UPDATE,
      expect.objectContaining({
        payload: expect.objectContaining({
          update_payload: expect.objectContaining({
            content: expect.arrayContaining([
              {
                block: 'personal',
                payload: {
                  '@type': 'personal',
                  full_name: 'Typed and left at once',
                },
              },
            ]),
          }),
        }),
      }),
    );
  });

  it('hands a pending change to the main process when the window closes', () => {
    const flushResumeSave = jest.fn();
    (
      window as unknown as { electron: { flushResumeSave: jest.Mock } }
    ).electron = { flushResumeSave };
    const { appActions } = renderEditArea();

    fireEvent.change(screen.getByLabelText('blocks.personal.full_name'), {
      target: { value: 'Typed and quit at once' },
    });
    fireEvent(window, new Event('beforeunload'));

    // The request outlives the window only from the main process.
    expect(appActions.performBduAction).not.toHaveBeenCalled();
    expect(flushResumeSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.arrayContaining([
          {
            block: 'personal',
            payload: {
              '@type': 'personal',
              full_name: 'Typed and quit at once',
            },
          },
        ]),
      }),
    );
  });

  it('auto-saves through performBduAction 2s after the user stops typing', async () => {
    jest.useFakeTimers();
    const setEditSchema = jest.fn();
    const { appActions } = renderEditArea(setEditSchema);

    fireEvent.change(screen.getByLabelText('blocks.personal.full_name'), {
      target: { value: 'Updated name' },
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(appActions.performBduAction).toHaveBeenCalledWith(
      BDU_ACTION_UPDATE,
      {
        payload: {
          update_payload: {
            resume_id: 'r1',
            resume_info: {
              resume_name: 'My resume',
              resume_locale: 'en',
              template_name: 'modern',
            },
            content: [
              {
                block: 'personal',
                payload: { '@type': 'personal', full_name: 'Updated name' },
              },
              {
                block: 'experience',
                payload: response.payload.resume.blocks.experience,
              },
            ],
          },
        },
        updateScreenPayload: {
          source: ScreenSource.EDIT,
          screenUpdateFunction: setEditSchema,
          resumeId: 'r1',
        },
      },
    );

    jest.useRealTimers();
  });

  it('resets the debounce timer on further changes instead of stacking submits', async () => {
    jest.useFakeTimers();
    const { appActions } = renderEditArea();

    const input = screen.getByLabelText('blocks.personal.full_name');
    fireEvent.change(input, { target: { value: 'First' } });
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    fireEvent.change(input, { target: { value: 'Second' } });
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(appActions.performBduAction).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(appActions.performBduAction).toHaveBeenCalledTimes(1);
    const [, params] = (appActions.performBduAction as jest.Mock).mock.calls[0];
    expect(params.payload.update_payload.content[0].payload.full_name).toBe(
      'Second',
    );

    jest.useRealTimers();
  });
});
