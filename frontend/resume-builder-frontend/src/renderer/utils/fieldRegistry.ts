import ResumeDate from '../components/resume_edit/input_components/ResumeDate';
import ResumeDropDownList from '../components/resume_edit/input_components/ResumeDropDownList';
import ResumeTextArea from '../components/resume_edit/input_components/ResumeTextArea';
import ResumeTextInput from '../components/resume_edit/input_components/ResumeTextInput';
import ResumeToggle from '../components/resume_edit/input_components/ResumeToggle';
import ResumeImage from '../components/resume_edit/input_components/ResumeImage';

const baseFieldRegistry = {
  text_input: ResumeTextInput,
  text_area: ResumeTextArea,
  toggle: ResumeToggle,
  drop_down_list: ResumeDropDownList,
  date: ResumeDate,
  image: ResumeImage,
};

export default baseFieldRegistry;
