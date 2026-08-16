import {
  Alert,
  Box,
  Button,
  colors,
  FormControlLabel,
  Radio,
  RadioGroup,
  Skeleton,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppActions, ScreenSource } from '../utils/appActions';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';
import { EditArea } from '../components/EditArea';
import { EditScreenSchema } from '../utils/backendTypes';
import ResumePDFPreview, {
  ResumePreviewScaleEnum,
} from '../components/ResumePDFPreview';

type EditScreenProps = {
  appActions: AppActions;
};

function EditScreenSkeleton() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        minHeight: 0,
      }}
    >
      <Skeleton
        variant="rounded"
        width="33vw"
        height="100vh"
        animation="wave"
      />
    </Box>
  );
}

function EditScreenError(props: { onRetry: () => void }) {
  const { onRetry } = props;
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Alert severity="error">Failed to load the resume editor.</Alert>
      <Button variant="contained" onClick={onRetry}>
        Retry
      </Button>
    </Box>
  );
}

const previewScaleMarks = [
  {
    value: 0.1,
    label: '10%',
  },
  {
    value: 0.25,
    label: '25%',
  },
  {
    value: 0.5,
    label: '50%',
  },
  {
    value: 0.75,
    label: '75%',
  },
  {
    value: 1,
    label: '100%',
  },
];

export default function EditScreen(props: EditScreenProps) {
  const { appActions } = props;
  const { resumeId } = useParams();
  const [editSchema, setEditSchema] = useState<SchemaResponseDTO>();
  const schema = editSchema?.schema as EditScreenSchema;
  const layout = (() => {
    try {
      const parsed = JSON.parse(
        localStorage.getItem('editorLayout') || '["40","60"]',
      );
      return Array.isArray(parsed) && parsed.length === 2
        ? parsed
        : ['40', '60'];
    } catch {
      return ['40', '60'];
    }
  })();
  const previewScaleKey = 'editPreviewScale';
  const previewModeKey = 'editPreviewMode';
  const [previewScale, setPreviewScale] = useState(
    Number.parseInt(localStorage.getItem(previewScaleKey), 10) || 0.5,
  );
  const [previewMode, setPreviewMode] = useState<ResumePreviewScaleEnum>(() => {
    const stored = localStorage.getItem(previewModeKey);
    const validModes = Object.values(ResumePreviewScaleEnum) as string[];
    return validModes.includes(stored ?? '')
      ? (stored as ResumePreviewScaleEnum)
      : ResumePreviewScaleEnum.FULL_HEIGHT;
  });

  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoadError(false);
    appActions
      .updateCurrentScreen({
        source: ScreenSource.EDIT,
        screenUpdateFunction: setEditSchema,
        resumeId,
      })
      .catch((error) => {
        console.error('Failed to load edit screen', error);
        setLoadError(true);
      });
  }, [appActions, resumeId, retryCount]);

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: '#f5f7fa',
      }}
    >
      {editSchema ? (
        <Group
          orientation="horizontal"
          onLayoutChanged={(sizes: Layout) => {
            const arraySizes = Object.values(sizes).map(
              (value, _index, _array) => {
                return value.toString();
              },
            );
            localStorage.setItem('editorLayout', JSON.stringify(arraySizes));
          }}
        >
          {/* Left part -- Form */}
          <Panel defaultSize={layout[0]} minSize="30">
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                borderRight: '1px solid #e0e0e0',
              }}
            >
              <Stack
                spacing={2}
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  zIndex: 1,
                }}
              >
                <Button
                  onClick={() => {
                    appActions.performBduAction('open_main_screen', {
                      payload: { resume_id: resumeId },
                    });
                  }}
                >
                  {
                    editSchema.translations[
                      schema.edit_area.to_main_screen_title
                    ]
                  }
                </Button>

                <Button
                  onClick={() =>
                    appActions.performBduAction(
                      schema.edit_area.export_button.action,
                      {
                        payload: {
                          resume_id: editSchema.payload.resume.resume_id,
                          resume_name: editSchema.payload.resume.resume_name,
                        },
                      },
                    )
                  }
                >
                  {editSchema.translations[schema.edit_area.export_button.key]}
                </Button>
              </Stack>

              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  minHeight: 0,
                }}
              >
                {editSchema && (
                  <EditArea
                    appActions={appActions}
                    editSchemaResponse={editSchema}
                    setEditSchema={setEditSchema}
                  />
                )}
              </Box>
            </Box>
          </Panel>

          <Separator
            style={{
              width: '6px',
              background: colors.blue[700],
              cursor: 'col-resize',
            }}
          />

          {/* Right part — preview */}
          <Panel defaultSize={layout[1]} minSize="30">
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  justifyContent: 'center',
                }}
              >
                <ResumePDFPreview
                  preview={editSchema?.payload?.preview}
                  paginated
                  scaleType={previewMode}
                  scale={previewScale}
                />
              </Box>

              <Box
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderTop: 1,
                  borderColor: 'divider',
                  justifyContent: 'center',
                  display: 'flex',
                  zIndex: 1,
                }}
              >
                <Stack direction="row" spacing={3} alignItems="center">
                  <Typography>
                    {
                      editSchema.translations[
                        schema.edit_area.preview.scale_title
                      ]
                    }
                  </Typography>
                  <RadioGroup
                    row
                    value={previewMode}
                    onChange={(e) => {
                      setPreviewMode(e.target.value);
                      localStorage.setItem(previewModeKey, e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value={ResumePreviewScaleEnum.FULL_WIDTH}
                      control={<Radio />}
                      label={
                        editSchema.translations[
                          schema.edit_area.preview.full_width_option_key
                        ]
                      }
                    />
                    <FormControlLabel
                      value={ResumePreviewScaleEnum.FULL_HEIGHT}
                      control={<Radio />}
                      label={
                        editSchema.translations[
                          schema.edit_area.preview.full_height_option_key
                        ]
                      }
                    />
                    <FormControlLabel
                      value={ResumePreviewScaleEnum.CUSTOM}
                      control={<Radio />}
                      label={
                        editSchema.translations[
                          schema.edit_area.preview.custom_option_key
                        ]
                      }
                    />
                  </RadioGroup>

                  <Box
                    sx={{
                      flex: 1,
                      maxWidth: 500,
                      minWidth: 250,
                    }}
                  >
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.1}
                      disabled={previewMode !== ResumePreviewScaleEnum.CUSTOM}
                      value={previewScale}
                      onChange={(_, value) => {
                        setPreviewScale(value);
                        localStorage.setItem(previewScaleKey, value.toString());
                      }}
                      marks={previewScaleMarks}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      width: 48,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {`${previewScale * 100}%`}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Panel>
        </Group>
      ) : loadError ? (
        <EditScreenError onRetry={() => setRetryCount((c) => c + 1)} />
      ) : (
        <EditScreenSkeleton />
      )}
    </Box>
  );
}
