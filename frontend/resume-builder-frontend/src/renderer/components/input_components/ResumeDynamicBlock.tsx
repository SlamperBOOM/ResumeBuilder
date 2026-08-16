import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DynamicBlock, FieldRendererProps } from '../../utils/resumeBlockTypes';
import DynamicBlockFieldRenderer from '../DynamicBlockFieldRenderer';

export default function ResumeDynamicBlock(props: FieldRendererProps) {
  const { resumeField, translations, resumeId } = props;
  const currentField = resumeField as DynamicBlock;

  const arrayPath = currentField.blocks_list;

  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: arrayPath,
  });

  return (
    <>
      {fields.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            border: 1,
            padding: 2,
            borderRadius: 2,
            marginTop: 1,
            marginBottom: 1,
          }}
        >
          {Object.keys(currentField.block_format).map((subKey) => {
            const subField = currentField.block_format[subKey];
            const fieldName = `${arrayPath}.${index}.${subField.resume_value}`;
            return (
              <DynamicBlockFieldRenderer
                key={subKey}
                resumeField={subField}
                translations={translations}
                fieldNameOverride={fieldName}
                resumeId={resumeId}
              />
            );
          })}
          <Button onClick={() => remove(index)}>
            <DeleteIcon color="error" />
          </Button>
        </Box>
      ))}

      <Button
        sx={{ marginTop: 1 }}
        onClick={() =>
          append(
            Object.fromEntries(
              Object.keys(currentField.block_format).map((key) => [
                currentField.block_format[key].resume_value,
                null,
              ]),
            ),
          )
        }
        fullWidth
        variant="contained"
      >
        {translations[currentField.add_button_title]}
      </Button>
    </>
  );
}
