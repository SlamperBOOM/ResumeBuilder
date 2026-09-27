import { Box, Stack, Typography } from '@mui/material';
import { Group, Layout, Panel, Separator } from 'react-resizable-panels';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EditScreenResponse from '../../DTO/EditScreenResponse';
import BlockRail from './BlockRail';
import ResumeBlock from './input_components/ResumeBlock';
import { useTranslate } from '../../utils/translations';
import { getSetting, setSetting } from '../../utils/settings';

const LAYOUT_SAVE_DEBOUNCE_MS = 100;

export type EditAreaProps = {
  editSchemaResponse: EditScreenResponse;
};

export function EditArea(props: EditAreaProps) {
  const { editSchemaResponse } = props;
  const editSchema = editSchemaResponse.schema;

  const { translations } = editSchemaResponse;
  const translateKey = useTranslate(translations);
  const resumeId = editSchemaResponse.payload.resume.resume_id;

  const blocks = editSchema.edit_area.resume_blocks;
  const blockKeys = useMemo(() => Object.keys(blocks), [blocks]);
  const [activeBlockKey, setActiveBlockKey] = useState(blockKeys[0]);

  // Pinned -- the rail is a resizable pane. Collapsed -- it is a strip that
  // expands over the form.
  const [railPinned, setRailPinned] = useState(() =>
    getSetting('editorRailPinned'),
  );
  const toggleRailPinned = useCallback(() => {
    setRailPinned((pinned) => {
      setSetting('editorRailPinned', !pinned);
      return !pinned;
    });
  }, []);

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

  const activeBlock = blocks[activeBlockKey];

  const rail = (
    <BlockRail
      blocks={blocks}
      activeBlockKey={activeBlockKey}
      onSelect={setActiveBlockKey}
      translations={translations}
      title={translateKey(editSchema.edit_area.blocks_title)}
      filledTitle={translateKey(editSchema.edit_area.block_state_filled_title)}
      emptyTitle={translateKey(editSchema.edit_area.block_state_empty_title)}
      pinned={railPinned}
      pinTitle={translateKey(editSchema.edit_area.pin_blocks_title)}
      unpinTitle={translateKey(editSchema.edit_area.unpin_blocks_title)}
      onTogglePinned={toggleRailPinned}
    />
  );

  // Only the selected block is on screen.
  const blockForm = (
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
        spacing={2}
        sx={{ px: 2, pt: 2 }}
      >
        <Typography variant="h6" component="h2" noWrap sx={{ minWidth: 0 }}>
          {activeBlock && translateKey(activeBlock.block_title)}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {`${blockKeys.indexOf(activeBlockKey) + 1} / ${blockKeys.length}`}
        </Typography>
      </Stack>

      {activeBlock?.block_hint && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, pt: 0.5, maxWidth: '68ch' }}
        >
          {translateKey(activeBlock.block_hint)}
        </Typography>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2,
          pt: 1,
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
  );

  if (!railPinned) {
    return (
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {rail}
        <Box sx={{ flex: 1, minWidth: 0 }}>{blockForm}</Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <Group orientation="horizontal" onLayoutChanged={handleLayoutChanged}>
        <Panel defaultSize={blocksLayout[0]} minSize="10">
          {rail}
        </Panel>

        <Separator
          style={{
            width: '6px',
            background: 'var(--mui-palette-divider)',
            cursor: 'col-resize',
          }}
        />

        <Panel defaultSize={blocksLayout[1]} minSize="30">
          {blockForm}
        </Panel>
      </Group>
    </Box>
  );
}
