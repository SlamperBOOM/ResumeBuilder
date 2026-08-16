import { useCallback, useMemo } from 'react';
import useApi from './useApi';
import ActionResponseDTO from '../DTO/ActionResponseDTO';
import { BDUActionPayload } from '../utils/backendTypes';

type BDUActionApi = {
  [action: string]: (
    payload?: BDUActionPayload,
  ) => Promise<ActionResponseDTO | null>;
};

function useActionApi() {
  const baseAddress = 'action/';
  const api = useApi();

  const performExit = useCallback(
    async (_payload?: BDUActionPayload) => {
      return (await api.performPostRequest(
        `${baseAddress}exit`,
        null,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performOpenSaveDir = useCallback(
    async (_payload?: BDUActionPayload) => {
      await api.performGetRequest(`${baseAddress}open_save_dir`);
      return null;
    },
    [api],
  );

  const performOpenLocalDir = useCallback(
    async (payload?: BDUActionPayload) => {
      await api.performPostRequest(`${baseAddress}open_local_dir`, {
        dir_path: payload?.local_dir_path,
      });
      return null;
    },
    [api],
  );

  const performAbout = useCallback(
    async (_payload?: BDUActionPayload) => {
      return (await api.performGetRequest(
        `${baseAddress}about`,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performGetLocales = useCallback(
    async (_payload?: BDUActionPayload) => {
      return (await api.performGetRequest(
        `${baseAddress}locales`,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performChangeLocale = useCallback(
    async (payload: BDUActionPayload) => {
      if (!payload?.locale) {
        console.log('No locale set');
        return null;
      }
      return (await api.performPostRequest(
        `${baseAddress}locale/set/${encodeURIComponent(payload.locale)}`,
        null,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performCreateNew = useCallback(
    async (_payload: BDUActionPayload) => {
      return (await api.performPostRequest(
        `${baseAddress}create_new`,
        null,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performDuplicate = useCallback(
    async (payload: BDUActionPayload) => {
      if (!payload?.resume_id) {
        console.log('No resume id');
        return null;
      }
      return (await api.performPostRequest(
        `${baseAddress}duplicate/${encodeURIComponent(payload.resume_id)}`,
        null,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performDelete = useCallback(
    async (payload: BDUActionPayload) => {
      if (!payload?.resume_id) {
        console.log('No resume id');
        return null;
      }
      return (await api.performDeleteRequest(
        `${baseAddress}delete/${encodeURIComponent(payload.resume_id)}`,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performConfirmDelete = useCallback(
    async (payload: BDUActionPayload) => {
      if (!payload?.resume_id) {
        console.log('No resume id');
        return null;
      }
      return (await api.performDeleteRequest(
        `${baseAddress}delete/confirm/${encodeURIComponent(payload.resume_id)}`,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performUpdate = useCallback(
    async (payload: BDUActionPayload) => {
      if (!payload?.update_payload) {
        console.log('No data for update');
        return null;
      }
      return (await api.performPostRequest(
        `${baseAddress}update`,
        payload?.update_payload,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performLoad = useCallback(
    async (payload: BDUActionPayload) => {
      if (!payload?.resume_id) {
        console.log('No resume id');
        return null;
      }
      return (await api.performGetRequest(
        `${baseAddress}load/${encodeURIComponent(payload.resume_id)}`,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performOpenMainScreen = useCallback(
    async (payload: BDUActionPayload) => {
      if (!payload || !payload.resume_id) {
        console.log('No resume id');
        return null;
      }
      return (await api.performPostRequest(
        `${baseAddress}open_main_screen/${encodeURIComponent(payload.resume_id)}`,
        null,
      )) as ActionResponseDTO;
    },
    [api],
  );

  const performExport = useCallback(
    async (payload: BDUActionPayload) => {
      let resumeName = 'Resume';
      if (payload.resume_name) {
        resumeName = payload.resume_name;
      }
      const files = await window.electron.openSaveFileDialog(resumeName);
      if (!files) {
        console.log('No file chosen');
        return null;
      }
      console.log(files);
      return (await api.performPostRequest(`${baseAddress}export`, {
        resume_id: payload?.resume_id,
        save_path: files,
      })) as ActionResponseDTO;
    },
    [api],
  );

  const performImport = useCallback(
    async (_payload: BDUActionPayload) => {
      const files = await window.electron.openFileDialog();
      if (!files) {
        console.log('No file chosen');
        return null;
      }
      console.log(files);
      return (await api.performPostRequest(`${baseAddress}import`, {
        file_name: files,
      })) as ActionResponseDTO;
    },
    [api],
  );

  return useMemo(() => {
    return {
      exit: performExit,
      open_save_dir: performOpenSaveDir,
      open_local_dir: performOpenLocalDir,
      about: performAbout,
      locales: performGetLocales,
      locale: performChangeLocale,
      create_new: performCreateNew,
      delete: performDelete,
      confirm_delete: performConfirmDelete,
      update: performUpdate,
      duplicate: performDuplicate,
      load: performLoad,
      open_main_screen: performOpenMainScreen,
      export: performExport,
      import: performImport,
    } as BDUActionApi;
  }, [
    performExit,
    performOpenSaveDir,
    performOpenLocalDir,
    performAbout,
    performGetLocales,
    performChangeLocale,
    performCreateNew,
    performDelete,
    performConfirmDelete,
    performUpdate,
    performDuplicate,
    performLoad,
    performOpenMainScreen,
    performExport,
    performImport,
  ]);
}

export default useActionApi;
