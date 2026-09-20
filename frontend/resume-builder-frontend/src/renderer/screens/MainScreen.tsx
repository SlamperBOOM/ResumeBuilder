import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { AppActions, ScreenSource } from '../utils/appActions';
import { ResumeCard } from '../components/ResumeCard';
import MainScreenResponse from '../DTO/MainScreenResponse';
import { useTranslate } from '../utils/translations';
import { searchByName } from '../utils/resumeSearch';
import logger from '../utils/logger';

const CARD_MIN_WIDTH = 340;

type MainScreenProps = {
  appActions: AppActions;
};

type ResumeGridProps = {
  hasResumes: boolean;
  cards: ReactNode[];
  schema: MainScreenResponse;
};

function MainScreenSkeleton() {
  const animation = 'wave';
  return (
    <Box
      role="status"
      aria-busy="true"
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
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

function ResumeGrid(props: ResumeGridProps) {
  const { hasResumes, cards, schema } = props;
  const translateKey = useTranslate(schema.translations);

  if (!hasResumes) {
    return <MainScreenEmptyState schema={schema} />;
  }

  if (cards.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        {translateKey(schema.schema.no_search_results)}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
        gap: 3,
      }}
    >
      {cards}
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
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    if (mainSchema?.payload.on_load_action !== undefined) {
      appActions.performBduAction(mainSchema.payload.on_load_action);
    }
  }, [mainSchema, appActions]);

  // Retry reloads the header as well: it is fetched once per appActions
  // identity, which updateScreen changes.
  const handleRetry = useCallback(() => {
    appActions.updateScreen();
    setRetryCount((count) => count + 1);
  }, [appActions]);

  const screenSchema = mainSchema?.schema;
  const newButton = screenSchema?.create_new;
  const importButton = screenSchema?.import_button;

  const resumes = useMemo(
    () => mainSchema?.payload.resumes ?? [],
    [mainSchema],
  );

  const resumeCards = useMemo(() => {
    if (!mainSchema) {
      return [];
    }
    return searchByName(
      resumes,
      searchQuery,
      (resume) => resume.resume_name,
    ).map((resume) => (
      <ResumeCard
        key={resume.resume_id}
        resume={resume}
        schema={mainSchema}
        appActions={appActions}
      />
    ));
  }, [mainSchema, resumes, searchQuery, appActions]);

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

            {resumes.length > 0 && (
              <TextField
                size="small"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={translateKey(screenSchema.search_placeholder)}
                slotProps={{
                  htmlInput: {
                    'aria-label': translateKey(screenSchema.search_placeholder),
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ margin: 2, width: 250 }}
              />
            )}
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
            <ResumeGrid
              hasResumes={resumes.length > 0}
              cards={resumeCards}
              schema={mainSchema}
            />
          </Box>
        </>
      ) : loadError ? (
        <MainScreenError onRetry={handleRetry} />
      ) : (
        <MainScreenSkeleton />
      )}
    </Box>
  );
}
