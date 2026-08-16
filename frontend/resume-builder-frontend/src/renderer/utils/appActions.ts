import AppDialogActions from '../dialogs/appDialogActions';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';
import { BDUActionPayload } from './backendTypes';

export enum ScreenSource {
  MAIN,
  EDIT,
}

export type UpdateScreenPayload = {
  source: ScreenSource;
  screenUpdateFunction: (schema: SchemaResponseDTO) => void;
  resumeId?: string;
};

export type BDUActionParams = {
  payload?: BDUActionPayload;
  updateScreenPayload?: UpdateScreenPayload;
};

export type AppActions = {
  dialogActions: AppDialogActions;
  performBduAction: (bduAction: string, payload?: BDUActionParams) => void;
  updateCurrentScreen: (payload: UpdateScreenPayload) => Promise<void>;
  updateScreen: () => void;
  updateScreenMarker: number;
};
