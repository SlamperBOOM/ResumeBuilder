import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { KeyboardEvent, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { BlockContent, BlocksSchema } from '../../utils/backendTypes';
import { Translations, useTranslate } from '../../utils/translations';

export type BlockRailProps = {
  blocks: BlocksSchema;
  activeBlockKey: string;
  onSelect: (blockKey: string) => void;
  translations: Translations;
  title: string;
  pinned: boolean;
  pinTitle: string;
  unpinTitle: string;
  onTogglePinned: () => void;
};

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 260;

// Every "blocks.<BLOCK>.<field>" list a block's schema points at, at any depth.
// Only dynamic blocks have one - they are the blocks entries are added to.
function blockListPaths(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(blockListPaths);
  if (node === null || typeof node !== 'object') return [];

  return Object.entries(node).flatMap(([key, value]) => {
    if (
      key === 'blocks_list' &&
      typeof value === 'string' &&
      value.startsWith('blocks.')
    ) {
      return [value];
    }
    return blockListPaths(value);
  });
}

function blockFieldPaths(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(blockFieldPaths);
  if (node === null || typeof node !== 'object') return [];

  return Object.entries(node).flatMap(([key, value]) => {
    if (
      key === 'resume_value' &&
      typeof value === 'string' &&
      value.startsWith('blocks.')
    ) {
      return [value];
    }
    return blockFieldPaths(value);
  });
}

function valueAt(blocks: unknown, path: string): unknown {
  // Paths are rooted at the form itself ("blocks.EXPERIENCE.experiences"), and
  // `blocks` is already that subtree, so the first segment is dropped.
  return path
    .split('.')
    .slice(1)
    .reduce<unknown>((node, segment) => {
      if (node === null || typeof node !== 'object') return undefined;
      return (node as Record<string, unknown>)[segment];
    }, blocks);
}

export function countBlockEntries(
  block: BlockContent,
  blocks: unknown,
): number | null {
  const lists = blockListPaths(block)
    .map((path) => valueAt(blocks, path))
    .filter((value): value is unknown[] => Array.isArray(value));

  if (lists.length === 0) {
    return null;
  }
  return lists.reduce((total, list) => total + list.length, 0);
}

export function isBlockFilled(block: BlockContent, blocks: unknown): boolean {
  return blockFieldPaths(block).some((path) => {
    const value = valueAt(blocks, path);
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });
}

function FilledMark({ filled }: { filled: boolean }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        flexShrink: 0,
        borderRadius: '50%',
        border: '1.5px solid',
        borderColor: filled ? 'transparent' : 'text.secondary',
        backgroundColor: filled ? 'text.secondary' : 'transparent',
      }}
    />
  );
}

export default function BlockRail(props: BlockRailProps) {
  const {
    blocks,
    activeBlockKey,
    onSelect,
    translations,
    title,
    pinned,
    pinTitle,
    unpinTitle,
    onTogglePinned,
  } = props;
  const translateKey = useTranslate(translations);
  const blockValues = useWatch({ name: 'blocks' });
  const [hovered, setHovered] = useState(false);

  const [focusedInside, setFocusedInside] = useState(false);
  const open = pinned || hovered || focusedInside;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!pinned && event.key === 'Escape') {
      setHovered(false);
      setFocusedInside(false);
      (event.target as HTMLElement).blur();
    }
  };

  const content = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pl: 0.5,
          minHeight: 36,
        }}
      >
        <Tooltip title={pinned ? unpinTitle : pinTitle}>
          <IconButton
            size="small"
            aria-label={pinned ? unpinTitle : pinTitle}
            aria-pressed={pinned}
            onClick={onTogglePinned}
          >
            {pinned ? (
              <PushPinIcon fontSize="small" />
            ) : (
              <PushPinOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        {open && (
          <Typography
            variant="overline"
            color="text.secondary"
            lineHeight={1.4}
          >
            {title}
          </Typography>
        )}
      </Box>

      <List dense disablePadding>
        {Object.keys(blocks).map((blockKey) => {
          const block = blocks[blockKey];
          const count = countBlockEntries(block, blockValues);
          const blockTitle = translateKey(block.block_title);
          const isActive = blockKey === activeBlockKey;
          const mark =
            count !== null && count > 0 ? (
              <Typography variant="caption" color="text.secondary">
                {count}
              </Typography>
            ) : (
              <FilledMark filled={isBlockFilled(block, blockValues)} />
            );

          return (
            <ListItem key={blockKey} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => onSelect(blockKey)}
                title={open ? undefined : blockTitle}
                aria-label={open ? undefined : blockTitle}
                sx={{
                  borderRadius: 1,
                  minHeight: 44,
                  gap: 1.5,
                  borderLeft: 3,
                  borderColor: isActive ? 'primary.main' : 'transparent',
                  justifyContent: open ? 'space-between' : 'center',
                }}
              >
                {open && (
                  <ListItemText
                    primary={blockTitle}
                    slotProps={{
                      primary: { fontWeight: isActive ? 600 : 400 },
                    }}
                    sx={{ my: 0.5 }}
                  />
                )}
                {mark}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  if (pinned) {
    return (
      <Box
        sx={{
          height: '100%',
          overflowY: 'auto',
          borderRight: 1,
          borderColor: 'divider',
          p: 1.5,
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        flex: `0 0 ${COLLAPSED_WIDTH}px`,
        width: COLLAPSED_WIDTH,
        height: '100%',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusedInside(true)}
      onBlur={() => setFocusedInside(false)}
      onKeyDown={handleKeyDown}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          zIndex: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          p: 1.5,
        }}
      >
        {content}
      </Box>
    </Box>
  );
}
