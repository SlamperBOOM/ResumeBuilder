import { Box, Button, Typography } from '@mui/material';

export default function ErrorScreen() {
  return (
    <Box>
      <Typography> Something went wrong, try update current screen </Typography>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      />
    </Box>
  );
}
