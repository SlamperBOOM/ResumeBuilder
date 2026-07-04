export type TemplateInfo = {
  name: string;
  preview: string;
};

type TemplatesDTO = {
  payload: TemplateInfo[];
  schema: JSON;
};

export default TemplatesDTO;
