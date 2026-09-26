import { Box, Skeleton, Stack, SxProps, Theme } from '@mui/material';

const PAGE_ASPECT = '1 / 1.414';

const SHEET: SxProps<Theme> = { height: 'auto', aspectRatio: PAGE_ASPECT };

export type MainScreenSkeletonProps = {
  gridSx: SxProps<Theme>;
};

const SHEET_COUNT = 6;

export function MainScreenSkeleton(props: MainScreenSkeletonProps) {
  const { gridSx } = props;

  return (
    <Box
      role="status"
      aria-busy="true"
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 3,
          pt: 2,
          pb: 2,
        }}
      >
        <Skeleton variant="rounded" width={150} height={36} />
        <Skeleton variant="rounded" width={120} height={36} />
        <Skeleton
          variant="rounded"
          width={250}
          height={40}
          sx={{ ml: 'auto' }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', px: 3, pb: 4 }}>
        <Box sx={gridSx}>
          {Array.from({ length: SHEET_COUNT }, (_, index) => index).map(
            (index) => (
              <Box key={index}>
                <Skeleton variant="rectangular" animation="wave" sx={SHEET} />
                <Skeleton animation="wave" width="70%" sx={{ mt: 1 }} />
                <Skeleton animation="wave" width="40%" />
              </Box>
            ),
          )}
        </Box>
      </Box>
    </Box>
  );
}

export function EditScreenSkeleton() {
  return (
    <Box
      role="status"
      aria-busy="true"
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Skeleton variant="rounded" width={140} height={36} />
        <Skeleton variant="rounded" height={56} sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={170} height={56} />
        <Skeleton variant="rounded" width={200} height={56} />
        <Skeleton variant="rounded" width={140} height={36} />
      </Stack>

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Box
          sx={{
            width: 220,
            p: 1.5,
            borderRight: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {Array.from({ length: 8 }, (_, index) => index).map((index) => (
            <Skeleton key={index} height={44} />
          ))}
        </Box>

        <Box sx={{ flex: 1, p: 2, backgroundColor: 'background.paper' }}>
          <Skeleton variant="text" width="40%" height={32} />
          {Array.from({ length: 5 }, (_, index) => index).map((index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={56}
              sx={{ my: 2 }}
            />
          ))}
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            p: 3,
            backgroundColor: 'surface.pdfBackdrop',
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{ ...SHEET, width: '100%', maxWidth: 560 }}
          />
        </Box>
      </Box>
    </Box>
  );
}
