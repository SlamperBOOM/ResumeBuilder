import { Box, Button, colors, Skeleton, Stack } from '@mui/material';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { AppActions, ScreenSource } from '../utils/appActions';
import { BDU_ACTION_OPEN_MAIN_SCREEN } from '../api/useActionApi';
import { EditArea } from '../components/EditArea';
import { useTranslate } from '../utils/translations';
import ResumePDFPreview, {
  ResumePreviewScaleEnum,
} from '../components/ResumePDFPreview';
import PreviewControls from '../components/PreviewControls';
import EditScreenResponse from '../DTO/EditScreenResponse';
import logger from '../utils/logger';

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

export default function EditScreen(props: EditScreenProps) {
  const { appActions } = props;
  const { resumeId } = useParams();
  const [editSchema, setEditSchema] = useState<EditScreenResponse | null>(null);
  const schema = editSchema?.schema;
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

  const { translations } = editSchema ?? {};
  const translateKey = useTranslate(translations);

  const handlePreviewModeChange = useCallback(
    (mode: ResumePreviewScaleEnum) => {
      setPreviewMode(mode);
      localStorage.setItem(previewModeKey, mode);
    },
    [],
  );

  const handlePreviewScaleChange = useCallback((scale: number) => {
    setPreviewScale(scale);
    localStorage.setItem(previewScaleKey, scale.toString());
  }, []);

  useEffect(() => {
    appActions
      .updateCurrentScreen({
        source: ScreenSource.EDIT,
        screenUpdateFunction: setEditSchema,
        resumeId,
      })
      .catch((error) => {
        logger.error('Failed to load edit screen', error);
        window.location.reload();
      });
  }, [appActions, resumeId]);

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
                    appActions.performBduAction(BDU_ACTION_OPEN_MAIN_SCREEN, {
                      payload: { resume_id: resumeId },
                    });
                  }}
                >
                  {translateKey(schema.edit_area.to_main_screen_title)}
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
                  {translateKey(schema.edit_area.export_button.key)}
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

              <PreviewControls
                scaleTitle={translateKey(schema.edit_area.preview.scale_title)}
                fullWidthLabel={translateKey(
                  schema.edit_area.preview.full_width_option_key,
                )}
                fullHeightLabel={translateKey(
                  schema.edit_area.preview.full_height_option_key,
                )}
                customLabel={translateKey(
                  schema.edit_area.preview.custom_option_key,
                )}
                previewMode={previewMode}
                onPreviewModeChange={handlePreviewModeChange}
                previewScale={previewScale}
                onPreviewScaleChange={handlePreviewScaleChange}
              />
            </Box>
          </Panel>
        </Group>
      ) : (
        <EditScreenSkeleton />
      )}
    </Box>
  );
}
