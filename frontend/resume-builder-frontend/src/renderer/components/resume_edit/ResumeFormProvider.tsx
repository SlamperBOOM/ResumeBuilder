import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ResumeFormValues, UpdatePayload } from '../../utils/backendTypes';
import EditScreenResponse from '../../DTO/EditScreenResponse';
import { AppActions, ScreenSource } from '../../utils/appActions';
import { BDU_ACTION_UPDATE } from '../../api/useActionApi';
import logger from '../../utils/logger';

// Add additional locales for date here
import 'dayjs/locale/ru';

const AUTOSAVE_DEBOUNCE_MS = 2000;

function buildUpdatePayload(data: ResumeFormValues): UpdatePayload {
  return {
    resume_id: data.resume_id,
    resume_info: {
      resume_name: data.resume_name,
      resume_locale: data.resume_locale,
      template_name: data.template_name,
    },
    content: Object.keys(data.blocks ?? {}).map((blockKey: string) => ({
      block: blockKey,
      payload: data.blocks[blockKey],
    })),
  };
}

export type ResumeFormProviderProps = {
  appActions: AppActions;
  editSchemaResponse: EditScreenResponse;
  setEditSchema: (schema: EditScreenResponse) => void;
  children: ReactNode;
};

/**
 * Owns the resume form and its autosave, so every field of the edit screen —
 * the ones in the top bar as much as the ones inside a block — writes to the
 * same form. Mounted only once the schema has resolved: the form takes its
 * default values from the loaded resume.
 */
export default function ResumeFormProvider(props: ResumeFormProviderProps) {
  const { appActions, editSchemaResponse, setEditSchema, children } = props;
  const { translations } = editSchemaResponse;

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

      logger.debug('Saving resume:', data);
      const updatePayload = buildUpdatePayload(data);
      appActions.performBduAction(BDU_ACTION_UPDATE, {
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

  const flushPendingSave = useCallback(() => {
    if (!debounceRef.current) {
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    methods.handleSubmit(onSubmit)();
  }, [methods, onSubmit]);

  const flushPendingSaveOnUnload = useCallback(() => {
    if (!debounceRef.current) {
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    window.electron.flushResumeSave(buildUpdatePayload(methods.getValues()));
  }, [methods]);

  useEffect(() => {
    const subscription = methods.watch((_values, { type }) => {
      if (type !== 'change') {
        return;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        methods.handleSubmit(onSubmit)();
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    window.addEventListener('beforeunload', flushPendingSaveOnUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', flushPendingSaveOnUnload);
      flushPendingSave();
    };
  }, [methods, onSubmit, flushPendingSave, flushPendingSaveOnUnload]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={translations.locale_name}
        >
          {children}
        </LocalizationProvider>
      </form>
    </FormProvider>
  );
}
