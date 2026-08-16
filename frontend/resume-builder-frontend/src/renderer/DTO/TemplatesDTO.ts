export type TemplateInfo = {
  name: string;
  preview: string;
};

export type TemplateSchema = {
  [templateName: string]: { display_name: string };
};

type TemplatesDTO = {
  payload: TemplateInfo[];
  schema: TemplateSchema;
};

export default TemplatesDTO;
