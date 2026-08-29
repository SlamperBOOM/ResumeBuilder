import { MainScreenSchema, SimpleResume } from '../utils/backendTypes';
import { Translations } from '../utils/translations';

type MainScreenResponse = {
  schema: MainScreenSchema;
  translations: Translations;
  payload: SimpleResume[];
};

export default MainScreenResponse;
