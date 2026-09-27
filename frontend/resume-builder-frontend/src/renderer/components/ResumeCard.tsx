import {
  Box,
  ButtonBase,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MouseEvent,
  ReactNode,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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

const PAGE_ASPECT = '1 / 1.414';

const PRERENDER_MARGIN = '300px';

export const ResumeCard = memo(function ResumeCard(props: ResumeCardProps) {
  const { resume, schema, appActions } = props;
  const screenSchema = schema.schema;
  const translateKey = useTranslate(schema.translations);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const [inReach, setInReach] = useState(false);

  useEffect(() => {
    const element = sheetRef.current;
    if (!element || inReach) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInReach(true);
        }
      },
      { rootMargin: PRERENDER_MARGIN },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [inReach]);

  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const runWithResumeId = (action: string) => {
    appActions.performBduAction(action, {
      payload: { resume_id: resume.resume_id },
    });
  };

  const resumeMenuButtons: ReactNode[] = [];
  Object.keys(screenSchema.resume_menu).forEach((key) => {
    const menuButton = screenSchema.resume_menu[key];
    resumeMenuButtons.push(
      <MenuItem
        key={menuButton.action}
        onClick={() => {
          handleClose();
          runWithResumeId(menuButton.action);
        }}
      >
        {translateKey(menuButton.key)}
      </MenuItem>,
    );
  });

  const editLabel = translateKey(screenSchema.edit_button.key);
  const duplicateButton = screenSchema.duplicate_button;

  return (
    <Box component="article" sx={{ minWidth: 0 }}>
      <Box
        ref={sheetRef}
        sx={{
          position: 'relative',
          aspectRatio: PAGE_ASPECT,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
          transition: 'border-color 0.2s',
          '&:hover, &:focus-within': {
            borderColor: 'primary.main',
          },
          '&:hover .sheet-actions, &:focus-within .sheet-actions': {
            opacity: 1,
            pointerEvents: 'auto',
          },
        }}
      >
        {resume.pdf_preview ? (
          inReach && (
            <ResumePDFPreview
              preview={resume.pdf_preview}
              scaleType={ResumePreviewScaleEnum.FULL_WIDTH}
              flush
            />
          )
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
            }}
          >
            <ArticleOutlinedIcon sx={{ fontSize: 48 }} />
          </Box>
        )}

        <ButtonBase
          aria-label={resume.resume_name}
          onClick={() => runWithResumeId(screenSchema.edit_button.action)}
          sx={{ position: 'absolute', inset: 0 }}
        />

        <Stack
          className="sheet-actions"
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            px: 1,
            py: 0.5,
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.2s',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          <Tooltip title={editLabel}>
            <IconButton
              size="small"
              color="primary"
              aria-label={editLabel}
              onClick={() => runWithResumeId(screenSchema.edit_button.action)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {duplicateButton && (
            <Tooltip title={translateKey(duplicateButton.key)}>
              <IconButton
                size="small"
                aria-label={translateKey(duplicateButton.key)}
                onClick={() => runWithResumeId(duplicateButton.action)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={translateKey(screenSchema.export_button.key)}>
            <IconButton
              size="small"
              aria-label={translateKey(screenSchema.export_button.key)}
              onClick={() => {
                appActions.performBduAction(screenSchema.export_button.action, {
                  payload: {
                    resume_id: resume.resume_id,
                    resume_name: resume.resume_name,
                  },
                });
              }}
            >
              <FileDownloadOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={translateKey(screenSchema.resume_menu_tooltip_title)}>
            <IconButton
              size="small"
              aria-label={translateKey(screenSchema.resume_menu_tooltip_title)}
              onClick={handleMenuOpen}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {resumeMenuButtons}
          </Menu>
        </Stack>
      </Box>

      <Box sx={{ mt: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          noWrap
          title={resume.resume_name}
        >
          {resume.resume_name}
        </Typography>
        {resume.modified_label && (
          <Typography variant="body2" color="text.secondary">
            {resume.modified_label}
          </Typography>
        )}
        {resume.tags && resume.tags.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            noWrap
          >
            {resume.tags.map((tag, index) => (
              <Box component="span" key={tag}>
                {index > 0 && ' · '}
                <Box component="span">{translateKey(tag)}</Box>
              </Box>
            ))}
          </Typography>
        )}
      </Box>
    </Box>
  );
});
