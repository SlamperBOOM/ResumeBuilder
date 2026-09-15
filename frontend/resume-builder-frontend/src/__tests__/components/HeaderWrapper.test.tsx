import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import HeaderWrapper from '../../renderer/components/HeaderWrapper';
import { makeAppActions } from '../../testUtils/appActions';

const mockGetHeader = jest.fn();

const mockSchemaApi = { getHeader: mockGetHeader };
jest.mock('../../renderer/api/useSchemaApi', () => ({
  __esModule: true,
  default: () => mockSchemaApi,
}));

beforeEach(() => {
  mockGetHeader.mockReset();
});

describe('HeaderWrapper', () => {
  it('renders its children', async () => {
    mockGetHeader.mockResolvedValue({
      schema: { app_title: 'app_title_key', menu: [] },
      translations: {},
    });

    render(
      <HeaderWrapper appActions={makeAppActions()}>
        <div data-testid="child">Content</div>
      </HeaderWrapper>,
    );

    expect(await screen.findByText('app_title_key')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders one translated button per menu entry and dispatches its action', async () => {
    mockGetHeader.mockResolvedValue({
      schema: {
        app_title: 'app_title_key',
        menu: [
          { key: 'settings_key', action: 'open_settings' },
          { key: 'about_key', action: 'open_about' },
        ],
      },
      translations: {
        app_title_key: 'Resume Builder',
        settings_key: 'Settings',
        about_key: 'About',
      },
    });
    const appActions = makeAppActions();

    render(
      <HeaderWrapper appActions={appActions}>
        <div />
      </HeaderWrapper>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'About' }));

    expect(appActions.performBduAction).toHaveBeenCalledWith('open_about');
  });

  it('still renders children when the header schema fails to load', async () => {
    mockGetHeader.mockRejectedValue(new Error('network down'));

    render(
      <HeaderWrapper appActions={makeAppActions()}>
        <div data-testid="child">Content</div>
      </HeaderWrapper>,
    );

    await Promise.resolve();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
