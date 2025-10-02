import { useCallback, useMemo } from 'react';
import useApi from './useApi';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';

function useSchemaApi() {
  const baseAddress = 'schema/';
  const api = useApi();

  const getHeader = useCallback(async () => {
    return (await api.performGetRequest(
      `${baseAddress}header`,
    )) as SchemaResponseDTO;
  }, [api]);

  const getLanguageDialog = useCallback(async () => {
    return (await api.performGetRequest(
      `${baseAddress}language_dialog`,
    )) as SchemaResponseDTO;
  }, [api]);

  const getMainScreen = useCallback(async () => {
    return (await api.performGetRequest(
      `${baseAddress}main_screen`,
    )) as SchemaResponseDTO;
  }, [api]);

  const getEditScreen = useCallback(
    async (resumeId: string) => {
      return (await api.performGetRequest(
        `${baseAddress}edit_screen/${resumeId}`,
      )) as SchemaResponseDTO;
    },
    [api],
  );

  return useMemo(() => {
    return {
      getHeader,
      getLanguageDialog,
      getMainScreen,
      getEditScreen,
    };
  }, [getHeader, getLanguageDialog, getMainScreen, getEditScreen]);
}

export default useSchemaApi;
