import { Box, Button, Skeleton, Stack } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { AppActions, ScreenSource } from '../utils/appActions';
import { MainScreenSchema } from '../utils/backendTypes';
import './Screens.css';
import { ResumeCard, SimpleResume } from '../components/ResumeCard';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';

type MainScreenProps = {
  appActions: AppActions;
};

function MainScreenSkeleton() {
  const animation = 'wave';
  return (
    <Stack spacing={2}>
      {Object.keys([1, 2, 3, 4, 5, 6]).map((_key: string) => {
        return (
          <Stack spacing={2} direction="row">
            <Skeleton
              variant="rounded"
              width="33vw"
              height="20vh"
              animation={animation}
            />
            <Skeleton
              variant="rounded"
              width="33vw"
              height="20vh"
              animation={animation}
            />
            <Skeleton
              variant="rounded"
              width="33vw"
              height="20vh"
              animation={animation}
            />
          </Stack>
        );
      })}
    </Stack>
  );
}

export default function MainScreen(props: MainScreenProps) {
  const { appActions } = props;

  const [mainSchema, setMainSchema] = useState<SchemaResponseDTO | null>(null);
  const [resumeCards, setResumeCards] = useState<Iterable<ReactNode>>([]);
  const [newButtonTitle, setNewButtonTitle] = useState<string>();
  const [newButtonAction, setNewButtonAction] = useState<string>('');

  useEffect(() => {
    appActions.updateCurrentScreen({
      source: ScreenSource.MAIN,
      screenUpdateFunction: setMainSchema,
    });
  }, [appActions]);

  useEffect(() => {
    if (!mainSchema) {
      return;
    }
    const screenSchema = mainSchema.schema as MainScreenSchema;
    setNewButtonTitle(mainSchema.translations[screenSchema.create_new.key]);
    setNewButtonAction(screenSchema.create_new.action);

    const cards: ReactNode[] = [];
    mainSchema.payload.forEach((resume: SimpleResume) => {
      cards.push(
        <ResumeCard
          key={resume.resume_id}
          resume={resume}
          schema={mainSchema}
          appActions={appActions}
        />,
      );
    });
    setResumeCards(cards);
  }, [appActions, mainSchema]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {mainSchema ? (
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
                appActions.performBduAction(newButtonAction);
              }}
              sx={{
                margin: 2,
              }}
            >
              {newButtonTitle}
            </Button>
          </Box>
          <Box
            sx={{
              overflowY: 'auto',
              padding: 2,
              paddingRight: 1,
            }}
          >
            <div className="resume_grid">{resumeCards}</div>
          </Box>
        </>
      ) : (
        MainScreenSkeleton()
      )}
    </Box>
  );
}
