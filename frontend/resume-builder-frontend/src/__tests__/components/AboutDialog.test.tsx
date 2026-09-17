import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AboutDialog from '../../renderer/dialogs/AboutDialog';
import { AboutModalSchema } from '../../renderer/utils/backendTypes';
import { makeDialogActions } from '../../testUtils/appActions';

const schema: AboutModalSchema = {
  app_name: 'Resume Builder',
  version_label: 'Version',
  copyright: '(c) 2026 SlamperBOOM',
  license: 'MIT with the Commons Clause.',
  github_title: 'GitHub repository',
  github_url: 'https://github.com/SlamperBOOM/ResumeBuilder',
  issues_title: 'Report a bug',
  issues_url: 'https://github.com/SlamperBOOM/ResumeBuilder/issues',
  close: 'Close',
};

beforeEach(() => {
  (
    window as unknown as {
      electron: { getAppVersion: jest.Mock; openExternal: jest.Mock };
    }
  ).electron = {
    getAppVersion: jest.fn().mockResolvedValue('1.2.3'),
    openExternal: jest.fn().mockResolvedValue(undefined),
  };
});

describe('AboutDialog', () => {
  it('shows the app name, the version from Electron, the copyright and the license', async () => {
    render(
      <AboutDialog
        showState
        schema={schema}
        dialogActions={makeDialogActions()}
      />,
    );

    expect(screen.getByText('Resume Builder')).toBeInTheDocument();
    expect(await screen.findByText('Version 1.2.3')).toBeInTheDocument();
    expect(screen.getByText(schema.copyright)).toBeInTheDocument();
    expect(screen.getByText(schema.license)).toBeInTheDocument();
  });

  it('opens each link in the system browser instead of the app window', async () => {
    render(
      <AboutDialog
        showState
        schema={schema}
        dialogActions={makeDialogActions()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'GitHub repository' }));
    fireEvent.click(screen.getByRole('button', { name: 'Report a bug' }));

    await waitFor(() =>
      expect(window.electron.openExternal).toHaveBeenCalledWith(
        schema.github_url,
      ),
    );
    expect(window.electron.openExternal).toHaveBeenCalledWith(
      schema.issues_url,
    );
  });

  it('closes on the close button', () => {
    const dialogActions = makeDialogActions();
    render(
      <AboutDialog showState schema={schema} dialogActions={dialogActions} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(dialogActions.aboutModal.close).toHaveBeenCalledTimes(1);
  });
});
