import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ResumeDynamicBlock from '../../renderer/components/resume_edit/input_components/ResumeDynamicBlock';
import {
  DynamicBlock,
  FieldRendererProps,
} from '../../renderer/utils/resumeBlockTypes';

jest.mock(
  '../../renderer/components/resume_edit/DynamicBlockFieldRenderer',
  () => ({
    __esModule: true,
    default: ({ fieldNameOverride, resumeField }: FieldRendererProps) => (
      <div data-testid="mock-dynamic-field">
        {`${fieldNameOverride}:${resumeField.type}`}
      </div>
    ),
  }),
);

const field: DynamicBlock = {
  type: 'dynamic_combined_block',
  blocks_list: 'experience',
  block_format: {
    company: {
      type: 'text_input',
      title: 'company_title',
      resume_value: 'company_name',
    },
    current: {
      type: 'toggle',
      title: 'current_title',
      resume_value: 'is_current',
      default_value: false,
    },
  },
  add_button_title: 'add_experience_key',
  delete_button_title: 'delete_entry_key',
};

function renderWithForm(defaultValues: Record<string, unknown>) {
  function Wrapper() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <ResumeDynamicBlock
          resumeField={field}
          translations={{
            add_experience_key: 'Add experience',
            delete_entry_key: 'Delete entry',
          }}
          resumeId="resume-1"
        />
      </FormProvider>
    );
  }
  return render(<Wrapper />);
}

describe('ResumeDynamicBlock', () => {
  it('renders the Add button and no entries when the list is empty', () => {
    renderWithForm({ experience: [] });

    expect(
      screen.getByRole('button', { name: 'Add experience' }),
    ).toBeInTheDocument();
    expect(screen.queryAllByTestId('mock-dynamic-field')).toHaveLength(0);
  });

  it('appends a new entry with one field per block_format key', () => {
    renderWithForm({ experience: [] });

    fireEvent.click(screen.getByRole('button', { name: 'Add experience' }));

    const fields = screen.getAllByTestId('mock-dynamic-field');
    expect(fields).toHaveLength(2);
    expect(fields[0]).toHaveTextContent('experience.0.company_name:text_input');
    expect(fields[1]).toHaveTextContent('experience.0.is_current:toggle');
  });

  it('removes an entry when its delete button is pressed', () => {
    renderWithForm({
      experience: [{ company_name: 'Acme', is_current: true }],
    });

    expect(screen.getAllByTestId('mock-dynamic-field')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Delete entry' }));

    expect(screen.queryAllByTestId('mock-dynamic-field')).toHaveLength(0);
  });
});
