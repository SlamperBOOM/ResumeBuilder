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
  primary_button: 'decline',
  destructive: true,
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

    expect(
      appActions.dialogActions.confirmationModal.close,
    ).toHaveBeenCalledTimes(1);
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

    expect(
      appActions.dialogActions.confirmationModal.close,
    ).toHaveBeenCalledTimes(1);
    expect(appActions.performBduAction).toHaveBeenCalledWith('delete_resume', {
      payload: { resume_id: 'r1' },
    });
  });
  it('leads with the safe answer and tints a destructive confirm', () => {
    render(
      <ConfirmationDialog
        showState
        confirmationDialogSchema={schema}
        appActions={makeAppActions()}
      />,
    );

    const decline = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Delete' });

    expect(decline).toHaveClass('MuiButton-contained');
    expect(decline).toHaveFocus();
    expect(confirm).toHaveClass('MuiButton-textError');
  });

  it('leads with the confirming answer when the backend asks it to', () => {
    render(
      <ConfirmationDialog
        showState
        confirmationDialogSchema={{
          ...schema,
          title: 'Resume exported',
          confirm_button_text: 'Open folder',
          decline_button_text: 'Not now',
          primary_button: 'confirm',
          destructive: false,
        }}
        appActions={makeAppActions()}
      />,
    );

    const confirm = screen.getByRole('button', { name: 'Open folder' });

    expect(confirm).toHaveClass('MuiButton-containedPrimary');
    expect(confirm).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Not now' })).toHaveClass(
      'MuiButton-text',
    );
  });
});
