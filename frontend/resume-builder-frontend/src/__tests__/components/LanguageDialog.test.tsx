import '@testing-library/jest-dom';
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import LanguageDialog from '../../renderer/dialogs/LanguageDialog';
import LanguageDialogResponse from '../../renderer/DTO/LanguageDialogResponse';
import { makeAppActions } from '../../testUtils/appActions';

const mockSchemaApi = { getLanguageDialog: jest.fn() };
jest.mock('../../renderer/api/useSchemaApi', () => ({
  __esModule: true,
  default: () => mockSchemaApi,
}));

const response: LanguageDialogResponse = {
  schema: {
    title: 'title_key',
    cancel_key: 'cancel_key',
    save_key: 'save_key',
    save_action: 'set_locale',
  },
  translations: {
    title_key: 'Choose language',
    cancel_key: 'Cancel',
    save_key: 'Save',
    en_key: 'English',
    pl_key: 'Polish',
  },
  payload: {
    locales: [
      { locale: 'en', key: 'en_key' },
      { locale: 'pl', key: 'pl_key' },
    ],
    current_locale: 'en',
  },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((onResolve) => {
    resolve = onResolve;
  });
  return { promise, resolve };
}

beforeEach(() => {
  mockSchemaApi.getLanguageDialog.mockReset();
  mockSchemaApi.getLanguageDialog.mockResolvedValue(response);
});

describe('LanguageDialog', () => {
  it('does not load the schema or render anything while closed', () => {
    render(<LanguageDialog showState={false} appActions={makeAppActions()} />);

    expect(mockSchemaApi.getLanguageDialog).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the dialog only once its schema has loaded', async () => {
    const pending = deferred<LanguageDialogResponse>();
    mockSchemaApi.getLanguageDialog.mockReturnValue(pending.promise);

    render(<LanguageDialog showState appActions={makeAppActions()} />);

    expect(mockSchemaApi.getLanguageDialog).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();

    await act(async () => {
      pending.resolve(response);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
  });

  it('reloads the schema on every open without flashing the previous one', async () => {
    const appActions = makeAppActions();
    const { rerender } = render(
      <LanguageDialog showState appActions={appActions} />,
    );
    await screen.findByRole('dialog');

    rerender(<LanguageDialog showState={false} appActions={appActions} />);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    const pending = deferred<LanguageDialogResponse>();
    mockSchemaApi.getLanguageDialog.mockReturnValue(pending.promise);
    rerender(<LanguageDialog showState appActions={appActions} />);

    expect(mockSchemaApi.getLanguageDialog).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('dialog')).toBeNull();

    await act(async () => {
      pending.resolve({
        ...response,
        payload: { ...response.payload, current_locale: 'pl' },
      });
    });

    expect(screen.getByRole('radio', { name: 'Polish' })).toBeChecked();
  });

  it('closes itself and reports the error when the schema fails to load', async () => {
    mockSchemaApi.getLanguageDialog.mockRejectedValue(
      new Error('network down'),
    );
    const appActions = makeAppActions();

    render(<LanguageDialog showState appActions={appActions} />);

    await waitFor(() =>
      expect(appActions.dialogActions.languageDialog.close).toHaveBeenCalledTimes(
        1,
      ),
    );
    expect(appActions.dialogActions.infoModal.open).toHaveBeenCalledWith({
      title: undefined,
      text: 'network down',
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders one radio per locale from the loaded schema', async () => {
    render(<LanguageDialog showState appActions={makeAppActions()} />);

    expect(await screen.findByRole('radio', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Polish' })).toBeInTheDocument();
  });

  it('updates the checked radio when the user selects one', async () => {
    render(<LanguageDialog showState appActions={makeAppActions()} />);

    const english = await screen.findByRole('radio', { name: 'English' });
    const polish = screen.getByRole('radio', { name: 'Polish' });
    expect(english).toBeChecked();

    fireEvent.click(polish);

    expect(polish).toBeChecked();
    expect(english).not.toBeChecked();
  });

  it('calls performBduAction with the selected locale on Save', async () => {
    const appActions = makeAppActions();
    render(<LanguageDialog showState appActions={appActions} />);

    await screen.findByRole('radio', { name: 'English' });
    fireEvent.click(screen.getByRole('radio', { name: 'Polish' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(appActions.dialogActions.languageDialog.close).toHaveBeenCalledTimes(
      1,
    );
    expect(appActions.performBduAction).toHaveBeenCalledWith('set_locale', {
      payload: { locale: 'pl' },
    });
  });

  it('closes without dispatching anything on Cancel', async () => {
    const appActions = makeAppActions();
    render(<LanguageDialog showState appActions={appActions} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(appActions.dialogActions.languageDialog.close).toHaveBeenCalledTimes(
      1,
    );
    expect(appActions.performBduAction).not.toHaveBeenCalled();
  });
});
