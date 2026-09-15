import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ResumeDropDownList from '../../renderer/components/resume_edit/input_components/ResumeDropDownList';
import { DropDownList } from '../../renderer/utils/resumeBlockTypes';

const field: DropDownList = {
  type: 'drop_down_list',
  title: 'country_title',
  resume_value: 'country',
  values: { pl: 'Poland', de: 'Germany' },
  default: 'pl',
};

function renderWithForm(defaultValues: Record<string, unknown>) {
  function Wrapper() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <ResumeDropDownList
          resumeField={field}
          translations={{ country_title: 'Country' }}
          resumeId="resume-1"
        />
      </FormProvider>
    );
  }
  return render(<Wrapper />);
}

describe('ResumeDropDownList', () => {
  it('renders every option from values', () => {
    renderWithForm({ country: 'pl' });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Country' }));

    expect(screen.getByRole('option', { name: 'Poland' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Germany' })).toBeInTheDocument();
  });

  it('selects the default value', () => {
    renderWithForm({ country: 'pl' });

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent(
      'Poland',
    );
  });

  it('updates the underlying form field when selecting an option', () => {
    renderWithForm({ country: 'pl' });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Country' }));
    fireEvent.click(screen.getByRole('option', { name: 'Germany' }));

    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveTextContent(
      'Germany',
    );
  });
});
