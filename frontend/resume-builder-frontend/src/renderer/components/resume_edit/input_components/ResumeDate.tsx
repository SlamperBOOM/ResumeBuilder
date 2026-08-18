import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { FormControl } from '@mui/material';
import {
  DateInput,
  DateVariant,
  FieldRendererProps,
} from '../../../utils/resumeBlockTypes';

export default function ResumeDate(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const currentField = resumeField as DateInput;

  const { control } = useFormContext();

  return (
    <Controller
      name={fieldNameOverride ?? currentField.resume_value}
      control={control}
      render={({ field: controllerField }) => (
        <FormControl fullWidth margin="normal">
          <DatePicker
            {...controllerField}
            label={translations[currentField.title]}
            sx={{ margin: 'normal' }}
            value={controllerField.value ? dayjs(controllerField.value) : null}
            views={
              currentField.variant === DateVariant.full
                ? ['year', 'month', 'day']
                : ['year', 'month']
            }
            onChange={(newValue) => {
              controllerField.onChange(
                newValue ? newValue.format('YYYY-MM-DD') : null,
              );
            }}
            slotProps={{
              field: {
                clearable: true,
                onClear: () => controllerField.onChange(null),
              },
            }}
          />
        </FormControl>
      )}
    />
  );
}
