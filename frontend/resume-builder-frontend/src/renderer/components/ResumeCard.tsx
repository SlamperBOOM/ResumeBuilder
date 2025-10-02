import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';
import { AppActions } from '../utils/appActions';

export type SimpleResume = {
  resume_id: string;
  resume_name: string;
  last_modification_date: string;
  html_preview: string;
};

export type ResumeCardProps = {
  resume: SimpleResume;
  schema: SchemaResponseDTO;
  appActions: AppActions;
};

export function ResumeCard(props: ResumeCardProps) {
  const { resume, schema, appActions } = props;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const resumeMenuButtons: ReactNode[] = [];
  Object.keys(schema.schema.resume_menu).forEach((key) => {
    const menuButton = schema.schema.resume_menu[key];
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
        {schema.translations[menuButton.key]}
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
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Preview */}
      <CardMedia
        sx={{
          height: 220,
          backgroundColor: '#eef2f6',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {resume.html_preview && (
          <Box
            sx={{
              transform: 'scale(0.4)',
              transformOrigin: 'top left',
              width: '250%',
              pointerEvents: 'none',
            }}
            dangerouslySetInnerHTML={{
              __html: resume.html_preview,
            }}
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
              title={
                schema.translations[schema.schema.resume_menu_tooltip_title]
              }
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

        <Box mt={2}>
          <Button
            variant="text"
            fullWidth
            onClick={() => {
              appActions.performBduAction(schema.schema.export_button.action, {
                payload: {
                  resume_id: resume.resume_id,
                  resume_name: resume.resume_name,
                },
              });
            }}
          >
            {schema.translations[schema.schema.export_button.key]}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
