import { renderHook } from '@testing-library/react';
import useFrontendAction, {
  appRoutes,
} from '../../renderer/frontendAction/useFrontendAction';
import FrontendActionEnum from '../../renderer/frontendAction/FrontendActionEnum';
import logger from '../../renderer/utils/logger';
import { makeDialogActions } from '../../testUtils/appActions';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function setup() {
  const dialogActions = makeDialogActions();
  const updateScreenViaBool = jest.fn();
  const { result } = renderHook(() =>
    useFrontendAction(dialogActions, updateScreenViaBool),
  );
  return { actions: result.current, dialogActions, updateScreenViaBool };
}

beforeEach(() => {
  mockNavigate.mockReset();
});

describe('useFrontendAction', () => {
  it('OPEN_MAIN_SCREEN navigates home and refreshes the screen', () => {
    const { actions, updateScreenViaBool } = setup();

    const result = actions[FrontendActionEnum.OPEN_MAIN_SCREEN]({});

    expect(mockNavigate).toHaveBeenCalledWith(appRoutes.mainScreen);
    expect(updateScreenViaBool).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('OPEN_EDIT_SCREEN navigates to the resume id from the payload', () => {
    const { actions, updateScreenViaBool } = setup();

    actions[FrontendActionEnum.OPEN_EDIT_SCREEN]({
      payload: { resume_id: 'r1' },
    });

    expect(mockNavigate).toHaveBeenCalledWith('/edit/r1');
    expect(updateScreenViaBool).toHaveBeenCalledTimes(1);
  });

  it('OPEN_EDIT_SCREEN warns and does nothing without a resume id', () => {
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const { actions, updateScreenViaBool } = setup();

    const result = actions[FrontendActionEnum.OPEN_EDIT_SCREEN]({});

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(updateScreenViaBool).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('No resume id for edit screen');
    expect(result).toBeNull();

    warnSpy.mockRestore();
  });

  it('UPDATE_CURRENT_SCREEN just refreshes the screen', () => {
    const { actions, updateScreenViaBool } = setup();

    actions[FrontendActionEnum.UPDATE_CURRENT_SCREEN]({});

    expect(updateScreenViaBool).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('SHOW_MESSAGE opens the info modal with the payload', () => {
    const { actions, dialogActions } = setup();
    const payload = { title: 'Saved', text: 'Your resume was saved.' };

    actions[FrontendActionEnum.SHOW_MESSAGE]({ payload });

    expect(dialogActions.infoModal.open).toHaveBeenCalledWith(payload);
  });

  it('SHOW_MESSAGE warns and does nothing without text', () => {
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const { actions, dialogActions } = setup();

    actions[FrontendActionEnum.SHOW_MESSAGE]({});

    expect(dialogActions.infoModal.open).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('No data for message dialog');

    warnSpy.mockRestore();
  });

  it('SHOW_CONFIRMATION opens the confirmation modal with the payload', () => {
    const { actions, dialogActions } = setup();
    const payload = {
      title: 'Delete?',
      text: 'This cannot be undone.',
      confirm_button_text: 'Delete',
      decline_button_text: 'Cancel',
      confirm_action: 'delete_resume',
      confirm_action_payload: { resume_id: 'r1' },
    };

    actions[FrontendActionEnum.SHOW_CONFIRMATION]({ payload });

    expect(dialogActions.confirmationModal.open).toHaveBeenCalledWith(
      payload,
    );
  });

  it('SHOW_CONFIRMATION warns and does nothing without a payload', () => {
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const { actions, dialogActions } = setup();

    actions[FrontendActionEnum.SHOW_CONFIRMATION]({});

    expect(dialogActions.confirmationModal.open).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('No data for confirmation dialog');

    warnSpy.mockRestore();
  });

  it('SHOW_CUSTOM_DIALOG opens the custom modal with the payload', () => {
    const { actions, dialogActions } = setup();
    const payload = {
      title: 'Export',
      text: 'Choose a format.',
      decline_button_text: 'Cancel',
      actions: [],
    };

    actions[FrontendActionEnum.SHOW_CUSTOM_DIALOG]({ payload });

    expect(dialogActions.customModal.open).toHaveBeenCalledWith(payload);
  });

  it('SHOW_CUSTOM_DIALOG warns and does nothing without a payload', () => {
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const { actions, dialogActions } = setup();

    actions[FrontendActionEnum.SHOW_CUSTOM_DIALOG]({});

    expect(dialogActions.customModal.open).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('No data for custom dialog');

    warnSpy.mockRestore();
  });

  it('OPEN_ABOUT opens the info modal with the payload text', () => {
    const { actions, dialogActions } = setup();

    actions[FrontendActionEnum.OPEN_ABOUT]({ payload: { text: 'About us' } });

    expect(dialogActions.infoModal.open).toHaveBeenCalledWith({
      title: undefined,
      text: 'About us',
    });
  });

  it('OPEN_ABOUT falls back to a default message without payload text', () => {
    const { actions, dialogActions } = setup();

    actions[FrontendActionEnum.OPEN_ABOUT]({});

    expect(dialogActions.infoModal.open).toHaveBeenCalledWith({
      title: undefined,
      text: 'Halo',
    });
  });

  it('LOCALE_DIALOG opens the language dialog', () => {
    const { actions, dialogActions } = setup();

    actions[FrontendActionEnum.LOCALE_DIALOG]({});

    expect(dialogActions.languageDialog.open).toHaveBeenCalledTimes(1);
  });

  it('CLOSE closes the window', () => {
    const closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {});
    const { actions } = setup();

    const result = actions[FrontendActionEnum.CLOSE]({});

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();

    closeSpy.mockRestore();
  });
});
