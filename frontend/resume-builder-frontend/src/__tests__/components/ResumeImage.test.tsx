import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ResumeImage from '../../renderer/components/resume_edit/input_components/ResumeImage';
import { ImageInput } from '../../renderer/utils/resumeBlockTypes';

const field: ImageInput = {
  type: 'image',
  title: 'avatar_title',
  resume_value: 'avatar',
  empty_text_key: 'avatar_empty',
  change_button_title: 'avatar_change',
  delete_button_title: 'avatar_delete',
};

function renderWithForm(defaultValues: Record<string, unknown>) {
  function Wrapper() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <ResumeImage
          resumeField={field}
          translations={{
            avatar_title: 'Avatar',
            avatar_empty: 'No image picked',
            avatar_change: 'Change avatar',
            avatar_delete: 'Delete avatar',
          }}
          resumeId="resume-1"
        />
      </FormProvider>
    );
  }
  return render(<Wrapper />);
}

beforeEach(() => {
  (window as unknown as { electron: { openImageDialog: jest.Mock } }).electron =
    { openImageDialog: jest.fn() };
});

describe('ResumeImage', () => {
  it('shows the empty-state text when no image is picked', () => {
    renderWithForm({ avatar: null });

    expect(screen.getByText('No image picked')).toBeInTheDocument();
  });

  it('shows a thumbnail for an already-picked path', () => {
    renderWithForm({ avatar: 'C:\\avatars\\me.png' });

    expect(screen.getByRole('img', { name: 'Avatar' })).toHaveAttribute(
      'src',
      'file:///C:/avatars/me.png',
    );
  });

  it('updates the form field with a valid picked path', async () => {
    (window.electron.openImageDialog as jest.Mock).mockResolvedValue({
      filePaths: ['C:\\avatars\\new.png'],
    });
    renderWithForm({ avatar: null });

    fireEvent.click(screen.getByRole('button', { name: 'Change avatar' }));

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'Avatar' })).toHaveAttribute(
        'src',
        'file:///C:/avatars/new.png',
      ),
    );
  });

  it('rejects a picked path with a disallowed extension', async () => {
    (window.electron.openImageDialog as jest.Mock).mockResolvedValue({
      filePaths: ['C:\\avatars\\new.gif'],
    });
    renderWithForm({ avatar: null });

    fireEvent.click(screen.getByRole('button', { name: 'Change avatar' }));

    await waitFor(() =>
      expect(window.electron.openImageDialog).toHaveBeenCalled(),
    );
    expect(screen.getByText('No image picked')).toBeInTheDocument();
  });

  it('clears the form field when the delete button is pressed', () => {
    renderWithForm({ avatar: 'C:\\avatars\\me.png' });

    fireEvent.click(screen.getByRole('button', { name: 'Delete avatar' }));

    expect(screen.getByText('No image picked')).toBeInTheDocument();
  });
});
