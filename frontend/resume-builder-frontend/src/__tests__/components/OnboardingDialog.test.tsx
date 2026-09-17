import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingDialog from '../../renderer/dialogs/OnboardingDialog';
import { OnboardingSchema } from '../../renderer/utils/backendTypes';
import { makeAppActions } from '../../testUtils/appActions';

const schema: OnboardingSchema = {
  slides: {
    first: { title: 'First slide', body: 'First body' },
    second: { title: 'Second slide', body: 'Second body' },
  },
  back: 'Back',
  next: 'Next',
  skip: 'Skip',
  finish: 'Finish',
};

describe('OnboardingDialog', () => {
  it('walks through the slides and marks onboarding as seen on finish', () => {
    const appActions = makeAppActions();
    render(
      <OnboardingDialog showState schema={schema} appActions={appActions} />,
    );

    expect(screen.getByText('First slide')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Second slide')).toBeInTheDocument();
    expect(appActions.performBduAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('onboarding_seen');
    expect(
      appActions.dialogActions.onboardingModal.close,
    ).toHaveBeenCalledTimes(1);
  });

  it('marks onboarding as seen when skipped', () => {
    const appActions = makeAppActions();
    render(
      <OnboardingDialog showState schema={schema} appActions={appActions} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('onboarding_seen');
    expect(
      appActions.dialogActions.onboardingModal.close,
    ).toHaveBeenCalledTimes(1);
  });
});
