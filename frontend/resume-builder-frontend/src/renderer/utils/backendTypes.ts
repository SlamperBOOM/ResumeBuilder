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
  resume_info: JSON;
  content: {
    block: string;
    payload: JSON;
  }[];
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
    },
    resume_blocks: BlockSchema;
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
