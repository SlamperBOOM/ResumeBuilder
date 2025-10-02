import axios from 'axios';
import { useCallback, useMemo } from 'react';
import ActionResponseDTO from '../DTO/ActionResponseDTO';
import { backendPort } from '../utils/consts';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';

function useApi() {
  const baseAddress = `http://localhost:${backendPort}/`;

  const performGetRequest = useCallback(
    async (url: string) => {
      return (
        await axios.get(baseAddress + url).catch((response) => {
          throw new Error(response.response.data);
        })
      ).data as ActionResponseDTO | SchemaResponseDTO;
    },
    [baseAddress],
  );

  const performPostRequest = useCallback(
    async (url: string, body: unknown) => {
      return (
        await axios.post(baseAddress + url, body).catch((response) => {
          throw new Error(response.response.data);
        })
      ).data as ActionResponseDTO;
    },
    [baseAddress],
  );

  const performDeleteRequest = useCallback(
    async (url: string) => {
      return (
        await axios.delete(baseAddress + url).catch((response) => {
          throw new Error(response.response.data);
        })
      ).data as ActionResponseDTO;
    },
    [baseAddress],
  );

  return useMemo(() => {
    return {
      performGetRequest,
      performPostRequest,
      performDeleteRequest,
    };
  }, [performGetRequest, performPostRequest, performDeleteRequest]);
}

export default useApi;
