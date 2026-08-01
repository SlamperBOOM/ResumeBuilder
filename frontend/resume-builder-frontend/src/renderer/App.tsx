import { useCallback, useEffect, useMemo, useState } from 'react';
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
import useActionApi from './api/useActionApi';
import useFrontendAction, {
  appRoutes,
} from './frontendAction/useFrontendAction';
import ErrorScreen from './screens/ErrorScreen';
import EditScreen from './screens/EditScreen';
import useSchemaApi from './api/useSchemaApi';
import InfoDialog from './dialogs/InfoDialog';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import {
  ConfirmationDialogSchema,
  CustomDialogSchema,
} from './utils/backendTypes';
import CustomDialog from './dialogs/CustomDialog';

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
    };
  }, [
    confirmationModalCloseCallback,
    confirmationModalShowCallback,
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
  const [updateScreenMarker, setUpdateScreenMarker] = useState<boolean>(false);
  const updateScreen = useCallback(() => {
    setUpdateScreenMarker(!updateScreenMarker);
  }, [updateScreenMarker]);
  const frontendActions = useFrontendAction(dialogActions, updateScreen);

  const performBduAction = useCallback(
    (bduAction: string, payload?: BDUActionParams) => {
      actionApi[bduAction](payload?.payload)
        .then((result: ActionResponseDTO | null) => {
          if (result) {
            const frontendActionResult = frontendActions[
              result.frontend_action
            ]({
              payload: result.payload,
              updateScreenPayload: payload?.updateScreenPayload,
            });
            if (frontendActionResult) {
              performBduAction(frontendActionResult);
            }
          }
          return null;
        })
        .catch((error: any) => {
          console.log(error);
        });
    },
    [actionApi, frontendActions],
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
          <Route path="*" element={<ErrorScreen />} />
        </Routes>
      </HeaderWrapper>
    </>
  );
}
