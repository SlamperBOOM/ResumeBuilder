import { LanguageDialogSchema } from '../utils/backendTypes';
import { Translations } from '../utils/resumeBlockTypes';

export type LanguageVariant = {
  locale: string;
  key: string;
};

type LanguageDialogResponse = {
  schema: LanguageDialogSchema;
  translations: Translations;
  payload: {
    locales: LanguageVariant[];
    current_locale: string;
  };
};

export default LanguageDialogResponse;
