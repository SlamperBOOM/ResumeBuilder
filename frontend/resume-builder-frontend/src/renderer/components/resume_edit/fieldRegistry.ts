import ResumeDate from './input_components/ResumeDate';
import ResumeDropDownList from './input_components/ResumeDropDownList';
import ResumeTextArea from './input_components/ResumeTextArea';
import ResumeTextInput from './input_components/ResumeTextInput';
import ResumeToggle from './input_components/ResumeToggle';
import ResumeImage from './input_components/ResumeImage';

const baseFieldRegistry = {
  text_input: ResumeTextInput,
  text_area: ResumeTextArea,
  toggle: ResumeToggle,
  drop_down_list: ResumeDropDownList,
  date: ResumeDate,
  image: ResumeImage,
};

export default baseFieldRegistry;
