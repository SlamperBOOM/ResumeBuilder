import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ResumeTextArea from '../../renderer/components/resume_edit/input_components/ResumeTextArea';
import { TextArea } from '../../renderer/utils/resumeBlockTypes';

const field: TextArea = {
  type: 'text_area',
  title: 'summary_title',
  resume_value: 'summary',
};

function renderWithForm(defaultValues: Record<string, unknown>) {
  function Wrapper() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <ResumeTextArea
          resumeField={field}
          translations={{ summary_title: 'Summary' }}
          resumeId="resume-1"
        />
      </FormProvider>
    );
  }
  return render(<Wrapper />);
}

describe('ResumeTextArea', () => {
  it('renders the translated label and current form value', () => {
    renderWithForm({ summary: 'Experienced developer' });

    expect(screen.getByLabelText('Summary')).toHaveValue(
      'Experienced developer',
    );
  });

  it('updates the underlying form field when the user types', () => {
    renderWithForm({ summary: '' });

    const textarea = screen.getByLabelText('Summary');
    fireEvent.change(textarea, { target: { value: 'New summary text' } });

    expect(textarea).toHaveValue('New summary text');
  });
});
