import { EditScreenSchema, ResumeFormValues } from '../utils/backendTypes';

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
