import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AppActions } from '../utils/appActions';
import { SimpleResume } from '../utils/backendTypes';
import ResumePDFPreview, { ResumePreviewScaleEnum } from './ResumePDFPreview';
import MainScreenResponse from '../DTO/MainScreenResponse';
import { useTranslate } from '../utils/translations';

export type ResumeCardProps = {
  resume: SimpleResume;
  schema: MainScreenResponse;
  appActions: AppActions;
};

export function ResumeCard(props: ResumeCardProps) {
  const { resume, schema, appActions } = props;
  const screenSchema = schema.schema;
  const translateKey = useTranslate(schema.translations);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const resumeMenuButtons: ReactNode[] = [];
  Object.keys(screenSchema.resume_menu).forEach((key) => {
    const menuButton = screenSchema.resume_menu[key];
    resumeMenuButtons.push(
      <MenuItem
        key={menuButton.action}
        onClick={() => {
          handleClose();
          appActions.performBduAction(menuButton.action, {
            payload: {
              resume_id: resume.resume_id,
            },
          });
        }}
      >
        {translateKey(menuButton.key)}
      </MenuItem>,
    );
  });

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        transition: '0.2s',
        width: '100%',
        minWidth: 0,
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Preview */}
      <CardMedia
        sx={{
          height: 320,
          backgroundColor: 'surface.cardPreview',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {resume.pdf_preview && (
          <ResumePDFPreview
            preview={resume.pdf_preview}
            scaleType={ResumePreviewScaleEnum.FULL_HEIGHT}
          />
        )}
      </CardMedia>

      <CardContent sx={{ flexGrow: 1 }}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="flex-start"
          wrap="nowrap"
        >
          <Grid sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {resume.resume_name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {new Date(resume.last_modification_date).toLocaleString()}
            </Typography>
          </Grid>

          <Grid>
            <Tooltip
              title={translateKey(screenSchema.resume_menu_tooltip_title)}
            >
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {resumeMenuButtons}
            </Menu>
          </Grid>
        </Grid>

        {resume.tags && resume.tags.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} mt={1.5}>
            {resume.tags.map((tag) => (
              <Chip
                key={tag}
                label={translateKey(tag)}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        )}

        <Box mt={2} display="flex" gap={1}>
          <Button
            variant="contained"
            sx={{ flex: 1 }}
            onClick={() => {
              appActions.performBduAction(screenSchema.edit_button.action, {
                payload: {
                  resume_id: resume.resume_id,
                },
              });
            }}
          >
            {translateKey(screenSchema.edit_button.key)}
          </Button>
          <Button
            variant="outlined"
            sx={{ flex: 1 }}
            onClick={() => {
              appActions.performBduAction(screenSchema.export_button.action, {
                payload: {
                  resume_id: resume.resume_id,
                  resume_name: resume.resume_name,
                },
              });
            }}
          >
            {translateKey(screenSchema.export_button.key)}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
