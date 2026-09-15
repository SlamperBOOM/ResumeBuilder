import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationDialog from '../../renderer/dialogs/ConfirmationDialog';
import { ConfirmationDialogSchema } from '../../renderer/utils/backendTypes';
import { makeAppActions } from '../../testUtils/appActions';

const schema: ConfirmationDialogSchema = {
  title: 'Delete resume?',
  text: 'This cannot be undone.',
  confirm_button_text: 'Delete',
  decline_button_text: 'Cancel',
  confirm_action: 'delete_resume',
  confirm_action_payload: { resume_id: 'r1' },
};

describe('ConfirmationDialog', () => {
  it('renders the schema title, text and buttons', () => {
    render(
      <ConfirmationDialog
        showState
        confirmationDialogSchema={schema}
        appActions={makeAppActions()}
      />,
    );

    expect(screen.getByText('Delete resume?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('closes without dispatching an action when declined', () => {
    const appActions = makeAppActions();
    render(
      <ConfirmationDialog
        showState
        confirmationDialogSchema={schema}
        appActions={appActions}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(appActions.dialogActions.confirmationModal.close).toHaveBeenCalledTimes(
      1,
    );
    expect(appActions.performBduAction).not.toHaveBeenCalled();
  });

  it('closes and dispatches the confirm action when confirmed', () => {
    const appActions = makeAppActions();
    render(
      <ConfirmationDialog
        showState
        confirmationDialogSchema={schema}
        appActions={appActions}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(appActions.dialogActions.confirmationModal.close).toHaveBeenCalledTimes(
      1,
    );
    expect(appActions.performBduAction).toHaveBeenCalledWith('delete_resume', {
      payload: { resume_id: 'r1' },
    });
  });
});
