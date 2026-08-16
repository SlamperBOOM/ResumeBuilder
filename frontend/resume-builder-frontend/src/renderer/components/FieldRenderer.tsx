import { FieldRendererProps } from '../utils/resumeBlockTypes';
import ResumeDate from './input_components/ResumeDate';
import ResumeDropDownList from './input_components/ResumeDropDownList';
import ResumeDynamicBlock from './input_components/ResumeDynamicBlock';
import ResumeTextArea from './input_components/ResumeTextArea';
import ResumeTextInput from './input_components/ResumeTextInput';
import ResumeToggle from './input_components/ResumeToggle';
import ResumeImage from './input_components/ResumeImage';
import ResumeTemplateField from './input_components/ResumeTemplateField';

const fieldRegistry = {
  text_input: ResumeTextInput,
  text_area: ResumeTextArea,
  toggle: ResumeToggle,
  drop_down_list: ResumeDropDownList,
  date: ResumeDate,
  dynamic_combined_block: ResumeDynamicBlock,
  image: ResumeImage,
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
