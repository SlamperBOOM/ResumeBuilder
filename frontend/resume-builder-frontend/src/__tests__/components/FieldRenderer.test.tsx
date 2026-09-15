import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import FieldRenderer from '../../renderer/components/resume_edit/FieldRenderer';
import {
  DateVariant,
  FieldRendererProps,
  ResumeInput,
} from '../../renderer/utils/resumeBlockTypes';

// FieldRenderer's only job is to look up `resumeField.type` in its registry
// and forward props to the matching component - the concrete components
// (ResumeTextInput, ResumeToggle, ...) have their own dedicated tests. So
// every real component is replaced here with a stand-in that just reports
// which one got rendered and what props it received.
function mockComponentFactory(testId: string) {
  return function ({
    resumeField,
    resumeId,
    fieldNameOverride,
  }: FieldRendererProps) {
    return (
      <div data-testid={testId}>
        {JSON.stringify({
          type: resumeField.type,
          resumeId,
          fieldNameOverride,
        })}
      </div>
    );
  };
}

jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeTextInput',
  () => ({
    __esModule: true,
    default: mockComponentFactory('mock-ResumeTextInput'),
  }),
);
jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeTextArea',
  () => ({
    __esModule: true,
    default: mockComponentFactory('mock-ResumeTextArea'),
  }),
);
jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeToggle',
  () => ({
    __esModule: true,
    default: mockComponentFactory('mock-ResumeToggle'),
  }),
);
jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeDropDownList',
  () => ({
    __esModule: true,
    default: mockComponentFactory('mock-ResumeDropDownList'),
  }),
);
jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeDate',
  () => ({
    __esModule: true,
    default: mockComponentFactory('mock-ResumeDate'),
  }),
);
jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeImage',
  () => ({
    __esModule: true,
    default: mockComponentFactory('mock-ResumeImage'),
  }),
);
jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeDynamicBlock',
  () => ({
    __esModule: true,
    default: mockComponentFactory('mock-ResumeDynamicBlock'),
  }),
);
jest.mock(
  '../../renderer/components/resume_edit/input_components/ResumeTemplateField',
  () => ({
    __esModule: true,
    default: mockComponentFactory('mock-ResumeTemplateField'),
  }),
);

const cases: Array<{ testId: string; field: ResumeInput }> = [
  {
    testId: 'mock-ResumeTextInput',
    field: { type: 'text_input', title: 't', resume_value: 'v' },
  },
  {
    testId: 'mock-ResumeTextArea',
    field: { type: 'text_area', title: 't', resume_value: 'v' },
  },
  {
    testId: 'mock-ResumeToggle',
    field: {
      type: 'toggle',
      title: 't',
      resume_value: 'v',
      default_value: true,
    },
  },
  {
    testId: 'mock-ResumeDropDownList',
    field: {
      type: 'drop_down_list',
      title: 't',
      resume_value: 'v',
      values: { a: 'A' },
      default: 'a',
    },
  },
  {
    testId: 'mock-ResumeDate',
    field: {
      type: 'date',
      title: 't',
      resume_value: 'v',
      variant: DateVariant.full,
    },
  },
  {
    testId: 'mock-ResumeImage',
    field: {
      type: 'image',
      title: 't',
      resume_value: 'v',
      empty_text_key: 'empty',
    },
  },
  {
    testId: 'mock-ResumeDynamicBlock',
    field: {
      type: 'dynamic_combined_block',
      blocks_list: 'list',
      block_format: {},
      add_button_title: 'add',
      delete_button_title: 'delete',
    },
  },
  {
    testId: 'mock-ResumeTemplateField',
    field: {
      type: 'template',
      title: 't',
      resume_value: 'v',
      template_choose_title: 'choose',
    },
  },
];

describe('FieldRenderer', () => {
  it.each(cases)(
    'renders $testId for field type "$field.type" and forwards props',
    ({ testId, field }) => {
      render(
        <FieldRenderer
          resumeField={field}
          translations={{}}
          resumeId="resume-1"
          fieldNameOverride="override.path"
        />,
      );

      const mock = screen.getByTestId(testId);
      const passedProps = JSON.parse(mock.textContent ?? '{}');

      expect(passedProps.type).toBe(field.type);
      expect(passedProps.resumeId).toBe('resume-1');
      expect(passedProps.fieldNameOverride).toBe('override.path');
    },
  );

  it('warns and renders nothing for an unknown field type', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const unknownField = {
      type: 'not_a_real_type',
      title: 't',
      resume_value: 'v',
    } as unknown as ResumeInput;

    const { container } = render(
      <FieldRenderer
        resumeField={unknownField}
        translations={{}}
        resumeId="resume-1"
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(warnSpy).toHaveBeenCalledWith(
      'Unknown resume field type: "not_a_real_type"',
    );

    warnSpy.mockRestore();
  });
});
