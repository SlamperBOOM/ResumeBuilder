import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ResumeToggle from '../../renderer/components/resume_edit/input_components/ResumeToggle';
import { Toggle } from '../../renderer/utils/resumeBlockTypes';

const field: Toggle = {
  type: 'toggle',
  title: 'visible_title',
  resume_value: 'is_visible',
  default_value: true,
};

function renderWithForm(defaultValues: Record<string, unknown>) {
  function Wrapper() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <ResumeToggle
          resumeField={field}
          translations={{ visible_title: 'Visible on resume' }}
          resumeId="resume-1"
        />
      </FormProvider>
    );
  }
  return render(<Wrapper />);
}

describe('ResumeToggle', () => {
  it('reflects the current form value as checked', () => {
    renderWithForm({ is_visible: true });

    expect(
      screen.getByRole('switch', { name: 'Visible on resume' }),
    ).toBeChecked();
  });

  it('flips the underlying form field when clicked', () => {
    renderWithForm({ is_visible: false });

    const toggle = screen.getByRole('switch', { name: 'Visible on resume' });
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);

    expect(toggle).toBeChecked();
  });
});
