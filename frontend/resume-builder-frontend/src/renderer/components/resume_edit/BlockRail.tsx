import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useWatch } from 'react-hook-form';
import { BlockContent, BlocksSchema } from '../../utils/backendTypes';
import { Translations, useTranslate } from '../../utils/translations';

export type BlockRailProps = {
  blocks: BlocksSchema;
  activeBlockKey: string;
  onSelect: (blockKey: string) => void;
  translations: Translations;
  title: string;
};

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

/**
 * How many entries a block holds, or `null` for a block that has no entries to
 * count because all of its fields are fixed.
 */
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

export default function BlockRail(props: BlockRailProps) {
  const { blocks, activeBlockKey, onSelect, translations, title } = props;
  const translateKey = useTranslate(translations);
  const blockValues = useWatch({ name: 'blocks' });

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
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 1, letterSpacing: '0.12em' }}
      >
        {title}
      </Typography>

      <List dense disablePadding>
        {Object.keys(blocks).map((blockKey) => {
          const count = countBlockEntries(blocks[blockKey], blockValues);
          const isActive = blockKey === activeBlockKey;
          return (
            <ListItem
              key={blockKey}
              disablePadding
              secondaryAction={
                count === null ? undefined : (
                  <Typography variant="caption" color="text.secondary">
                    {count}
                  </Typography>
                )
              }
            >
              <ListItemButton
                selected={isActive}
                onClick={() => onSelect(blockKey)}
                sx={{
                  borderRadius: 1,
                  minHeight: 44,
                  borderLeft: 3,
                  borderColor: isActive ? 'primary.main' : 'transparent',
                }}
              >
                <ListItemText
                  primary={translateKey(blocks[blockKey].block_title)}
                  slotProps={{ primary: { fontWeight: isActive ? 700 : 400 } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
