import { MainScreenSchema, SimpleResume } from '../utils/backendTypes';
import { Translations } from '../utils/translations';

type MainScreenPayload = {
  resumes: SimpleResume[];
  on_load_action?: string;
};

type MainScreenResponse = {
  schema: MainScreenSchema;
  translations: Translations;
  payload: MainScreenPayload;
};

export default MainScreenResponse;
