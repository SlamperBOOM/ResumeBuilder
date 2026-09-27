import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useCallback } from 'react';
import { ConfirmationDialogSchema } from '../utils/backendTypes';
import { AppActions } from '../utils/appActions';

type ConfirmationDialogProps = {
  showState: boolean;
  confirmationDialogSchema: ConfirmationDialogSchema | undefined;
  appActions: AppActions;
};

export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { showState, confirmationDialogSchema, appActions } = props;

  const confirmActionCallback = useCallback(() => {
    if (!confirmationDialogSchema) {
      return;
    }
    appActions.performBduAction(confirmationDialogSchema.confirm_action, {
      payload: confirmationDialogSchema.confirm_action_payload,
    });
  }, [appActions, confirmationDialogSchema]);

  const confirmLeads = confirmationDialogSchema?.primary_button === 'confirm';
  const destructive = confirmationDialogSchema?.destructive ?? false;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {confirmationDialogSchema && (
        // Escape and a click outside always decline, never confirm.
        <Dialog
          open={showState}
          onClose={appActions.dialogActions.confirmationModal.close}
        >
          <DialogTitle>{confirmationDialogSchema.title}</DialogTitle>
          <DialogContent dividers>
            <DialogContentText>
              {confirmationDialogSchema.text}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant={confirmLeads ? 'text' : 'contained'}
              autoFocus={!confirmLeads}
              onClick={appActions.dialogActions.confirmationModal.close}
            >
              {confirmationDialogSchema.decline_button_text}
            </Button>
            <Button
              variant={confirmLeads ? 'contained' : 'text'}
              color={destructive ? 'error' : 'primary'}
              autoFocus={confirmLeads}
              onClick={() => {
                appActions.dialogActions.confirmationModal.close();
                confirmActionCallback();
              }}
            >
              {confirmationDialogSchema.confirm_button_text}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
