import { useForm, FormProvider } from 'react-hook-form';
import { Box, Stack, Typography } from '@mui/material';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ResumeFormValues, UpdatePayload } from '../utils/backendTypes';
import EditScreenResponse from '../DTO/EditScreenResponse';
import FieldRenderer from './resume_edit/FieldRenderer';
import BlockRail from './resume_edit/BlockRail';
import ResumeBlock from './resume_edit/input_components/ResumeBlock';
import { AppActions, ScreenSource } from '../utils/appActions';
import { BDU_ACTION_UPDATE } from '../api/useActionApi';
import { useTranslate } from '../utils/translations';
import { getSetting, setSetting } from '../utils/settings';
import logger from '../utils/logger';

// Add additional locales for date here
import 'dayjs/locale/ru';

const LAYOUT_SAVE_DEBOUNCE_MS = 100;

export type EditAreaProps = {
  appActions: AppActions;
  editSchemaResponse: EditScreenResponse;
  setEditSchema: (schema: EditScreenResponse) => void;
};

export function EditArea(props: EditAreaProps) {
  const { appActions, editSchemaResponse, setEditSchema } = props;
  const editSchema = editSchemaResponse.schema;

  const { translations } = editSchemaResponse;
  const translateKey = useTranslate(translations);
  const resumeId = editSchemaResponse.payload.resume.resume_id;

  const blocks = editSchema.edit_area.resume_blocks;
  const blockKeys = useMemo(() => Object.keys(blocks), [blocks]);
  const [activeBlockKey, setActiveBlockKey] = useState(blockKeys[0]);

  const blocksLayout = getSetting('editorBlocksLayout');
  const layoutSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLayoutChanged = useCallback((sizes: Layout) => {
    const arraySizes = Object.values(sizes).map((value) => value.toString());
    if (layoutSaveTimeout.current) clearTimeout(layoutSaveTimeout.current);
    layoutSaveTimeout.current = setTimeout(() => {
      setSetting('editorBlocksLayout', arraySizes);
    }, LAYOUT_SAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (layoutSaveTimeout.current) clearTimeout(layoutSaveTimeout.current);
    };
  }, []);

  // A schema reload must not leave a block selected that no longer exists.
  useEffect(() => {
    setActiveBlockKey((current) =>
      blockKeys.includes(current) ? current : blockKeys[0],
    );
  }, [blockKeys]);

  const methods = useForm({
    defaultValues: editSchemaResponse.payload.resume,
    mode: 'onChange',
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const onSubmit = useCallback(
    (data: ResumeFormValues) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      logger.debug('Saving resume:', data);
      const updatePayload: UpdatePayload = {
        resume_id: data.resume_id,
        resume_info: {
          resume_name: data.resume_name,
          resume_locale: data.resume_locale,
          template_name: data.template_name,
        },
        content: [],
      };

      Object.keys(data.blocks ?? {}).forEach((blockKey: string) => {
        const block = data.blocks[blockKey];
        updatePayload.content.push({
          block: blockKey,
          payload: block,
        });
      });
      appActions.performBduAction(BDU_ACTION_UPDATE, {
        payload: { update_payload: updatePayload },
        updateScreenPayload: {
          source: ScreenSource.EDIT,
          screenUpdateFunction: setEditSchema,
          resumeId: data.resume_id,
        },
      });
    },
    [appActions, setEditSchema],
  );

  useEffect(() => {
    const subscription = methods.watch((_values, { type }) => {
      if (type !== 'change') {
        return;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        methods.handleSubmit(onSubmit)();
      }, 2000);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [methods, onSubmit]);

  const activeBlock = blocks[activeBlockKey];

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={translations.locale_name}
        >
          {/* Resume-wide fields, above the blocks: they belong to no block. */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'flex-start',
              px: 2,
              pb: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {[
              editSchema.edit_area.resume_name,
              editSchema.edit_area.resume_locale,
              editSchema.edit_area.template,
            ].map((field) => (
              <Box
                key={field.resume_value}
                sx={{ flex: '1 1 150px', minWidth: 0 }}
              >
                <FieldRenderer
                  resumeField={field}
                  translations={translations}
                  resumeId={resumeId}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <Group
              orientation="horizontal"
              onLayoutChanged={handleLayoutChanged}
            >
              <Panel defaultSize={blocksLayout[0]} minSize="10">
                <BlockRail
                  blocks={blocks}
                  activeBlockKey={activeBlockKey}
                  onSelect={setActiveBlockKey}
                  translations={translations}
                  title={translateKey(editSchema.edit_area.blocks_title)}
                />
              </Panel>

              <Separator
                style={{
                  width: '6px',
                  background: 'var(--mui-palette-divider)',
                  cursor: 'col-resize',
                }}
              />

              <Panel defaultSize={blocksLayout[1]} minSize="30">
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="baseline"
                    justifyContent="space-between"
                    sx={{ px: 2, pt: 2, pb: 1 }}
                  >
                    <Typography variant="h6">
                      {activeBlock && translateKey(activeBlock.block_title)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {`${blockKeys.indexOf(activeBlockKey) + 1} / ${blockKeys.length}`}
                    </Typography>
                  </Stack>

                  {/* Only the selected block is on screen */}
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: 'auto',
                      px: 2,
                      pb: 2,
                    }}
                  >
                    {activeBlock && (
                      <ResumeBlock
                        key={activeBlockKey}
                        schema={activeBlock}
                        translations={translations}
                        resumeId={resumeId}
                      />
                    )}
                  </Box>
                </Box>
              </Panel>
            </Group>
          </Box>
        </LocalizationProvider>
      </form>
    </FormProvider>
  );
}
