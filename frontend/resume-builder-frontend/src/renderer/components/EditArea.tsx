import { useForm, FormProvider } from 'react-hook-form';
import { useCallback, useEffect, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  EditScreenSchema,
  ResumeFormValues,
  UpdatePayload,
} from '../utils/backendTypes';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';
import FieldRenderer from './FieldRenderer';
import ResumeBlock from './input_components/ResumeBlock';
import { AppActions, ScreenSource } from '../utils/appActions';

// Add additional locales for date here
import 'dayjs/locale/ru';

export type EditAreaProps = {
  appActions: AppActions;
  editSchemaResponse: SchemaResponseDTO;
  setEditSchema: (schema: SchemaResponseDTO) => void;
};

export function EditArea(props: EditAreaProps) {
  const { appActions, editSchemaResponse, setEditSchema } = props;
  const editSchema = editSchemaResponse.schema as EditScreenSchema;

  const { translations } = editSchemaResponse;
  const resumeId = editSchemaResponse.payload.resume.resume_id;

  const methods = useForm({
    defaultValues: editSchemaResponse.payload.resume,
    mode: 'onChange',
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const onSubmit = useCallback(
    (data: ResumeFormValues) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      console.log('Saving resume: ', data);
      const updatePayload: UpdatePayload = {
        resume_id: data.resume_id,
        resume_info: {
          resume_name: data.resume_name,
          resume_locale: data.resume_locale,
          template_name: data.template_name,
        },
        content: [],
      };

      Object.keys(data.blocks ?? {}).forEach((blockKey: string) => {
        const block = data.blocks[blockKey];
        updatePayload.content.push({
          block: blockKey,
          payload: block,
        });
      });
      appActions.performBduAction('update', {
        payload: { update_payload: updatePayload },
        updateScreenPayload: {
          source: ScreenSource.EDIT,
          screenUpdateFunction: setEditSchema,
          resumeId: data.resume_id,
        },
      });
    },
    [appActions, setEditSchema],
  );

  useEffect(() => {
    const subscription = methods.watch(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        methods.handleSubmit(onSubmit)();
      }, 2000);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [methods, onSubmit]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={translations.locale_name}
        >
          <FieldRenderer
            resumeField={editSchema.edit_area.resume_name}
            translations={translations}
            resumeId={resumeId}
          />
          <FieldRenderer
            resumeField={editSchema.edit_area.resume_locale}
            translations={translations}
            resumeId={resumeId}
          />
          <FieldRenderer
            resumeField={editSchema.edit_area.template}
            translations={translations}
            resumeId={resumeId}
          />
          {Object.keys(editSchema.edit_area.resume_blocks).map(
            (block_key: string) => {
              const block = editSchema.edit_area.resume_blocks[block_key];
              return (
                <ResumeBlock
                  key={block_key}
                  schema={block}
                  translations={translations}
                  resumeId={resumeId}
                />
              );
            },
          )}
        </LocalizationProvider>
      </form>
    </FormProvider>
  );
}
