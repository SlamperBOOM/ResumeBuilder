import { useCallback, useMemo } from 'react';
import type { ZodType } from 'zod';
import useApi from './useApi';
import HeaderResponse from '../DTO/HeaderResponse';
import LanguageDialogResponse from '../DTO/LanguageDialogResponse';
import MainScreenResponse from '../DTO/MainScreenResponse';
import EditScreenResponse from '../DTO/EditScreenResponse';
import TemplatesDTO from '../DTO/TemplatesDTO';
import {
  schemaResponseSchema,
  templatesResponseSchema,
} from './apiSchemasValidation';

const baseAddress = 'schema/';

function useSchemaApi() {
  const api = useApi();

  const getSchema = useCallback(
    <T>(path: string, schema: ZodType<unknown>): Promise<T> =>
      api.performGetRequest<T>(`${baseAddress}${path}`, schema),
    [api],
  );

  const getHeader = useCallback(
    () => getSchema<HeaderResponse>('header', schemaResponseSchema),
    [getSchema],
  );

  const getLanguageDialog = useCallback(
    () =>
      getSchema<LanguageDialogResponse>(
        'language_dialog',
        schemaResponseSchema,
      ),
    [getSchema],
  );

  const getMainScreen = useCallback(
    () => getSchema<MainScreenResponse>('main_screen', schemaResponseSchema),
    [getSchema],
  );

  const getEditScreen = useCallback(
    (resumeId: string) =>
      getSchema<EditScreenResponse>(
        `edit_screen/${encodeURIComponent(resumeId)}`,
        schemaResponseSchema,
      ),
    [getSchema],
  );

  const getTemplates = useCallback(
    (resumeId: string) =>
      getSchema<TemplatesDTO>(
        `templates/${encodeURIComponent(resumeId)}`,
        templatesResponseSchema,
      ),
    [getSchema],
  );

  return useMemo(() => {
    return {
      getHeader,
      getLanguageDialog,
      getMainScreen,
      getEditScreen,
      getTemplates,
    };
  }, [
    getHeader,
    getLanguageDialog,
    getMainScreen,
    getEditScreen,
    getTemplates,
  ]);
}

export default useSchemaApi;
