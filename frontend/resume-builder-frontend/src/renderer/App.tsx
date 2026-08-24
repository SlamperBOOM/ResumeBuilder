import { useCallback, useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import LanguageDialog from './dialogs/LanguageDialog';
import MainScreen from './screens/MainScreen';
import HeaderWrapper from './components/HeaderWrapper';
import AppDialogActions from './dialogs/appDialogActions';
import {
  AppActions,
  BDUActionParams,
  ScreenSource,
  UpdateScreenPayload,
} from './utils/appActions';
import ActionResponseDTO from './DTO/ActionResponseDTO';
import useActionApi, { BduActionName } from './api/useActionApi';
import useFrontendAction, {
  appRoutes,
} from './frontendAction/useFrontendAction';
import EditScreen from './screens/EditScreen';
import useSchemaApi from './api/useSchemaApi';
import InfoDialog from './dialogs/InfoDialog';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import {
  ConfirmationDialogSchema,
  CustomDialogSchema,
} from './utils/backendTypes';
import CustomDialog from './dialogs/CustomDialog';
import RouteNotFoundScreen from './screens/RouteNotFoundScreen';

export default function App() {
  // language dialog
  const [languageDialogShow, setLanguageDialogShow] = useState<boolean>(false);
  const languageDialogShowCallback = useCallback(() => {
    setLanguageDialogShow(true);
  }, [setLanguageDialogShow]);
  const languageDialogCloseCallback = useCallback(() => {
    setLanguageDialogShow(false);
  }, [setLanguageDialogShow]);

  // info modal
  const [infoModalShow, setInfoModalShow] = useState<boolean>(false);
  const [infoModalTitle, setInfoModalTitle] = useState<string | undefined>('');
  const [infoModalText, setInfoModalText] = useState<string>('');
  const infoModalShowCallback = useCallback(
    (title: string | undefined, text: string) => {
      setInfoModalTitle(title);
      setInfoModalText(text);
      setInfoModalShow(true);
    },
    [setInfoModalTitle, setInfoModalText, setInfoModalShow],
  );
  const infoModalCloseCallback = useCallback(() => {
    setInfoModalShow(false);
  }, [setInfoModalShow]);

  // confirmation modal
  const [confirmationModalShow, setConfirmationModalShow] =
    useState<boolean>(false);
  const [confirmationModalSchema, setConfirmationModalSchema] =
    useState<ConfirmationDialogSchema>();
  const confirmationModalShowCallback = useCallback(
    (schema: ConfirmationDialogSchema) => {
      setConfirmationModalSchema(schema);
      setConfirmationModalShow(true);
    },
    [setConfirmationModalShow, setConfirmationModalSchema],
  );
  const confirmationModalCloseCallback = useCallback(() => {
    setConfirmationModalShow(false);
  }, [setConfirmationModalShow]);

  // custom dialog
  const [customDialogShow, setCustomDialogShow] = useState<boolean>(false);
  const [customDialogSchema, setCustomDialogSchema] =
    useState<CustomDialogSchema>();
  const customDialogShowCallback = useCallback(
    (schema: CustomDialogSchema) => {
      setCustomDialogSchema(schema);
      setCustomDialogShow(true);
    },
    [setCustomDialogSchema, setCustomDialogShow],
  );
  const customDialogCloseCallback = useCallback(() => {
    setCustomDialogShow(false);
  }, [setCustomDialogShow]);

  // app actions

  const dialogActions: AppDialogActions = useMemo(() => {
    return {
      languageDialog: {
        show: languageDialogShowCallback,
        close: languageDialogCloseCallback,
      },
      infoModal: {
        show: infoModalShowCallback,
        close: infoModalCloseCallback,
      },
      confirmationModal: {
        show: confirmationModalShowCallback,
        close: confirmationModalCloseCallback,
      },
      customModal: {
        show: customDialogShowCallback,
        close: customDialogCloseCallback,
      },
    };
  }, [
    confirmationModalCloseCallback,
    confirmationModalShowCallback,
    customDialogCloseCallback,
    customDialogShowCallback,
    infoModalCloseCallback,
    infoModalShowCallback,
    languageDialogCloseCallback,
    languageDialogShowCallback,
  ]);

  const schemaApi = useSchemaApi();

  const updateCurrentScreen = useCallback(
    async (updateScreenPayload: UpdateScreenPayload) => {
      switch (updateScreenPayload.source) {
        case ScreenSource.MAIN: {
          const schema = await schemaApi.getMainScreen();
          updateScreenPayload.screenUpdateFunction(schema);
          break;
        }
        case ScreenSource.EDIT: {
          if (!updateScreenPayload.resumeId) {
            console.log('No resume_id for edit screen update');
            return;
          }
          const schema = await schemaApi.getEditScreen(
            updateScreenPayload.resumeId,
          );
          updateScreenPayload.screenUpdateFunction(schema);
          break;
        }
        default: {
          console.log('unexpected enum');
        }
      }
    },
    [schemaApi],
  );

  const actionApi = useActionApi();
  const [updateScreenMarker, setUpdateScreenMarker] = useState<number>(0);
  const updateScreen = useCallback(() => {
    setUpdateScreenMarker((previous) => previous + 1);
  }, []);
  const frontendActions = useFrontendAction(dialogActions, updateScreen);

  const performBduAction = useCallback(
    (bduAction: BduActionName | (string & {}), payload?: BDUActionParams) => {
      const action = actionApi[bduAction];
      if (!action) {
        console.error(`Unknown BDU action received: "${bduAction}"`);
        dialogActions.infoModal.show(
          undefined,
          `Unknown action received from the backend: "${bduAction}"`,
        );
        return;
      }
      action(payload?.payload)
        .then((result: ActionResponseDTO | null) => {
          if (result) {
            const frontendAction = frontendActions[result.frontend_action];
            if (!frontendAction) {
              console.error(
                `Unknown frontend action received: "${result.frontend_action}"`,
              );
              dialogActions.infoModal.show(
                undefined,
                `Unknown frontend action received from the backend: "${result.frontend_action}"`,
              );
              return null;
            }
            const frontendActionResult = frontendAction({
              payload: result.payload,
              updateScreenPayload: payload?.updateScreenPayload,
            });
            if (frontendActionResult) {
              performBduAction(
                frontendActionResult.bduAction,
                frontendActionResult.payload,
              );
            }
          }
          return null;
        })
        .catch((error: unknown) => {
          console.error(error);
          const message =
            error instanceof Error ? error.message : String(error);
          dialogActions.infoModal.show(undefined, message);
        });
    },
    [actionApi, frontendActions, dialogActions],
  );

  const appActions: AppActions = useMemo(() => {
    return {
      dialogActions,
      performBduAction,
      updateCurrentScreen,
      updateScreen,
      updateScreenMarker,
    };
  }, [
    dialogActions,
    performBduAction,
    updateCurrentScreen,
    updateScreen,
    updateScreenMarker,
  ]);

  return (
    <>
      <LanguageDialog showState={languageDialogShow} appActions={appActions} />
      <InfoDialog
        showState={infoModalShow}
        title={infoModalTitle}
        text={infoModalText}
        dialogActions={dialogActions}
      />
      <ConfirmationDialog
        showState={confirmationModalShow}
        confirmationDialogSchema={confirmationModalSchema}
        appActions={appActions}
      />
      <CustomDialog
        showState={customDialogShow}
        customDialogSchema={customDialogSchema}
        appActions={appActions}
      />
      <HeaderWrapper appActions={appActions}>
        <Routes>
          <Route
            path={appRoutes.mainScreen}
            element={<MainScreen appActions={appActions} />}
          />
          <Route
            path={appRoutes.editScreen}
            element={<EditScreen appActions={appActions} />}
          />
          <Route path="*" element={<RouteNotFoundScreen />} />
        </Routes>
      </HeaderWrapper>
    </>
  );
}
