import { FieldRendererProps } from '../../utils/resumeBlockTypes';
import baseFieldRegistry from './fieldRegistry';

export default function DynamicBlockFieldRenderer(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride, resumeId } = props;
  const Component = baseFieldRegistry[resumeField.type];

  if (!Component) {
    console.warn(`Unknown dynamic block field type: "${resumeField.type}"`);
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
