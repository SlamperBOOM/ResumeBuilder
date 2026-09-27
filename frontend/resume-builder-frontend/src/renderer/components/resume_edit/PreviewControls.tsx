import {
  Box,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { ResumePreviewScaleEnum } from '../ResumePDFPreview';

const MIN_SCALE = 0.1;
const MAX_SCALE = 1;
const SCALE_STEP = 0.1;

function toPercent(scale: number) {
  return `${Math.round(scale * 100)}%`;
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(scale * 10) / 10));
}

type PreviewControlsProps = {
  scaleTitle: string;
  fullWidthLabel: string;
  fullHeightLabel: string;
  customLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  previewMode: ResumePreviewScaleEnum;
  onPreviewModeChange: (mode: ResumePreviewScaleEnum) => void;
  previewScale: number;
  onPreviewScaleChange: (scale: number) => void;
};

export default function PreviewControls(props: PreviewControlsProps) {
  const {
    scaleTitle,
    fullWidthLabel,
    fullHeightLabel,
    customLabel,
    zoomInLabel,
    zoomOutLabel,
    previewMode,
    onPreviewModeChange,
    previewScale,
    onPreviewScaleChange,
  } = props;

  const zoomDisabled = previewMode !== ResumePreviewScaleEnum.CUSTOM;

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        px: 2,
        py: 1,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        justifyContent: 'center',
        display: 'flex',
        zIndex: 1,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <ToggleButtonGroup
          size="small"
          color="primary"
          exclusive
          value={previewMode}
          aria-label={scaleTitle}
          onChange={(_, mode) => {
            if (mode !== null) {
              onPreviewModeChange(mode as ResumePreviewScaleEnum);
            }
          }}
        >
          <ToggleButton value={ResumePreviewScaleEnum.FULL_WIDTH}>
            {fullWidthLabel}
          </ToggleButton>
          <ToggleButton value={ResumePreviewScaleEnum.FULL_HEIGHT}>
            {fullHeightLabel}
          </ToggleButton>
          <ToggleButton value={ResumePreviewScaleEnum.CUSTOM}>
            {customLabel}
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            size="small"
            aria-label={zoomOutLabel}
            disabled={zoomDisabled || previewScale <= MIN_SCALE}
            onClick={() =>
              onPreviewScaleChange(clampScale(previewScale - SCALE_STEP))
            }
          >
            <RemoveIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="caption"
            aria-live="polite"
            color={zoomDisabled ? 'text.disabled' : 'text.primary'}
            sx={{
              width: 48,
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {toPercent(previewScale)}
          </Typography>

          <IconButton
            size="small"
            aria-label={zoomInLabel}
            disabled={zoomDisabled || previewScale >= MAX_SCALE}
            onClick={() =>
              onPreviewScaleChange(clampScale(previewScale + SCALE_STEP))
            }
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
