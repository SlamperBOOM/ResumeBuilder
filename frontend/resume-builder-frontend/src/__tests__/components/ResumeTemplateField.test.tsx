import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import ResumeTemplateField from '../../renderer/components/resume_edit/input_components/ResumeTemplateField';
import { TemplateChooser } from '../../renderer/utils/resumeBlockTypes';

const mockGetTemplates = jest.fn();

const mockSchemaApi = { getTemplates: mockGetTemplates };
jest.mock('../../renderer/api/useSchemaApi', () => ({
  __esModule: true,
  default: () => mockSchemaApi,
}));

jest.mock('../../renderer/components/ResumePDFPreview');

const field: TemplateChooser = {
  type: 'template',
  title: 'template_title',
  resume_value: 'template_name',
  template_choose_title: 'choose_template_title',
  close_button_title: 'close_title',
  load_error_key: 'templates_load_error',
};

beforeEach(() => {
  mockGetTemplates.mockReset();

  global.ResizeObserver = class {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [{ contentRect: { width: 900, height: 450 } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      );
    }

    unobserve() {}

    disconnect() {}
  };
});

function renderWithForm(defaultValues: Record<string, unknown>) {
  function Wrapper() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <ResumeTemplateField
          resumeField={field}
          translations={{
            template_title: 'Template',
            choose_template_title: 'Choose a template',
            templates_load_error: 'Could not load the templates. Try again.',
          }}
          resumeId="resume-1"
        />
      </FormProvider>
    );
  }
  return render(<Wrapper />);
}

describe('ResumeTemplateField', () => {
  it('opens the dialog and calls getTemplates when the field is clicked', async () => {
    mockGetTemplates.mockResolvedValue({
      payload: [{ name: 'modern', preview: 'modern.pdf' }],
      schema: { modern: { display_name: 'modern_display' } },
    });
    renderWithForm({ template_name: 'modern' });

    fireEvent.click(screen.getByLabelText('Template'));

    await waitFor(() =>
      expect(mockGetTemplates).toHaveBeenCalledWith('resume-1'),
    );
    expect(await screen.findByText('Choose a template')).toBeInTheDocument();
  });

  it('renders templates as cards and updates the field on selection', async () => {
    mockGetTemplates.mockResolvedValue({
      payload: [
        { name: 'modern', preview: 'modern.pdf' },
        { name: 'classic', preview: 'classic.pdf' },
      ],
      schema: {
        modern: { display_name: 'modern_display' },
        classic: { display_name: 'classic_display' },
      },
    });
    renderWithForm({ template_name: 'modern' });

    fireEvent.click(screen.getByLabelText('Template'));

    expect(await screen.findByText('modern_display')).toBeInTheDocument();
    expect(screen.getByText('classic_display')).toBeInTheDocument();

    const classicCard = screen.getByText('classic_display');
    fireEvent.click(classicCard);
    fireEvent.pointerUp(classicCard);

    await waitFor(() =>
      expect(screen.getByLabelText('Template')).toHaveValue('classic'),
    );
    await waitFor(
      () =>
        expect(screen.queryByText('Choose a template')).not.toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  it('shows an error alert instead of opening the dialog when getTemplates fails', async () => {
    mockGetTemplates.mockRejectedValue(new Error('network error'));
    renderWithForm({ template_name: 'modern' });

    fireEvent.click(screen.getByLabelText('Template'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load the templates. Try again.',
    );
    expect(screen.queryByText('Choose a template')).not.toBeInTheDocument();
  });
});
