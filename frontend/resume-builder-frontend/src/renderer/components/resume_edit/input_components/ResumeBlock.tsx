import { Box } from '@mui/material';
import { BlockContent } from '../../../utils/backendTypes';
import { ResumeInput } from '../../../utils/resumeBlockTypes';
import { Translations } from '../../../utils/translations';
import FieldRenderer from '../FieldRenderer';

type ResumeBlockProps = {
  schema: BlockContent;
  translations: Translations;
  resumeId: string;
};

const NON_FIELD_KEYS: Set<string> = new Set(['block_title', 'block_hint']);

export default function ResumeBlock(props: ResumeBlockProps) {
  const { schema, translations, resumeId } = props;

  return (
    <Box>
      {Object.keys(schema).map((fieldKey: string) => {
        if (NON_FIELD_KEYS.has(fieldKey)) {
          return null;
        }
        const field = schema[fieldKey] as ResumeInput;
        return (
          <FieldRenderer
            key={fieldKey}
            resumeField={field}
            translations={translations}
            resumeId={resumeId}
          />
        );
      })}
    </Box>
  );
}
