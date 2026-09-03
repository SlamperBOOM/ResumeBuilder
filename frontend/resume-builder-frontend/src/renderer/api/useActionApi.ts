import { useCallback, useMemo } from 'react';
import useApi from './useApi';
import logger from '../utils/logger';
import ActionResponseDTO from '../DTO/ActionResponseDTO';
import { BDUActionPayload } from '../utils/backendTypes';
import {
  actionResponseSchema,
  optionalActionResponseSchema,
} from './apiSchemasValidation';
import { validatePickedPath } from './validatePickedPath';

const baseAddress = 'action/';

type BDUActionApi = {
  [action: string]: (
    payload?: BDUActionPayload,
  ) => Promise<ActionResponseDTO | null>;
};

type ActionRequestConfig = {
  method: 'get' | 'post' | 'delete';
  buildUrl: (payload?: BDUActionPayload) => string;
  buildBody?: (payload?: BDUActionPayload) => unknown;
  isValid?: (payload?: BDUActionPayload) => boolean;
  invalidMessage?: string;
  optionalResponse?: boolean;
};

const actionConfigs = {
  exit: {
    method: 'post',
    buildUrl: () => 'exit',
  },
  open_save_dir: {
    method: 'get',
    buildUrl: () => 'open_save_dir',
    optionalResponse: true,
  },
  open_local_dir: {
    method: 'post',
    buildUrl: () => 'open_local_dir',
    buildBody: (payload) => ({ dir_path: payload?.local_dir_path }),
    isValid: (payload) => validatePickedPath(payload?.local_dir_path),
    invalidMessage: 'Invalid or missing local directory path',
    optionalResponse: true,
  },
  about: {
    method: 'get',
    buildUrl: () => 'about',
  },
  locales: {
    method: 'get',
    buildUrl: () => 'locales',
  },
  locale: {
    method: 'post',
    buildUrl: (payload) =>
      `locale/set/${encodeURIComponent(payload?.locale ?? '')}`,
    isValid: (payload) => Boolean(payload?.locale),
    invalidMessage: 'No locale set',
  },
  create_new: {
    method: 'post',
    buildUrl: () => 'create_new',
  },
  duplicate: {
    method: 'post',
    buildUrl: (payload) =>
      `duplicate/${encodeURIComponent(payload?.resume_id ?? '')}`,
    isValid: (payload) => Boolean(payload?.resume_id),
    invalidMessage: 'No resume id',
  },
  delete: {
    method: 'delete',
    buildUrl: (payload) =>
      `delete/${encodeURIComponent(payload?.resume_id ?? '')}`,
    isValid: (payload) => Boolean(payload?.resume_id),
    invalidMessage: 'No resume id',
  },
  confirm_delete: {
    method: 'delete',
    buildUrl: (payload) =>
      `delete/confirm/${encodeURIComponent(payload?.resume_id ?? '')}`,
    isValid: (payload) => Boolean(payload?.resume_id),
    invalidMessage: 'No resume id',
  },
  update: {
    method: 'post',
    buildUrl: () => 'update',
    buildBody: (payload) => payload?.update_payload,
    isValid: (payload) => Boolean(payload?.update_payload),
    invalidMessage: 'No data for update',
  },
  load: {
    method: 'get',
    buildUrl: (payload) =>
      `load/${encodeURIComponent(payload?.resume_id ?? '')}`,
    isValid: (payload) => Boolean(payload?.resume_id),
    invalidMessage: 'No resume id',
  },
  open_main_screen: {
    method: 'post',
    buildUrl: (payload) =>
      `open_main_screen/${encodeURIComponent(payload?.resume_id ?? '')}`,
    isValid: (payload) => Boolean(payload?.resume_id),
    invalidMessage: 'No resume id',
  },
} satisfies Record<string, ActionRequestConfig>;

export type BduActionName = keyof typeof actionConfigs | 'export' | 'import';

export const BDU_ACTION_UPDATE: BduActionName = 'update';
export const BDU_ACTION_OPEN_MAIN_SCREEN: BduActionName = 'open_main_screen';

function createBduAction(
  api: ReturnType<typeof useApi>,
  config: ActionRequestConfig,
): (payload?: BDUActionPayload) => Promise<ActionResponseDTO | null> {
  return async (payload) => {
    if (config.isValid && !config.isValid(payload)) {
      logger.warn(config.invalidMessage ?? 'Invalid payload for BDU action');
      return null;
    }

    const url = `${baseAddress}${config.buildUrl(payload)}`;
    const schema = config.optionalResponse
      ? optionalActionResponseSchema
      : actionResponseSchema;
    let data: ActionResponseDTO | null;

    switch (config.method) {
      case 'get':
        data = await api.performGetRequest<ActionResponseDTO | null>(
          url,
          schema,
        );
        break;
      case 'delete':
        data = await api.performDeleteRequest<ActionResponseDTO | null>(
          url,
          schema,
        );
        break;
      case 'post':
      default:
        data = await api.performPostRequest<ActionResponseDTO | null>(
          url,
          config.buildBody ? config.buildBody(payload) : null,
          schema,
        );
        break;
    }

    return data;
  };
}

export default function useActionApi() {
  const api = useApi();

  const performExport = useCallback(
    async (payload?: BDUActionPayload) => {
      let resumeName = 'Resume';
      if (!payload) {
        logger.warn('No payload provided for export action');
        return null;
      }
      if (payload.resume_name) {
        resumeName = payload.resume_name;
      }
      const files = await window.electron.openSaveFileDialog(resumeName);
      if (!files) {
        logger.debug('No file chosen for export');
        return null;
      }
      if (!validatePickedPath(files, { allowedExtensions: ['.pdf'] })) {
        logger.warn('Rejected export path from dialog:', files);
        return null;
      }
      return api.performPostRequest<ActionResponseDTO>(
        `${baseAddress}export`,
        {
          resume_id: payload?.resume_id,
          save_path: files,
        },
        actionResponseSchema,
      );
    },
    [api],
  );

  const performImport = useCallback(
    async (_payload?: BDUActionPayload) => {
      const files = await window.electron.openFileDialog();
      if (!files) {
        logger.debug('No file chosen for import');
        return null;
      }
      if (!validatePickedPath(files)) {
        logger.warn('Rejected import path from dialog:', files);
        return null;
      }
      return api.performPostRequest<ActionResponseDTO>(
        `${baseAddress}import`,
        {
          file_name: files,
        },
        actionResponseSchema,
      );
    },
    [api],
  );

  return useMemo(() => {
    const result = {} as BDUActionApi;
    Object.entries(actionConfigs).forEach(([key, config]) => {
      result[key] = createBduAction(api, config);
    });
    result.export = performExport;
    result.import = performImport;
    return result;
  }, [api, performExport, performImport]);
}
