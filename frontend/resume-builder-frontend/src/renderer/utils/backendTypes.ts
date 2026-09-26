import {
  DateInput,
  DropDownList,
  DynamicBlock,
  ImageInput,
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
  resume_menu: { [menuKey: string]: BDUButtonSchema };
  edit_button: BDUButtonSchema;
  duplicate_button: BDUButtonSchema;
  export_button: BDUButtonSchema;
  resume_menu_tooltip_title: string;
  create_new: BDUButtonSchema;
  import_button: BDUButtonSchema;
  search_placeholder: string;
  no_search_results: string;
  // Which resume fields become card chips. The frontend only renders them.
  card_tags: { resume_value: string; key_prefix: string }[];
  empty_state: { title: string; subtitle: string };
};

export type SimpleResume = {
  resume_id: string;
  resume_name: string;
  last_modification_date: string;
  modified_label?: string;
  html_preview: string;
  pdf_preview: string;
  tags?: string[];
};

export type HeaderSchema = {
  app_title: string;
  menu: BDUButtonSchema[];
};

export type BlockContent = { block_title: string; block_hint: string } & {
  [field: string]:
    | TextInput
    | Toggle
    | TextArea
    | DropDownList
    | DateInput
    | ImageInput
    | DynamicBlock
    | string;
};

export type BlocksSchema = { [block_name: string]: BlockContent };

export type EditScreenSchema = {
  edit_area: {
    topbar: {
      to_main_screen_title: string;
      resume_name: TextInput;
      resume_locale: DropDownList;
      template: TemplateChooser;
      export_button: BDUButtonSchema;
    };
    blocks_title: string;
    pin_blocks_title: string;
    unpin_blocks_title: string;
    preview: {
      scale_title: string;
      full_width_option_key: string;
      full_height_option_key: string;
      custom_option_key: string;
    };
    resume_blocks: BlocksSchema;
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

export type AboutModalSchema = {
  app_name: string;
  version_label: string;
  copyright: string;
  license: string;
  github_title: string;
  github_url: string;
  issues_title: string;
  issues_url: string;
  close: string;
};

export type HelpModalSchema = {
  title: string;
  html: string;
};

export type OnboardingSchema = {
  slides: { [slideKey: string]: { title: string; body: string } };
  back: string;
  next: string;
  skip: string;
  finish: string;
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
