import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FieldRendererProps } from '../../renderer/utils/resumeBlockTypes';
import { EditArea } from '../../renderer/components/EditArea';
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

jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeBlock',
  () => ({
    __esModule: true,
    default: ({ schema }: { schema: { block_title: string } }) => (
      <div data-testid={`mock-resume-block-${schema.block_title}`} />
    ),
  }),
);

const schema: EditScreenSchema = {
  edit_area: {
    to_main_screen_title: 'to_main_key',
    export_button: { key: 'export_key', action: 'export' },
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
    },
    preview: {
      scale_title: 'scale_title_key',
      full_width_option_key: 'full_width_key',
      full_height_option_key: 'full_height_key',
      custom_option_key: 'custom_key',
    },
    resume_blocks: {
      personal: { block_title: 'personal_block_title' },
      experience: { block_title: 'experience_block_title' },
    },
  },
};

const response: EditScreenResponse = {
  schema,
  translations: {},
  payload: {
    resume: {
      resume_id: 'r1',
      resume_name: 'My resume',
      resume_locale: 'en',
      template_name: 'modern',
      blocks: {
        personal: { '@type': 'personal', full_name: 'Jane Doe' },
        experience: { '@type': 'experience' },
      },
    },
    preview: 'preview.pdf',
  },
};

describe('EditArea', () => {
  it('renders the top-level fields and one block per resume block', () => {
    render(
      <EditArea
        appActions={makeAppActions()}
        editSchemaResponse={response}
        setEditSchema={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('resume_name')).toHaveValue('My resume');
    expect(screen.getByLabelText('resume_locale')).toHaveValue('en');
    expect(screen.getByLabelText('template_name')).toHaveValue('modern');
    expect(
      screen.getByTestId('mock-resume-block-personal_block_title'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('mock-resume-block-experience_block_title'),
    ).toBeInTheDocument();
  });

  it('auto-saves through performBduAction 2s after the user stops typing', async () => {
    jest.useFakeTimers();
    const appActions = makeAppActions();
    const setEditSchema = jest.fn();

    render(
      <EditArea
        appActions={appActions}
        editSchemaResponse={response}
        setEditSchema={setEditSchema}
      />,
    );

    fireEvent.change(screen.getByLabelText('resume_name'), {
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
              resume_name: 'Updated name',
              resume_locale: 'en',
              template_name: 'modern',
            },
            content: [
              {
                block: 'personal',
                payload: response.payload.resume.blocks.personal,
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
    const appActions = makeAppActions();

    render(
      <EditArea
        appActions={appActions}
        editSchemaResponse={response}
        setEditSchema={jest.fn()}
      />,
    );

    const input = screen.getByLabelText('resume_name');
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
    expect(params.payload.update_payload.resume_info.resume_name).toBe(
      'Second',
    );

    jest.useRealTimers();
  });
});
