import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Box, Button, Card, CardActions, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import {
  FieldRendererProps,
  ImageInput,
} from '../../../utils/resumeBlockTypes';
import { useTranslate } from '../../../utils/translations';
import { validatePickedPath } from '../../../api/validatePickedPath';
import { localFileOrigin } from '../../../utils/consts';
import logger from '../../../utils/logger';

// Converts an absolute filesystem path (Windows `C:\...` or POSIX `/...`)
// into an `app://local-file/...` URL usable as an <img> src.
function toLocalFileUrl(path: string): string {
  const normalized = path.replaceAll('\\', '/');
  return (
    localFileOrigin +
    encodeURI(normalized.startsWith('/') ? normalized : `/${normalized}`)
  );
}

export default function ResumeImage(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as ImageInput;
  const translateKey = useTranslate(translations);

  const { control } = useFormContext();

  // Tracks the last path that failed to load as a thumbnail, so we can
  // fall back to showing the raw path as text instead (e.g. if the CSP
  // blocks it, or the file no longer exists at that location).
  const [erroredValue, setErroredValue] = useState<string | null>(null);

  return (
    <Controller
      name={fieldNameOverride ?? currentField.resume_value}
      control={control}
      render={({ field: controllerField }) => (
        <Card
          sx={{
            width: 250,
          }}
        >
          <Typography variant="h6" sx={{ textAlign: 'center', padding: 1 }}>
            {translateKey(currentField.title)}
          </Typography>
          {controllerField.value ? (
            erroredValue === controllerField.value ? (
              <Typography
                variant="subtitle1"
                sx={{
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                }}
              >
                {controllerField.value}
              </Typography>
            ) : (
              <Box
                component="img"
                src={toLocalFileUrl(controllerField.value)}
                alt={translateKey(currentField.title)}
                onError={() => {
                  logger.warn(
                    'Failed to load image thumbnail:',
                    controllerField.value,
                  );
                  setErroredValue(controllerField.value);
                }}
                sx={{
                  display: 'block',
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                }}
              />
            )
          ) : (
            <Typography
              variant="subtitle1"
              sx={{
                width: '100%',
                height: '100%',
                textAlign: 'center',
                opacity: '50%',
              }}
            >
              {translateKey(currentField.empty_text_key)}
            </Typography>
          )}

          <CardActions sx={{ justifyContent: 'center' }}>
            <Button
              size="small"
              aria-label={translateKey(currentField.change_button_title)}
              onClick={async () => {
                const path = await window.electron.openImageDialog();
                const fileName = path.filePaths[0];

                if (!fileName) {
                  return;
                }

                if (
                  !validatePickedPath(fileName, {
                    allowedExtensions: ['.png', '.jpg', '.jpeg'],
                  })
                ) {
                  logger.warn('Rejected image path from dialog:', fileName);
                  return;
                }

                controllerField.onChange(fileName);
              }}
            >
              <Edit />
            </Button>

            <Button
              size="small"
              color="error"
              aria-label={translateKey(currentField.delete_button_title)}
              onClick={() => controllerField.onChange(null)}
            >
              <Delete />
            </Button>
          </CardActions>
        </Card>
      )}
    />
  );
}
