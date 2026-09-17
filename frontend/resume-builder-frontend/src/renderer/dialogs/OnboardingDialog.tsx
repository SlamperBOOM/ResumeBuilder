import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MobileStepper,
} from '@mui/material';
import { useState } from 'react';
import { AppActions } from '../utils/appActions';
import { OnboardingSchema } from '../utils/backendTypes';

type OnboardingDialogProps = {
  showState: boolean;
  schema: OnboardingSchema | undefined;
  appActions: AppActions;
};

export default function OnboardingDialog(props: OnboardingDialogProps) {
  const { showState, schema, appActions } = props;
  const [step, setStep] = useState(0);

  if (!schema) {
    return null;
  }

  const slides = Object.values(schema.slides);
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const finish = () => {
    appActions.performBduAction('onboarding_seen');
    appActions.dialogActions.onboardingModal.close();
  };

  return (
    <Dialog open={showState} onClose={finish} maxWidth="sm" fullWidth>
      <DialogTitle>{slide.title}</DialogTitle>
      <DialogContent dividers sx={{ minHeight: 120 }}>
        <DialogContentText>{slide.body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {!isLast && <Button onClick={finish}>{schema.skip}</Button>}
        <MobileStepper
          variant="dots"
          steps={slides.length}
          activeStep={step}
          position="static"
          sx={{ flex: 1, background: 'transparent' }}
          backButton={
            <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
              {schema.back}
            </Button>
          }
          nextButton={
            isLast ? (
              <Button variant="contained" onClick={finish}>
                {schema.finish}
              </Button>
            ) : (
              <Button variant="contained" onClick={() => setStep(step + 1)}>
                {schema.next}
              </Button>
            )
          }
        />
      </DialogActions>
    </Dialog>
  );
}
