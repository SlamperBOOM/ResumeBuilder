import { Controller, useFormContext } from 'react-hook-form';
import { FormControlLabel, Switch } from '@mui/material';
import { FieldRendererProps, Toggle } from '../../../utils/resumeBlockTypes';
import { useTranslate } from '../../../utils/translations';

export default function ResumeToggle(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as Toggle;
  const translateKey = useTranslate(translations);

  const { control } = useFormContext();

  return (
    <Controller
      name={fieldNameOverride ?? currentField.resume_value}
      control={control}
      render={({ field: controllerField }) => (
        <FormControlLabel
          control={
            <Switch {...controllerField} checked={controllerField.value} />
          }
          label={translateKey(currentField.title)}
        />
      )}
    />
  );
}
