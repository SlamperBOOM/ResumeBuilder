import {
  ConfirmationDialogSchema,
  CustomDialogSchema,
} from '../utils/backendTypes';

type AppDialogActions = {
  languageDialog: {
    show: () => void;
    close: () => void;
  };
  infoModal: {
    show: (title: string | undefined, text: string) => void;
    close: () => void;
  };
  confirmationModal: {
    show: (schema: ConfirmationDialogSchema) => void;
    close: () => void;
  };
  customModal: {
    show: (schema: CustomDialogSchema) => void;
    close: () => void;
  };
};

export default AppDialogActions;
