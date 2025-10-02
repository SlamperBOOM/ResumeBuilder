import {
  EditScreenSchema,
  HeaderSchema,
  LanguageDialogSchema,
  MainScreenSchema,
} from '../utils/backendTypes';

type SchemaResponseDTO = {
  schema:
    | MainScreenSchema
    | HeaderSchema
    | EditScreenSchema
    | LanguageDialogSchema;
  translations: JSON;
  payload?: JSON;
};

export default SchemaResponseDTO;
