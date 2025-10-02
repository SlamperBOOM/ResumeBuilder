import { TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { FieldRendererProps, TextArea } from '../../utils/resumeBlockTypes';

export default function ResumeTextArea(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as TextArea;

  const { control } = useFormContext();

  return (
    <Controller
      name={fieldNameOverride ?? currentField.resume_value}
      control={control}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          multiline
          minRows={3}
          label={translations[currentField.title]}
          fullWidth
          margin="normal"
        />
      )}
    />
  );
}
