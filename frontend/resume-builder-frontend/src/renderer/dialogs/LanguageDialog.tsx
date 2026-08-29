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
import {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppActions } from '../utils/appActions';
import useSchemaApi from '../api/useSchemaApi';
import { LanguageVariant } from '../DTO/LanguageDialogResponse';
import { translate } from '../utils/translations';

type LanguageDialogProps = {
  showState: boolean;
  appActions: AppActions;
};

export default function LanguageDialog(props: LanguageDialogProps) {
  const { showState, appActions } = props;

  const schemaApi = useSchemaApi();

  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [localeNodes, setLocaleNodes] = useState<Iterable<ReactNode>>([]);
  const [actionOnConfirm, setActionOnConfirm] = useState<string>('');
  const [cancelButtonText, setCancelButtonText] = useState<string>('');
  const [saveButtonText, setSaveButtonText] = useState<string>('');

  const [currentLocale, setCurrentLocale] = useState<string>('');

  useEffect(() => {
    schemaApi
      .getLanguageDialog()
      .then((schema) => {
        const dialogSchema = schema.schema;
        setLocaleNodes(
          schema.payload.locales.map((locale: LanguageVariant) => {
            return (
              <FormControlLabel
                value={locale.locale}
                key={locale.locale}
                control={<Radio />}
                label={translate(schema.translations, locale.key)}
              />
            );
          }),
        );
        setCurrentLocale(schema.payload.current_locale);
        setDialogTitle(translate(schema.translations, dialogSchema.title));
        setCancelButtonText(
          translate(schema.translations, dialogSchema.cancel_key),
        );
        setSaveButtonText(
          translate(schema.translations, dialogSchema.save_key),
        );
        setActionOnConfirm(dialogSchema.save_action);
        return null;
      })
      .catch((error) => {
        console.log(error);
      });
  }, [schemaApi, appActions.updateScreenMarker]);

  const onChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, value: string) => {
      setCurrentLocale(value);
    },
    [setCurrentLocale],
  );
  const onSave = useCallback(() => {
    appActions.dialogActions.languageDialog.close();
    if (currentLocale) {
      appActions.performBduAction(actionOnConfirm, {
        payload: { locale: currentLocale },
      });
    }
  }, [actionOnConfirm, appActions, currentLocale]);

  const radioGroupRef = useRef<HTMLElement>(null);

  return (
    <Dialog open={showState}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          ref={radioGroupRef}
          aria-label="ringtone"
          name="locale"
          value={currentLocale}
          onChange={onChange}
        >
          {localeNodes}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={appActions.dialogActions.languageDialog.close}
        >
          {cancelButtonText}
        </Button>
        <Button onClick={onSave}>{saveButtonText}</Button>
      </DialogActions>
    </Dialog>
  );
}
