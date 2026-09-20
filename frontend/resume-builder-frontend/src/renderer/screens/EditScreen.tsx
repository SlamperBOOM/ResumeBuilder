import {
  Box,
  Button,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { getSetting, setSetting } from '../utils/settings';

type EditScreenProps = {
  appActions: AppActions;
};

const LAYOUT_SAVE_DEBOUNCE_MS = 100;

function EditScreenSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
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
  const layout = getSetting('editorLayout');
  const [previewScale, setPreviewScale] = useState(() =>
    getSetting('editPreviewScale'),
  );
  const [previewMode, setPreviewMode] = useState<ResumePreviewScaleEnum>(() => {
    const stored = getSetting('editPreviewMode');
    const validModes = Object.values(ResumePreviewScaleEnum) as string[];
    return validModes.includes(stored)
      ? (stored as ResumePreviewScaleEnum)
      : ResumePreviewScaleEnum.FULL_HEIGHT;
  });

  const { translations } = editSchema ?? {};
  const translateKey = useTranslate(translations);

  const handlePreviewModeChange = useCallback(
    (mode: ResumePreviewScaleEnum) => {
      setPreviewMode(mode);
      setSetting('editPreviewMode', mode);
    },
    [],
  );

  const handlePreviewScaleChange = useCallback((scale: number) => {
    setPreviewScale(scale);
    setSetting('editPreviewScale', scale);
  }, []);

  const layoutSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLayoutChanged = useCallback((sizes: Layout) => {
    const arraySizes = Object.values(sizes).map((value) => value.toString());
    if (layoutSaveTimeout.current) clearTimeout(layoutSaveTimeout.current);
    layoutSaveTimeout.current = setTimeout(() => {
      setSetting('editorLayout', arraySizes);
    }, LAYOUT_SAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (layoutSaveTimeout.current) clearTimeout(layoutSaveTimeout.current);
    };
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
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: 'surface.editor',
      }}
    >
      {editSchema && schema ? (
        <>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              px: 2,
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => {
                appActions.performBduAction(BDU_ACTION_OPEN_MAIN_SCREEN, {
                  payload: { resume_id: resumeId },
                });
              }}
            >
              {translateKey(schema.edit_area.to_main_screen_title)}
            </Button>

            <Divider orientation="vertical" flexItem />

            <Typography variant="h6" noWrap sx={{ flex: 1, minWidth: 0 }}>
              {editSchema.payload.resume.resume_name}
            </Typography>

            <Button
              variant="contained"
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

          <Group orientation="horizontal" onLayoutChanged={handleLayoutChanged}>
            {/* Left part -- block rail + form */}
            <Panel defaultSize={layout[0]} minSize="30">
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  backgroundColor: 'background.paper',
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <EditArea
                  appActions={appActions}
                  editSchemaResponse={editSchema}
                  setEditSchema={setEditSchema}
                />
              </Box>
            </Panel>

            <Separator
              style={{
                width: '6px',
                background: 'var(--mui-palette-primary-main)',
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
                  scaleTitle={translateKey(
                    schema.edit_area.preview.scale_title,
                  )}
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
        </>
      ) : (
        <EditScreenSkeleton />
      )}
    </Box>
  );
}
