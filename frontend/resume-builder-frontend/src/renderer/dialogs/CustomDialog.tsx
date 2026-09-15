import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  BDUActionPayload,
  CustomActionButton,
  CustomDialogSchema,
} from '../utils/backendTypes';
import { AppActions } from '../utils/appActions';

type CustomDialogProps = {
  showState: boolean;
  customDialogSchema: CustomDialogSchema | undefined;
  appActions: AppActions;
};

export default function CustomDialog(props: CustomDialogProps) {
  const { showState, customDialogSchema, appActions } = props;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {customDialogSchema && (
        <Dialog open={showState}>
          <DialogTitle>{customDialogSchema.title}</DialogTitle>
          <DialogContent dividers>
            <DialogContentText>{customDialogSchema.text}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              autoFocus
              onClick={appActions.dialogActions.customModal.close}
            >
              {customDialogSchema.decline_button_text}
            </Button>
            {customDialogSchema.actions.map((button: CustomActionButton) => {
              return (
                <Button
                  key={button.action}
                  onClick={() => {
                    appActions.dialogActions.customModal.close();
                    appActions.performBduAction(button.action, {
                      payload: button.payload as BDUActionPayload,
                    });
                  }}
                >
                  {button.title}
                </Button>
              );
            })}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
