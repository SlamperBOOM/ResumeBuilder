import { Box, Card, Typography } from '@mui/material';
import { BlockSchema } from '../../utils/backendTypes';
import FieldRenderer from '../FieldRenderer';

type ResumeBlockProps = {
  schema: BlockSchema;
  translations: JSON;
};

export default function ResumeBlock(props: ResumeBlockProps) {
  const { schema, translations } = props;

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
      <Typography variant="h5" color="primary">
        {translations[schema.block_title]}
      </Typography>
      {Object.keys(schema).map((fieldKey: string) => {
        if (fieldKey === 'block_title') {
          return null;
        }
        const field = schema[fieldKey];
        return (
          <FieldRenderer resumeField={field} translations={translations} />
        );
      })}
    </Card>
  );
}
