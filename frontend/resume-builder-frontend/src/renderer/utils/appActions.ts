import AppDialogActions from '../dialogs/AppDialogActions';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';

export enum ScreenSource {
  MAIN,
  EDIT,
}

export type UpdateScreenPayload = {
  source: ScreenSource;
  screenUpdateFunction: (schema: SchemaResponseDTO) => void;
  resumeId?: string;
};

export type UpdatePayload = {
  resume_id: string;
  resume_info: JSON;
  content: {
    block: string;
    payload: JSON;
  }[];
};

export type BDUActionPayload = {
  locale?: string;
  resume_id?: string;
  resume_name?: string;
  update_payload?: UpdatePayload;
};

export type BDUActionParams = {
  payload?: BDUActionPayload;
  updateScreenPayload?: UpdateScreenPayload;
};

export type AppActions = {
  dialogActions: AppDialogActions;
  performBduAction: (bduAction: string, payload?: BDUActionParams) => void;
  updateCurrentScreen: (payload: UpdateScreenPayload) => Promise<void>;
};
