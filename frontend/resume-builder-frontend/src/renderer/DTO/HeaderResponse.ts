import { HeaderSchema } from '../utils/backendTypes';
import { Translations } from '../utils/translations';

type HeaderResponse = {
  schema: HeaderSchema;
  translations: Translations;
  payload?: JSON;
};

export default HeaderResponse;
