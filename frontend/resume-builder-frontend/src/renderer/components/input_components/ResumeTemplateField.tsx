import { Controller, useFormContext } from 'react-hook-form';
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  FieldRendererProps,
  TemplateChooser,
} from '../../utils/resumeBlockTypes';
import useSchemaApi from '../../api/useSchemaApi';
import { TemplateInfo } from '../../DTO/TemplatesDTO';
import ResumePDFPreview, { ResumePreviewScaleEnum } from '../ResumePDFPreview';

export default function ResumeTemplateField(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride, resumeId } = props;
  const currentField = resumeField as TemplateChooser;

  const { control } = useFormContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [schema, setSchema] = useState<JSON>();

  const columnsForTemplateKey = 'columnsForTemplates';
  const [columns, setColumns] = useState<number>(
    parseInt(localStorage.getItem(columnsForTemplateKey)) || 4,
  );

  const schemaApi = useSchemaApi();
  useEffect(() => {
    if (initDialogOpen) {
      schemaApi
        .getTemplates(resumeId)
        .then((response) => {
          setTemplates(response.payload);
          setSchema(response.schema);
          setInitDialogOpen(false);
          setDialogOpen(true);
          return null;
        })
        .catch(() => {
          setDialogOpen(false);
        });
    }
  }, [resumeId, schemaApi, initDialogOpen]);

  return (
    <Controller
      name={fieldNameOverride ?? currentField.resume_value}
      control={control}
      render={({ field: controllerField }) => (
        <>
          <TextField
            label={translations[currentField.title]}
            value={controllerField.value}
            onClick={() => setInitDialogOpen(true)}
            fullWidth
            margin="normal"
            sx={{ cursor: 'pointer' }}
          />
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth={false}
            fullWidth
            scroll="paper"
            slotProps={{
              paper: {
                sx: {
                  width: '90vw',
                  height: '90vh',
                },
              },
            }}
          >
            <DialogTitle>
              {translations[currentField.template_choose_title]}
            </DialogTitle>

            <DialogContent dividers>
              <Slider
                min={2}
                max={6}
                step={null}
                value={columns}
                onChange={(_, value) => {
                  setColumns(value);
                  localStorage.setItem(columnsForTemplateKey, value.toString());
                }}
                marks={[
                  {
                    value: 2,
                    label: 2,
                  },
                  {
                    value: 3,
                    label: 3,
                  },
                  {
                    value: 4,
                    label: 4,
                  },
                  {
                    value: 6,
                    label: 6,
                  },
                ]}
              />
              <Grid container spacing={2}>
                {templates?.map((template) => {
                  return (
                    <Grid
                      size={{ xs: 12, sm: 12 / columns }}
                      key={template.name}
                    >
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border:
                            controllerField.value === template.name
                              ? '3px solid'
                              : '1px solid #ddd',
                          borderColor:
                            controllerField.value === template.name
                              ? 'primary.main'
                              : undefined,
                          transition: '0.2s',
                          '&:hover': {
                            boxShadow: 6,
                          },
                        }}
                        onClick={() => {
                          controllerField.onChange(template.name);
                          setDialogOpen(false);
                        }}
                      >
                        <ResumePDFPreview
                          preview={template.preview}
                          scaleType={ResumePreviewScaleEnum.FULL_WIDTH}
                        />

                        <CardContent>
                          <Typography textAlign="center">
                            {translations[schema[template.name]?.display_name]}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </DialogContent>
          </Dialog>
        </>
      )}
    />
  );
}
