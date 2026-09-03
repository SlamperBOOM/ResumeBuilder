import { Controller, useFormContext } from 'react-hook-form';
import {
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  FieldRendererProps,
  TemplateChooser,
} from '../../../utils/resumeBlockTypes';
import useSchemaApi from '../../../api/useSchemaApi';
import { TemplateInfo, TemplateSchema } from '../../../DTO/TemplatesDTO';
import { useTranslate } from '../../../utils/translations';
import ResumePDFPreview, {
  ResumePreviewScaleEnum,
} from '../../ResumePDFPreview';
import logger from '../../../utils/logger';

const CARD_ASPECT_RATIO = 210 / 297;

const GRID_GAP = 16;

export default function ResumeTemplateField(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride, resumeId } = props;
  const currentField = resumeField as TemplateChooser;
  const translateKey = useTranslate(translations);

  const { control } = useFormContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [initDialogOpen, setInitDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [schema, setSchema] = useState<TemplateSchema>();
  const [loadError, setLoadError] = useState(false);

  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  const contentRef = useCallback((node: HTMLDivElement | null) => {
    setContentEl(node);
  }, []);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!contentEl) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ width, height });
    });
    observer.observe(contentEl);

    return () => observer.disconnect();
  }, [contentEl]);

  const rowHeight = containerSize.height;
  const cardWidth = rowHeight * CARD_ASPECT_RATIO;
  const columns =
    cardWidth > 0
      ? Math.max(
          1,
          Math.floor((containerSize.width + GRID_GAP) / (cardWidth + GRID_GAP)),
        )
      : 1;

  const schemaApi = useSchemaApi();
  useEffect(() => {
    if (initDialogOpen) {
      schemaApi
        .getTemplates(resumeId)
        .then((response) => {
          setTemplates(response.payload);
          setSchema(response.schema);
          setInitDialogOpen(false);
          setLoadError(false);
          setDialogOpen(true);
          return null;
        })
        .catch((error) => {
          logger.error('Failed to load templates', error);
          setDialogOpen(false);
          setInitDialogOpen(false);
          setLoadError(true);
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
            label={translateKey(currentField.title)}
            value={controllerField.value}
            onClick={() => setInitDialogOpen(true)}
            fullWidth
            margin="normal"
            sx={{ cursor: 'pointer' }}
          />
          {loadError && (
            <Alert severity="error" onClose={() => setLoadError(false)}>
              Failed to load templates. Please try again.
            </Alert>
          )}
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
              {translateKey(currentField.template_choose_title)}
            </DialogTitle>

            <DialogContent ref={contentRef} dividers>
              {rowHeight > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, ${cardWidth}px)`,
                    gap: GRID_GAP,
                    justifyContent: 'center',
                  }}
                >
                  {templates?.map((template) => {
                    return (
                      <Card
                        key={template.name}
                        sx={{
                          width: cardWidth,
                          height: rowHeight,
                          display: 'flex',
                          flexDirection: 'column',
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
                        <div
                          style={{
                            flex: '1 1 auto',
                            minHeight: 0,
                            overflow: 'hidden',
                          }}
                        >
                          <ResumePDFPreview
                            preview={template.preview}
                            scaleType={ResumePreviewScaleEnum.FULL_HEIGHT}
                          />
                        </div>

                        <CardContent sx={{ flex: '0 0 auto' }}>
                          <Typography textAlign="center">
                            {translateKey(
                              schema[template.name]?.display_name ?? '',
                            )}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    />
  );
}
