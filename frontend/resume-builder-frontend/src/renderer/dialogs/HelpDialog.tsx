import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Palette, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AppDialogActions from './appDialogActions';
import { HelpModalSchema } from '../utils/backendTypes';

type HelpDialogProps = {
  showState: boolean;
  schema: HelpModalSchema | undefined;
  dialogActions: AppDialogActions;
};

// The help page styles itself with CSS variables (see help_page.html). The
// style block below overrides them with the app theme, for both schemes: the
// frame follows prefers-color-scheme the same way the app does
function themeVars({ palette: p }: { palette: Palette }) {
  return (
    `--accent:${p.primary.main};--on-accent:${p.primary.contrastText};` +
    `--bg:${p.background.paper};--text:${p.text.primary};` +
    `--muted:${p.text.secondary};--line:${p.divider};--surface:${p.surface.editor};`
  );
}

export default function HelpDialog(props: HelpDialogProps) {
  const { showState, schema, dialogActions } = props;
  const theme = useTheme();

  if (!schema) {
    return null;
  }

  const { light, dark } = theme.colorSchemes;
  const themeCss =
    light && dark
      ? `<style>:root{${themeVars(light)}}` +
        `@media (prefers-color-scheme: dark){:root{${themeVars(dark)}}}</style>`
      : '';

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
          srcDoc={schema.html.replace('</head>', `${themeCss}</head>`)}
          style={{ flex: 1, border: 'none' }}
        />
      </DialogContent>
    </Dialog>
  );
}
