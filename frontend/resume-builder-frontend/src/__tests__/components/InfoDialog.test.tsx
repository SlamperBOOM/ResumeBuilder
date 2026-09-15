import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import InfoDialog from '../../renderer/dialogs/InfoDialog';
import { InfoModalSchema } from '../../renderer/utils/backendTypes';
import { makeDialogActions } from '../../testUtils/appActions';

describe('InfoDialog', () => {
  it('renders the title and text', () => {
    const schema: InfoModalSchema = { title: 'Heads up', text: 'Saved.' };
    render(
      <InfoDialog showState schema={schema} dialogActions={makeDialogActions()} />,
    );

    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Saved.')).toBeInTheDocument();
  });

  it('renders without a title when none is provided', () => {
    const schema: InfoModalSchema = { title: undefined, text: 'Saved.' };
    render(
      <InfoDialog showState schema={schema} dialogActions={makeDialogActions()} />,
    );

    expect(screen.getByText('Saved.')).toBeInTheDocument();
  });

  it('calls close when OK is clicked', () => {
    const dialogActions = makeDialogActions();
    const schema: InfoModalSchema = { title: 'Heads up', text: 'Saved.' };
    render(
      <InfoDialog showState schema={schema} dialogActions={dialogActions} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(dialogActions.infoModal.close).toHaveBeenCalledTimes(1);
  });
});
