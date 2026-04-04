import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import AppDialogActions from './appDialogActions';

type InfoDialogProps = {
  showState: boolean;
  title: string | undefined;
  text: string;
  dialogActions: AppDialogActions;
};

export default function InfoDialog(props: InfoDialogProps) {
  const { showState, title, text, dialogActions } = props;

  return (
    <Dialog open={showState}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent dividers>
        <DialogContentText>{text}</DialogContentText>
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
  );
}
