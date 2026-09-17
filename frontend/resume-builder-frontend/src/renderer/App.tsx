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
  AboutModalSchema,
  ConfirmationDialogSchema,
  CustomDialogSchema,
  HelpModalSchema,
  InfoModalSchema,
  OnboardingSchema,
} from './utils/backendTypes';
import AboutDialog from './dialogs/AboutDialog';
import CustomDialog from './dialogs/CustomDialog';
import HelpDialog from './dialogs/HelpDialog';
import OnboardingDialog from './dialogs/OnboardingDialog';
import RouteNotFoundScreen from './screens/RouteNotFoundScreen';
import logger from './utils/logger';

function useDialog<T = void>() {
  const [showState, setShowState] = useState(false);
  const [data, setData] = useState<T>();
  const open = useCallback((value: T) => {
    setData(value);
    setShowState(true);
  }, []);
  const close = useCallback(() => setShowState(false), []);
  return { showState, data, open, close };
}

export default function App() {
  const languageDialogProps = useDialog();
  const infoModalProps = useDialog<InfoModalSchema>();
  const confirmationDialogProps = useDialog<ConfirmationDialogSchema>();
  const customDialogProps = useDialog<CustomDialogSchema>();
  const aboutModalProps = useDialog<AboutModalSchema>();
  const helpModalProps = useDialog<HelpModalSchema>();
  const onboardingModalProps = useDialog<OnboardingSchema>();

  // app actions

  const dialogActions: AppDialogActions = useMemo(() => {
    return {
      languageDialog: {
        open: languageDialogProps.open,
        close: languageDialogProps.close,
      },
      infoModal: {
        open: infoModalProps.open,
        close: infoModalProps.close,
      },
      confirmationModal: {
        open: confirmationDialogProps.open,
        close: confirmationDialogProps.close,
      },
      customModal: {
        open: customDialogProps.open,
        close: customDialogProps.close,
      },
      aboutModal: {
        open: aboutModalProps.open,
        close: aboutModalProps.close,
      },
      helpModal: {
        open: helpModalProps.open,
        close: helpModalProps.close,
      },
      onboardingModal: {
        open: onboardingModalProps.open,
        close: onboardingModalProps.close,
      },
    };
  }, [
    aboutModalProps.close,
    aboutModalProps.open,
    confirmationDialogProps.close,
    confirmationDialogProps.open,
    customDialogProps.close,
    customDialogProps.open,
    helpModalProps.close,
    helpModalProps.open,
    onboardingModalProps.close,
    onboardingModalProps.open,
    infoModalProps.close,
    infoModalProps.open,
    languageDialogProps.close,
    languageDialogProps.open,
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
            logger.warn('No resume_id for edit screen update');
            return;
          }
          const schema = await schemaApi.getEditScreen(
            updateScreenPayload.resumeId,
          );
          updateScreenPayload.screenUpdateFunction(schema);
          break;
        }
        default: {
          logger.warn('Unexpected screen source in updateCurrentScreen');
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
        logger.error(`Unknown BDU action received: "${bduAction}"`);
        dialogActions.infoModal.open({
          title: undefined,
          text: `Unknown action received from the backend: "${bduAction}"`,
        });
        return;
      }
      action(payload?.payload)
        .then((result: ActionResponseDTO | null) => {
          if (result) {
            const frontendAction = frontendActions[result.frontend_action];
            if (!frontendAction) {
              logger.error(
                `Unknown frontend action received: "${result.frontend_action}"`,
              );
              dialogActions.infoModal.open({
                title: undefined,
                text: `Unknown frontend action received from the backend: "${result.frontend_action}"`,
              });
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
          logger.error('BDU action failed:', error);
          const message =
            error instanceof Error ? error.message : String(error);
          dialogActions.infoModal.open({ title: undefined, text: message });
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
      <LanguageDialog
        showState={languageDialogProps.showState}
        appActions={appActions}
      />
      <InfoDialog
        showState={infoModalProps.showState}
        schema={infoModalProps.data}
        dialogActions={dialogActions}
      />
      <ConfirmationDialog
        showState={confirmationDialogProps.showState}
        confirmationDialogSchema={confirmationDialogProps.data}
        appActions={appActions}
      />
      <CustomDialog
        showState={customDialogProps.showState}
        customDialogSchema={customDialogProps.data}
        appActions={appActions}
      />
      <AboutDialog
        showState={aboutModalProps.showState}
        schema={aboutModalProps.data}
        dialogActions={dialogActions}
      />
      <HelpDialog
        showState={helpModalProps.showState}
        schema={helpModalProps.data}
        dialogActions={dialogActions}
      />
      <OnboardingDialog
        showState={onboardingModalProps.showState}
        schema={onboardingModalProps.data}
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
