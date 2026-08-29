import { TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { FieldRendererProps, TextInput } from '../../../utils/resumeBlockTypes';
import { useTranslate } from '../../../utils/translations';

export default function ResumeTextInput(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as TextInput;
  const translateKey = useTranslate(translations);

  const { control } = useFormContext();

  return (
    <Controller
      name={fieldNameOverride ?? currentField.resume_value}
      control={control}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          label={translateKey(currentField.title)}
          fullWidth
          margin="normal"
        />
      )}
    />
  );
}
