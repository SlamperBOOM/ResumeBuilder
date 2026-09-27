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

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {confirmationDialogSchema && (
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
              variant="contained"
              autoFocus
              onClick={appActions.dialogActions.confirmationModal.close}
            >
              {confirmationDialogSchema.decline_button_text}
            </Button>
            <Button
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
