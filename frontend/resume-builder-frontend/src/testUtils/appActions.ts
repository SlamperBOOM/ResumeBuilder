import { AppActions } from '../renderer/utils/appActions';
import AppDialogActions from '../renderer/dialogs/appDialogActions';

export function makeDialogActions(): AppDialogActions {
  return {
    languageDialog: { open: jest.fn(), close: jest.fn() },
    infoModal: { open: jest.fn(), close: jest.fn() },
    confirmationModal: { open: jest.fn(), close: jest.fn() },
    customModal: { open: jest.fn(), close: jest.fn() },
  };
}

export function makeAppActions(overrides: Partial<AppActions> = {}): AppActions {
  return {
    dialogActions: makeDialogActions(),
    performBduAction: jest.fn(),
    updateCurrentScreen: jest.fn(),
    updateScreen: jest.fn(),
    updateScreenMarker: 0,
    ...overrides,
  };
}
