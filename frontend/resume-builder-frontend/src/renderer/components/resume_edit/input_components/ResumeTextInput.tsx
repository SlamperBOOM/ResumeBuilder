import { TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { FieldRendererProps, TextInput } from '../../../utils/resumeBlockTypes';

export default function ResumeTextInput(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as TextInput;

  const { control } = useFormContext();

  return (
    <Controller
      name={fieldNameOverride ?? currentField.resume_value}
      control={control}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          label={translations[currentField.title]}
          fullWidth
          margin="normal"
        />
      )}
    />
  );
}
