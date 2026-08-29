import { EditScreenSchema, ResumeFormValues } from '../utils/backendTypes';
import { Translations } from '../utils/translations';

export type EditScreenPayload = {
  resume: ResumeFormValues;
  preview: string;
};

type EditScreenResponse = {
  schema: EditScreenSchema;
  translations: Translations;
  payload: EditScreenPayload;
};

export default EditScreenResponse;
