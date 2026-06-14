import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppDialogActions from '../dialogs/appDialogActions';
import { UpdateScreenPayload } from '../utils/appActions';

interface FrontendActionParams {
  payload?: JSON;
  updateScreenPayload?: UpdateScreenPayload;
}

interface FrontendActionResult {
  bduAction: string;
  payload?: JSON;
}

type FrontendActionApi = {
  [action: string]: (
    payload: FrontendActionParams,
  ) => FrontendActionResult | null;
};

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
    },
    [updateScreenViaBool],
  );

  const performShowConfirmation = useCallback(
    (params: FrontendActionParams) => {
      if (!params.payload) {
        console.log('No data for confirmation dialog');
        return null;
      }
      dialogActions.confirmationModal.show(params.payload);
      return null;
    },
    [dialogActions.confirmationModal],
  );

  const performShowMessage = useCallback(
    (params: FrontendActionParams) => {
      if (!params.payload || !params.payload.text) {
        console.log('No data for message dialog');
        return null;
      }
      dialogActions.infoModal.show(params.payload.title, params.payload.text);
      return null;
    },
    [dialogActions.infoModal],
  );

  const performOpenAbout = useCallback((params: FrontendActionParams) => {
    const aboutWindow = window.open('', 'modal');
    aboutWindow?.document.writeln(params.payload ?? 'Halo');
    return null;
  }, []);

  const performLocaleDialog = useCallback(
    (_params: FrontendActionParams) => {
      dialogActions.languageDialog.show();
      return null;
    },
    [dialogActions.languageDialog],
  );

  const performClose = useCallback((_params: FrontendActionParams) => {
    window.close();
    return null;
  }, []);

  return useMemo(() => {
    return {
      OPEN_MAIN_SCREEN: openMainScreen,
      OPEN_EDIT_SCREEN: openEditScreen,
      UPDATE_CURRENT_SCREEN: updateScreen,
      SHOW_MESSAGE: performShowMessage,
      SHOW_CONFIRMATION: performShowConfirmation,
      CLOSE: performClose,
      OPEN_ABOUT: performOpenAbout,
      LOCALE_DIALOG: performLocaleDialog,
    } as FrontendActionApi;
  }, [
    openEditScreen,
    openMainScreen,
    performClose,
    performLocaleDialog,
    performOpenAbout,
    performShowConfirmation,
    performShowMessage,
    updateScreen,
  ]);
}

export default useFrontendAction;
