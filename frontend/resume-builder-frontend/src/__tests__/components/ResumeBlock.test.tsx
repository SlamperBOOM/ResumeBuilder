import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ResumeBlock from '../../renderer/components/resume_edit/input_components/ResumeBlock';
import { BlockContent } from '../../renderer/utils/backendTypes';
import { FieldRendererProps } from '../../renderer/utils/resumeBlockTypes';

jest.mock('../../renderer/components/resume_edit/FieldRenderer', () => ({
  __esModule: true,
  default: ({ resumeField }: FieldRendererProps) => (
    <div data-testid={`mock-field-${resumeField.type}`}>{resumeField.type}</div>
  ),
}));

const schema: BlockContent = {
  block_title: 'block_title_key',
  block_hint: 'block_hint_key',
  full_name: {
    type: 'text_input',
    title: 'name_title',
    resume_value: 'full_name',
  },
  is_visible: {
    type: 'toggle',
    title: 'visible_title',
    resume_value: 'is_visible',
    default_value: true,
  },
};

describe('ResumeBlock', () => {
  // The title and the hint belong to the form header in EditArea, not to the
  // block body.
  it('does not render the block title or its hint', () => {
    render(
      <ResumeBlock
        schema={schema}
        translations={{
          block_title_key: 'Personal info',
          block_hint_key: 'What belongs here',
        }}
        resumeId="resume-1"
      />,
    );

    expect(screen.queryByText('Personal info')).toBeNull();
    expect(screen.queryByText('What belongs here')).toBeNull();
  });

  it('skips the non-field keys and renders one FieldRenderer per remaining key', () => {
    render(
      <ResumeBlock schema={schema} translations={{}} resumeId="resume-1" />,
    );

    expect(screen.getByTestId('mock-field-text_input')).toBeInTheDocument();
    expect(screen.getByTestId('mock-field-toggle')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-field-block_title_key')).toBeNull();
  });
});
