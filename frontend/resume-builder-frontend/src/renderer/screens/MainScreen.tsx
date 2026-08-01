import { Box, Button, Skeleton } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { AppActions, ScreenSource } from '../utils/appActions';
import { MainScreenSchema, BDUButtonSchema } from '../utils/backendTypes';
import { ResumeCard, SimpleResume } from '../components/ResumeCard';
import SchemaResponseDTO from '../DTO/SchemaResponseDTO';

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

export default function MainScreen(props: MainScreenProps) {
  const { appActions } = props;

  const [mainSchema, setMainSchema] = useState<SchemaResponseDTO | null>(null);
  const [resumeCards, setResumeCards] = useState<Iterable<ReactNode>>([]);
  const [newButton, setNewButton] = useState<BDUButtonSchema>();
  const [importButton, setImportButton] = useState<BDUButtonSchema>();

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
    setNewButton(screenSchema.create_new);
    setImportButton(screenSchema.import_button);

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
              {mainSchema.translations[newButton!.key]}
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
      ) : (
        MainScreenSkeleton()
      )}
    </Box>
  );
}
