import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppDialogActions from '../dialogs/appDialogActions';
import { UpdateScreenPayload } from '../utils/appActions';
import FrontendActionEnum from './FrontendActionEnum';
import logger from '../utils/logger';

interface FrontendActionParams {
  payload?: JSON;
  updateScreenPayload?: UpdateScreenPayload;
}

interface FrontendActionResult {
  bduAction: string;
  payload?: JSON;
}

// Record<enum, ...> instead of a `[action: string]` index signature -
// FrontendActionEnum is already kept in sync with the handlers below, so
// this catches a missing/renamed handler at compile time instead of
// silently returning `undefined` at runtime.
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
      if (!params.payload || !params.payload.resume_id) {
        logger.warn('No resume id for edit screen');
        return null;
      }
      navigate(
        appRoutes.editScreen.replace(':resumeId', params.payload.resume_id),
      );
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
      if (!params.payload) {
        logger.warn('No data for confirmation dialog');
        return null;
      }
      dialogActions.confirmationModal.open(params.payload);
      return null;
    },
    [dialogActions.confirmationModal],
  );

  const performShowMessage = useCallback(
    (params: FrontendActionParams) => {
      if (!params.payload || !params.payload.text) {
        logger.warn('No data for message dialog');
        return null;
      }
      dialogActions.infoModal.open(params.payload);
      return null;
    },
    [dialogActions.infoModal],
  );

  const performShowCustomDialog = useCallback(
    (params: FrontendActionParams) => {
      if (!params.payload) {
        logger.warn('No data for custom dialog');
        return null;
      }
      dialogActions.customModal.open(params.payload);
      return null;
    },
    [dialogActions.customModal],
  );

  const performOpenAbout = useCallback(
    (params: FrontendActionParams) => {
      // Render through InfoDialog (React text rendering, escaped by
      // default) instead of window.open + document.writeln, which
      // inserted backend-supplied content as raw, unescaped HTML.
      const text = params.payload.text ? params.payload.text : 'Halo';
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
