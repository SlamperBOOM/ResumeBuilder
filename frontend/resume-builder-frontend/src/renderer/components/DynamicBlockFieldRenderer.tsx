import { FieldRendererProps } from '../utils/resumeBlockTypes';
import ResumeDate from './input_components/ResumeDate';
import ResumeDropDownList from './input_components/ResumeDropDownList';
import ResumeTextArea from './input_components/ResumeTextArea';
import ResumeTextInput from './input_components/ResumeTextInput';
import ResumeToggle from './input_components/ResumeToggle';

const fieldRegistry = {
  text_input: ResumeTextInput,
  text_area: ResumeTextArea,
  toggle: ResumeToggle,
  drop_down_list: ResumeDropDownList,
  date: ResumeDate,
};

export default function DynamicBlockFieldRenderer(props: FieldRendererProps) {
  const { resumeField, translations, fieldNameOverride } = props;
  const Component = fieldRegistry[resumeField.type];

  if (!Component) return null;

  return (
    <Component
      resumeField={resumeField}
      translations={translations}
      fieldNameOverride={fieldNameOverride}
    />
  );
}
