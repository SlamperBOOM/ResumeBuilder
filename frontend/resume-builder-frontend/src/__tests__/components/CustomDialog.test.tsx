import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomDialog from '../../renderer/dialogs/CustomDialog';
import { CustomDialogSchema } from '../../renderer/utils/backendTypes';
import { makeAppActions } from '../../testUtils/appActions';

const schema: CustomDialogSchema = {
  title: 'Export options',
  text: 'Choose a format.',
  decline_button_text: 'Cancel',
  actions: [
    {
      title: 'PDF',
      action: 'export_pdf',
      payload: { format: 'pdf' } as unknown as JSON,
    },
    {
      title: 'DOCX',
      action: 'export_docx',
      payload: { format: 'docx' } as unknown as JSON,
    },
  ],
};

describe('CustomDialog', () => {
  it('renders the title, text, decline button and one button per action', () => {
    render(
      <CustomDialog
        showState
        customDialogSchema={schema}
        appActions={makeAppActions()}
      />,
    );

    expect(screen.getByText('Export options')).toBeInTheDocument();
    expect(screen.getByText('Choose a format.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DOCX' })).toBeInTheDocument();
  });

  it('closes without dispatching an action when declined', () => {
    const appActions = makeAppActions();
    render(
      <CustomDialog
        showState
        customDialogSchema={schema}
        appActions={appActions}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(appActions.dialogActions.customModal.close).toHaveBeenCalledTimes(1);
    expect(appActions.performBduAction).not.toHaveBeenCalled();
  });

  it('dispatches each action independently', () => {
    const appActions = makeAppActions();
    render(
      <CustomDialog
        showState
        customDialogSchema={schema}
        appActions={appActions}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'PDF' }));

    expect(appActions.dialogActions.customModal.close).toHaveBeenCalledTimes(1);
    expect(appActions.performBduAction).toHaveBeenCalledWith('export_pdf', {
      payload: { format: 'pdf' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'DOCX' }));

    expect(appActions.dialogActions.customModal.close).toHaveBeenCalledTimes(2);
    expect(appActions.performBduAction).toHaveBeenLastCalledWith(
      'export_docx',
      { payload: { format: 'docx' } },
    );
  });
});
