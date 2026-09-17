import {
  AboutModalSchema,
  ConfirmationDialogSchema,
  CustomDialogSchema,
  HelpModalSchema,
  InfoModalSchema,
  OnboardingSchema,
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
  aboutModal: {
    open: (schema: AboutModalSchema) => void;
    close: () => void;
  };
  helpModal: {
    open: (schema: HelpModalSchema) => void;
    close: () => void;
  };
  onboardingModal: {
    open: (schema: OnboardingSchema) => void;
    close: () => void;
  };
};

export default AppDialogActions;
