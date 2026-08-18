import { Alert, Box, Button, Skeleton } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { AppActions, ScreenSource } from '../utils/appActions';
import { ResumeCard } from '../components/ResumeCard';
import MainScreenResponse from '../DTO/MainScreenResponse';

type MainScreenProps = {
  appActions: AppActions;
};

function MainScreenSkeleton() {
  const animation = 'wave';
  return (
    <Box
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

  useEffect(() => {
    setLoadError(false);
    appActions
      .updateCurrentScreen({
        source: ScreenSource.MAIN,
        screenUpdateFunction: setMainSchema,
      })
      .catch((error) => {
        console.error('Failed to load main screen', error);
        setLoadError(true);
      });
  }, [appActions, retryCount]);

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
              {mainSchema.translations[newButton.key]}
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
              {mainSchema.translations[importButton.key]}
            </Button>
          </Box>
          <Box
            sx={{
              overflowY: 'auto',
              padding: 2,
              paddingRight: 1,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 3,
              }}
            >
              {resumeCards}
            </Box>
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
