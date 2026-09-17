import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AppDialogActions from './appDialogActions';
import { HelpModalSchema } from '../utils/backendTypes';

type HelpDialogProps = {
  showState: boolean;
  schema: HelpModalSchema | undefined;
  dialogActions: AppDialogActions;
};

export default function HelpDialog(props: HelpDialogProps) {
  const { showState, schema, dialogActions } = props;

  if (!schema) {
    return null;
  }

  return (
    <Dialog open={showState} onClose={dialogActions.helpModal.close} fullScreen>
      <DialogTitle sx={{ pr: 7 }}>{schema.title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={dialogActions.helpModal.close}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers sx={{ p: 0, display: 'flex' }}>
        {/* The iframe keeps the page's CSS and the app's theme apart. The
            backend-rendered page is plain HTML, and without allow-scripts
            nothing in it runs. allow-same-origin is needed for the links of
            the page's table of contents: they point at about:srcdoc#<section>
            (see the <base> tag in help_page.html), and a frame with an opaque
            origin is not allowed to navigate there */}
        <iframe
          title={schema.title}
          sandbox="allow-same-origin"
          srcDoc={schema.html}
          style={{ flex: 1, border: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
}
