import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppActions, ScreenSource } from '../utils/appActions';
import { ResumeCard } from '../components/ResumeCard';
import MainScreenResponse from '../DTO/MainScreenResponse';
import { useTranslate } from '../utils/translations';
import logger from '../utils/logger';

type MainScreenProps = {
  appActions: AppActions;
};

function MainScreenSkeleton() {
  const animation = 'wave';
  return (
    <Box
      role="status"
      aria-busy="true"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 3,
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((key: number) => (
        <Skeleton
          key={key}
          variant="rounded"
          height={320}
          animation={animation}
        />
      ))}
    </Box>
  );
}

function MainScreenEmptyState(props: { schema: MainScreenResponse }) {
  const { schema } = props;
  const { empty_state: emptyState } = schema.schema;
  const translateKey = useTranslate(schema.translations);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <ArticleOutlinedIcon sx={{ fontSize: 96, opacity: 0.4 }} />
      <Typography variant="h6" color="text.primary">
        {translateKey(emptyState.title)}
      </Typography>
      <Typography variant="body2">
        {translateKey(emptyState.subtitle)}
      </Typography>
    </Box>
  );
}

function MainScreenError(props: { onRetry: () => void }) {
  const { onRetry } = props;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
      }}
    >
      <Alert severity="error">Failed to load resumes.</Alert>
      <Button variant="contained" onClick={onRetry}>
        Retry
      </Button>
    </Box>
  );
}

export default function MainScreen(props: MainScreenProps) {
  const { appActions } = props;

  const [mainSchema, setMainSchema] = useState<MainScreenResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const translateKey = useTranslate(mainSchema?.translations);

  useEffect(() => {
    setLoadError(false);
    appActions
      .updateCurrentScreen({
        source: ScreenSource.MAIN,
        screenUpdateFunction: setMainSchema,
      })
      .catch((error) => {
        logger.error('Failed to load main screen', error);
        setLoadError(true);
      });
  }, [appActions, retryCount]);

  // Once per mount, after the screen is loaded; the backend answers with
  // nothing when onboarding has already been seen
  const onboardingChecked = useRef(false);
  useEffect(() => {
    if (mainSchema && !onboardingChecked.current) {
      onboardingChecked.current = true;
      appActions.performBduAction('onboarding_status');
    }
  }, [mainSchema, appActions]);

  const screenSchema = mainSchema?.schema;
  const newButton = screenSchema?.create_new;
  const importButton = screenSchema?.import_button;

  const resumeCards = useMemo(() => {
    if (!mainSchema) {
      return [];
    }
    const resumes = mainSchema.payload ?? [];
    return resumes.map((resume) => (
      <ResumeCard
        key={resume.resume_id}
        resume={resume}
        schema={mainSchema}
        appActions={appActions}
      />
    ));
  }, [mainSchema, appActions]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      {mainSchema && newButton && importButton ? (
        <>
          <Box
            sx={{
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                appActions.performBduAction(newButton.action);
              }}
              sx={{
                margin: 2,
              }}
            >
              {translateKey(newButton.key)}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                appActions.performBduAction(importButton.action);
              }}
              sx={{
                margin: 2,
              }}
            >
              {translateKey(importButton.key)}
            </Button>
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: 2,
              paddingRight: 1,
            }}
          >
            {resumeCards.length === 0 ? (
              <MainScreenEmptyState schema={mainSchema} />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 3,
                }}
              >
                {resumeCards}
              </Box>
            )}
          </Box>
        </>
      ) : loadError ? (
        <MainScreenError onRetry={() => setRetryCount((c) => c + 1)} />
      ) : (
        <MainScreenSkeleton />
      )}
    </Box>
  );
}
