import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DropDownList, FieldRendererProps } from '../../utils/resumeBlockTypes';

export default function ResumeDropDownList(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as DropDownList;

  const { control } = useFormContext();

  return (
    <Controller
      name={fieldNameOverride ?? currentField.resume_value}
      control={control}
      render={({ field: controllerField }) => (
        <FormControl fullWidth margin="normal">
          <InputLabel>{translations[currentField.title]}</InputLabel>
          <Select
            {...controllerField}
            value={controllerField.value ?? ''}
            label={translations[currentField.title]}
            onChange={(e) => {
              const val = e.target.value;
              controllerField.onChange(val === '' ? null : val);
            }}
          >
            {Object.keys(currentField.values).map((key: string) => {
              const title = currentField.values[key];
              return (
                <MenuItem key={key} value={key}>
                  {translations[title]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}
    />
  );
}
