import { MainScreenSchema, SimpleResume } from '../utils/backendTypes';
import { Translations } from '../utils/resumeBlockTypes';

type MainScreenResponse = {
  schema: MainScreenSchema;
  translations: Translations;
  payload: SimpleResume[];
};

export default MainScreenResponse;
