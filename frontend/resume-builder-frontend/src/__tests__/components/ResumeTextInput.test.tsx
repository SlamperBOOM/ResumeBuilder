import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ResumeTextInput from '../../renderer/components/resume_edit/input_components/ResumeTextInput';
import { TextInput } from '../../renderer/utils/resumeBlockTypes';

const field: TextInput = {
  type: 'text_input',
  title: 'full_name_title',
  resume_value: 'full_name',
};

function renderWithForm(defaultValues: Record<string, unknown>) {
  function Wrapper() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <ResumeTextInput
          resumeField={field}
          translations={{ full_name_title: 'Full name' }}
          resumeId="resume-1"
        />
      </FormProvider>
    );
  }
  return render(<Wrapper />);
}

describe('ResumeTextInput', () => {
  it('renders the translated label and current form value', () => {
    renderWithForm({ full_name: 'Ada Lovelace' });

    expect(screen.getByLabelText('Full name')).toHaveValue('Ada Lovelace');
  });

  it('falls back to the raw translation key when no translation is provided', () => {
    function Wrapper() {
      const methods = useForm({ defaultValues: { full_name: '' } });
      return (
        <FormProvider {...methods}>
          <ResumeTextInput
            resumeField={field}
            translations={{}}
            resumeId="resume-1"
          />
        </FormProvider>
      );
    }
    render(<Wrapper />);

    expect(screen.getByLabelText('full_name_title')).toBeInTheDocument();
  });

  it('updates the underlying form field when the user types', () => {
    renderWithForm({ full_name: '' });

    const input = screen.getByLabelText('Full name');
    fireEvent.change(input, { target: { value: 'Grace Hopper' } });

    expect(input).toHaveValue('Grace Hopper');
  });
});
