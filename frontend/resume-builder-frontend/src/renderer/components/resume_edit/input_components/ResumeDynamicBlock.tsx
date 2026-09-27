import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  DynamicBlock,
  FieldRendererProps,
} from '../../../utils/resumeBlockTypes';
import { useTranslate } from '../../../utils/translations';
import DynamicBlockFieldRenderer from '../DynamicBlockFieldRenderer';

export default function ResumeDynamicBlock(props: FieldRendererProps) {
  const { resumeField, translations, resumeId } = props;
  const currentField = resumeField as DynamicBlock;
  const translateKey = useTranslate(translations);

  const arrayPath = currentField.blocks_list;

  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: arrayPath,
  });

  const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
  const closeConfirmation = () => setPendingRemoval(null);

  const deleteTitle = translateKey(currentField.delete_button_title);

  return (
    <>
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        {fields.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              px: 2,
              pb: 2,
              pt: 0.5,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="caption" color="text.secondary">
                {index + 1}
              </Typography>
              <Tooltip title={deleteTitle}>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={deleteTitle}
                  onClick={() => setPendingRemoval(index)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

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
          </Box>
        ))}

        <Button
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
          {translateKey(currentField.add_button_title)}
        </Button>
      </Stack>

      <Dialog open={pendingRemoval !== null} onClose={closeConfirmation}>
        <DialogTitle>
          {translateKey(currentField.delete_entry_confirm_title)}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            {translateKey(currentField.delete_entry_confirm_text)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" autoFocus onClick={closeConfirmation}>
            {translateKey(currentField.delete_entry_decline)}
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (pendingRemoval !== null) {
                remove(pendingRemoval);
              }
              closeConfirmation();
            }}
          >
            {translateKey(currentField.delete_entry_confirm)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
