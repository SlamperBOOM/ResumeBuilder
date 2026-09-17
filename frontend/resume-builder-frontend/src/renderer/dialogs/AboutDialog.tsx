import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import appIcon from '../../../assets/icon.png';
import AppDialogActions from './appDialogActions';
import { AboutModalSchema } from '../utils/backendTypes';
import logger from '../utils/logger';

type AboutDialogProps = {
  showState: boolean;
  schema: AboutModalSchema | undefined;
  dialogActions: AppDialogActions;
};

export default function AboutDialog(props: AboutDialogProps) {
  const { showState, schema, dialogActions } = props;
  const [version, setVersion] = useState('');

  useEffect(() => {
    if (!showState) {
      return;
    }
    window.electron
      .getAppVersion()
      .then((appVersion) => {
        setVersion(appVersion);
        return null;
      })
      .catch((error) => logger.error('Failed to read the app version', error));
  }, [showState]);

  if (!schema) {
    return null;
  }

  const openLink = (url: string) => {
    window.electron
      .openExternal(url)
      .catch((error) => logger.error(`Failed to open ${url}`, error));
  };

  return (
    <Dialog
      open={showState}
      onClose={dialogActions.aboutModal.close}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent>
        <Stack spacing={1} alignItems="center" textAlign="center">
          <Box
            component="img"
            src={appIcon}
            alt=""
            sx={{ width: 72, height: 72 }}
          />
          <Typography variant="h5" component="h2">
            {schema.app_name}
          </Typography>
          {version && (
            <Typography variant="body2" color="text.secondary">
              {`${schema.version_label} ${version}`}
            </Typography>
          )}
          <Typography variant="body2">{schema.copyright}</Typography>
          <Typography variant="body2" color="text.secondary">
            {schema.license}
          </Typography>
          <Stack direction="row" spacing={2}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link
              component="button"
              variant="body2"
              onClick={() => openLink(schema.github_url)}
            >
              {schema.github_title}
            </Link>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link
              component="button"
              variant="body2"
              onClick={() => openLink(schema.issues_url)}
            >
              {schema.issues_title}
            </Link>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          autoFocus
          variant="contained"
          onClick={dialogActions.aboutModal.close}
        >
          {schema.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
