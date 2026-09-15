import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import RouteNotFoundScreen from '../../renderer/screens/RouteNotFoundScreen';

describe('RouteNotFoundScreen', () => {
  it('renders its message', () => {
    render(<RouteNotFoundScreen />);

    expect(
      screen.getByText('Something went wrong, reload app'),
    ).toBeInTheDocument();
  });

  it('reloads the page when the reload button is clicked', () => {
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: reloadMock },
    });

    render(<RouteNotFoundScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
