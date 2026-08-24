import { Box, Button, Typography } from '@mui/material';

export default function RouteNotFoundScreen() {
  return (
    <Box>
      <Typography> Something went wrong, reload app </Typography>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload
      </Button>
    </Box>
  );
}
