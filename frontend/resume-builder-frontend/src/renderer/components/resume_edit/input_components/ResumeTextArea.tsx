import { TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { FieldRendererProps, TextArea } from '../../../utils/resumeBlockTypes';
import { useTranslate } from '../../../utils/translations';

export default function ResumeTextArea(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as TextArea;
  const translateKey = useTranslate(translations);

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
          label={translateKey(currentField.title)}
          fullWidth
          margin="normal"
        />
      )}
    />
  );
}
