export type BaseInput = {
  type: string;
  title: string;
  resume_value: string;
};

export type TextInput = BaseInput;

export type Toggle = BaseInput & {
  default_value: boolean;
};

export type TextArea = BaseInput;

export type DropDownList = BaseInput & {
  values: {
    [key: string]: string;
  };
  default: string;
};

export enum DateVariant {
  full = 'full',
  month = 'month',
}

export type DateInput = {
  type: string;
  resume_value: string;
  title: string;
  variant: DateVariant;
};

export type ImageInput = BaseInput & {
  empty_text_key: string;
};

export type DynamicBlock = {
  type: string;
  blocks_list: string;
  block_format: {
    [field: string]:
      | TextInput
      | Toggle
      | TextArea
      | DropDownList
      | DateInput
      | ImageInput;
  };
  add_button_title: string;
};

export type ResumeInput =
  | TextInput
  | Toggle
  | TextArea
  | DropDownList
  | DateInput
  | ImageInput
  | DynamicBlock;

export type FieldRendererProps = {
  resumeField: ResumeInput;
  translations: { field: string; value: string }[];
  fieldNameOverride?: string;
};
