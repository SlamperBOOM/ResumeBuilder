import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { ResumePreviewScaleEnum } from './ResumePDFPreview';

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

function toPercent(scale: number) {
  return `${scale * 100}%`;
}

type PreviewControlsProps = {
  scaleTitle: string;
  fullWidthLabel: string;
  fullHeightLabel: string;
  customLabel: string;
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
    previewMode,
    onPreviewModeChange,
    previewScale,
    onPreviewScaleChange,
  } = props;

  return (
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
        <Typography>{scaleTitle}</Typography>
        <RadioGroup
          row
          value={previewMode}
          onChange={(e) =>
            onPreviewModeChange(e.target.value as ResumePreviewScaleEnum)
          }
        >
          <FormControlLabel
            value={ResumePreviewScaleEnum.FULL_WIDTH}
            control={<Radio />}
            label={fullWidthLabel}
          />
          <FormControlLabel
            value={ResumePreviewScaleEnum.FULL_HEIGHT}
            control={<Radio />}
            label={fullHeightLabel}
          />
          <FormControlLabel
            value={ResumePreviewScaleEnum.CUSTOM}
            control={<Radio />}
            label={customLabel}
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
            aria-label={scaleTitle}
            getAriaValueText={toPercent}
            min={0.1}
            max={1}
            step={0.1}
            disabled={previewMode !== ResumePreviewScaleEnum.CUSTOM}
            value={previewScale}
            onChange={(_, value) => onPreviewScaleChange(value)}
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
          {toPercent(previewScale)}
        </Typography>
      </Stack>
    </Box>
  );
}
