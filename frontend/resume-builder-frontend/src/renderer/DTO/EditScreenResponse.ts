import { EditScreenSchema, ResumePayload } from '../utils/backendTypes';
import { Translations } from '../utils/translations';

type EditScreenResponse = {
  schema: EditScreenSchema;
  translations: Translations;
  payload: ResumePayload;
};

export default EditScreenResponse;
