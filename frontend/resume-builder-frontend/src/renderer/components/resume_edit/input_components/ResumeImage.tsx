import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Box, Button, Card, CardActions, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { FieldRendererProps, ImageInput } from '../../../utils/resumeBlockTypes';
import { validatePickedPath } from '../../../api/validatePickedPath';

// Converts an absolute filesystem path (Windows `C:\...` or POSIX `/...`)
// into a `file://` URL usable as an <img> src.
function toFileUrl(path: string): string {
  const normalized = path.replaceAll('\\', '/');
  const withLeadingSlash = normalized.startsWith('/')
    ? normalized
    : `/${normalized}`;
  return `file://${withLeadingSlash}`;
}

export default function ResumeImage(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as ImageInput;

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
            {translations[currentField.title]}
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
                src={toFileUrl(controllerField.value)}
                alt={translations[currentField.title]}
                onError={() => setErroredValue(controllerField.value)}
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
              {translations[currentField.empty_text_key]}
            </Typography>
          )}

          <CardActions sx={{ justifyContent: 'center' }}>
            <Button
              size="small"
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
                  console.error('Rejected image path from dialog:', fileName);
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
