import { Card, Typography } from '@mui/material';
import { BlockContent } from '../../../utils/backendTypes';
import { ResumeInput } from '../../../utils/resumeBlockTypes';
import { Translations, useTranslate } from '../../../utils/translations';
import FieldRenderer from '../FieldRenderer';

type ResumeBlockProps = {
  schema: BlockContent;
  translations: Translations;
  resumeId: string;
};

const NON_FIELD_KEYS: Set<string> = new Set(['block_title']);

export default function ResumeBlock(props: ResumeBlockProps) {
  const { schema, translations, resumeId } = props;
  const translateKey = useTranslate(translations);

  return (
    <Card
      sx={{
        border: 1,
        padding: 2,
        borderRadius: 2,
        marginTop: 1,
        marginBottom: 1,
      }}
      elevation={4}
    >
      <Typography variant="h5" color="primary" sx={{ marginBottom: 1 }}>
        {translateKey(schema.block_title)}
      </Typography>
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
    </Card>
  );
}
