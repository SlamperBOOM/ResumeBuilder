import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppDialogActions from '../dialogs/AppDialogActions';
import { UpdateScreenPayload } from '../utils/appActions';

interface FrontendActionParams {
  payload?: JSON;
  updateScreenPayload?: UpdateScreenPayload;
}

interface FrontendActionResult {
  bduAction: string;
  payload?: JSON;
}

export const appRoutes = {
  mainScreen: '/',
  editScreen: '/edit/:resumeId',
};

function useFrontendAction(
  dialogActions: AppDialogActions,
  updateCurrentScreen: (payload: UpdateScreenPayload) => Promise<void>,
) {
  const navigate = useNavigate();

  const openMainScreen = useCallback(
    (_params: FrontendActionParams) => {
      navigate(appRoutes.mainScreen);
      return null;
    },
    [navigate],
  );

  const openEditScreen = useCallback(
    (params: FrontendActionParams) => {
      navigate(
        appRoutes.editScreen.replace(':resumeId', params.payload.resume_id),
      );
      return null;
    },
    [navigate],
  );

  const updateScreen = useCallback(
    (params: FrontendActionParams) => {
      if (!params.updateScreenPayload) {
        return null;
      }
      updateCurrentScreen(params.updateScreenPayload);
      return null;
    },
    [updateCurrentScreen],
  );

  const performShowAlert = useCallback((params: FrontendActionParams) => {
    //
    return null;
  }, []);

  const performShowMessage = useCallback((params: FrontendActionParams) => {
    //
    return null;
  }, []);

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
      SHOW_ALERT: performShowAlert,
      CLOSE: performClose,
      OPEN_ABOUT: performOpenAbout,
      LOCALE_DIALOG: performLocaleDialog,
    };
  }, [
    openEditScreen,
    openMainScreen,
    performClose,
    performLocaleDialog,
    performOpenAbout,
    performShowAlert,
    performShowMessage,
    updateScreen,
  ]);
}

export default useFrontendAction;
