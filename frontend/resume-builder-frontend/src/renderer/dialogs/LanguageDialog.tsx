import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { AppActions } from '../utils/appActions';
import useSchemaApi from '../api/useSchemaApi';
import LanguageDialogResponse from '../DTO/LanguageDialogResponse';
import { translate } from '../utils/translations';
import logger from '../utils/logger';

type LanguageDialogProps = {
  showState: boolean;
  appActions: AppActions;
};

export default function LanguageDialog(props: LanguageDialogProps) {
  const { showState, appActions } = props;
  const { dialogActions } = appActions;

  const schemaApi = useSchemaApi();

  const [dialogData, setDialogData] = useState<LanguageDialogResponse | null>(
    null,
  );
  const [currentLocale, setCurrentLocale] = useState('');

  useEffect(() => {
    if (!showState) {
      return undefined;
    }
    let cancelled = false;
    schemaApi
      .getLanguageDialog()
      .then((response) => {
        if (!cancelled) {
          setCurrentLocale(response.payload.current_locale);
          setDialogData(response);
        }
        return null;
      })
      .catch((error) => {
        logger.error('Failed to load language dialog', error);
        if (!cancelled) {
          dialogActions.languageDialog.close();
          dialogActions.infoModal.open({
            title: undefined,
            text: error instanceof Error ? error.message : String(error),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showState, schemaApi, dialogActions]);

  if (!dialogData) {
    return null;
  }

  const { schema, translations, payload } = dialogData;
  const title = translate(translations, schema.title);

  const onSave = () => {
    dialogActions.languageDialog.close();
    if (currentLocale) {
      appActions.performBduAction(schema.save_action, {
        payload: { locale: currentLocale },
      });
    }
  };

  return (
    <Dialog
      open={showState}
      slotProps={{ transition: { onExited: () => setDialogData(null) } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          aria-label={title}
          name="locale"
          value={currentLocale}
          onChange={(_event, value) => setCurrentLocale(value)}
        >
          {payload.locales.map((locale) => (
            <FormControlLabel
              value={locale.locale}
              key={locale.locale}
              control={<Radio />}
              label={translate(translations, locale.key)}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={dialogActions.languageDialog.close}>
          {translate(translations, schema.cancel_key)}
        </Button>
        <Button onClick={onSave}>
          {translate(translations, schema.save_key)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
