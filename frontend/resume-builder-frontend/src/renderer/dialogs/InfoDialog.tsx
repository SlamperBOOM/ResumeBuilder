import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import AppDialogActions from './appDialogActions';
import { InfoModalSchema } from '../utils/backendTypes';

type InfoDialogProps = {
  showState: boolean;
  schema: InfoModalSchema | undefined;
  dialogActions: AppDialogActions;
};

export default function InfoDialog(props: InfoDialogProps) {
  const { showState, schema, dialogActions } = props;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {schema && (
        <Dialog open={showState}>
          {schema.title && <DialogTitle>{schema.title}</DialogTitle>}
          <DialogContent dividers>
            <DialogContentText>{schema.text}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              variant="contained"
              onClick={dialogActions.infoModal.close}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
