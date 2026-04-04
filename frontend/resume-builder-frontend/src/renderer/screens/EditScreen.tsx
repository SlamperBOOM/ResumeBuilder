import { Box, Button, colors, Paper, Skeleton } from '@mui/material';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppActions, ScreenSource } from '../utils/appActions';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';
import { EditArea } from '../components/EditArea';

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
  const [editSchema, setEditSchema] = useState<SchemaResponseDTO>();
  const layout = JSON.parse(
    localStorage.getItem('editorLayout') || '["40","60"]',
  );

  useEffect(() => {
    appActions.updateCurrentScreen({
      source: ScreenSource.EDIT,
      screenUpdateFunction: setEditSchema,
      resumeId,
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
          {/* Левая часть — форма */}
          <Panel defaultSize={layout[0]} minSize="30">
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                borderRight: '1px solid #e0e0e0',
              }}
            >
              <Button
                onClick={() => {
                  appActions.performBduAction('open_main_screen', {
                    payload: { resume_id: resumeId },
                  });
                }}
                sx={{ margin: 2 }}
              >
                {
                  editSchema.translations[
                    editSchema.schema.edit_area.to_main_screen_title
                  ]
                }
              </Button>
              <Button
                onClick={() =>
                  appActions.performBduAction(
                    editSchema.schema.edit_area.export_button.action,
                    {
                      payload: {
                        resume_id: editSchema.payload.resume.resume_id,
                        resume_name: editSchema.payload.resume.resume_name,
                      },
                    },
                  )
                }
              >
                {
                  editSchema.translations[
                    editSchema.schema.edit_area.export_button.key
                  ]
                }
              </Button>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 2,
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

          {/* Правая часть — preview */}
          <Panel defaultSize={layout[1]} minSize="30">
            <Box
              sx={{
                // width: '60vw',
                overflowY: 'auto',
                display: 'flex',
                justifyContent: 'center',
                padding: 4,
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  width: '50vw',
                  padding: 4,
                  overflow: 'auto',
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: editSchema && editSchema.payload?.preview,
                  }}
                />
              </Paper>
            </Box>
          </Panel>
        </Group>
      ) : (
        EditScreenSkeleton()
      )}
    </Box>
  );
}
