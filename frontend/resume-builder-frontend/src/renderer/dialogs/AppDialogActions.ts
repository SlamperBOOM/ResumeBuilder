import {
  ConfirmationDialogSchema,
  CustomDialogSchema,
  InfoModalSchema,
} from '../utils/backendTypes';

type AppDialogActions = {
  languageDialog: {
    open: () => void;
    close: () => void;
  };
  infoModal: {
    open: (schema: InfoModalSchema) => void;
    close: () => void;
  };
  confirmationModal: {
    open: (schema: ConfirmationDialogSchema) => void;
    close: () => void;
  };
  customModal: {
    open: (schema: CustomDialogSchema) => void;
    close: () => void;
  };
};

export default AppDialogActions;
