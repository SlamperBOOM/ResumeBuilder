import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ResumeDate from '../../renderer/components/resume_edit/input_components/ResumeDate';
import { DateInput, DateVariant } from '../../renderer/utils/resumeBlockTypes';

function makeField(variant: DateVariant): DateInput {
  return {
    type: 'date',
    title: 'birth_date_title',
    resume_value: 'birth_date',
    variant,
  };
}

function renderWithForm(
  variant: DateVariant,
  defaultValues: Record<string, unknown>,
) {
  function Wrapper() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ResumeDate
            resumeField={makeField(variant)}
            translations={{ birth_date_title: 'Birth date' }}
            resumeId="resume-1"
          />
        </LocalizationProvider>
      </FormProvider>
    );
  }
  return render(<Wrapper />);
}

describe('ResumeDate', () => {
  it('renders day, month and year sections for DateVariant.full', () => {
    renderWithForm(DateVariant.full, { birth_date: '2024-06-15' });

    expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
  });

  it('renders only month and year sections for DateVariant.month', () => {
    renderWithForm(DateVariant.month, { birth_date: '2024-06-15' });

    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
  });

  it('reflects the current form value', () => {
    renderWithForm(DateVariant.full, { birth_date: '2024-06-15' });

    const sections = screen
      .getAllByRole('spinbutton')
      .map((section) => section.textContent);

    expect(sections).toContain('15');
    expect(sections).toContain('2024');
  });

  it('clears the underlying form field when the clear button is pressed', () => {
    renderWithForm(DateVariant.full, { birth_date: '2024-06-15' });

    fireEvent.click(screen.getByTitle('Clear'));

    const sections = screen
      .getAllByRole('spinbutton')
      .map((section) => section.textContent);

    expect(sections).not.toContain('2024');
    expect(sections).not.toContain('15');
  });
});
