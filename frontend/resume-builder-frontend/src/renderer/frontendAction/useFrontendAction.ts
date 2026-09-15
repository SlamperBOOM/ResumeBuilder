import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppDialogActions from '../dialogs/appDialogActions';
import { BDUActionParams, UpdateScreenPayload } from '../utils/appActions';
import {
  ConfirmationDialogSchema,
  CustomDialogSchema,
  InfoModalSchema,
} from '../utils/backendTypes';
import FrontendActionEnum from './FrontendActionEnum';
import logger from '../utils/logger';

interface FrontendActionParams {
  payload?: unknown;
  updateScreenPayload?: UpdateScreenPayload;
}

interface FrontendActionResult {
  bduAction: string;
  payload?: BDUActionParams;
}

type FrontendActionApi = Record<
  FrontendActionEnum,
  (payload: FrontendActionParams) => FrontendActionResult | null
>;

export const appRoutes = {
  mainScreen: '/',
  editScreen: '/edit/:resumeId',
};

function useFrontendAction(
  dialogActions: AppDialogActions,
  updateScreenViaBool: () => void,
) {
  const navigate = useNavigate();

  const openMainScreen = useCallback(
    (_params: FrontendActionParams) => {
      navigate(appRoutes.mainScreen);
      updateScreenViaBool();
      return null;
    },
    [navigate, updateScreenViaBool],
  );

  const openEditScreen = useCallback(
    (params: FrontendActionParams) => {
      const payload = params.payload as { resume_id?: string } | undefined;
      if (!payload?.resume_id) {
        logger.warn('No resume id for edit screen');
        return null;
      }
      navigate(appRoutes.editScreen.replace(':resumeId', payload.resume_id));
      updateScreenViaBool();
      return null;
    },
    [navigate, updateScreenViaBool],
  );

  const updateScreen = useCallback(
    (_params: FrontendActionParams) => {
      updateScreenViaBool();
      return null;
    },
    [updateScreenViaBool],
  );

  const performShowConfirmation = useCallback(
    (params: FrontendActionParams) => {
      const payload = params.payload as ConfirmationDialogSchema | undefined;
      if (!payload) {
        logger.warn('No data for confirmation dialog');
        return null;
      }
      dialogActions.confirmationModal.open(payload);
      return null;
    },
    [dialogActions.confirmationModal],
  );

  const performShowMessage = useCallback(
    (params: FrontendActionParams) => {
      const payload = params.payload as InfoModalSchema | undefined;
      if (!payload?.text) {
        logger.warn('No data for message dialog');
        return null;
      }
      dialogActions.infoModal.open(payload);
      return null;
    },
    [dialogActions.infoModal],
  );

  const performShowCustomDialog = useCallback(
    (params: FrontendActionParams) => {
      const payload = params.payload as CustomDialogSchema | undefined;
      if (!payload) {
        logger.warn('No data for custom dialog');
        return null;
      }
      dialogActions.customModal.open(payload);
      return null;
    },
    [dialogActions.customModal],
  );

  const performOpenAbout = useCallback(
    (params: FrontendActionParams) => {
      // Render through InfoDialog (React text rendering, escaped by
      // default) instead of window.open + document.writeln, which
      // inserted backend-supplied content as raw, unescaped HTML.
      const payload = params.payload as { text?: string } | undefined;
      const text = payload?.text ? payload.text : 'Halo';
      dialogActions.infoModal.open({
        title: undefined,
        text,
      });
      return null;
    },
    [dialogActions.infoModal],
  );

  const performLocaleDialog = useCallback(
    (_params: FrontendActionParams) => {
      dialogActions.languageDialog.open();
      return null;
    },
    [dialogActions.languageDialog],
  );

  const performClose = useCallback((_params: FrontendActionParams) => {
    window.close();
    return null;
  }, []);

  return useMemo<FrontendActionApi>(() => {
    return {
      [FrontendActionEnum.OPEN_MAIN_SCREEN]: openMainScreen,
      [FrontendActionEnum.OPEN_EDIT_SCREEN]: openEditScreen,
      [FrontendActionEnum.UPDATE_CURRENT_SCREEN]: updateScreen,
      [FrontendActionEnum.SHOW_MESSAGE]: performShowMessage,
      [FrontendActionEnum.SHOW_CONFIRMATION]: performShowConfirmation,
      [FrontendActionEnum.SHOW_CUSTOM_DIALOG]: performShowCustomDialog,
      [FrontendActionEnum.CLOSE]: performClose,
      [FrontendActionEnum.OPEN_ABOUT]: performOpenAbout,
      [FrontendActionEnum.LOCALE_DIALOG]: performLocaleDialog,
    };
  }, [
    openEditScreen,
    openMainScreen,
    performClose,
    performLocaleDialog,
    performOpenAbout,
    performShowConfirmation,
    performShowMessage,
    performShowCustomDialog,
    updateScreen,
  ]);
}

export default useFrontendAction;
