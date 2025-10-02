import { Controller, useFormContext } from 'react-hook-form';
import { FormControlLabel, Switch } from '@mui/material';
import { FieldRendererProps, Toggle } from '../../utils/resumeBlockTypes';

export default function ResumeToggle(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as Toggle;

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
          label={translations[currentField.title]}
        />
      )}
    />
  );
}
