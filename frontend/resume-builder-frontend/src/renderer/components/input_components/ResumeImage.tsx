import { Controller, useFormContext } from 'react-hook-form';
import {
  Button,
  Card,
  CardActions,
  Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { FieldRendererProps, ImageInput } from '../../utils/resumeBlockTypes';

export default function ResumeImage(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as ImageInput;

  const { control } = useFormContext();

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
            <Typography
              variant="subtitle1"
              sx={{
                width: '100%',
                height: '100%',
                textAlign: 'center',
              }}
            >
              {controllerField.value}
            </Typography>
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
              component="label"
              size="small"
              onClick={async () => {
                const path = await window.electron.openImageDialog();
                console.log(path.filePaths[0]);

                controllerField.onChange(path.filePaths[0]);
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
