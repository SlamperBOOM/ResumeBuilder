import { ComponentType } from 'react';
import { FieldRendererProps } from '../../utils/resumeBlockTypes';
import baseFieldRegistry from './fieldRegistry';
import ResumeDynamicBlock from './input_components/ResumeDynamicBlock';
import ResumeTemplateField from './input_components/ResumeTemplateField';

const fieldRegistry: Record<string, ComponentType<FieldRendererProps>> = {
  ...baseFieldRegistry,
  dynamic_combined_block: ResumeDynamicBlock,
  template: ResumeTemplateField,
};

export default function FieldRenderer(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride, resumeId } = props;
  const Component = fieldRegistry[resumeField.type];

  if (!Component) {
    console.warn(`Unknown resume field type: "${resumeField.type}"`);
    return null;
  }

  return (
    <Component
      resumeField={resumeField}
      translations={translations}
      fieldNameOverride={fieldNameOverride}
      resumeId={resumeId}
    />
  );
}
