import AppDialogActions from '../dialogs/appDialogActions';
import { BDUActionPayload } from './backendTypes';
import { BduActionName } from '../api/useActionApi';
import MainScreenResponse from '../DTO/MainScreenResponse';
import EditScreenResponse from '../DTO/EditScreenResponse';

export enum ScreenSource {
  MAIN,
  EDIT,
}

export type UpdateScreenPayload =
  | {
      source: ScreenSource.MAIN;
      screenUpdateFunction: (schema: MainScreenResponse) => void;
      resumeId?: string;
    }
  | {
      source: ScreenSource.EDIT;
      screenUpdateFunction: (schema: EditScreenResponse) => void;
      resumeId?: string;
    };

export type BDUActionParams = {
  payload?: BDUActionPayload;
  updateScreenPayload?: UpdateScreenPayload;
};

export type AppActions = {
  dialogActions: AppDialogActions;
  performBduAction: (
    bduAction: BduActionName | (string & {}),
    payload?: BDUActionParams,
  ) => void;
  updateCurrentScreen: (payload: UpdateScreenPayload) => Promise<void>;
  updateScreen: () => void;
  updateScreenMarker: number;
};
