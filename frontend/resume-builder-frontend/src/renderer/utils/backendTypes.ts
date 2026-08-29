import {
  DateInput,
  DropDownList,
  DynamicBlock,
  TemplateChooser,
  TextArea,
  TextInput,
  Toggle,
} from './resumeBlockTypes';

export type BDUButtonSchema = { key: string; action: string };

export type UpdatePayload = {
  resume_id: string;
  resume_info: {
    resume_name: string;
    resume_locale: string;
    template_name: string;
  };
  content: {
    block: string;
    payload: unknown;
  }[];
};

export type ResumeFormValues = {
  resume_id: string;
  resume_name: string;
  resume_locale: string;
  template_name: string;
  blocks: { [blockKey: string]: unknown };
};

export type BDUActionPayload = {
  locale?: string;
  resume_id?: string;
  resume_name?: string;
  local_dir_path?: string;
  update_payload?: UpdatePayload;
};

export type MainScreenSchema = {
  resume_menu: BDUButtonSchema[];
  export_button: BDUButtonSchema;
  resume_menu_tooltip_title: string;
  create_new: BDUButtonSchema;
  import_button: BDUButtonSchema;
  empty_state: { title: string; subtitle: string };
};

export type SimpleResume = {
  resume_id: string;
  resume_name: string;
  last_modification_date: string;
  html_preview: string;
  pdf_preview: string;
};

export type HeaderSchema = {
  app_title: string;
  menu: BDUButtonSchema[];
};

export type BlockSchema = {
  [block_name: string]: { block_title: string } & {
    [field: string]:
      | TextInput
      | Toggle
      | TextArea
      | DropDownList
      | DateInput
      | DynamicBlock;
  };
};

export type EditScreenSchema = {
  edit_area: {
    to_main_screen_title: string;
    export_button: BDUButtonSchema;
    resume_name: TextInput;
    resume_locale: DropDownList;
    template: TemplateChooser;
    preview: {
      scale_title: string;
      full_width_option_key: string;
      full_height_option_key: string;
      custom_option_key: string;
    };
    resume_blocks: BlockSchema;
  };
};

export type ResumeBlockFormat = {
  '@type': string;
  [field: string]: string | JSON | JSON[];
};

export type ResumePayload = {
  preview: string;
  resume: {
    resume_id: string;
    resume_locale: string;
    resume_name: string;
    template_name: string;
    version_of_last_edit: string;
    blocks: {
      [block_name: string]: ResumeBlockFormat;
    };
  };
};

export type LanguageDialogSchema = {
  title: string;
  cancel_key: string;
  save_key: string;
  save_action: string;
};

export type ConfirmationDialogSchema = {
  title: string;
  text: string;
  confirm_button_text: string;
  decline_button_text: string;
  confirm_action: string;
  confirm_action_payload: BDUActionPayload;
};

export type InfoModalSchema = {
  title: string | undefined;
  text: string;
};

export type CustomActionButton = {
  title: string;
  action: string;
  payload: JSON;
};

export type CustomDialogSchema = {
  title: string;
  text: string;
  decline_button_text: string;
  actions: CustomActionButton[];
};
