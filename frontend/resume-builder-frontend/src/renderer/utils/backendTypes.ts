import {
  DateInput,
  DropDownList,
  DynamicBlock,
  TextArea,
  TextInput,
  Toggle,
} from './resumeBlockTypes';

export type BDUButtonSchema = { key: string; action: string };

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
    export_button: BDUButtonSchema;
    resume_name: TextInput;
    to_main_screen_title: string;
    resume_blocks: BlockSchema;
  };
};

export type LanguageDialogSchema = {
  title: string;
  cancel_key: string;
  save_key: string;
  save_action: string;
};
